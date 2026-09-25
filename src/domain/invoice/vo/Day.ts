import dayjs from "dayjs";

import { BusinessRule, BusinessRuleViolation } from "../../../../framework/ddd";

export class DayDateBusinessRuleViolation extends BusinessRuleViolation {
  constructor(message: string) {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const positiveNumber = (value: any): boolean => {
  const negative = value <= 0;
  const infinite = !Number.isFinite(value);
  return !negative || !infinite || !Number.isNaN(value);
};

class DayBusinessRules extends BusinessRule<DayDate> {
  doValidate(date: DayDate): BusinessRuleViolation | null {
    if (!positiveNumber(date.day) || date.day > 31) {
      return new DayDateBusinessRuleViolation(`Day must be a positive number, given: ${date.day}`);
    }
    return null;
  }
}

class MonthBusinessRules extends BusinessRule<DayDate> {
  doValidate(date: DayDate): BusinessRuleViolation | null {
    if (!positiveNumber(date.month) || date.month > 12) {
      return new DayDateBusinessRuleViolation(
        `Month must be a positive number between 1 and 12, given: ${date.month}`,
      );
    }
    return null;
  }
}

class YearBusinessRules extends BusinessRule<DayDate> {
  doValidate(date: DayDate): BusinessRuleViolation | null {
    if (!positiveNumber(date.year)) {
      return new DayDateBusinessRuleViolation(`Year must be a positive number, given: ${date.year}`);
    }
    return null;
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
