import { lowerSlotBranch, completeSlotBranch, getCurrentPathBranch, chooseSlotForSortBranch, 
         removeDisableBranch, isSlotSimpleBranch } from './slot-branch.js';

jest.useFakeTimers()
jest.setSystemTime(new Date('2023-12-20')) // mercredi

describe('lowerSlotBranch', () => {
    it('lowerSlot', () => {
        expect(lowerSlotBranch({type:'branch',value:['S32', 'mercredi', 'matin']})).toEqual({type:'branch',value:['mercredi', 'matin']})
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

    it.skip('complete on multi slot :-o', () => {
        const result = completeSlotBranch('mercredi jeudi next_week vendredi');
        expect(result).toEqual('this_month this_week mercredi jeudi next_week vendredi');
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