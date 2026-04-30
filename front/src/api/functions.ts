export function pluralize(n: any, forms: any) {
  const absN = Math.abs(n) % 100
  const n1 = absN % 10

  if (absN > 10 && absN < 20) return forms[2]
  if (n1 === 1) return forms[0]
  if (n1 >= 2 && n1 <= 4) return forms[1]

  return forms[2]
}
