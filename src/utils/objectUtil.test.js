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

test('empty value is keeped', () => {
    const given = {a:12, b:''};
    const expected = { prem: 12, deuse: '' };
    expect(mapProperties(given, mapping)).toEqual(expected);
})

test('zero', () => {
    const given = {a:0, b:'toto'};
    const expected = { prem: 0, deuse: 'toto' };
    expect(mapProperties(given, mapping)).toEqual(expected);
})

test('null', () => {
    const given = {a:null, b:'123'};
    const expected = { prem: null, deuse: '123' };
    expect(mapProperties(given, mapping)).toEqual(expected);
})