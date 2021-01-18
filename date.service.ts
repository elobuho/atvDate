import { Injectable } from '@angular/core';
import * as dayjs from 'dayjs';
import * as localeData from 'dayjs/plugin/localeData';
import * as weekday from 'dayjs/plugin/weekday';

@Injectable({
  providedIn: 'root',
})
export class AtvDateService {
  constructor() {
    dayjs.extend(localeData);
    dayjs.extend(weekday);
  }

  async setLocale(locale: string): Promise<any> {
    await import(`dayjs/locale/${locale}.js`);
    dayjs.locale(locale);
  }

  format(dayjsObj: dayjs.Dayjs, formatTpl = 'DD-MM-YYYY'): string {
    return dayjs(dayjsObj).format(formatTpl);
  }

  getNow(): dayjs.Dayjs {
    return dayjs();
  }

  skip(date: dayjs.Dayjs, amount: number, unit: dayjs.OpUnitType): dayjs.Dayjs {
    return date.add(amount, unit);
  }

  getDateFromISO(isoDate: string): dayjs.Dayjs {
    const date = dayjs(isoDate);
    if (date.isValid()) {
      return date.clone();
    } else {
      throw new Error('Invalid date.');
    }
  }

  getDateAsISO(date: dayjs.Dayjs): string {
    return date.toISOString();
  }

  getWeekdays(): string[] {
    return dayjs.weekdaysShort(true);
  }

  generateCalendar(date: dayjs.Dayjs): Array<Array<dayjs.Dayjs>> {
    const rows = [[]];
    let rowIndex = 0;
    const year = date.year();
    const month = date.month();
    const daysInMonth = date.daysInMonth();

    // Active month
    for (let dayNo = 1; dayNo <= daysInMonth; dayNo++) {
      const day = dayjs(new Date(year, month, dayNo));
      rows[rowIndex].push(day);
      // Push a new row on the last day of the week, but don't create an empty row
      if (day.weekday() === 6 && day.date() !== daysInMonth) {
        rowIndex++;
        rows.push([]);
      }
    }

    // Weekdays from the previous month ...
    const firstRow = rows[0];
    const lastRow = rows[rows.length - 1];

    if (firstRow.length < 7) {
      const firstDay = firstRow[0].clone();
      for (let dayNo = 1; firstRow.length < 7; dayNo++) {
        const day = firstDay.subtract(dayNo, 'day');
        firstRow.unshift(day);
      }
    }

    // ... and next month
    if (lastRow.length < 7) {
      const [lastDay] = lastRow.slice(-1);
      for (let dayNo = 1; lastRow.length < 7; dayNo++) {
        const day = lastDay.add(dayNo, 'day');
        lastRow.push(day);
      }
    }

    return rows;
  }
}
