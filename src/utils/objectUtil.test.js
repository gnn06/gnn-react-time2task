import { mapProperties } from "./objectUtil.js";

const mapping = [
    { old: 'a', new: 'prem'},
    { old: 'b', new: 'deuse'},
];

test('should map all properties', () => {
    const given = {a:12, b:'abc'};
    const expected = { prem: 12, deuse: 'abc' };
    expect(mapProperties(given, mapping)).toEqual(expected);
});

test('should map first property', () => {
    const given = {b:'abc'};
    const expected = { deuse: 'abc' };
    expect(mapProperties(given, mapping)).toEqual(expected);
})

test('should map second property', () => {
    const given = {a:12};
    const expected = { prem: 12 };
    expect(mapProperties(given, mapping)).toEqual(expected);
})

test('should don\'t transmit unmapped property', () => {
    const given = {a:12, b: 'abc', c: 24};
    const expected = { prem: 12, deuse: 'abc' };
    expect(mapProperties(given, mapping)).toEqual(expected);
})