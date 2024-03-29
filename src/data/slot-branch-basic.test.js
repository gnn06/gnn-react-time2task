import { lowerSlotBranch, completeSlotBranch, getCurrentPathBranch, chooseSlotForSortBranch, 
         removeDisableBranch, isSlotSimpleBranch, isSlotUniqueBranch, slotTruncateBranch, getHashBranch } from './slot-branch.js';

jest.useFakeTimers()
jest.setSystemTime(new Date('2023-12-20')) // mercredi

describe('lowerSlotBranch', () => {
    it('lowerSlot', () => {
        expect(lowerSlotBranch({type:'branch',value:['S32', 'mercredi', 'matin']}))
            .toEqual({type:'branch',value:['mercredi', 'matin']})
    })

    it('lowerSlot no lower', () => {
        expect(lowerSlotBranch({type:'branch',value:['matin']})).toEqual({type:'branch',value:[]})
    })

    it('lowerSlot empty', () => {
        expect(lowerSlotBranch({type:'branch',value:['']})).toEqual({type:'branch',value:[]})
    })

    it('lowerSlot multi', () => {
        expect(lowerSlotBranch({type:'branch',value:['this_week', {type:'multi', value:['mercredi','jeudi']}]})).toEqual({type:'multi', value:['mercredi','jeudi']})
    })

    it('sub branch due of flag', () => {
        const given = { type:'branch',
                        value:[
                            'this_week', 
                            { type:'branch', value: ['jeudi'], flags: ['chaque']}]}
        const result = lowerSlotBranch(given);
        expect(result).toEqual(given.value.at(1))
    })
})

describe('completeSlotBranch', () => {
    it('completeSlot level1', () => {
        const result = completeSlotBranch({type:'branch',value:['week']});
        expect(result).toEqual({type:'branch',value:['this_month', 'week']});
    })

    it('completeSlot level2', () => {
        const result = completeSlotBranch({type:'branch',value:['vendredi']}, 1);
        expect(result).toEqual({type:'branch',value:['this_month', 'this_week', 'vendredi']});
    })

    it('completeSlot level3 target level 2', () => {
        const result = completeSlotBranch({type:'branch',value:['vendredi']}, 2);
        expect(result).toEqual({type:'branch',value:['this_week', 'vendredi']});
    })

    it('completeSlot level3', () => {
        const result = completeSlotBranch({type:'branch',value:['aprem']});
        expect(result).toEqual({type:'branch',value:['this_month', 'this_week', 'mercredi', 'aprem']});
    })

    it('completeSlot level4 target level 2', () => {
        const result = completeSlotBranch({type:'branch',value:['aprem']}, 2);
        expect(result).toEqual({type:'branch',value:['this_week', 'mercredi', 'aprem']});
    })

    it('completeSlot level1 level2', () => {
        const result = completeSlotBranch({type:'branch',value:['week', 'vendredi']});
        expect(result).toEqual({type:'branch',value:['this_month', 'week', 'vendredi']});

    })

    it('completeSlot level1_bis level2', () => {
        const result = completeSlotBranch({type:'branch',value:['next_week', 'vendredi']});
        expect(result).toEqual({type:'branch',value:['this_month', 'next_week', 'vendredi']});
    })

    it('completeSlot unidefined', () => {
        const result = completeSlotBranch(undefined);
        expect(result).toEqual(undefined);
    })

    it('completeSlot already complete', () => {
        const result = completeSlotBranch({type:'branch',value:['this_month','next_week', 'vendredi']});
        expect(result).toEqual({type:'branch',value:['this_month', 'next_week', 'vendredi']});
    })

    it('complete on multi slot :-o', () => {
        const result = completeSlotBranch(
            { type: 'multi',
              value: [ 
                { type: 'branch', value: ['mercredi'] },
                { type: 'branch', value: ['jeudi'] },
                { type: 'branch', value: ['next_week', 'vendredi'] } ]
            });
        expect(result).toEqual(
            { type: 'multi',
              value: [ 
                { type: 'branch', value: ['this_month', 'this_week', 'mercredi'] },
                { type: 'branch', value: ['this_month', 'this_week', 'jeudi'] },
                { type: 'branch', value: ['this_month', 'next_week', 'vendredi'] } ]
            });
    })
})

describe('getCurrentPathBranch', () => {
    test('should return day of the week branch depth 3', () => {
        expect(getCurrentPathBranch(3)).toEqual({type:'branch',value:['mercredi']});
    });
    
    test('should return day of the week branch depth 2', () => {
        expect(getCurrentPathBranch(2)).toEqual({type:'branch',value:['this_week', 'mercredi']});
    });
    
    test('should return day of the week branch depth 1', () => {
        expect(getCurrentPathBranch(1)).toEqual({type:'branch',value:['this_month', 'this_week', 'mercredi']});
    })
})

describe('chooseSlotForSortBranch', () => {
    test('should take default (first) multi', () => {
        expect(chooseSlotForSortBranch({type:'multi',value:[
            {type:'branch',value:['lundi']},
            {type:'branch',value:['mardi']}]
        })).toEqual({type:'branch',value:['lundi']})
    });

    test('should take first slot', () => {
        expect(chooseSlotForSortBranch(
            {type:'multi',value:[
                {type:'branch',value:['mercredi']},
                {type:'branch',value:['jeudi']}]
            })).toEqual({type:'branch',value:['mercredi']})
    });
    
    test('should take second slot', () => {
        expect(chooseSlotForSortBranch(
            {type:'multi',value:[
                {type:'branch',value:['lundi']},
                {type:'branch',value:['mercredi']}]
            })).toEqual({type:'branch',value:['mercredi']})
    });

})

describe('removeDisable', () => {
    test('multi', () => {
        const given = {
            type: 'multi',
            value: [
                { type: 'branch', value: [ 'lundi' ], flags: [ 'disable' ] },
                { type: 'branch', value: [ 'mardi' ] }
            ]
        }
        const expected = {
            type: 'multi',
            value: [
                { type: 'branch', value: [ 'mardi' ] }
            ]
        }
        const result = removeDisableBranch(given)
        expect(result).toEqual(expected)
    })

    test('branch && disable', () => {
        const result = removeDisableBranch({ type: 'branch', value: [ 'lundi' ], flags: [ 'disable' ] })
        expect(result).toEqual(null)
    })

    test('branch && chaque', () => {
        const given = { type: 'branch', value: [ 'lundi' ], flags: ['chaque'] }
        const result = removeDisableBranch(given)
        expect(result).toEqual(given)
    })

    test('branch && !disable', () => {
        const given = { type: 'branch', value: [ 'lundi' ] }
        const result = removeDisableBranch(given)
        expect(result).toEqual(given)
    })
})

describe('isSlotSimple', () => {
    test('isSlotSimple branch', () => {
        const result = isSlotSimpleBranch({type:'branch', value: ['this_week', 'lundi']})
        expect(result).toBeTruthy()
    })

    test('isSlotSimple multi', () => {
        const result = isSlotSimpleBranch(
            {type:'multi', value: [
                {type:'branch', value: ['this_week', 'lundi']},
                {type:'branch', value: ['this_week', 'mardi']}
            ]})
        expect(result).toBeFalsy()
    })

    test('isSlotSimple flag', () => {
        const result = isSlotSimpleBranch(
            {type:'branch', value: ['this_week', 'lundi'], flags: ['chaque']})
        expect(result).toBeFalsy()
    })
});

describe('isSlotUnique', () => {
    test('isSlotUnique chaque', () => {
        const result = isSlotUniqueBranch(
            {type:'branch', value: ['this_week', 'lundi'], flags: ['chaque']})
        expect(result).toBeFalsy()
    })
        
    test('isSlotUnique every2', () => {
        const result = isSlotUniqueBranch(
            {type:'branch', value: ['this_week', 'lundi'], flags: ['EVERY2']})
        expect(result).toBeFalsy()
    })
    
    test('isSlotUnique chaque at level2', () => {
        const result = isSlotUniqueBranch(
            {type:'branch', value: ['this_week', {type:'branch', value: ['lundi'], flags: ['chaque']}]})
        expect(result).toBeFalsy()
    })
    
    test('isSlotUnique multi', () => {
        const result = isSlotUniqueBranch(
            {type:'multi', value: ['lundi', 'mardi']})
        expect(result).toBeFalsy()
    })
    
    test('isSlotUnique branch', () => {
        const result = isSlotUniqueBranch(
            {type:'branch', value: ['this_week', 'mardi']})
        expect(result).toBeTruthy()
    })
});

describe('slotTruncate', () => {
    test('nominal simple branch level < depth', () => {
        const givenSlot = { type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ], flags: ['chaque'] }
        const result = slotTruncateBranch(givenSlot, 3)
        expect(result).toEqual({ type: 'branch', value: [ 'this_week', 'lundi' ], flags: ['chaque'] })
    });

    test('level = depth', () => {
        const givenSlot = { type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ] }
        const result = slotTruncateBranch(givenSlot, 4)
        expect(result).toEqual({ type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ] })
    });

    test('level > depth, keep everything', () => {
        const givenSlot = { type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ] }
        const result = slotTruncateBranch(givenSlot, 5)
        expect(result).toEqual({ type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ] })
    });

    test('truncate all', () => {
        const givenSlot = { type: 'branch', value: [ 'lundi', 'aprem' ] }
        const result = slotTruncateBranch(givenSlot, 1)
        expect(result).toEqual({ type: 'branch', value: [  ] })
    });

    test('multi', () => {
        const givenSlot = { type: 'multi', value: [ { type: 'branch', value: [ 'lundi', 'aprem' ] }, { type: 'branch', value: [ 'mardi', 'aprem' ] } ] }
        const result = slotTruncateBranch(givenSlot, 3)
        expect(result).toEqual({ type: 'multi', value: [ { type: 'branch', value: [ 'lundi' ] }, { type: 'branch', value: [ 'mardi' ] } ] })
    });

    test('multi becoming empty', () => {
        const givenSlot = { type: 'multi', value: [ { type: 'branch', value: [ 'lundi', 'aprem' ] }, { type: 'branch', value: [ 'mardi', 'aprem' ] } ] }
        const result = slotTruncateBranch(givenSlot, 2)
        expect(result).toEqual({ type: 'multi', value: [ { type: 'branch', value: [  ] }, { type: 'branch', value: [  ] } ] })
    })

    test('sub branch', () => {
        const givenSlot = { type: 'branch', value: [ 'this_week', { type: 'branch', value: [ 'lundi', 'aprem' ], flags:['flag'] }], flags:['flag'] }
        const result = slotTruncateBranch(givenSlot, 3)
        expect(result).toEqual({ type: 'branch', value: [ 'this_week', { type: 'branch', value: [ 'lundi' ], flags:['flag'] } ], flags:['flag'] })
    });
    
});

describe('hashBranch', () => {
    test('depth = 1', () => {
        const given = { type: 'branch', value: [ 'this_week' ]};
        const result = getHashBranch(given)
        expect(result).toEqual('this_week')
    });

    test('depth = 3', () => {
        const given = { type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ]};
        const result = getHashBranch(given)
        expect(result).toEqual('this_week lundi aprem')
    });

    test('sub', () => {
        const given = { type: 'branch', value: [ 'this_month', 'this_week', 
                        { type: 'branch', value: [ 'lundi', 'aprem' ] } ] };
        const result = getHashBranch(given)
        expect(result).toEqual('this_month this_week lundi aprem')
    });

    test('multi', () => {
        const given = { type: 'multi',
                        value: [ { type: 'branch', value: [ 'lundi' ] },
                                 { type: 'branch', value: [ 'mardi' ] } ]
                    };
        const result = getHashBranch(given)
        expect(result).toEqual('lundi')
    });

    test('multi', () => {
        const given = { type: 'branch',
                        value: [ 'lundi',
                            { type: 'multi',
                              value: [ { type: 'branch', value: [  ] },
                                       { type: 'branch', value: [  ] } ]
                            }
                        ]
                    };
        const result = getHashBranch(given)
        expect(result).toEqual('lundi')
    })

});