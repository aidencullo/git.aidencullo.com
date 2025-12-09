import { DEFAULT_LOCALE, DEFAULT_TIME_ZONE } from '../constants/time';

export function formatDateToTimeZone(
  date: Date,
  timeZone: string = DEFAULT_TIME_ZONE,
  locale: string = DEFAULT_LOCALE,
) {
  return date.toLocaleDateString(locale, { timeZone });
}

export function getRelativeDate(base: Date, daysOffset: number) {
  const adjusted = new Date(base);
  adjusted.setDate(adjusted.getDate() + daysOffset);
  return adjusted;
}

