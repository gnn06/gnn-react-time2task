import { slotIsInOther, slotIsInOtherBranch, completeSlot, slotEqual, firstSlot, lowerSlot, lowerSlotBranch, slotDepth, slotCompare, getCurrentPath, slotCompareTree, getCurrentPathBranch, chooseSlotForSortBranch, completeSlotBranch } from './slot-path.js';
import SlotPath from './slot-path';

test('that constructor split expr', () => {
    const slot = new SlotPath('S32 mercredi matin');
    expect(slot.slots).toEqual(['S32', 'mercredi', 'matin'])
})

jest.useFakeTimers()
jest.setSystemTime(new Date('2023-12-20')) // mercredi

describe('slotIsInOtherBranch', () => {
    it('slotIsInOther true by first level', () => {
        const result = slotIsInOther('S32 mercredi matin','S32');
        expect(result).toBeTruthy();
    })
    
    it('slotIsInOtherBranch true by first level', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S32', 'mercredi', 'matin']},{type:'branch',value:['S32']});
        expect(result).toBeTruthy();
    })

    it('slotIsInOtherBranch true by second level', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S32', 'mercredi', 'matin']},{type:'branch',value:['S32', 'mercredi']});
        expect(result).toBeTruthy();
    })

    it('slotIsInOtherBranch true by last level', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S32', 'mercredi', 'matin']},{type:'branch',value:['S32', 'mercredi', 'matin']});
        expect(result).toBeTruthy();
    })

    it('slotIsInOtherBranch false by last level', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S32', 'mercredi', 'aprem']},{type:'branch',value:['S32', 'mercredi', 'matin']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch false by second level', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S32', 'mercredi', 'aprem']},{type:'branch',value:['S32', 'lundi', 'aprem']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch false by first level', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S32', 'mercredi', 'aprem']},{type:'branch',value:['S33', 'mercredi', 'aprem']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch true other less deeper', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S32', 'mercredi', 'aprem']},{type:'branch',value:['S32', 'mercredi']});
        expect(result).toBeTruthy()
    })

    it('slotIsInOtherBranch false other less deeper', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S32', 'mercredi', 'aprem']},{type:'branch',value:['S32', 'lundi']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch true other has 1 level', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S32', 'mercredi', 'aprem']},{type:'branch',value:['S32']});
        expect(result).toBeTruthy()
    })

    it('slotIsInOtherBranch false other has 1 level', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S32', 'mercredi', 'aprem']},{type:'branch',value:['S33']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch incomplet expr', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S33']},{type:'branch',value:['S33']});
        expect(result).toBeTruthy()
    })

    it('slotIsInOtherBranch incomplet expr trop précis', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S33']},{type:'branch',value:['S33', 'mercredi']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch incomplet expr false', () => {
        const result = slotIsInOtherBranch({type:'branch',value:['S32', 'mercredi']},{type:'branch',value:['S33']});
        expect(result).toBeFalsy()
    })

    describe('check behabior of slotIsInOtherBranch on multi', () => {
        it('on first slot', () => {
            const result = slotIsInOtherBranch(
                {type:'multi',value:[
                    {type:'branch',value:['mercredi']},
                    {type:'branch',value:['jeudi']}]},
                {type:'branch',value:['mercredi']});
            expect(result).toBeTruthy()
        })

        it('on second slot', () => {
            const result = slotIsInOtherBranch(
                {type:'multi',value:[
                    {type:'branch',value:['mercredi']},
                    {type:'branch',value:['jeudi']}]},
                {type:'branch',value:['jeudi']});
            expect(result).toBeTruthy()
        })

        it('multi on depth 3', () => {
            const result = slotIsInOtherBranch(
                {type:'branch',value:['this_month', 'this_week',
                    {type:'multi',value:[
                        {type:'branch',value:['mercredi']},
                        {type:'branch',value:['jeudi']}]}
                ]},
                {type:'branch',value:['this_month', 'this_week', 'jeudi']});
            expect(result).toBeTruthy()
        })

        it('different depth first', () => {
            const result = slotIsInOtherBranch(
                {type:'branch',value:[              'this_week', 'jeudi']},
                {type:'branch',value:['this_month', 'this_week', 'jeudi']});
            expect(result).toBeTruthy()
        })
    })
})

describe('firstSlot', () => {
    it('firstSlot', () => {
        const result = firstSlot('S32 mercredi matin');
        expect(result).toEqual('S32')
    })

    it('firstSlot one level', () => {
        const result = firstSlot('matin');
        expect(result).toEqual('matin')
    })

    it('firstSlot empty', () => {
        const result = firstSlot('');
        expect(result).toEqual('')
    })
})

describe('lowerSlot', () => {
    it('lowerSlot', () => {
        expect(lowerSlot('S32 mercredi matin')).toEqual('mercredi matin')
    })

    it('lowerSlot no lower', () => {
        expect(lowerSlot('matin')).toEqual('')
    })

    it('lowerSlot empty', () => {
        expect(lowerSlot('')).toEqual('')
    })
})

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

describe('completeSlot', () => {
    it('completeSlot level1', () => {
        const result = completeSlot('week');
        expect(result).toEqual('this_month week');
    })

    it('completeSlot level2', () => {
        const result = completeSlot('vendredi');
        expect(result).toEqual('this_month this_week vendredi');

    })

    it('completeSlot level3', () => {
        const result = completeSlot('aprem');
        expect(result).toEqual('this_month this_week mercredi aprem');
    })

    it('completeSlot level1 level2', () => {
        const result = completeSlot('week vendredi');
        expect(result).toEqual('this_month week vendredi');

    })

    it('completeSlot level1_bis level2', () => {
        const result = completeSlot('next_week vendredi');
        expect(result).toEqual('this_month next_week vendredi');
    })

    it('completeSlot unidefined', () => {
        const result = completeSlot(undefined);
        expect(result).toEqual(undefined);

    })

    it('complete on multi slot :-o', () => {
        const result = completeSlot('mercredi jeudi next_week vendredi');
        expect(result).toEqual('this_month this_week mercredi jeudi next_week vendredi');
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

describe('slotDepth', () => {
    it('one level', () => {
        const result = slotDepth('week');
        expect(result).toEqual(1);
    })

    it('two levels', () => {
        const result = slotDepth('week lundi');
        expect(result).toEqual(2);
    })

    it('three levels', () => {
        const result = slotDepth('week lundi aprem');
        expect(result).toEqual(3);
    })
})

describe('slotEqual', () => {
    it('equal one level', () => {
        const result = slotEqual('week', 'week');
        expect(result).toEqual(true);
    })
    it('not equal one level', () => {
        const result = slotEqual('week', 'next_week');
        expect(result).toEqual(false);
    })
    it('equal two level', () => {
        const result = slotEqual('week lundi', 'week lundi');
        expect(result).toEqual(true);
    })
    it('not equal tow level', () => {
        const result = slotEqual('week lundi', 'week mardi');
        expect(result).toEqual(false);
    })
    it('other empty', () => {
        const result = slotEqual('week lundi', 'week');
        expect(result).toEqual(false);
    })
    it('this empty', () => {
        const result = slotEqual('week', 'week lundi');
        expect(result).toEqual(false);
    })    
})

describe('slotCompare', () => {
    
    function inner_test (op1, op2, expected) {
        const result = slotCompare(op1, op2);
        expect(result).toEqual(expected);
    }

    describe('compare at level 1', () => {
        it('lower', () => {
            inner_test('this_month', 'next_month', -1);
        })
    
        it('greater', () => {
            inner_test('next_month', 'this_month', 1);
        })
        
        it('equal', () => {
            inner_test('this_month', 'this_month', 0);
        })
    })

    describe('compare at level 2', () => {
        it('this_month week this_month next_week', () => {
            inner_test('this_month week', 'this_month next_week', -1);
        })
    
        it('this_month next_week this_month week', () => {
            inner_test('this_month next_week', 'this_month week', 1);
        })
    
        it('this_month week compare to this_month week', () => {
            inner_test('this_month week', 'this_month week', 0);
        })    
    })

    describe('different depth', () => {
        it('this_month week compare to this_month', () => {
            inner_test('this_month week', 'this_month', 1);
        })
        it('this_month compare to this_month week', () => {
            inner_test('this_month', 'this_month week', 1);
        })
    })

    describe('compare with empty', () => {
        it('other is empty', () => {
            inner_test('this_month', undefined, -1);
        })
    
        it('this is empty', () => {
            inner_test(undefined, 'this_month', 1);
        })
    })

    describe('sort multi', () => {
        it('second slot don\'t affect sort', () => {
            inner_test('this_month this_week mercredi vendredi', 'this_month this_week jeudi', -1)
        })
    })
})

describe('slotCompareTree', () => {
    
    function inner_test (op1, op2, expected) {
        const result = slotCompareTree(op1, op2);
        expect(result).toEqual(expected);
    }

    describe('compare at level 1', () => {
        it('lower', () => {
            inner_test({type:'branch',value:['this_month']}, {type:'branch',value:['next_month']}, -1);
        })
    
        it('greater', () => {
            inner_test({type:'branch',value:['next_month']}, {type:'branch',value:['this_month']}, 1);
        })
        
        it('equal', () => {
            inner_test({type:'branch',value:['this_month']}, {type:'branch',value:['this_month']}, 0);
        })
    })

    describe('compare at level 2', () => {
        it('this_month week this_month next_week', () => {
            inner_test({type:'branch',value:['this_month', 'week']}, {type:'branch',value:['this_month', 'next_week']}, -1);
        })
    
        it('this_month next_week this_month week', () => {
            inner_test({type:'branch',value:['this_month', 'next_week']}, {type:'branch',value:['this_month', 'week']}, 1);
        })
    
        it('this_month week compare to this_month week', () => {
            inner_test({type:'branch',value:['this_month', 'week']}, {type:'branch',value:['this_month', 'week']}, 0);
        })    
    })

    describe('different depth', () => {
        it('this_month week compare to this_month', () => {
            inner_test({type:'branch',value:['this_month', 'week']}, {type:'branch',value:['this_month']}, 1);
        })
        it('this_month compare to this_month week', () => {
            inner_test({type:'branch',value:['this_month']}, {type:'branch',value:['this_month', 'week']}, 1);
        })
    })

    describe('compare with empty', () => {
        it('other is empty', () => {
            inner_test({type:'branch',value:['this_month']}, undefined, -1);
        })
    
        it('this is empty', () => {
            inner_test(undefined, {type:'branch',value:['this_month']}, 1);
        })
    })

    describe('sort multi', () => {
        it('second slot don\'t affect sort', () => {
            inner_test({type:'branch',value:['this_month', 'this_week', 'mercredi', 'vendredi']}, {type:'branch',value:['this_month', 'this_week', 'jeudi']}, -1)
        })
    })

    //TODO multi, chaque
    it('first disable', () => {
        inner_test({type:'branch',value:['this_month', 'this_week', 'mercredi'],flags:['disable']}, {type:'branch',value:['this_month', 'this_week', 'jeudi']}, 1)
    })

    it('second disable', () => {
        inner_test({type:'branch',value:['this_month', 'this_week', 'mercredi']}, {type:'branch',value:['this_month', 'this_week', 'mardi'],flags:['disable']}, -1)
    })

    it('chaque don\'t change order', () => {
        inner_test({type:'branch',value:['this_month', 'this_week', 'mercredi'], flags:['chaque']}, {type:'branch',value:['this_month', 'this_week', 'mardi']}, 1)
    })

    describe('delta at depth 1', () => {
        it('different level first', () => {
            inner_test({type:'branch',value:['this_month', 'next_week', 'mercredi']}, {type:'branch',value:['this_week', 'mardi']}, 1)
        })
    
        it('different level second', () => {
            inner_test({type:'branch',value:['next_week', 'mercredi']}, {type:'branch',value:['this_month', 'this_week', 'jeudi']}, 1)
        }) 
    });

    describe('delta at depth > 1', () => {
        it('delata at depth 2', () => {
            inner_test({type:'branch',value:['this_month', 'this_week', 'mercredi']}, {type:'branch',value:['next_week', 'mardi']}, -1)
        })

        it('delta at depth 3', () => {
            inner_test({type:'branch',value:['this_month', 'this_week', 'mercredi']}, {type:'branch',value:['mardi']}, 1)
        }) 
    });

    it('multi and branch', () => {
        inner_test(
            {type:'multi',value:[
                {type:'branch',value:['mardi']},
                {type:'branch',value:['jeudi']}
            ]}
            , 
            {type:'branch',value:['mercredi']},
            -1)
    })

    it('branch and multi', () => {
        inner_test(
            {type:'branch',value:['mercredi']},
            {type:'multi',value:[
                {type:'branch',value:['mardi']},
                {type:'branch',value:['jeudi']}
            ]},            
            1)
    })

    it('multi at level 3 and branch', () => {
        inner_test(
            {type:'branch',value:[
                'this_month', 'this_week', 
                {type:'multi',value:[
                    {type:'branch',value:['mardi']},
                    {type:'branch',value:['jeudi']}
                ]}
            ]},
            {type:'branch',value:['this_month', 'this_week', 'mercredi']},
            -1)
    })

    describe('multi slot choose' , () => {
        describe('multi at first level, multi-branch and branch-multi', () => {
            it('multi doesn\'t contain current slot so use first', () => {
                inner_test(
                    {type:'multi',value:[
                        {type:'branch',value:['jeudi']},
                        {type:'branch',value:['lundi']}]},
                    {type:'branch',value:['mardi']},
                    1)
            })
        
            it('multi contain current slot', () => {
                inner_test(
                    {type:'multi',value:[
                        {type:'branch',value:['lundi']},
                        {type:'branch',value:['mercredi']}]},
                    {type:'branch',value:['mardi']},
                    1)
            })

            it('branch-multi, don\'t contain current', () => {
                inner_test(
                    {type:'branch',value:['mardi']},
                    {type:'multi',value:[
                        {type:'branch',value:['jeudi']},
                        {type:'branch',value:['lundi']}]},
                    -1)
            })
        });

        it('multi at second level', () => {
            inner_test(
                { type:'branch',value:['this_week', 
                    { type:'multi',value:[
                        { type:'branch',value:['jeudi']},
                        { type:'branch',value:['lundi']}]}
                    ]},
                { type:'branch',value:['this_week', 'mardi']},
                1)
        })

        it('multi disable', () => {
            inner_test(
                { type:'multi',value:[
                    { type:'branch',value:['vendredi'], flags: ['disable'] },
                    { type:'branch',value:['lundi']}]},
                { type:'branch',value:[ 'mercredi' ]},
                -1)
        })
        
    });
})

describe('getCurrentPath', () => {
    test('should return day of the week', () => {
        expect(getCurrentPath()).toEqual('this_month this_week mercredi');
    });

    test('should return day of the week branch depth 3', () => {
        expect(getCurrentPathBranch(3)).toEqual({type:'branch',value:['mercredi']});
    });
    
    test('should return day of the week branch depth 2', () => {
        expect(getCurrentPathBranch(2)).toEqual({type:'branch',value:['this_week', 'mercredi']});
    });

    test('should return day of the week branch depth 1', () => {
        expect(getCurrentPathBranch(1)).toEqual({type:'branch',value:['this_month', 'this_week', 'mercredi']});
    })
    
});

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