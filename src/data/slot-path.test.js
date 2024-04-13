import { slotEqual, slotCompare, getPreviousSlot } from './slot-path.js';

jest.useFakeTimers()
jest.setSystemTime(new Date('2023-12-20')) // mercredi

describe('slotCompare', () => {
    
    function inner_test (op1, op2, expected) {
        const result = slotCompare(op1, op2);
        expect(result).toEqual(expected);
    }

    describe('compare at level 1', () => {
        it('lower', () => {
            inner_test('this_month', 'next_month', -1);
        })
    
        it('greater', () => {
            inner_test('next_month', 'this_month', 1);
        })
        
        it('equal', () => {
            inner_test('this_month', 'this_month', 0);
        })
    })

    describe('compare at level 2', () => {
        it('this_month this_week this_month next_week', () => {
            inner_test('this_month this_week', 'this_month next_week', -1);
        })
    
        it('this_month next_week this_month this_week', () => {
            inner_test('this_month next_week', 'this_month this_week', 1);
        })
    
        it('this_month week compare to this_month week', () => {
            inner_test('this_month this_week', 'this_month this_week', 0);
        })    
    })

    describe('different depth', () => {
        it('this_month week compare to this_month', () => {
            inner_test('this_month this_week', 'this_month', -1);
        })
        it('this_month compare to this_month week', () => {
            inner_test('this_month', 'this_month this_week', 1);
        })
    })

    describe('compare with empty', () => {
        it('other is empty', () => {
            inner_test('this_month', undefined, -1);
        })
    
        it('this is empty', () => {
            inner_test(undefined, 'this_month', 1);
        })
    })

    describe('sort multi', () => {
        it('second slot don\'t affect sort', () => {
            inner_test('this_month this_week mercredi vendredi', 'this_month this_week jeudi', -1)
        })
    })
})

describe('slotEqual', () => {
    it('equal one level', () => {
        const result = slotEqual('week', 'week');
        expect(result).toEqual(true);
    })
    it('not equal one level', () => {
        const result = slotEqual('week', 'next_week');
        expect(result).toEqual(false);
    })
    it('equal two level', () => {
        const result = slotEqual('week lundi', 'week lundi');
        expect(result).toEqual(true);
    })
    it('not equal tow level', () => {
        const result = slotEqual('week lundi', 'week mardi');
        expect(result).toEqual(false);
    })
    it('other empty', () => {
        const result = slotEqual('week lundi', 'week');
        expect(result).toEqual(false);
    })
    it('this empty', () => {
        const result = slotEqual('week', 'week lundi');
        expect(result).toEqual(false);
    })    
})


describe('getPreviousSlot', () => {
    test('month', () => {
        const given    = "next_month";
        const expected = "this_month"
        const result   = getPreviousSlot(given);
        expect(result).toEqual(expected)
    });
    test('week', () => {
        const given    = "next_week";
        const expected = "this_week"
        const result   = getPreviousSlot(given);
        expect(result).toEqual(expected)
    });
    test('day', () => {
        const given    = "mercredi";
        const expected = "mardi"
        const result   = getPreviousSlot(given);
        expect(result).toEqual(expected)
    });
    test('hour', () => {
        const given    = "aprem";
        const expected = "matin"
        const result   = getPreviousSlot(given);
        expect(result).toEqual(expected)
    });
    test('stay on first', () => {
        const given    = "this_week";
        const expected = "this_week"
        const result   = getPreviousSlot(given);
        expect(result).toEqual(expected)
    });
    test('restart', () => {
        const given    = "this_week";
        const expected = "following_week"
        const result   = getPreviousSlot(given, true);
        expect(result).toEqual(expected)
    });
});