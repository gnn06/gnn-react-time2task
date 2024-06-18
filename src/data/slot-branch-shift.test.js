import { _branchAlias, _getBranchPreviousOrShift, getBranchWeight } from "./slot-branch";
import { branchCompare, branchShift } from "./slot-branch++";

/**
 * Au début ou non      START 
 * Shift ou non         SHIFT 
 * Répétition ou non    REPEAT 
 * Nb alias             NB_ALIAS_<_REPEAT 
 * Generic              GENERIC 
 * Multi                MULTI 
 * Level demandé        LEVEL 
 * 
 * GENERIC 
 * NOT GENERIC, NOT START, NOT SHIFT 
 * NOT GENERIC, NOT START, SHIFT 
 * NOT GENERIC, START, NOT REPEAT 
 * NOT GENERIC, START, REPEAT, NB_ALIAS_INF 
 * NOT GENERIC, START, REPEAT, NOT NB_ALIAS_INF  
 */

describe('slotShift', () => {
    describe('no shift, no repetition', () => {
        test('nominal', () => {
            const given = { type: 'branch', value: [ 'next_week' ] };
            const result = branchShift(given, 'week');
            const expected = { type: 'branch', value: [ 'this_week' ] };
            expect(result).toEqual(expected)
        });
        
        test('last', () => {
            const given = { type: 'branch', value: [ 'following_week' ] };
            const result = branchShift(given, 'week');
            const expected = { type: 'branch', value: [ 'next_week' ] };
            expect(result).toEqual(expected)
        });
        
        test('restart on NO repeat', () => {
            const given = { type: 'branch', value: [ 'this_week' ] };
            const result = branchShift(given, 'week');
            const expected = { type: 'branch', value: [ 'this_week' ] };
            expect(result).toEqual(expected)
        });
        
        test('different level', () => {
            const given = { type: 'branch', value: [ 'mardi' ] };
            const result = branchShift(given, 'week');
            const expected = { type: 'branch', value: [ 'mardi' ] };
            expect(result).toEqual(expected)
        });
        
        test('sub branch', () => {
            const given = { type: 'branch', value: [ 'this_month', 'next_week' ] };
            const result = branchShift(given, 'week');
            const expected = { type: 'branch', value: [ 'this_month', 'this_week' ] };
            expect(result).toEqual(expected)
        });

        test('multi', () => {
            const result = branchShift(
                {type:'multi',value:[{ type: 'branch', value: [ 'next_week', 'mardi'    ] }, 
                                     { type: 'branch', value: [ 'next_week', 'mercredi' ] }]}
                , 'week')
            expect(result).toEqual(
                {type:'multi',value:[
                    { type: 'branch', value: [ 'this_week', 'mardi'    ] }, 
                    { type: 'branch', value: [ 'this_week', 'mercredi' ] }]})
        });
    
        test('string', () => {
            const result = branchShift('next_week', 'week')
            expect(result).toEqual('this_week')
        })
    });

    describe('shift', () => {
        test('shift 2', () => {
            expect(
                branchShift(
                    { type: 'branch', value: [ 'this_week' ], shift: 2 }
                , 'week')
            ).toEqual(
                { type: 'branch', value: [ 'this_week' ], shift: 1 }
            )
        });

        test('shift 6', () => {
            expect(
                branchShift(
                    { type: 'branch', value: [ 'this_week' ], shift: 6 }
                , 'week')
            ).toEqual(
                { type: 'branch', value: [ 'this_week' ], shift: 5 }
            )
        });

        test('no shift because on start', () => {
            expect(
                branchShift(
                    { type: 'branch', value: [ 'this_week' ], shift: 0 }
                    , 'week')
            ).toEqual(
                { type: 'branch', value: [ 'this_week' ], shift: 0 }
            )
        });

        test('shift on sub level', () => {
            const given = { type: 'branch', value: [ 'this_month', { type: 'branch', value: [ 'this_week' ], shift: 2 } ] };
            const result = branchShift(given, 'week');
            const expected = { type: 'branch', value: [ 'this_month', { type: 'branch', value: [ 'this_week' ], shift: 1 } ] };
            expect(result).toEqual(expected)
        })    

        test('no shift because month', () => {
            const given = { type: 'branch', value: [ 'next_month' ], shift: 1 };
            const result = branchShift(given, 'week');
            const expected = { type: 'branch', value: [ 'next_month' ], shift: 1 };
            expect(result).toEqual(expected)
        });
    });
    
    describe('repetition', () => {
        test('no restart', () => {
            const result = branchShift(
                { type: 'branch', value: [ 'next_week' ], repetition: 2 }
                , 'week')
            expect(result).toEqual(
                { type: 'branch', value: [ 'this_week' ], repetition: 2 }
            )
        })

        test('restart', () => {
            const result = branchShift(
                { type: 'branch', value: [ 'this_week' ], repetition: 2 }
                , 'week')
            expect(result).toEqual(
                { type: 'branch', value: [ 'next_week' ], repetition: 2 }
            )
        })      

        test('restart with shift', () => {
            const given = { type: 'branch', value: [ 'this_week' ], repetition: 6 };
            const result = branchShift(given, 'week');
            const expected = { type: 'branch', value: [ 'this_week' ], shift: 5, repetition: 6 };
            expect(result).toEqual(expected)
        });

        test('no restart with shift and repetition', () => {
            const given = { type: 'branch', value: [ 'this_week' ], repetition: 6, shift: 5 };
            const result = branchShift(given, 'week');
            const expected = { type: 'branch', value: [ 'this_week' ], repetition: 6, shift: 4 };
            expect(result).toEqual(expected)
        });

        describe('shift month', () => {
            test('no shift month', () => {
                const given = { type: 'branch', value: [ 'next_month', 'next_week' ] };
                const result = branchShift(given, 'month');
                const expected = { type: 'branch', value: [ 'this_month', 'next_week' ] };
                expect(result).toEqual(expected)
            });

            test('shift month, no shift because already at start', () => {
                const given = { type: 'branch', value: [ 'this_month' ] };
                const result = branchShift(given, 'month');
                const expected = { type: 'branch', value: [ 'this_month' ] };
                expect(result).toEqual(expected)
            });
            
            test('shift month, restart', () => {
                const given = { type: 'branch', value: [ 'this_month' ], repetition: 2 };
                const result = branchShift(given, 'month');
                const expected = { type: 'branch', value: [ 'this_month' ], shift: 1, repetition: 2 };
                expect(result).toEqual(expected)
            });
        });
    });

    describe('shift and repetition', () => {
        test('shift with every 2', () => {
            const result = branchShift(
                { type: 'branch', value: [ 'this_week' ], shift: 0, repetition: 2 }
                , 'week'
            )
            expect(result).toEqual(
                { type: 'branch', value: [ 'this_week' ], shift: 1, repetition: 2 }
            )
        });

        test('shift restart with every 6', () => {
            const result = branchShift(
                { type: 'branch', value: [ 'this_week' ], shift: 0, repetition: 6 }
                , 'week'
            )
            expect(result).toEqual(
                { type: 'branch', value: [ 'this_week' ], shift: 5, repetition: 6 }
            )
        });
    });

    test('subbranch', () => {
        const result = branchShift(
            { type: 'branch', flags: ['chaque'], value: [ 'this_month', 'this_week', 'lundi', 'aprem' ] }
            , 'week'
        )
        expect(result).toEqual(
            { type: 'branch', flags: ['chaque'], value: [ 'this_month', 'this_week', 'lundi', 'aprem' ] }
        )
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
    const result = branchShift(given, 'week');
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
        const result = getBranchWeight({ type: 'branch', value: ['this_week'] })
        expect(result).toEqual(2)
    });

    test('shift', () => {
        const result = getBranchWeight({ type: 'branch', value: ['this_week'], shift: 1 })
        expect(result).toEqual(3)
    })
});

test('compare shift other', () => {
    const result = branchCompare({ type: 'branch', value: [ 'this_week' ] }, { type: 'branch', value: [ 'this_week' ], shift: 1 })
    expect(result).toEqual(-1)
});

describe('slotCompare with shift and compplete', () => {
    test('compare shift this with complete this', () => {
        const result = branchCompare({ type: 'branch', value: [ 'this_week' ], shift: 1 }, { type: 'branch', value: [ 'this_month', 'this_week' ] })
        expect(result).toEqual(1)
    });
    
    test('compare shift this with complete other', () => {
        const result = branchCompare({ type: 'branch', value: [ 'this_month', 'this_week' ] },{ type: 'branch', value: [ 'this_week' ], shift: 1 })
        expect(result).toEqual(-1)
    });
});

describe('slotAlias', () => {
    test('should trransform this + 1 into next', () => {
        // Also test keeping subbranch
        const given    = { value: ['this_week', 'mardi'], shift: 1, repetition: 2 }
        const expected = { value: ['next_week', 'mardi'], repetition: 2 }
        const result = _branchAlias(given)
        expect(result).toEqual(expected)
    });

    test('shoud transform "this + 2" into following', () => {
        const given    = { value: ['this_week'], shift: 2 }
        const expected = { value: ['following_week'] }
        const result = _branchAlias(given)
        expect(result).toEqual(expected)
    });

    test('shoud transform "next+1" into following', () => {
        const given    = { value: ['next_week'], shift: 1 }
        const expected = { value: ['following_week'] }
        const result = _branchAlias(given)
        expect(result).toEqual(expected)
    });

    test('should not transform because no shift', () => {
        const given    = { value: ['this_week', 'mardi'] }
        const expected = { value: ['this_week', 'mardi'] }
        const result = _branchAlias(given)
        expect(result).toEqual(expected)
    });
    
    test('should not transform because shift 3', () => {
        const given    = { value: ['this_week', 'mardi'], shift: 3 }
        const expected = { value: ['this_week', 'mardi'], shift: 3 }
        const result = _branchAlias(given)
        expect(result).toEqual(expected)
    });
});

describe('getPreviousOrShift', () => {
    test('should create shift when repeat and retrieve null', () => {
        const result = _getBranchPreviousOrShift({ type: 'branch', value: ['this_week', 'mardi'], repetition: 3 })
        expect(result).toEqual({ type: 'branch', value: ['this_week', 'mardi'], repetition: 3, shift: 2 })
        
    });

    test('should keep when no repeat', () => {
        const result = _getBranchPreviousOrShift({ type: 'branch', value: ['this_week', 'mardi'] })
        expect(result).toEqual({ type: 'branch', value: ['this_week', 'mardi'] })
    });

    test('previousSlot', () => {
        const result = _getBranchPreviousOrShift({ type: 'branch', value: ['next_week', 'mardi'] })
        expect(result).toEqual({ type: 'branch', value: ['this_week', 'mardi'] })
    });

    test('restart without shift', () => {
        const result = _getBranchPreviousOrShift({ type: 'branch', value: ['this_week', 'mardi'], repetition: 2 })
        expect(result).toEqual({ type: 'branch', value: ['next_week', 'mardi'], repetition: 2 })
    })

    test('branch with shift', () => {
        const result = _getBranchPreviousOrShift({ type: 'branch', value: ['this_week', 'mardi'], shift: 2 })
        expect(result).toEqual({ type: 'branch', value: ['this_week', 'mardi'], shift: 1 })
    })

    test('shift =  0 no repetition', () => {
        const result = _getBranchPreviousOrShift({ type: 'branch', value: ['this_week', 'mardi'], shift: 0 })
        expect(result).toEqual({ type: 'branch', value: ['this_week', 'mardi'], shift: 0 })
    })

    test('shift =  0 with repetition', () => {
        const result = _getBranchPreviousOrShift({ type: 'branch', value: ['this_week', 'mardi'], shift: 0 , repetition: 4})
        expect(result).toEqual({ type: 'branch', value: ['this_week', 'mardi'], shift: 3, repetition: 4 })
    })
});
