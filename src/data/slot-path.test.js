import { SlotPath } from "./slot-path";

describe('SlotPath', () => {
    test('constructor', () => {
        const given = "this_month this_week + 1 mardi aprem"
        const expected = { IDs: [ "this_month", "this_week + 1", "mardi", "aprem" ]}
        const result = new SlotPath(given)
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
    test('delete no match', () => {
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
