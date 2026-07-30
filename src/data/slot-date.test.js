import { beforeEach, describe, expect, vi } from 'vitest'

import { getDate, getDateString, getDefaultDates, getISODate, getSnapDateToSave, getSnapSlotId, shiftDate, getCurrentWeekdayId } from "./slot-date";

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
    test('following_week', () => {
        const givenSlot     = { id: "following_week" }
        const givenSnapDate = [{ slotid: "this_week", date: "2025-01-06" }]
        const expectedDate  = "2025-01-20"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    });
    test('following_week + 1', () => {
        const givenSlot     = { id: "following_week + 1" }
        const givenSnapDate = [{ slotid: "this_week", date: "2025-01-06" }]
        const expectedDate  = "2025-01-27"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    });
    test('snapDate exist, no shift, month', () => {
        const givenSlot     = {id:'this_month'}
        const givenSnapDate = [{slotid: 'this_month',date: "2024-01-01"}]
        const expectedDate  = "2024-01"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    });
    test('this_month + 1', () => {
        const givenSlot     = {id:'this_month + 1'}
        const givenSnapDate = [{slotid: 'this_month',date: "2024-01-01"}]
        const expectedDate  = "2024-02"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    });
    test('next_month + 1', () => {
        const givenSlot     = {id:'next_month + 1'}
        const givenSnapDate = [{slotid: 'this_month',date: "2024-01-01"}]
        const expectedDate  = "2024-03"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    });
    test('snapDate exist, shift, month', () => {
        const givenSlot     = {id:'next_month'}
        const givenSnapDate = [{slotid: 'this_month',date: "2024-01-01"}]
        const expectedDate  = "2024-02"
        const result = getDate(givenSlot, givenSnapDate)
        expect(result).toEqual(expectedDate)
    })    
    
    
    // TODO vérifier les autres level month, day

    describe('C2a — niveau 3 (today/tomorrow/weekdays)', () => {
        const snapDates = [
            { slotid: 'this_month', date: '2025-01' },
            { slotid: 'this_week',  date: '2024-12-30' },
            { slotid: 'today',      date: '2025-01-03' },
        ]

        test('today → snapDate.date', () => {
            expect(getDate({ id: 'today' }, snapDates)).toBe('2025-01-03')
        })

        test('tomorrow → snapDate + 1 jour', () => {
            expect(getDate({ id: 'tomorrow' }, snapDates)).toBe('2025-01-04')
        })

        test('today sans snapDate jour → date courante par défaut', () => {
            expect(getDate({ id: 'today' }, [])).toBe('2025-01-03')
        })

        test('lundi → lundi de la semaine courante (décalage 0)', () => {
            expect(getDate({ id: 'lundi' }, snapDates)).toBe('2024-12-30')
        })

        test('mardi → mardi de la semaine courante (décalage 1)', () => {
            expect(getDate({ id: 'mardi' }, snapDates)).toBe('2024-12-31')
        })

        test('vendredi → vendredi de la semaine courante (décalage 4)', () => {
            expect(getDate({ id: 'vendredi' }, snapDates)).toBe('2025-01-03')
        })

        test('lundi sans snapDate semaine → défaut ISO semaine', () => {
            expect(getDate({ id: 'lundi' }, [])).toBe('2024-12-30')
        })
    })
});

test('getISODate', () => {
    const result = getISODate(new Date("2024-12-25T02:15:45Z"))
    expect(result).toEqual("2024-12-25")
});

describe('getCurrentWeekdayId — jour du today STOCKÉ (snapDates), pas l\'horloge', () => {
    // this_week = lundi 2023-12-18
    const week = { slotid: 'this_week', date: '2023-12-18' };
    test('today mercredi (2023-12-20) → mercredi', () => {
        expect(getCurrentWeekdayId([week, { slotid: 'today', date: '2023-12-20' }])).toBe('mercredi');
    });
    test('today lundi (= début de semaine) → lundi', () => {
        expect(getCurrentWeekdayId([week, { slotid: 'today', date: '2023-12-18' }])).toBe('lundi');
    });
    test('today vendredi (2023-12-22) → vendredi', () => {
        expect(getCurrentWeekdayId([week, { slotid: 'today', date: '2023-12-22' }])).toBe('vendredi');
    });
    test('today samedi (2023-12-23) → samedi (hors weekday → overflow côté vue)', () => {
        expect(getCurrentWeekdayId([week, { slotid: 'today', date: '2023-12-23' }])).toBe('samedi');
    });
    test('today hors de la semaine (semaine suivante) → null', () => {
        expect(getCurrentWeekdayId([week, { slotid: 'today', date: '2023-12-25' }])).toBe(null);
    });
    test('indépendant de l\'horloge : today stocké mercredi même si système = mardi', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2023-12-19')); // mardi système
        expect(getCurrentWeekdayId([week, { slotid: 'today', date: '2023-12-20' }])).toBe('mercredi');
        vi.useRealTimers();
    });
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
    test('nominal — C2a : contient now month, this_week et today', () => {
        const result = getDefaultDates()
        const expected = [
            { slotid:"this_month", date: "2025-01" },
            { slotid:"this_week",  date: "2024-12-30" },
            { slotid:"today",      date: "2025-01-03" },
        ]
        expect(result).toEqual(expected)
    });
});

describe('getDefaultDates — VITE_FAKE_NOW', () => {
    beforeEach(() => { vi.stubEnv('VITE_FAKE_NOW', '2025-01-03') })
    afterEach(() => { vi.unstubAllEnvs() })

    test('respecte VITE_FAKE_NOW (vendredi 2025-01-03)', () => {
        const result = getDefaultDates()
        expect(result).toEqual([
            { slotid: 'this_month', date: '2025-01' },
            { slotid: 'this_week',  date: '2024-12-30' },
            { slotid: 'today',      date: '2025-01-03' },
        ])
    })
})

describe('getDateString', () => {
    test('week', () => {
        const result = getDateString(new Date("2024-01-01"), 2)
        expect(result).toEqual("2024-01-01")
    });

    test('month', () => {
        const result = getDateString(new Date("2024-01-01"), 1)
        expect(result).toEqual("2024-01")
    })

    test('day — E1b', () => {
        const result = getDateString(new Date("2024-01-15"), 3)
        expect(result).toEqual("2024-01-15")
    })
});

describe('getSnapSlotId — E1a', () => {
    test('month → this_month', () => {
        expect(getSnapSlotId('month')).toBe('this_month')
    })
    test('week → this_week', () => {
        expect(getSnapSlotId('week')).toBe('this_week')
    })
    test('day → today', () => {
        expect(getSnapSlotId('day')).toBe('today')
    })
});

describe('getSnapDateToSave — snapDate vide (pas de snap en BDD)', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2025, 0, 3, 13, 35, 45))
    })
    afterEach(() => { vi.useRealTimers() })

    test('day, snapDate="" → date du jour par défaut (ne plante pas)', () => {
        expect(getSnapDateToSave('day', '')).toBe('2025-01-03')
    })
    test('week, snapDate="" → lundi de la semaine courante par défaut', () => {
        expect(getSnapDateToSave('week', '')).toBe('2024-12-30')
    })
    test('month, snapDate="" → premier du mois courant par défaut', () => {
        expect(getSnapDateToSave('month', '')).toBe('2025-01')
    })
});

describe('getSnapDateToSave — snapDate non vide (avancement)', () => {
    test('day → avance d\'un jour', () => {
        expect(getSnapDateToSave('day', '2025-01-03')).toBe('2025-01-04')
    })
    test('week → avance d\'une semaine', () => {
        expect(getSnapDateToSave('week', '2024-12-30')).toBe('2025-01-06')
    })
    test('month → avance d\'un mois', () => {
        expect(getSnapDateToSave('month', '2025-01')).toBe('2025-02')
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
    test('day, not null — C2a', () => {
        expect(shiftDate("2025-01-03", "day")).toEqual("2025-01-04")
    })
    test('day, null — C2a', () => {
        expect(shiftDate("", "day")).toEqual("")
    })
});
