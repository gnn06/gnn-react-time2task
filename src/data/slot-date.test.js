import { beforeEach, describe, expect, vi } from 'vitest'

import { getDate, getDateString, getDefaultDates, getISODate, shiftDate } from "./slot-date";

describe('getDate', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers()
        const date = new Date(2025, 0, 3, 13, 35, 45)
        vi.setSystemTime(date)
      })
      afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers()
      })
    test('snapDate don\'t , no shift', () => {
        const givenSlot     = {id:'this_week'}
        const givenSnapDate = []
        const expectedDate  = "2024-12-30"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    })
    
    test('snapDate exist, no shift', () => {
        const givenSlot     = {id:'this_week'}
        const givenSnapDate = [{slotid: 'this_week',date: "2024-12-07"}]
        const expectedDate  = "2024-12-07"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    });
    
    test('snapDate don\'t exist => default + shift', () => {
        const givenSlot     = {id:'next_week'}
        const givenSnapDate = []
        const expectedDate  = "2025-01-06"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    })
    
    test('snapDate exist => shift', () => {
        const givenSlot     = {id:'next_week'}
        const givenSnapDate = [{slotid: 'this_week',date: "2024-12-07"}]
        const expectedDate  = "2024-12-14"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    })

    test('snapDate exist, no shift, month', () => {
        const givenSlot     = {id:'this_month'}
        const givenSnapDate = [{slotid: 'this_month',date: "2024-01-01"}]
        const expectedDate  = "2024-01"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    })
    test('snapDate exist, shift, month', () => {
        const givenSlot     = {id:'next_month'}
        const givenSnapDate = [{slotid: 'this_month',date: "2024-01-01"}]
        const expectedDate  = "2024-02"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    })
    
    
    // TODO vérifier les autres level month, day    
});

test('getISODate', () => {
    const result = getISODate(new Date("2024-12-25T02:15:45Z"))
    expect(result).toEqual("2024-12-25")
});

describe('getDefaultDate', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers()
        const date = new Date(2025, 0, 3, 13, 35, 45)
        vi.setSystemTime(date)
      })
      afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers()
      })
    test('nominal', () => {
        const result = getDefaultDates()
        const expected = [{ slotid:"this_month", date: "2025-01" }, { slotid:"this_week", date: "2024-12-30" }]
        expect(result).toEqual(expected)
    });
});

describe('getDateString', () => {
    test('week', () => {
        const result = getDateString(new Date("2024-01-01"), 2)
        expect(result).toEqual("2024-01-01")
    });

    test('month', () => {
        const result = getDateString(new Date("2024-01-01"), 1)
        expect(result).toEqual("2024-01")
    })
});

describe('shiftDate', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers()
        const date = new Date(2025, 0, 3, 13, 35, 45)
        vi.setSystemTime(date)
    })
    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers()
    })
    test('month, not null', () => {
        const result = shiftDate("2024-12", "month")
        expect(result).toEqual("2025-01")
    });
    test('week, not null', () => {
        const result = shiftDate("2024-12-01", "week")
        expect(result).toEqual("2024-12-08")
    });
    test('month, null', () => {
        const result = shiftDate("", "month")
        expect(result).toEqual("")
    });
    test('week, null', () => {
        const result = shiftDate("", "week")
        expect(result).toEqual("")
    });
});
