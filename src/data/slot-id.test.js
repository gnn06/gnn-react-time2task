import { getSlotIdPrevious, getSlotIdFirstLevel } from './slot-id.js';

jest.useFakeTimers()
jest.setSystemTime(new Date('2023-12-20')) // mercredi

describe('getPreviousSlot', () => {
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
    test('stay on first', () => {
        const given    = "this_week";
        const result   = getSlotIdPrevious(given);
        expect(result).toEqual("this_week")
    });
    test('restart', () => {
        const given    = "this_week";
        const expected = "next_week"
        const result   = getSlotIdPrevious(given, 2);
        expect(result).toEqual(expected)
    });

    describe('getPreviousBis', () => {
        test('should return previous bis', () => {
            const result = getSlotIdPrevious('following_week')
            expect(result).toEqual('next_week')
        });

        test('should return previous', () => {
            const result = getSlotIdPrevious('next_week')
            expect(result).toEqual('this_week')
        });
    
        test('should return null when reach begin', () => {
            const result = getSlotIdPrevious('this_week')
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
    });
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