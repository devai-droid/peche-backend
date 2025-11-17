export class ArrayHelper {
  public static chunk(array: Array<any>, size: number) {
    const chunked = []
    for (let i = 0; i < array.length; i += size) {
      const chunk = array.slice(i, i + size)
      chunked.push(chunk)
    }
    return chunked
  }
}

export const isArrayOf =
  <T>(elemGuard: (x: any) => x is T) =>
  (arr: any[]): arr is Array<T> =>
    arr.every(elemGuard)

export const isInstanceOf =
  <T>(ctor: new (...args: any) => T) =>
  (x: any): x is T =>
    x instanceof ctor
