import { BadRequestException } from "@nestjs/common"
import { TransformFnParams } from "class-transformer"
import { SortOrder } from "../dto/pagination-query.dto"

export class DtoHelper {
  static explodeParamValue(params?: TransformFnParams) {
    if (typeof params?.value == "string") {
      return params?.value.split(",")
    }
    return params?.value
  }

  static booleanParamValue(params?: TransformFnParams) {
    if (typeof params?.value == "string") {
      return params.value.toLocaleLowerCase() == "true"
    }
    return params?.value
  }

  static checkSortParams(sortBy?: string[], sortOrder?: SortOrder[]) {
    if (sortBy && sortOrder && sortBy.length != sortOrder.length) {
      throw new BadRequestException("sort paramemter is wrong")
    } else if (sortBy && !sortOrder) {
      throw new BadRequestException("sortOrder is empty")
    } else if (!sortBy && sortOrder) {
      throw new BadRequestException("sortBy is empty")
    }
  }

  static checkProperties(entityFields: string[], properties: string[]) {
    const nonProps = []
    for (const prop of properties) {
      if (!entityFields.includes(prop)) {
        nonProps.push(prop)
      }
    }
    if (nonProps.length > 0) {
      throw new BadRequestException(`wrong properties: ${nonProps}`)
    }
  }
}
