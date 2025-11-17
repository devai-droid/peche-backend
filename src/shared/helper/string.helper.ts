export class StringHelper {
  static toBoolean(str?: string): boolean {
    return str?.toLocaleLowerCase() == "true"
  }

  static toNumberOrUndefined(str?: string): number | undefined {
    if (str) {
      return Number(str)
    }
    return undefined
  }

  static chunk(str: string, size: number) {
    return str.match(new RegExp(`.{1,${size}}`, "g"))
  }

  static formatCreditCard(str?: string) {
    if (!str) {
      return str
    }
    return this.chunk(str, 4)?.join("-")
  }

  static toAgeGroup(birthdate?: string) {
    if (!birthdate) {
      return "-"
    }
    const birthYear = birthdate.substring(0, 4)
    const thisYear = new Date().getFullYear()
    const age = thisYear - Number(birthYear)
    if (age < 10) {
      return "-"
    } else {
      return `${`${age}`.substring(0, 1)}0대`
    }
  }
}
