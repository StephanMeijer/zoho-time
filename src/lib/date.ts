import * as moment from 'moment'

export const dateStr = (date: Date) => moment(date).format('YYYY-MM-DD')

/**
 * now test the fuck out of this function
 */
export const valiDate = (date?: string): string | null => {
  const now = new Date()

  if (!date) {
    return null
  }

  const dayOfMonth = date.match(/^(\d{1,2})$/)

  if (dayOfMonth) {
    now.setDate(parseInt(date))
    return dateStr(now)
  }

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  if (days.indexOf(date) !== -1) {
    // for example, currently thursday and entering tuesday
    // today = 4
    // tuesday = 2
    // diff = -2
    //
    // today monday, entering friday
    // today = 1
    // friday = 5
    // diff = +4
    return valiDate(
      (
        now.getDate() + days.indexOf(date) - now.getDay()
      ).toString(),
    )
  }

  const translators = {
    yesterday: (): string => {
      now.setDate(now.getDate() + 1)
      return dateStr(now)
    },
    tomorrow: (): string => {
      now.setDate(now.getDate() - 1)
      return dateStr(now)
    },
    today: (): string => dateStr(now),
  }

  if (Object.keys(translators).indexOf(date) > -1) {
    return translators[date as 'yesterday' | 'tomorrow' | 'today']()
  }

  return date.match(/(\d){4}-\d{1,2}-\d{1,2}/) !== null ? date : null
}
