import * as _ from "lodash"

export class ObjectHelper {
  public static toNumberOrUndefined(src?: any) {
    if (!src) {
      return undefined
    }
    if (typeof src === "string" && src == "") {
      return undefined
    }
    if (!isNaN(src)) {
      return _.toNumber(src)
    }
  }

  public static isNumeric(value) {
    return !_.isNaN(parseFloat(value)) || _.isFinite(value)
  }
}
