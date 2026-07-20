export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function getMonday(date = new Date()) {
  const result = new Date(date)
  const day = result.getUTCDay()
  result.setUTCDate(result.getUTCDate() - (day === 0 ? 6 : day - 1))
  result.setUTCHours(0, 0, 0, 0)
  return result
}

export function getWeekDates(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setUTCDate(date.getUTCDate() + index)
    return date
  })
}

export function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return toDateKey(date)
}
