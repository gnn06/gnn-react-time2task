import { vi } from "vitest";
import { isSlotEqual, slotCompare, slotExprAdd } from "./slot-expr.js";

vi.useFakeTimers()
vi.setSystemTime(new Date('2023-12-20')) // mercredi

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
    
        it('this_month this_week compare to this_month this_week', () => {
            inner_test('this_month this_week', 'this_month this_week', 0);
        })    
    })

    describe('different depth', () => {
        it('this_month this_week compare to this_month', () => {
            inner_test('this_month this_week', 'this_month', -1);
        })
        it('this_month compare to this_month this_week', () => {
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
        const result = isSlotEqual('this_week', 'this_week');
        expect(result).toEqual(true);
    })
    it('not equal one level', () => {
        const result = isSlotEqual('this_week', 'next_week');
        expect(result).toEqual(false);
    })
    it('equal two level', () => {
        const result = isSlotEqual('this_week lundi', 'this_week lundi');
        expect(result).toEqual(true);
    })
    it('not equal tow level', () => {
        const result = isSlotEqual('this_week lundi', 'this_week mardi');
        expect(result).toEqual(false);
    })
    it('other empty', () => {
        const result = isSlotEqual('this_week lundi', 'this_week');
        expect(result).toEqual(false);
    })
    it('this empty', () => {
        const result = isSlotEqual('this_week', 'this_week lundi');
        expect(result).toEqual(false);
    })    
    it("every (don't check  length)", () => {
        const result = isSlotEqual('this_month every 2 this_week jeudi', 'this_month this_week jeudi');
        expect(result).toEqual(true);
    })
})


describe('slotExprAdd', () => {
    test('nominal', () => {
        const givenSource = 'this_month'
        const givenToAdd = 'this_month this_week'
        const expected = "this_month this_week"
        const result = slotExprAdd(givenSource, givenToAdd)
        expect(result).toEqual(expected)
    });

    test('empty', () => {
        const givenSource = ''
        const givenToAdd = 'this_month this_week'
        const expected = "this_month this_week"
        const result = slotExprAdd(givenSource, givenToAdd)
        expect(result).toEqual(expected)
    });

    test('completion needed', () => {
        const givenSource = 'mardi'
        const givenToAdd = 'this_month this_week jeudi'
        const expected = "this_month this_week mardi jeudi"
        const result = slotExprAdd(givenSource, givenToAdd)
        expect(result).toEqual(expected)
    });
});

  