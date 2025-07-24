import { format, parse, isValid, parseISO, formatISO } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { enUS } from 'date-fns/locale';
;
export interface DateRange {
  start: Date,
  end: Date,
}
export interface FormattedDate {
  date: Date,
  formatted: string,
  iso: string,
  timestamp: number,
}
export interface TimeZoneInfo {
  timezone: string,
  offset: number,
  abbreviation: string,
}
export interface DateValidationResult {
  isValid: boolean,
  error?: string
  date?: Date}
export interface RelativeTimeOptions {
  numeric?: 'always' | 'auto'
  style?: 'long' | 'short' | 'narrow'}
export type DateFormat = 'short' | 'medium' | 'long' | 'full' | 'iso' | 'custom';
;
export type TimeFormat = 'short' | 'medium' | 'long' | 'full' | '24h' | '12h';
;
export const DATE_FORMATS: Record<DateFormat, string> = {
  short: 'MM/dd/yyyy',
  medium: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  full: 'EEEE, MMMM dd, yyyy',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  custom: 'yyyy-MM-dd'
}
export const TIME_FORMATS: Record<TimeFormat, string> = {
  short: 'h:mm a',
  medium: 'h:mm:ss a',
  long: 'h:mm:ss a zzz',
  full: 'h:mm:ss a zzzz',
  '24h': 'HH:mm:ss',
  '12h': 'h:mm:ss a'
}
export const DEFAULT_TIMEZONE = 'UTC';
export const DEFAULT_LOCALE = enUS;
export const MILLISECONDS_IN_DAY = 86400000;
export const MILLISECONDS_IN_HOUR = 3600000;
export const MILLISECONDS_IN_MINUTE = 60000;

Execution error
