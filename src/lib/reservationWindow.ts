const RESERVATION_START_HOUR = 8;
const RESERVATION_END_HOUR = 17;

export interface ReservationWindowStatus {
  isOpen: boolean;
  timeZone: string;
  windowLabel: string;
}

export function getDateStringInTimeZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

export function isPastDateInTimeZone(dateStr: string, now: Date, timeZone: string): boolean {
  const today = getDateStringInTimeZone(now, timeZone);
  return dateStr < today;
}

function getCurrentHourAndMinuteInTimeZone(now: Date, timeZone: string): {
  hour: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const hourPart = parts.find((part) => part.type === 'hour')?.value;
  const minutePart = parts.find((part) => part.type === 'minute')?.value;

  const hour = Number(hourPart ?? '0');
  const minute = Number(minutePart ?? '0');

  return { hour, minute };
}

export function getReservationWindowStatus(
  now: Date,
  configuredTimeZone: string
): ReservationWindowStatus {
  const safeTimeZone = configuredTimeZone || 'UTC';
  const { hour, minute } = getCurrentHourAndMinuteInTimeZone(now, safeTimeZone);
  const currentMinutes = hour * 60 + minute;
  const startMinutes = RESERVATION_START_HOUR * 60;
  const endMinutes = RESERVATION_END_HOUR * 60;

  return {
    isOpen: currentMinutes >= startMinutes && currentMinutes < endMinutes,
    timeZone: safeTimeZone,
    windowLabel: '08:00-17:00',
  };
}
