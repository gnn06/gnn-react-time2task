import { vi } from 'vitest';
import { getBranchLowerSlot, branchComplete, getBranchCurrentPath, _chooseSlotForSortBranch, 
         branchRemoveDisable, isBranchSimple, isBranchUnique, branchTruncate, getBranchHash, branchToExpr, _appendToBranch, 
         getBranchHead, getBranchTail } from './slot-branch.js';

vi.useFakeTimers()
vi.setSystemTime(new Date('2023-12-20')) // mercredi

describe('lowerSlotBranch', () => {
    it('lowerSlot', () => {
        expect(getBranchLowerSlot({type:'branch',value:['S32', 'mercredi', 'matin']}))
            .toEqual({type:'branch',value:['mercredi', 'matin']})
    })

    it('lowerSlot no lower', () => {
        expect(getBranchLowerSlot({type:'branch',value:['matin']})).toEqual({type:'branch',value:[]})
    })

    it('lowerSlot empty', () => {
        expect(getBranchLowerSlot({type:'branch',value:['']})).toEqual({type:'branch',value:[]})
    })

    it('lowerSlot multi', () => {
        expect(getBranchLowerSlot({type:'branch',value:['this_week', {type:'multi', value:['mercredi','jeudi']}]})).toEqual({type:'multi', value:['mercredi','jeudi']})
    })

    it('sub branch due of flag', () => {
        const given = { type:'branch',
                        value:[
                            'this_week', 
                            { type:'branch', value: ['jeudi'], flags: ['chaque']}]}
        const result = getBranchLowerSlot(given);
        expect(result).toEqual(given.value.at(1))
    })
})

describe('completeSlotBranch', () => {
    it('completeSlot level1', () => {
        const result = branchComplete({type:'branch',value:['this_week']});
        expect(result).toEqual({type:'branch',value:['this_month', 'this_week']});
    })

    it('completeSlot level2', () => {
        const result = branchComplete({type:'branch',value:['vendredi']}, 1);
        expect(result).toEqual({type:'branch',value:['this_month', 'this_week', 'vendredi']});
    })

    it('completeSlot level3 target level 2', () => {
        const result = branchComplete({type:'branch',value:['vendredi']}, 2);
        expect(result).toEqual({type:'branch',value:['this_week', 'vendredi']});
    })

    it('completeSlot level3', () => {
        const result = branchComplete({type:'branch',value:['aprem']});
        expect(result).toEqual({type:'branch',value:['this_month', 'this_week', 'mercredi', 'aprem']});
    })

    it('completeSlot level4 target level 2', () => {
        const result = branchComplete({type:'branch',value:['aprem']}, 2);
        expect(result).toEqual({type:'branch',value:['this_week', 'mercredi', 'aprem']});
    })

    it('completeSlot level1 level2', () => {
        const result = branchComplete({type:'branch',value:['week', 'vendredi']});
        expect(result).toEqual({type:'branch',value:['this_month', 'week', 'vendredi']});

    })

    it('completeSlot level1_bis level2', () => {
        const result = branchComplete({type:'branch',value:['next_week', 'vendredi']});
        expect(result).toEqual({type:'branch',value:['this_month', 'next_week', 'vendredi']});
    })

    it('completeSlot unidefined', () => {
        const result = branchComplete(undefined);
        expect(result).toEqual(undefined);
    })

    it('completeSlot already complete', () => {
        const result = branchComplete({type:'branch',value:['this_month','next_week', 'vendredi']});
        expect(result).toEqual({type:'branch',value:['this_month', 'next_week', 'vendredi']});
    })

    it('complete on multi slot :-o', () => {
        const result = branchComplete(
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

    describe('shift', () => {
        test('shift', () => {
            const result = branchComplete(
                { type: 'branch', value: [ 'this_week' ], shift: 1 });
            expect(result).toEqual(
                { type: 'branch', value: ['this_month', { type: 'branch', value: [ 'this_week' ], shift: 1 } ] });
        });

        test('shift month', () => {
            const result = branchComplete(
                { type: 'branch', value: [ 'this_month' ], shift: 1 });
            expect(result).toEqual(
                { type: 'branch', value: ['this_month' ], shift: 1 });
        });
    });
})

describe('getCurrentPathBranch', () => {
    test('should return day of the week branch depth 3', () => {
        expect(getBranchCurrentPath(3)).toEqual({type:'branch',value:['mercredi']});
    });
    
    test('should return day of the week branch depth 2', () => {
        expect(getBranchCurrentPath(2)).toEqual({type:'branch',value:['this_week', 'mercredi']});
    });
    
    test('should return day of the week branch depth 1', () => {
        expect(getBranchCurrentPath(1)).toEqual({type:'branch',value:['this_month', 'this_week', 'mercredi']});
    })
})

describe('chooseSlotForSortBranch', () => {
    test('should take default (first) multi', () => {
        expect(_chooseSlotForSortBranch({type:'multi',value:[
            {type:'branch',value:['lundi']},
            {type:'branch',value:['mardi']}]
        })).toEqual({type:'branch',value:['lundi']})
    });

    test('should take first slot', () => {
        expect(_chooseSlotForSortBranch(
            {type:'multi',value:[
                {type:'branch',value:['mercredi']},
                {type:'branch',value:['jeudi']}]
            })).toEqual({type:'branch',value:['mercredi']})
    });
    
    test('should take second slot', () => {
        expect(_chooseSlotForSortBranch(
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
        const result = branchRemoveDisable(given)
        expect(result).toEqual(expected)
    })

    test('branch && disable', () => {
        const result = branchRemoveDisable({ type: 'branch', value: [ 'lundi' ], flags: [ 'disable' ] })
        expect(result).toEqual(null)
    })

    test('branch && chaque', () => {
        const given = { type: 'branch', value: [ 'lundi' ], flags: ['chaque'] }
        const result = branchRemoveDisable(given)
        expect(result).toEqual(given)
    })

    test('branch && !disable', () => {
        const given = { type: 'branch', value: [ 'lundi' ] }
        const result = branchRemoveDisable(given)
        expect(result).toEqual(given)
    })
})

describe('isBranchSimple', () => {
    test('isBranchSimple branch', () => {
        const result = isBranchSimple({type:'branch', value: ['this_week', 'lundi']})
        expect(result).toBeTruthy()
    })

    test('isBranchSimple multi', () => {
        const result = isBranchSimple(
            {type:'multi', value: [
                {type:'branch', value: ['this_week', 'lundi']},
                {type:'branch', value: ['this_week', 'mardi']}
            ]})
        expect(result).toBeFalsy()
    })

    test('isBranchSimple flag', () => {
        const result = isBranchSimple(
            {type:'branch', value: ['this_week', 'lundi'], flags: ['chaque']})
        expect(result).toBeFalsy()
    })
});

describe('isBranchUnique', () => {
    test('isBranchUnique chaque', () => {
        const result = isBranchUnique(
            {type:'branch', value: ['this_week', 'lundi'], flags: ['chaque']})
        expect(result).toBeFalsy()
    })
        
    test('isBranchUnique every2', () => {
        const result = isBranchUnique(
            {type:'branch', value: ['this_week', 'lundi'], flags: ['EVERY2']})
        expect(result).toBeFalsy()
    })
    
    test('isBranchUnique chaque at level2', () => {
        const result = isBranchUnique(
            {type:'branch', value: ['this_week', {type:'branch', value: ['lundi'], flags: ['chaque']}]})
        expect(result).toBeFalsy()
    })
    
    test('isBranchUnique multi', () => {
        const result = isBranchUnique(
            {type:'multi', value: ['lundi', 'mardi']})
        expect(result).toBeFalsy()
    })
    
    test('isBranchUnique branch', () => {
        const result = isBranchUnique(
            {type:'branch', value: ['this_week', 'mardi']})
        expect(result).toBeTruthy()
    })

    test('generic', () => {
        const result = isBranchUnique(
            {type:'branch', value: ['week']})
        expect(result).toBeFalsy()
    })
});

describe('slotTruncate', () => {
    test('nominal simple branch level < depth', () => {
        const givenSlot = { type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ], flags: ['chaque'] }
        const result = branchTruncate(givenSlot, 3)
        expect(result).toEqual({ type: 'branch', value: [ 'this_week', 'lundi' ], flags: ['chaque'] })
    });

    test('level = depth', () => {
        const givenSlot = { type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ] }
        const result = branchTruncate(givenSlot, 4)
        expect(result).toEqual({ type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ] })
    });

    test('level > depth, keep everything', () => {
        const givenSlot = { type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ] }
        const result = branchTruncate(givenSlot, 5)
        expect(result).toEqual({ type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ] })
    });

    test('truncate all', () => {
        const givenSlot = { type: 'branch', value: [ 'lundi', 'aprem' ] }
        const result = branchTruncate(givenSlot, 1)
        expect(result).toEqual({ type: 'branch', value: [  ] })
    });

    test('multi', () => {
        const givenSlot = { type: 'multi', value: [ { type: 'branch', value: [ 'lundi', 'aprem' ] }, { type: 'branch', value: [ 'mardi', 'aprem' ] } ] }
        const result = branchTruncate(givenSlot, 3)
        expect(result).toEqual({ type: 'multi', value: [ { type: 'branch', value: [ 'lundi' ] }, { type: 'branch', value: [ 'mardi' ] } ] })
    });

    test('multi becoming empty', () => {
        const givenSlot = { type: 'multi', value: [ { type: 'branch', value: [ 'lundi', 'aprem' ] }, { type: 'branch', value: [ 'mardi', 'aprem' ] } ] }
        const result = branchTruncate(givenSlot, 2)
        expect(result).toEqual({ type: 'multi', value: [ { type: 'branch', value: [  ] }, { type: 'branch', value: [  ] } ] })
    })

    test('sub branch', () => {
        const givenSlot = { type: 'branch', value: [ 'this_week', { type: 'branch', value: [ 'lundi', 'aprem' ], flags:['flag'] }], flags:['flag'] }
        const result = branchTruncate(givenSlot, 3)
        expect(result).toEqual({ type: 'branch', value: [ 'this_week', { type: 'branch', value: [ 'lundi' ], flags:['flag'] } ], flags:['flag'] })
    });
    
});

describe('hashBranch', () => {
    test('depth = 1', () => {
        const given = { type: 'branch', value: [ 'this_week' ]};
        const result = getBranchHash(given)
        expect(result).toEqual('this_week')
    });

    test('depth = 3', () => {
        const given = { type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ]};
        const result = getBranchHash(given)
        expect(result).toEqual('this_week lundi aprem')
    });

    test('sub', () => {
        const given = { type: 'branch', value: [ 'this_month', 'this_week', 
                        { type: 'branch', value: [ 'lundi', 'aprem' ] } ] };
        const result = getBranchHash(given)
        expect(result).toEqual('this_month this_week lundi aprem')
    });

    test('multi', () => {
        const given = { type: 'multi',
                        value: [ { type: 'branch', value: [ 'lundi' ] },
                                 { type: 'branch', value: [ 'mardi' ] } ]
                    };
        const result = getBranchHash(given)
        expect(result).toEqual('lundi')
    });

    test('branch with multi', () => {
        const given = { type: 'branch',
                        value: [ 'lundi',
                            { type: 'multi',
                              value: [ { type: 'branch', value: [  ] },
                                       { type: 'branch', value: [  ] } ]
                            }
                        ]
                    };
        const result = getBranchHash(given)
        expect(result).toEqual('lundi')
    })

    test('shift with alias', () => {
        const given = { type: 'branch', value: [ 'this_week', 'lundi' ], shift: 1 };
        const result = getBranchHash(given)
        expect(result).toEqual('next_week lundi')
    });

    test('shift with alias + 4', () => {
        const given = { type: 'branch', value: [ 'this_week', 'lundi' ], shift: 4 };
        const result = getBranchHash(given)
        expect(result).toEqual('this_week + 4 lundi')
    });

    test('generic', () => {
        const given = { type: 'branch', value: [ 'week', 'lundi' ] };
        const result = getBranchHash(given)
        expect(result).toEqual('this_week lundi')
    });

    test('generic month', () => {
        const given = { type: 'branch', value: [ 'month', 'this_week' ] };
        const result = getBranchHash(given)
        expect(result).toEqual('this_month this_week')
    });

});

describe('slotToExpr', () => {
    test('Name of the group', () => {
        const given    = { value: [ 'lundi', 'aprem' ] }
        const expected = 'lundi aprem'
        const result = branchToExpr(given)
        expect(result).toEqual(expected)
    });
    
    test('sub', () => {
        const given    = { value: [ 'this_week', { value: [ 'lundi' ] } ] }
        const expected = 'this_week lundi'
        const result = branchToExpr(given)
        expect(result).toEqual(expected)
    });
    
    test('wiht flags', () => {
        const given    = { value: [ 'lundi', 'aprem' ], flags: [ 'disable', 'every2'] }
        const expected = 'disable every2 lundi aprem'
        const result = branchToExpr(given)
        expect(result).toEqual(expected)
    });
    
    test('multi', () => {
        const given    = { type: 'multi', value: [ { value: [ 'lundi', 'matin' ] }, { value: [ 'mardi', 'aprem' ] } ] }
        const expected = 'lundi matin mardi aprem'
        const result = branchToExpr(given)
        expect(result).toEqual(expected)
    }); 

    test('shift', () => {
        const given    = { value: [ 'this_week' ], shift: 3 }
        const expected = 'this_week + 3'
        const result = branchToExpr(given)
        expect(result).toEqual(expected)
    });

    test('shift with alias', () => {
        const given    = { value: [ 'this_week' ], shift: 1 }
        const expected = 'next_week'
        const result = branchToExpr(given)
        expect(result).toEqual(expected)
    });

    test('shift 0', () => {
        const given    = { value: [ 'this_week' ], shift: 0 }
        const expected = 'this_week'
        const result = branchToExpr(given)
        expect(result).toEqual(expected)
    });

    test('repetition', () => {
        const given    = { value: [ 'this_week' ], repetition: 6 }
        const expected = 'every 6 this_week'
        const result = branchToExpr(given)
        expect(result).toEqual(expected)
    });
});

describe('appendToBranch', () => {
    test('simple branch', () => {
        const given = { type: 'branch', value: [ 'mardi' ] }
        
        const result = _appendToBranch('this_week', given)
        
        const expected = { type: 'branch', value: [ 'this_week', 'mardi' ] }
        
        expect(result).toEqual(expected)
    })
    
    test('branch with flags', () => {
        const given = { type: 'branch', value: [ 'mardi' ], flags: [ 'chaque' ] }
        const result = _appendToBranch('this_week', given)
        const expected = { type: 'branch', value: [ 'this_week', { type: 'branch', value: [ 'mardi' ], flags: [ 'chaque' ] } ] }
        expect(result).toEqual(expected)
    }); 
});

describe('foo', () => {
    const branch = { type: 'branch', value: [ 'this_week', 'lundi', 'aprem' ], shift: 12 }
    test('head', () => {
        const result = getBranchHead(branch)
        expect(result).toEqual({ type: 'branch', value: [ 'this_week' ], shift: 12 })
    });
    test('tail', () => {
        const result = getBranchTail(branch)
        expect(result).toEqual({ type: 'branch', value: [ 'lundi', 'aprem' ] })
    });
    test('tail on subbranch', () => {
        const result = getBranchTail({ type: 'branch', value: [ 'this_week', {type: 'branch', value: ['lundi'], flags: ['chaque'] } ] })
        expect(result).toEqual({type: 'branch', value: ['lundi'], flags: ['chaque'] })
    });
});