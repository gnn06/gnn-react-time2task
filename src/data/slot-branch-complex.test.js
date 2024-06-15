import { branchCompare, isBranchEqualOrInclude } from './slot-branch++.js';
import { isSlotEqualOrInclude } from './slot-expr.js';
    
jest.useFakeTimers()
jest.setSystemTime(new Date('2023-12-20')) // mercredi
    

describe('slotIsInOtherBranch', () => {
    it('slotIsInOther true by first level', () => {
        const result = isSlotEqualOrInclude('this_week mercredi matin','this_week');
        expect(result).toBeTruthy();
    })
    
    it('slotIsInOtherBranch true by first level', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['this_week', 'mercredi', 'matin']},{type:'branch',value:['this_week']});
        expect(result).toBeTruthy();
    })

    it('slotIsInOtherBranch true by second level', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['this_week', 'mercredi', 'matin']},{type:'branch',value:['this_week', 'mercredi']});
        expect(result).toBeTruthy();
    })

    it('slotIsInOtherBranch true by last level', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['this_week', 'mercredi', 'matin']},{type:'branch',value:['this_week', 'mercredi', 'matin']});
        expect(result).toBeTruthy();
    })

    it('slotIsInOtherBranch false by last level', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['this_week', 'mercredi', 'aprem']},{type:'branch',value:['this_week', 'mercredi', 'matin']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch false by second level', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['this_week', 'mercredi', 'aprem']},{type:'branch',value:['this_week', 'lundi', 'aprem']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch false by first level', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['this_week', 'mercredi', 'aprem']},{type:'branch',value:['next_week', 'mercredi', 'aprem']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch true other less deeper', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['this_week', 'mercredi', 'aprem']},{type:'branch',value:['this_week', 'mercredi']});
        expect(result).toBeTruthy()
    })

    it('slotIsInOtherBranch false other less deeper', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['this_week', 'mercredi', 'aprem']},{type:'branch',value:['this_week', 'lundi']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch true other has 1 level', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['this_week', 'mercredi', 'aprem']},{type:'branch',value:['this_week']});
        expect(result).toBeTruthy()
    })

    it('slotIsInOtherBranch false other has 1 level', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['this_week', 'mercredi', 'aprem']},{type:'branch',value:['next_week']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch incomplet expr', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['next_week']},{type:'branch',value:['next_week']});
        expect(result).toBeTruthy()
    })

    it('slotIsInOtherBranch incomplet expr trop précis', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['next_week']},{type:'branch',value:['next_week', 'mercredi']});
        expect(result).toBeFalsy()
    })

    it('slotIsInOtherBranch incomplet expr false', () => {
        const result = isBranchEqualOrInclude({type:'branch',value:['this_week', 'mercredi']},{type:'branch',value:['next_week']});
        expect(result).toBeFalsy()
    })

    describe('check behabior of slotIsInOtherBranch on multi', () => {
        it('on first slot', () => {
            const result = isBranchEqualOrInclude(
                {type:'multi',value:[
                    {type:'branch',value:['mercredi']},
                    {type:'branch',value:['jeudi']}]},
                {type:'branch',value:['mercredi']});
            expect(result).toBeTruthy()
        })

        it('on second slot', () => {
            const result = isBranchEqualOrInclude(
                {type:'multi',value:[
                    {type:'branch',value:['mercredi']},
                    {type:'branch',value:['jeudi']}]},
                {type:'branch',value:['jeudi']});
            expect(result).toBeTruthy()
        })

        it('multi on depth 3', () => {
            const result = isBranchEqualOrInclude(
                {type:'branch',value:['this_month', 'this_week',
                    {type:'multi',value:[
                        {type:'branch',value:['mercredi']},
                        {type:'branch',value:['jeudi']}]}
                ]},
                {type:'branch',value:['this_month', 'this_week', 'jeudi']});
            expect(result).toBeTruthy()
        })

        it('different depth first', () => {
            const result = isBranchEqualOrInclude(
                {type:'branch',value:['this_month', 'this_week', 'jeudi']},
                {type:'branch',value:['this_month', 'this_week', 'jeudi']});
            expect(result).toBeTruthy()
        })

    })
    test('disable', () => {
        const result = isBranchEqualOrInclude(
        {type:'branch',value:['this_month', 'this_week', 'lundi'], flags: ['disable']},
            {type:'branch',value:['this_month', 'this_week', 'lundi']});
        expect(result).toBeFalsy()
    })

    test('subbranch for flag', () => {
        const result = isBranchEqualOrInclude(
            { type: 'branch', value: [ 'this_month', 
                { type: 'branch', value: [ 'this_week', 'jeudi' ], flags: ['EVERY2'] }
            ] }
            ,{ type: 'branch', value: [ 'this_month', 'this_week', 'jeudi']});
        expect(result).toBeTruthy()
    })

    describe('shift', () => {
        test('next + 1', () => {
            const result = isBranchEqualOrInclude(
                { type: 'branch', value: [ 'this_week'], shift: 1 },
                { type: 'branch', value: [ 'next_week']});
            expect(result).toBeTruthy()
        });
        test('next + 1 other', () => {
            const result = isBranchEqualOrInclude(
                { type: 'branch', value: [ 'next_week']},
                { type: 'branch', value: [ 'this_week'], shift: 1 });
            expect(result).toBeTruthy()
        })
        test('this + 1 don\'t match this', () => {
            const result = isBranchEqualOrInclude(
                { type: 'branch', value: [ 'this_week', 'mardi'], shift: 1 },
                { type: 'branch', value: [ 'this_week']});
            expect(result).toBeFalsy()
        });
    });
})

describe('slotCompareTree', () => {
    
    function inner_test (op1, op2, expected) {
        const result = branchCompare(op1, op2);
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
            inner_test({type:'branch',value:['this_month', 'week']}, {type:'branch',value:['this_month']}, -1);
        })
        it('this_month compare to this_month week', () => {
            inner_test({type:'branch',value:['this_month']}, {type:'branch',value:['this_month', 'week']}, 1);
        })
        it('delta depth first deeper', () => {
            inner_test({type:'branch',value:['vendredi', 'aprem']}, {type:'branch',value:['vendredi']}, -1)
        })
    
        it('delta depth second deeper', () => {
            inner_test({type:'branch',value:['vendredi']}, {type:'branch',value:['vendredi', 'aprem']}, 1)
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
            inner_test(
                {type:'branch',value:['this_month', 'next_week', 'mercredi']}, 
                {type:'branch',value:['this_month', 'this_week', 'mardi']}, 1)
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
            inner_test(
                {type:'branch',value:['this_month', 'this_week', 'mercredi']}, 
                {type:'branch',value:['this_month', 'this_week', 'mardi']}, 1)
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