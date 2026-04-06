import { JWT } from "google-auth-library"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { CreateProductFromGoogleSpreadsheetDto } from "@root/product/dto/product.dto"
import {
  CATEGORY_COLUMN_NUMBER,
  CATEGORY_SHEET_NAME,
  DETAIL_PAGE_COLUMN_NUMBER,
  DETAIL_PAGE_SHEET_NAME,
  EVENT_COLUMN_NUMBER,
  GOOGLE_EMAIL,
  GOOGLE_PRIVATE_KEY,
  PRODUCT_COLUMN_NUMBER,
  PRODUCT_SHEET_NAME,
  SHEET_TRUE_KEY,
} from "@root/shared/constant/google-spreadsheet"
import { CreateEventFromGoogleSpreadsheetDto } from "@root/event/dto/event.dto"
import { EventLabel } from "@root/shared/enum/event"
import {
  CreateCategoryFromSheetDto,
  CreateDetailPageFromSheetDto,
} from "@root/product/dto/product.dto"

export class GoogleSpreadsheetHelper {
  static get config(): any {
    return new JWT({
      email: GOOGLE_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
  }

  static async getProductsFromSpreadsheet(url: string) {
    const spreadsheetId = url.match(/\/d\/(.+)\//)[1]
    const doc = new GoogleSpreadsheet(spreadsheetId, this.config)

    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    await sheet.loadCells()

    // 빈칸에 toString() 해서 발생하는 에러 예방
    function safeString(value: any): string {
      return value ? value.toString().trim() : ""
    }

    const products = []
    for (let i = 1; i < sheet.rowCount; i++) {
      if (
        sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME).value &&
        sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME).value != ""
      ) {
        products.push(
          Object.assign(new CreateProductFromGoogleSpreadsheetDto(), {
            visible:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE).value == SHEET_TRUE_KEY,
            visibleEN:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_EN).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_EN).value == SHEET_TRUE_KEY,
            visibleZH:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_ZH).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_ZH).value == SHEET_TRUE_KEY,
            visibleZHTW:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_ZHTW).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_ZHTW).value == SHEET_TRUE_KEY,
            visibleJA:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_JA).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_JA).value == SHEET_TRUE_KEY,
            visibleTH:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_TH).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_TH).value == SHEET_TRUE_KEY,
            categoryName: safeString(sheet.getCell(i, PRODUCT_COLUMN_NUMBER.CATEGORY).value),
            detailPageName: safeString(sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DETAIL_PAGE).value),
            name: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME).value,
            nameEN: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME_EN).value,
            nameZH: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME_ZH).value,
            nameZHTW: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME_ZHTW).value,
            nameJA: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME_JA).value,
            nameTH: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME_TH).value,
            description: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION).value,
            descriptionEN: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION_EN).value,
            descriptionZH: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION_ZH).value,
            descriptionZHTW: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION_ZHTW).value,
            descriptionJA: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION_JA).value,
            descriptionTH: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION_TH).value,
            price: Number(sheet.getCell(i, PRODUCT_COLUMN_NUMBER.PRICE).value),
            ...(sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DISCOUNT_PRICE).value && {
              discountPrice: Number(sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DISCOUNT_PRICE).value),
            }),
            order: i,
          }),
        )
      }
    }
    return products
  }

  static async getCategoriesFromSpreadsheet(url: string) {
    const spreadsheetId = url.match(/\/d\/(.+)\//)[1]
    const doc = new GoogleSpreadsheet(spreadsheetId, this.config)

    await doc.loadInfo()
    const sheet = doc.sheetsByTitle[CATEGORY_SHEET_NAME]
    if (!sheet) return []
    await sheet.loadCells()

    function safeString(value: any): string {
      return value ? value.toString().trim() : ""
    }

    const categories: CreateCategoryFromSheetDto[] = []
    for (let i = 1; i < sheet.rowCount; i++) {
      const name = safeString(sheet.getCell(i, CATEGORY_COLUMN_NUMBER.NAME).value)
      if (!name) continue
      categories.push({
        name,
        nameJA: safeString(sheet.getCell(i, CATEGORY_COLUMN_NUMBER.NAME_JA).value),
        nameEN: safeString(sheet.getCell(i, CATEGORY_COLUMN_NUMBER.NAME_EN).value),
        nameZH: safeString(sheet.getCell(i, CATEGORY_COLUMN_NUMBER.NAME_ZH).value),
        nameZHTW: safeString(sheet.getCell(i, CATEGORY_COLUMN_NUMBER.NAME_ZHTW).value),
        nameTH: safeString(sheet.getCell(i, CATEGORY_COLUMN_NUMBER.NAME_TH).value),
        order: Number(sheet.getCell(i, CATEGORY_COLUMN_NUMBER.ORDER).value) || undefined,
      })
    }
    return categories
  }

  static async getDetailPagesFromSpreadsheet(url: string) {
    const spreadsheetId = url.match(/\/d\/(.+)\//)[1]
    const doc = new GoogleSpreadsheet(spreadsheetId, this.config)

    await doc.loadInfo()
    const sheet = doc.sheetsByTitle[DETAIL_PAGE_SHEET_NAME]
    if (!sheet) return []
    await sheet.loadCells()

    function safeString(value: any): string {
      return value ? value.toString().trim() : ""
    }

    const detailPages: CreateDetailPageFromSheetDto[] = []
    for (let i = 1; i < sheet.rowCount; i++) {
      const name = safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.NAME).value)
      if (!name) continue
      detailPages.push({
        categoryName: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.CATEGORY_NAME).value),
        name,
        nameJA: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.NAME_JA).value),
        nameEN: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.NAME_EN).value),
        nameZH: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.NAME_ZH).value),
        nameZHTW: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.NAME_ZHTW).value),
        nameTH: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.NAME_TH).value),
        description: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.DESCRIPTION).value),
        descriptionJA: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.DESCRIPTION_JA).value),
        descriptionEN: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.DESCRIPTION_EN).value),
        descriptionZH: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.DESCRIPTION_ZH).value),
        descriptionZHTW: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.DESCRIPTION_ZHTW).value),
        descriptionTH: safeString(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.DESCRIPTION_TH).value),
        order: Number(sheet.getCell(i, DETAIL_PAGE_COLUMN_NUMBER.ORDER).value) || undefined,
      })
    }
    return detailPages
  }

  static async getProductsFromSpreadsheetByTitle(url: string) {
    const spreadsheetId = url.match(/\/d\/(.+)\//)[1]
    const doc = new GoogleSpreadsheet(spreadsheetId, this.config)

    await doc.loadInfo()
    const sheet = doc.sheetsByTitle[PRODUCT_SHEET_NAME]
    if (!sheet) return []
    await sheet.loadCells()

    function safeString(value: any): string {
      return value ? value.toString().trim() : ""
    }

    const products = []
    for (let i = 1; i < sheet.rowCount; i++) {
      if (
        sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME).value &&
        sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME).value != ""
      ) {
        products.push(
          Object.assign(new CreateProductFromGoogleSpreadsheetDto(), {
            visible:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE).value == SHEET_TRUE_KEY,
            visibleEN:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_EN).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_EN).value == SHEET_TRUE_KEY,
            visibleZH:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_ZH).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_ZH).value == SHEET_TRUE_KEY,
            visibleZHTW:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_ZHTW).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_ZHTW).value == SHEET_TRUE_KEY,
            visibleJA:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_JA).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_JA).value == SHEET_TRUE_KEY,
            visibleTH:
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_TH).value &&
              sheet.getCell(i, PRODUCT_COLUMN_NUMBER.VISIBLE_TH).value == SHEET_TRUE_KEY,
            categoryName: safeString(sheet.getCell(i, PRODUCT_COLUMN_NUMBER.CATEGORY).value),
            detailPageName: safeString(sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DETAIL_PAGE).value),
            name: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME).value,
            nameEN: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME_EN).value,
            nameZH: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME_ZH).value,
            nameZHTW: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME_ZHTW).value,
            nameJA: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME_JA).value,
            nameTH: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.NAME_TH).value,
            description: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION).value,
            descriptionEN: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION_EN).value,
            descriptionZH: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION_ZH).value,
            descriptionZHTW: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION_ZHTW).value,
            descriptionJA: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION_JA).value,
            descriptionTH: sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DESCRIPTION_TH).value,
            price: Number(sheet.getCell(i, PRODUCT_COLUMN_NUMBER.PRICE).value),
            ...(sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DISCOUNT_PRICE).value && {
              discountPrice: Number(sheet.getCell(i, PRODUCT_COLUMN_NUMBER.DISCOUNT_PRICE).value),
            }),
            order: i,
          }),
        )
      }
    }
    return products
  }

  static async getEventsFromSpreadsheet(url: string, bundleId: string) {
    const spreadsheetId = url.match(/\/d\/(.+)\//)[1]
    const doc = new GoogleSpreadsheet(spreadsheetId, this.config)

    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    await sheet.loadCells()

    // 빈칸에 toString() 해서 발생하는 에러 예방
    function safeString(value: any): string {
      return value ? value.toString().trim() : ""
    }

    const events = []
    for (let i = 1; i < sheet.rowCount; i++) {
      if (sheet.getCell(i, EVENT_COLUMN_NUMBER.NAME).value && sheet.getCell(i, EVENT_COLUMN_NUMBER.NAME).value != "") {
        const label = []
        if (
          sheet.getCell(i, EVENT_COLUMN_NUMBER.LABEL_NEW).value &&
          sheet.getCell(i, EVENT_COLUMN_NUMBER.LABEL_NEW).value == SHEET_TRUE_KEY
        ) {
          label.push(EventLabel.NEW)
        }
        if (
          sheet.getCell(i, EVENT_COLUMN_NUMBER.LABEL_POP).value &&
          sheet.getCell(i, EVENT_COLUMN_NUMBER.LABEL_POP).value == SHEET_TRUE_KEY
        ) {
          label.push(EventLabel.POP)
        }
        if (
          sheet.getCell(i, EVENT_COLUMN_NUMBER.LABEL_BEST).value &&
          sheet.getCell(i, EVENT_COLUMN_NUMBER.LABEL_BEST).value == SHEET_TRUE_KEY
        ) {
          label.push(EventLabel.BEST)
        }
        if (
          sheet.getCell(i, EVENT_COLUMN_NUMBER.LABEL_KAKAO).value &&
          sheet.getCell(i, EVENT_COLUMN_NUMBER.LABEL_KAKAO).value == SHEET_TRUE_KEY
        ) {
          label.push(EventLabel.KAKAO)
        }
        events.push(
          Object.assign(new CreateEventFromGoogleSpreadsheetDto(), {
            visible:
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE).value &&
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE).value == SHEET_TRUE_KEY,
            visibleEN:
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE_EN).value &&
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE_EN).value == SHEET_TRUE_KEY,
            visibleZH:
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE_ZH).value &&
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE_ZH).value == SHEET_TRUE_KEY,
            visibleZHTW:
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE_ZHTW).value &&
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE_ZHTW).value == SHEET_TRUE_KEY,
            visibleJA:
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE_JA).value &&
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE_JA).value == SHEET_TRUE_KEY,
            visibleTH:
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE_TH).value &&
              sheet.getCell(i, EVENT_COLUMN_NUMBER.VISIBLE_TH).value == SHEET_TRUE_KEY,
            categoryName: safeString(sheet.getCell(i, EVENT_COLUMN_NUMBER.CATEGORY).value),
            detailPageName: sheet.getCell(i, EVENT_COLUMN_NUMBER.DETAIL_PAGE).value.toString().trim(),
            bundleId: bundleId,
            name: sheet.getCell(i, EVENT_COLUMN_NUMBER.NAME).value,
            nameEN: sheet.getCell(i, EVENT_COLUMN_NUMBER.NAME_EN).value,
            nameZH: sheet.getCell(i, EVENT_COLUMN_NUMBER.NAME_ZH).value,
            nameZHTW: sheet.getCell(i, EVENT_COLUMN_NUMBER.NAME_ZHTW).value,
            nameJA: sheet.getCell(i, EVENT_COLUMN_NUMBER.NAME_JA).value,
            nameTH: sheet.getCell(i, EVENT_COLUMN_NUMBER.NAME_TH).value,
            description: sheet.getCell(i, EVENT_COLUMN_NUMBER.DESCRIPTION).value,
            descriptionEN: sheet.getCell(i, EVENT_COLUMN_NUMBER.DESCRIPTION_EN).value,
            descriptionZH: sheet.getCell(i, EVENT_COLUMN_NUMBER.DESCRIPTION_ZH).value,
            descriptionZHTW: sheet.getCell(i, EVENT_COLUMN_NUMBER.DESCRIPTION_ZHTW).value,
            descriptionJA: sheet.getCell(i, EVENT_COLUMN_NUMBER.DESCRIPTION_JA).value,
            descriptionTH: sheet.getCell(i, EVENT_COLUMN_NUMBER.DESCRIPTION_TH).value,
            price: Number(sheet.getCell(i, EVENT_COLUMN_NUMBER.PRICE).value),
            ...(sheet.getCell(i, EVENT_COLUMN_NUMBER.DISCOUNT_PRICE).value && {
              discountPrice: Number(sheet.getCell(i, EVENT_COLUMN_NUMBER.DISCOUNT_PRICE).value),
            }),
            order: i,
            ...(label.length > 0 && { label: label }),
          }),
        )
      }
    }
    return events
  }
}
