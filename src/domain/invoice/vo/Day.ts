import dayjs from "dayjs";

interface DayFactoryI {
  build(): Day
  month(month: number): DayFactoryI
  year(year: number): DayFactoryI
  day(day: number): DayFactoryI
}

class DayFactory implements DayFactoryI {
  private invoiceFieldsMap: Record<string, number>;

  constructor() {
    this.invoiceFieldsMap = {};
  }

  public build(): Day {
    return Day.initialize(
      this.invoiceFieldsMap.day,
      this.invoiceFieldsMap.month,
      this.invoiceFieldsMap.year
    );
  }

  public month(month: number): DayFactoryI {
    this.invoiceFieldsMap.month = month;
    return this;
  }
  public year(year: number): DayFactoryI {
    this.invoiceFieldsMap.year = year;
    return this;
  }

  public day(day: number): DayFactoryI {
    this.invoiceFieldsMap.day = day;
    return this;
  }
}

export type DayDate = {
  day: number;
  month: number;
  year: number;
}

// TODO: try to remove dayjs dependency

export class Day {
  public readonly numericDate: number;
  public readonly date: DayDate;

  private constructor(date: DayDate) {
    this.numericDate = Number(dayjs().date(date.day).month(date.month-1).year(date.year).format("YYYYMMDD"));
    this.date = date;
  }

  static initialize(day: number, month: number, year: number) {
    return new Day({ day, month, year });
  }

  static today() {
    return Day.initialize(dayjs().date(), dayjs().month() + 1, dayjs().year());
  }

  static builder(): DayFactoryI {
    return new DayFactory();
  }
}