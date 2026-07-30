import { vi } from "vitest";
import { isSlotEqual, slotCompare, slotExprAdd } from "./slot-expr.js";
import { slotHasImpreciseIcon } from "./slot-view";

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

describe('tâche imprécise — icône', () => {
    it('une tâche affectée à this_month sans semaine est imprécise dans le slot this_month', () => {
        const taskSlotExpr = 'this_month';
        const slotPath = 'this_month';
        expect(slotHasImpreciseIcon(slotPath, 1)).toBe(true);
        expect(isSlotEqual(taskSlotExpr, slotPath)).toBe(true);
    })
    it('une tâche affectée à this_month this_week n\'est pas imprécise dans this_month', () => {
        const taskSlotExpr = 'this_month this_week';
        const slotPath = 'this_month';
        expect(isSlotEqual(taskSlotExpr, slotPath)).toBe(false);
    })
    it('une tâche affectée à this_month this_week est imprécise dans le slot this_week', () => {
        const taskSlotExpr = 'this_month this_week';
        const slotPath = 'this_month this_week';
        expect(slotHasImpreciseIcon(slotPath, 2)).toBe(true);
        expect(isSlotEqual(taskSlotExpr, slotPath)).toBe(true);
    })
    it('une tâche affectée à this_month next_week n\'a pas d\'icône (hors branche this_week)', () => {
        const slotPath = 'this_month next_week';
        expect(slotHasImpreciseIcon(slotPath, 2)).toBe(false);
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

  