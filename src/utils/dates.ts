import { format, parseISO } from 'date-fns'

export const todayISO = () => format(new Date(), 'yyyy-MM-dd')

export const formatDateNice = (iso: string) =>
  format(parseISO(iso), 'EEEE, MMMM d')