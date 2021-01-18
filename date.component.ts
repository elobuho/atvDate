import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Dayjs } from 'dayjs';
import { AtvDateService } from './date.service';

@Component({
  selector: 'atv-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateComponent),
      multi: true,
    },
  ],
})
export class DateComponent implements OnInit, ControlValueAccessor {
  isSelectVisible = false;
  @Input()
  displayFormat = 'DD-MM-YYYY';
  @Input()
  locale = 'pl';
  @Input('active')
  activeInput: string;

  activeDate: Dayjs;
  now: Dayjs;

  inputValue = new FormControl('');

  // Calendar elements
  get calActive(): string {
    return this.date.format(this.activeDate, this.displayFormat);
  }
  weekdays: string[] = [];
  calendar: Dayjs[][];

  isDayPrev(day: Dayjs): boolean {
    if (day.format('YYYYMM') < this.activeDate.format('YYYYMM')) {
      return true;
    }
    return false;
  }

  isDayNext(day: Dayjs): boolean {
    if (day.format('YYYYMM') > this.activeDate.format('YYYYMM')) {
      return true;
    }
    return false;
  }

  onClick(): void {
    this.isSelectVisible = !this.isSelectVisible;
  }

  onChangeMonth(amount: number): void {
    this.activeDate = this.date.skip(this.activeDate, amount, 'month');
    this.calendar = this.date.generateCalendar(this.activeDate);
  }

  goToDay(day: Dayjs): void {
    const prevActiveDay = this.activeDate;
    this.activeDate = day;
    this.inputValue.setValue(this.calActive);
    this.onChange(this.date.getDateAsISO(this.activeDate));
    if (day.month() !== prevActiveDay.month()) {
      this.calendar = this.date.generateCalendar(this.activeDate);
    }
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private date: AtvDateService
  ) {}

  onChange: (value) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(isoDate: string): void {
    const date = this.date.getDateFromISO(isoDate);
    this.activeDate = date.clone();
    this.inputValue.setValue(this.calActive);
    this.cd.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    if (disabled) {
      this.inputValue.disable();
    } else {
      this.inputValue.enable();
    }
  }

  ngOnInit(): void {
    this.renderer.listen('window', 'click', (e: any) => {
      if (e.path.indexOf(this.el.nativeElement) < 0) {
        this.isSelectVisible = false;
        this.cd.markForCheck();
      }
    });
    if (!this.activeDate) {
      this.activeDate = this.date.getNow();
    }
    this.now = this.date.getNow();
    this.date.setLocale(this.locale).then(() => {
      this.weekdays = this.date.getWeekdays();
      this.calendar = this.date.generateCalendar(this.activeDate);
    });
  }
}
