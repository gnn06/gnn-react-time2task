import { vi } from 'vitest';
import { getSlotIdPrevious, getSlotIdFirstLevel, getSlotIdNextPrev as getSlotIdNextPrev, getSlotIdIndex, getSlotIdDistance, isSlotIdEquals } from './slot-id.js';

vi.useFakeTimers()
vi.setSystemTime(new Date('2023-12-20')) // mercredi

describe('getSlotIdPrevious', () => {
    test('month', () => {
        const given    = "next_month";
        const expected = "this_month"
        const result   = getSlotIdPrevious(given);
        expect(result).toEqual(expected)
    });
    test('week', () => {
        const given    = "next_week";
        const expected = "this_week"
        const result   = getSlotIdPrevious(given);
        expect(result).toEqual(expected)
    });
    test('day', () => {
        const given    = "mercredi";
        const expected = "mardi"
        const result   = getSlotIdPrevious(given);
        expect(result).toEqual(expected)
    });
    test('hour', () => {
        const given    = "aprem";
        const expected = "matin"
        const result   = getSlotIdPrevious(given);
        expect(result).toEqual(expected)
    });
    test('should return null when reach begin', () => {
        const result = getSlotIdPrevious('this_week')
        expect(result).toEqual('this_week')
    });
    test('restart', () => {
        const given    = "this_week";
        const expected = "next_week"
        const result   = getSlotIdPrevious(given, 2);
        expect(result).toEqual(expected)
    });

    test('should return previous bis', () => {
        const result = getSlotIdPrevious('following_week')
        expect(result).toEqual('next_week')
    });

    test('should return previous', () => {
        const result = getSlotIdPrevious('next_week')
        expect(result).toEqual('this_week')
    });

    test('should return last', () => {
        const result = getSlotIdPrevious('this_week', 2)
        expect(result).toEqual('next_week')
    });

    test('should return null when repetition over end', () => {
        const result = getSlotIdPrevious('this_week', 3)
        expect(result).toEqual(null)
    }); 

    test('repetition = 1', () => {
        const result = getSlotIdPrevious('this_week', 1)
        expect(result).toEqual(null)
    })
});

describe('getFirstLevelSlot', () => {
    test('month', () => {
        const result = getSlotIdFirstLevel(1) 
        expect(result).toEqual('this_month')
    });
    
    test('week', () => {
        const result = getSlotIdFirstLevel(2) 
        expect(result).toEqual('this_week')
    })
});

describe('getSlotIdNext', () => {
    describe('next', () => {
        test('nominal', () => {
            const given    = "this_week"
            const expected = "next_week"
            const result = getSlotIdNextPrev(given, 1)
            expect(result).toEqual(expected)
        });
        test('max', () => {
            const given    = "following_week"
            const expected = "following_week + 1"
            const result = getSlotIdNextPrev(given, 1)
            expect(result).toEqual(expected)
        });
        test('shift', () => {
            const given    = "this_week + 3"
            const expected = "this_week + 4"
            const result = getSlotIdNextPrev(given, 1)
            expect(result).toEqual(expected)
        });
    });
    test('previous', () => {
        const given    = "next_week"
        const expected = "this_week"
        const result = getSlotIdNextPrev(given, -1)
        expect(result).toEqual(expected)
    })
    test('previous not exist', () => {
        const given    = "this_week"
        const expected = "this_week"
        const result = getSlotIdNextPrev(given, -1)
        expect(result).toEqual(expected)
    })
    test('previous shift', () => {
        const given    = "this_week + 4"
        const expected = "this_week + 3"
        const result = getSlotIdNextPrev(given, -1)
        expect(result).toEqual(expected)
    })
    test('previous shift 1', () => {
        const given    = "this_week + 1"
        const expected = "this_week"
        const result = getSlotIdNextPrev(given, -1)
        expect(result).toEqual(expected)
    })
    test('2', () => {
        const given    = "this_week"
        const expected = "following_week"
        const result = getSlotIdNextPrev(given, 2)
        expect(result).toEqual(expected)
    });
    test('-2', () => {
        const given    = "following_week"
        const expected = "this_week"
        const result = getSlotIdNextPrev(given, -2)
        expect(result).toEqual(expected)
    });
    test('2 becomes shift', () => {
        const given    = "following_week"
        const expected = "following_week + 2"
        const result = getSlotIdNextPrev(given, 2)
        expect(result).toEqual(expected)
    });
    test('2 shift', () => {
        const given    = "this_week + 1"
        const expected = "this_week + 3"
        const result = getSlotIdNextPrev(given, 2)
        expect(result).toEqual(expected)
    });
    test('-2 shift', () => {
        const given    = "this_week + 3"
        const expected = "this_week + 1"
        const result = getSlotIdNextPrev(given, -2)
        expect(result).toEqual(expected)
    });
});


describe('getSlotIdIndex', () => {
    test('this', () => {
        const given = "this_week"
        const expected = 0
        const result = getSlotIdIndex(given)
        expect(result).toEqual(expected)
    });
    test('nominal', () => {
        const given = "next_week"
        const expected = 1
        const result = getSlotIdIndex(given)
        expect(result).toEqual(expected)
    });
    test('shift', () => {
        const given = "next_week + 1"
        const expected = 2
        const result = getSlotIdIndex(given)
        expect(result).toEqual(expected)
    });
    test('do not exists', () => {
        const given = "notexist"
        const expected = -1
        const result = getSlotIdIndex(given)
        expect(result).toEqual(expected)
    })
});

describe('getSlotIdDistance', () => {
    test('nominal', () => {
        const givenPath1 = "mardi"
        const givenPath2 = "jeudi"
        const expected = 2
        const result = getSlotIdDistance(givenPath1, givenPath2)
        expect(result).toEqual(expected)
    });
    test('nominal opposé', () => {
        const givenPath1 = "jeudi"
        const givenPath2 = "mardi"
        const expected = -2
        const result = getSlotIdDistance(givenPath1, givenPath2)
        expect(result).toEqual(expected)
    });
})

describe('isSlotIdEquals', () => {
    test('equal', () => {
        const given1 = "this_week"
        const given2 = "this_week"
        const result = isSlotIdEquals(given1, given2)
        expect(result).toBeTruthy()
    });
    test('not equal', () => {
        const given1 = "this_week"
        const given2 = "next_week"
        const result = isSlotIdEquals(given1, given2)
        expect(result).toBeFalsy()
    })
    test('generic equals', () => {
        const given1 = "week"
        const given2 = "next_week"
        const result = isSlotIdEquals(given1, given2)
        expect(result).toBeTruthy()
    })
    test('generic not equals', () => {
        const given1 = "week"
        const given2 = "this_month"
        const result = isSlotIdEquals(given1, given2)
        expect(result).toBeFalsy()
    })
});