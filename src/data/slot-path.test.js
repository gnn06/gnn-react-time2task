import { SlotPath } from "./slot-path";

describe('SlotPath', () => {
    test('constructor', () => {
        const given = "this_month this_week + 1 mardi aprem"
        const expected = { IDs: [ "this_month", "this_week + 1", "mardi", "aprem" ]}
        const result = new SlotPath(given)
        expect(result).toEqual(expected)
    });
    test('constructor empty', () => {
        const given = "this_month this_week + 1 mardi aprem"
        const expected = { IDs: [] }
        const result = new SlotPath("")
        expect(result).toEqual(expected)
    });
    
    describe('shift', () => {
        test('next', () => {
            const given    =       "this_month this_week mardi aprem"
            const expected = { IDs: ["this_month", "next_week", "mardi", "aprem"] }
            const underTest = new SlotPath(given)
            const result = underTest.shift(2, 1)
            expect(result).toEqual(expected)
        });
        test('previous', () => {
            const given    =         "this_month next_week mardi aprem"
            const expected = { IDs: ["this_month", "this_week", "mardi", "aprem"] }
            const underTest = new SlotPath(given)
            const result = underTest.shift(2, -1)
            expect(result).toEqual(expected)
        });
    });

    test('toExpr', () => {
        const given = new SlotPath("this_month this_week mercredi")
        const expected = "this_month this_week mercredi"
        const result = given.toExpr(given)
        expect(result).toEqual(expected)
    });

    test('getLast', () => {
        const given = new SlotPath("this_month this_week mercredi")
        const expected = "mercredi"
        const result = given.getLast()
        expect(result).toEqual(expected)
    });
    test('getLast on empty', () => {
        const given = new SlotPath("")
        const expected = ""
        const result = given.getLast()
        expect(result).toEqual(expected)
    });
    test('delete', () => {
        const given = new SlotPath("this_month this_week mercredi")
        const expected = {IDs: ["this_month", "this_week"]}
        const result = given.delete("mercredi")
        expect(result).toEqual(expected)
    });
    test('delete no match', () => {
        const given = new SlotPath("this_month this_week mercredi")
        const expected = {IDs: ["this_month", "this_week", "mercredi"]}
        const result = given.delete("next_week")
        expect(result).toEqual(expected)
    });
    test('delete empty', () => {
        const given = new SlotPath("this_month this_week mercredi")
        const expected = {IDs: []}
        const result = given.delete("this_month")
        expect(result).toEqual(expected)
    });
    test('delete deepper', () => {
        const given = new SlotPath("this_month this_week mercredi")
        const expected = {IDs: ["this_month", "this_week", "mercredi"]}
        const result = given.delete("this_month this_week mercredi aprem")
        expect(result).toEqual(expected)
    });
});

test('distance', () => {
    const given1 = new SlotPath("this_month this_week mardi")
    const given2 = new SlotPath("this_month this_week jeudi")
    const expected = 2
    const result = given1.getDistanceTo(given2)
    expect(result).toEqual(expected)
});


test('append', () => {
    const given1 = new SlotPath("this_month this_week mardi")
    const expected = new SlotPath("this_month this_week mardi aprem")
    const result = given1.append("aprem")
    expect(result).toEqual(expected)
})

test('append empty', () => {
    const given1 = new SlotPath("")
    const expected = new SlotPath("this_month")
    const result = given1.append("this_month")
    expect(result).toEqual(expected)
})

describe('equals', () => {
    test('depth 1, equals', () => {
        const given1 = new SlotPath("this_month")
        const given2 = new SlotPath("this_month")
        const result = given1.equals(given2)
        expect(result).toBeTruthy()
    });
    test('depth 1, not equals', () => {
        const given1 = new SlotPath("this_month")
        const given2 = new SlotPath("next_month")
        const result = given1.equals(given2)
        expect(result).toBeFalsy()
    });
    test('level 1 equals, depth differs', () => {
        const given1 = new SlotPath("this_month this_week")
        const given2 = new SlotPath("this_month")
        const result = given1.equals(given2)
        expect(result).toBeFalsy()
    });
    test('level 1 equals, depth differs bis', () => {
        const given1 = new SlotPath("this_month")
        const given2 = new SlotPath("this_month this_week")
        const result = given1.equals(given2)
        expect(result).toBeFalsy()
    });    
    test('level 1 equals, level 2 differs', () => {
        const given1 = new SlotPath("this_month this_week")
        const given2 = new SlotPath("this_month next_week")
        const result = given1.equals(given2)
        expect(result).toBeFalsy()
    });    
    test('level 1 equals, level 2 equals', () => {
        const given1 = new SlotPath("this_month this_week")
        const given2 = new SlotPath("this_month this_week")
        const result = given1.equals(given2)
        expect(result).toBeTruthy()
    });
    test('generic', () => {
        const given1 = new SlotPath("this_month this_week day")
        const given2 = new SlotPath("this_month this_week mardi")
        const result = given1.equals(given2)
        expect(result).toBeTruthy()
    });
    test('generic order', () => {
        const given1 = new SlotPath("this_month this_week mardi")
        const given2 = new SlotPath("this_month this_week day")
        const result = given1.equals(given2)
        expect(result).toBeTruthy()
    });
    test('generic twice', () => {
        const given1 = new SlotPath("this_month this_week day")
        const given2 = new SlotPath("this_month this_week day")
        const result = given1.equals(given2)
        expect(result).toBeTruthy()
    })
});

describe('equalsOrInclude', () => {
    test('shorter', () => {
        const given1 = new SlotPath("this_month this_week mercredi")
        const given2 = new SlotPath("this_month this_week")
        const result = given1.equalsOrInclude(given2)
        expect(result).toBeTruthy()
    });
    test('longer', () => {
        const given1 = new SlotPath("this_month this_week")
        const given2 = new SlotPath("this_month this_week mercredi")
        const result = given1.equalsOrInclude(given2)
        expect(result).toBeFalsy()
    });
    test('equals', () => {
        const given1 = new SlotPath("this_month this_week")
        const given2 = new SlotPath("this_month this_week")
        const result = given1.equalsOrInclude(given2)
        expect(result).toBeTruthy()
    });
    test('differs', () => {
        const given1 = new SlotPath("this_month this_week")
        const given2 = new SlotPath("this_month next_week")
        const result = given1.equalsOrInclude(given2)
        expect(result).toBeFalsy()
    });
});