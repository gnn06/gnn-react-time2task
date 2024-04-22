import { slotShift, getWeightBranch, slotCompareBranch, slotAlias } from './slot-branch'

describe('slotShift', () => {
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
        const result = slotShift(
            {type:'multi',value:[{ type: 'branch', value: [ 'next_week', 'mardi'    ] }, 
                                 { type: 'branch', value: [ 'next_week', 'mercredi' ] }]}
            , 'week')
        expect(result).toEqual(
            {type:'multi',value:[
                { type: 'branch', value: [ 'this_week', 'mardi'    ] }, 
                { type: 'branch', value: [ 'this_week', 'mercredi' ] }]})
    });

    test('string', () => {
        const result = slotShift('next_week', 'week')
        expect(result).toEqual('this_week')
    })

    describe('shift', () => {
        test('shift', () => {
            const given = { type: 'branch', value: [ 'this_month', { type: 'branch', value: [ 'this_week' ], shift: 2 } ] };
            const result = slotShift(given, 'week');
            const expected = { type: 'branch', value: [ 'this_month', { type: 'branch', value: [ 'this_week' ], shift: 1 } ] };
            expect(result).toEqual(expected)
        })    

        test('shift 2', () => {
            expect(
                slotShift(
                    { type: 'branch', value: [ 'this_week' ], shift: 2 }
                , 'week')
            ).toEqual(
                { type: 'branch', value: [ 'this_week' ], shift: 1 }
            )
        });

        test('shift without EVERY2', () => {
            expect(
                slotShift(
                    { type: 'branch', value: [ 'this_week' ], shift: 0 }
                    , 'week')
            ).toEqual(
                { type: 'branch', value: [ 'this_week' ], shift: 0 }
            )
        });

        test('shift with EVERY2', () => {
            const result = slotShift(
                { type: 'branch', value: [ 'this_week' ], shift: 0, flags: ['EVERY2'] }
                , 'week'
            )
            expect(result).toEqual(
                { type: 'branch', value: [ 'this_week' ], shift: 2, flags: ['EVERY2'] }
            )
        });
    });

    describe('every2', () => {
        test('next_week with every2', () => {
            const result = slotShift(
                { type: 'branch', value: [ 'next_week' ], flags: [ 'EVERY2' ] }
                , 'week')
            expect(result).toEqual(
                { type: 'branch', value: [ 'this_week' ], flags: ['EVERY2'] }
            )
        })

        test('next_week with every2 which restart', () => {
            const result = slotShift(
                { type: 'branch', value: [ 'this_week' ], flags: [ 'EVERY2' ] }
                , 'week')
            expect(result).toEqual(
                { type: 'branch', value: [ 'following_week' ], flags: ['EVERY2'] }
            )
        })

        test('restart on repeat', () => {
            const given = { type: 'branch', value: [ 'this_week' ], flags: [ 'EVERY2' ] };
            const result = slotShift(given, 'week');
            const expected = { type: 'branch', value: [ 'following_week' ], flags: [ 'EVERY2' ] };
            expect(result).toEqual(expected)
        });        
    });

    test('no shift month', () => {
        const given = { type: 'branch', value: [ 'next_month', 'next_week' ] };
        const result = slotShift(given, 'month');
        const expected = { type: 'branch', value: [ 'this_month', 'next_week' ] };
        expect(result).toEqual(expected)
    });

    test('shift month', () => {
        const given = { type: 'branch', value: [ 'next_month' ], shift: 1 };
        const result = slotShift(given, 'week');
        const expected = { type: 'branch', value: [ 'next_month' ], shift: 1 };
        expect(result).toEqual(expected)
    });
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

describe('getWeight', () => {
    test('nominal', () => {
        const result = getWeightBranch({ type: 'branch', value: ['this_week'] })
        expect(result).toEqual(2)
    });

    test('shift', () => {
        const result = getWeightBranch({ type: 'branch', value: ['this_week'], shift: 1 })
        expect(result).toEqual(3)
    })
});

test('compare shift other', () => {
    const result = slotCompareBranch({ type: 'branch', value: [ 'this_week' ] }, { type: 'branch', value: [ 'this_week' ], shift: 1 })
    expect(result).toEqual(-1)
});

describe('slotCompare with shift and compplete', () => {
    test('compare shift this with complete this', () => {
        const result = slotCompareBranch({ type: 'branch', value: [ 'this_week' ], shift: 1 }, { type: 'branch', value: [ 'this_month', 'this_week' ] })
        expect(result).toEqual(1)
    });
    
    test('compare shift this with complete other', () => {
        const result = slotCompareBranch({ type: 'branch', value: [ 'this_month', 'this_week' ] },{ type: 'branch', value: [ 'this_week' ], shift: 1 })
        expect(result).toEqual(-1)
    });
});

describe('slotAlias', () => {
    test('should trransform this + 1 into next', () => {
        // Also test keeping subbranch
        const given    = { value: ['this_week', 'mardi'], shift: 1, flags: ['EVERY2'] }
        const expected = { value: ['next_week', 'mardi'], flags: ['EVERY2'] }
        const result = slotAlias(given)
        expect(result).toEqual(expected)
    });

    test('shoud transform "this + 2" into following', () => {
        const given    = { value: ['this_week'], shift: 2 }
        const expected = { value: ['following_week'] }
        const result = slotAlias(given)
        expect(result).toEqual(expected)
    });

    test('shoud transform "next+1" into following', () => {
        const given    = { value: ['next_week'], shift: 1 }
        const expected = { value: ['following_week'] }
        const result = slotAlias(given)
        expect(result).toEqual(expected)
    });

    test('should not transform because no shift', () => {
        const given    = { value: ['this_week', 'mardi'] }
        const expected = { value: ['this_week', 'mardi'] }
        const result = slotAlias(given)
        expect(result).toEqual(expected)
    });
    
    test('should not transform because shift 3', () => {
        const given    = { value: ['this_week', 'mardi'], shift: 3 }
        const expected = { value: ['this_week', 'mardi'], shift: 3 }
        const result = slotAlias(given)
        expect(result).toEqual(expected)
    });
});
