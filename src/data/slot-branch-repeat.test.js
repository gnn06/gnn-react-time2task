import { isBranchRepeat1, isBranchRepeat2 } from './slot-branch.js';

describe('repeat1', () => {
    describe('branch', () => {
        test('branch with recurrence 1', () => {
            const result = isBranchRepeat1(
                { type:'branch', value: ['lundi'], flags:['chaque']});
            expect(result).toBeTruthy();
        });

        test('branch with recurrence 2', () => {
            const result = isBranchRepeat1(
                { type:'branch', value: ['this_week', 
                    { type:'branch', value: ['lundi'], flags:['chaque']}] });
            expect(result).toBeTruthy();
        })

        test('branch with recurrence 3', () => {
            const result = isBranchRepeat1(
                { type:'branch', value: ['this_month', 
                    { type:'branch', value: ['this_week', 
                        { type:'branch', value: ['lundi'], flags:['chaque'] } 
                    ] } ] });
            expect(result).toBeTruthy();
        })

        test('branch deep 3 repeat at level 2', () => {
            const result = isBranchRepeat1(
                { type:'branch', value: ['this_month', 
                    { type:'branch', value: ['this_week', 'lundi' ], flags:['chaque'] } ] });
            expect(result).toBeTruthy();
        })

        test('branch deep 1 without recurrence', () => {
            const result = isBranchRepeat1({type:'branch', value: ['lundi']});
            expect(result).toBeFalsy();
        })

        test('branch deep 2 without recurrence', () => {
            const result = isBranchRepeat1({type:'branch', value: ['this_week', 'lundi']});
            expect(result).toBeFalsy();
        })

        test('branch deep 3 without recurrence', () => {
            const result = isBranchRepeat1(
                { type:'branch', value: ['this_month', 'this_week', 'lundi'] });
            expect(result).toBeFalsy();
        })
        
        test('branch without recurrence but disable', () => {
            const result = isBranchRepeat1({type:'branch', value: ['lundi'], flags:['disable']});
            expect(result).toBeFalsy();
        });    

        test('every 2', () => {
            const result = isBranchRepeat1(
                {type:'branch', value: [
                    'this_week'               
                ], repetition: 2});
            expect(result).toBeTruthy();
        })

        test('every 1', () => {
            const result = isBranchRepeat1(
                {type:'branch', value: [
                    'this_week'               
                ], repetition: 1});
            expect(result).toBeTruthy();
        })

        test('week', () => {
            const result = isBranchRepeat1(
                {type:'branch', value: [ 'week' ]});
            expect(result).toBeTruthy();
        })

        test('lundi', () => {
            const result = isBranchRepeat1(
                {type:'branch', value: [ 'lundi' ]});
            expect(result).toBeFalsy();
        })
    });

    describe('multi', () => {
        describe('multi at level 1', () => {
            test('multi with recurrence on first', () => {
                const result = isBranchRepeat1(
                    {type:'multi', value: [
                        {type:'branch', value: ['lundi'], flags:['chaque']},
                        {type:'branch', value: ['mardi']}
                    ]});
                expect(result).toBeTruthy();
            });
            
            test('multi with recurrence on second', () => {
                const result = isBranchRepeat1({type:'multi', value: [
                    {type:'branch', value: ['lundi']},
                    {type:'branch', value: ['mardi'], flags:['chaque']}
                ]});
                expect(result).toBeTruthy();
            });
            
            test('multi without recurrence', () => {
                const result = isBranchRepeat1({type:'multi', value: [
                    {type:'branch', value: ['lundi']},
                    {type:'branch', value: ['mardi']}
                ]});
                expect(result).toBeFalsy();
            });
        });

        test('multi at final depth' , () => {
            const result = isBranchRepeat1(
                {type:'branch', value: [
                    'this_month', 'this_week',
                    {type:'multi', value: [
                        {type:'branch', value: ['lundi'], flags:['chaque']},
                        {type:'branch', value: ['mardi']}
                    ]}
                ]});
            expect(result).toBeTruthy();
        });

        test('multi at middle depth', () => {
            const result = isBranchRepeat1(
                {type:'branch', value: [
                    'this_month', 
                    {type:'multi', value: [
                        {type:'branch', value: ['this_week', 'lundi'], repetition: 2},
                        {type:'branch', value: ['next_week', 'mardi']}
                    ]}
                ]});
            expect(result).toBeTruthy();
        });

        test('multi at level 1, EVERY2 on branch one', () => {
            const result = isBranchRepeat2(
                {type:'multi', value: [
                    {type:'branch', value: ['this_week', 'lundi'], repetition: 2},
                    {type:'branch', value: ['next_week', 'mardi']}
                ]});
            expect(result).toBeTruthy();
        });

        test('multi at level1, no repeat', () => {
            const result = isBranchRepeat2(
                {type:'multi', value: [
                    {type:'branch', value: ['this_week', 'lundi']},
                    {type:'branch', value: ['next_week', 'mardi']}
                ]});
            expect(result).toBeFalsy();
        })

        test('deep multi without recurrence', () => {
            const result = isBranchRepeat1(
                {type:'branch', value: [
                    'this_week',
                    {type:'multi', value: [
                        {type:'branch', value: ['lundi']},
                        {type:'branch', value: ['mardi']}
                    ]}
                ]});
            expect(result).toBeFalsy();
        })
    });


})

describe('Repeat2', () => {
    test('isRepeat with EVERY2', () => {
        const result = isBranchRepeat2(
            {type:'branch', value: [
                'this_week'               
            ], repetition: 2});
        expect(result).toBeTruthy();
    })

    test('isRepeat with chaque', () => {
        const result = isBranchRepeat2(
            {type:'branch', value: [
                'this_week'               
            ], flags: ['chaque']});
        expect(result).toBeFalsy();
    })

    test('generic', () => {
        const result = isBranchRepeat2(
            {type:'branch', value: ['week']});
        expect(result).toBeFalsy();
    })

    test('simple', () => {
        const result = isBranchRepeat2(
            {type:'branch', value: ['lundi']});
        expect(result).toBeFalsy();
    })
});