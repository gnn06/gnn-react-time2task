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

test('different level', () => {
    const given = { type: 'branch', value: [ 'mardi' ] };
    const result = slotShift(given, 'week');
    const expected = { type: 'branch', value: [ 'mardi' ] };
    expect(result).toEqual(expected)
});

test('sub branch', () => {
    const given = { type: 'branch', value: [ 'this_month', 'next_week' ] };
    const result = slotShift(given, 'week');
    const expected = { type: 'branch', value: [ 'this_month', 'this_week' ] };
    expect(result).toEqual(expected)
});



test('multi', () => {
    const given = {
        "type": "multi",
        "value": [ { "type": "branch",
                     "value": [ "next_week", "mercredi" ]
                   },
                   { "type": "branch",
                     "value": [ "following_week", "mardi" ]
                   }
        ]
    };
    const result = slotShift(given, 'week');
    const expected = {
        "type": "multi",
        "value": [
            {
                "type": "branch",
                "value": [ "this_week", "mercredi" ]
            },
            {
                "type": "branch",
                "value": [ "next_week", "mardi" ]
            }
        ]
    };
    expect(result).toEqual(expected)
});