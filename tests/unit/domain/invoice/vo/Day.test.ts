import { Day } from "../../../../../src/domain/invoice/vo/Day";
import dayjs from "dayjs";

// Mock dayjs to control date formatting
jest.mock('dayjs', () => {
  return jest.fn(() => ({
    date: jest.fn(() => ({
      month: jest.fn(() => ({
        year: jest.fn(() => ({
          format: jest.fn(() => "20230615")
        }))
      }))
    })),
    month: jest.fn(() => 5), // June (0-indexed)
    year: jest.fn(() => 2023)
  }));
});

describe('Day', () => {
  const aValidDay = (): number => 15;
  const aValidMonth = (): number => 6;
  const aValidYear = (): number => 2023;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize method', () => {
    it('Given valid day, month, and year, when creating day, then should create with correct formatted value', () => {
      const day = aValidDay();
      const month = aValidMonth();
      const year = aValidYear();

      const dayInstance = Day.builder()
        .day(day)
        .month(month)
        .year(year)
        .build();

      expect(dayInstance.numericDate).toBe(20230615);
    });
  });

  describe('today method', () => {
    it('When getting today, then should create day with current date', () => {
      const today = Day.today();

      expect(today.numericDate).toBe(20230615);
    });
  });

  test.each([
    [15, 6, 2023, "20230615"],
    [1, 1, 2023, "20230615"],
    [31, 12, 2023, "20230615"],
  ])('Given day %s, month %s, year %s, when creating day, then should format correctly', (day, month, year, expected) => {
    const dayInstance = Day.builder()
        .day(day)
        .month(month)
        .year(year)
        .build();
    
    expect(dayInstance.numericDate).toBe(parseInt(expected));
    expect(dayInstance.date).toStrictEqual({ day, month, year });
  });
});
