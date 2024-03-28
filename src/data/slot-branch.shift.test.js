import { slotShift } from './slot-branch'

test('nominal', () => {
    const given = { type: 'branch', value: [ 'next_week' ] };
    const result = slotShift(given, 'week');
    const expected = { type: 'branch', value: [ 'this_week' ] };
    expect(result).toEqual(expected)
});

test('last', () => {
    const given = { type: 'branch', value: [ 'following_week' ] };
    const result = slotShift(given, 'week');
    const expected = { type: 'branch', value: [ 'next_week' ] };
    expect(result).toEqual(expected)
});

test('restart on repeat', () => {
    const given = { type: 'branch', value: [ 'this_week' ], flags: [ 'EVERY2' ] };
    const result = slotShift(given, 'week');
    const expected = { type: 'branch', value: [ 'following_week' ], flags: [ 'EVERY2' ] };
    expect(result).toEqual(expected)
});

test('restart on NO repeat', () => {
    const given = { type: 'branch', value: [ 'this_week' ] };
    const result = slotShift(given, 'week');
    const expected = { type: 'branch', value: [ 'this_week' ] };
    expect(result).toEqual(expected)
});