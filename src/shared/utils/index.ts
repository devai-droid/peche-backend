import { DaysOfWeek } from "@root/shared/enum/reservation"

export async function sleep(mSec: number) {
  await new Promise((resolve) => setTimeout(resolve, mSec))
}

export function randomXDigit(digit: number) {
  const min = 10 ** (digit - 1)
  const max = min * 9
  return `${Math.floor(Math.random() * max) + min}`
}

export function removeHyphen(str: string) {
  return str ? str.replaceAll("-", "") : str
}

export function numberToDayOfWeekString(dayOfWeek: number) {
  switch (dayOfWeek) {
    case 0:
      return DaysOfWeek.SUN
    case 1:
      return DaysOfWeek.MON
    case 2:
      return DaysOfWeek.TUE
    case 3:
      return DaysOfWeek.WED
    case 4:
      return DaysOfWeek.THU
    case 5:
      return DaysOfWeek.FRI
    case 6:
      return DaysOfWeek.SAT
    default:
      return undefined
  }
}
