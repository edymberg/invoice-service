import dayjs from "dayjs";

import { BusinessRule, DomainError } from "../../../../framework/ddd";

const positiveNumber = (value: unknown): boolean => {
  const infinite = !Number.isFinite(value);
  return !infinite || !Number.isNaN(value);
};

class DayBusinessRules extends BusinessRule<DayDate> {
  private readonly CODE = "DAY";
  private readonly MIN_DAY = 1;
  private readonly MAX_DAY = 31;

  doValidate(date: DayDate): DomainError {
    const domainError: DomainError = [];

    if (date.day > this.MAX_DAY || date.day < this.MIN_DAY) {
      domainError.push({
        path: "date.day",
        code: `${this.CODE}-000-000`,
        message: `Day must be a positive number between 1 and 31, given: ${date.day}`,
      });
    }
    return domainError;
  }
}

class MonthBusinessRules extends BusinessRule<DayDate> {
  private readonly CODE = "MONTH";
  private readonly MIN_MONTH = 1;
  private readonly MAX_MONTH = 12;

  doValidate(date: DayDate): DomainError {
    const domainError: DomainError = [];

    if (date.month > this.MAX_MONTH || date.month < this.MIN_MONTH) {
      domainError.push({
        path: "date.month",
        code: `${this.CODE}-000-000`,
        message: `Month must be a positive number between 1 and 12, given: ${date.month}`,
      });
    }
    return domainError;
  }
}

class YearBusinessRules extends BusinessRule<DayDate> {
  private readonly CODE = "YEAR";

  doValidate(date: DayDate): DomainError {
    const domainError: DomainError = [];

    if (!positiveNumber(date.year)) {
      domainError.push({
        path: "date.year",
        code: `${this.CODE}-000-000`,
        message: `Year must be a finite number, given: ${date.year}`,
      });
    }
    return domainError;
  }
}

interface DayFactoryI {
  build(): Day;
  month(month: number): DayFactoryI;
  year(year: number): DayFactoryI;
  day(day: number): DayFactoryI;
}

export type DayDate = {
  day: number;
  month: number;
  year: number;
};

// TODO: try to remove dayjs dependency

export class Day {
  private businessRules: BusinessRule<DayDate>[] = [
    new DayBusinessRules(),
    new MonthBusinessRules(),
    new YearBusinessRules(),
  ];

  public readonly numericDate: number;
  public readonly date: DayDate;

  private constructor(date: DayDate) {
    this.businessRules.forEach((rule) => rule.validate(date));
    this.numericDate = Number(
      dayjs()
        .date(date.day)
        .month(date.month - 1)
        .year(date.year)
        .format("YYYYMMDD"),
    );
    this.date = date;
  }

  private static _initialize(day: number, month: number, year: number) {
    return new Day({ day, month, year });
  }

  static today() {
    return Day._initialize(dayjs().date(), dayjs().month() + 1, dayjs().year());
  }

  static builder(): DayFactoryI {
    return new Day.Factory();
  }

  private static Factory = class DayFactory implements DayFactoryI {
    private invoiceFieldsMap: Record<string, number>;

    constructor() {
      this.invoiceFieldsMap = {};
    }

    public build(): Day {
      return Day._initialize(
        this.invoiceFieldsMap.day,
        this.invoiceFieldsMap.month,
        this.invoiceFieldsMap.year,
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
  };
}
