export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(month: string): string {
  const [year, number] = month.split('-')
  return `${year}년 ${Number(number)}월`
}

export function shiftMonth(month: string, offset: number): string {
  const [year, number] = month.split('-').map(Number)
  return monthKey(new Date(year, number - 1 + offset, 1))
}
