import { isSlotRepeat1Branch, isSlotRepeat2Branch } from './slot-branch.js';

describe('repeat1', () => {
    describe('branch', () => {
        test('branch with recurrence 1', () => {
            const result = isSlotRepeat1Branch(
                { type:'branch', value: ['lundi'], flags:['chaque']});
            expect(result).toBeTruthy();
        });

        test('branch with recurrence 2', () => {
            const result = isSlotRepeat1Branch(
                { type:'branch', value: ['this_week', 
                    { type:'branch', value: ['lundi'], flags:['chaque']}] });
            expect(result).toBeTruthy();
        })

        test('branch with recurrence 3', () => {
            const result = isSlotRepeat1Branch(
                { type:'branch', value: ['this_month', 
                    { type:'branch', value: ['this_week', 
                        { type:'branch', value: ['lundi'], flags:['chaque'] } 
                    ] } ] });
            expect(result).toBeTruthy();
        })

        test('branch deep 3 repeat at level 2', () => {
            const result = isSlotRepeat1Branch(
                { type:'branch', value: ['this_month', 
                    { type:'branch', value: ['this_week', 'lundi' ], flags:['chaque'] } ] });
            expect(result).toBeTruthy();
        })

        test('branch deep 1 without recurrence', () => {
            const result = isSlotRepeat1Branch({type:'branch', value: ['lundi']});
            expect(result).toBeFalsy();
        })

        test('branch deep 2 without recurrence', () => {
            const result = isSlotRepeat1Branch({type:'branch', value: ['this_week', 'lundi']});
            expect(result).toBeFalsy();
        })

        test('branch deep 3 without recurrence', () => {
            const result = isSlotRepeat1Branch(
                { type:'branch', value: ['this_month', 'this_week', 'lundi'] });
            expect(result).toBeFalsy();
        })
        
        test('branch without recurrence but disable', () => {
            const result = isSlotRepeat1Branch({type:'branch', value: ['lundi'], flags:['disable']});
            expect(result).toBeFalsy();
        });    

        test('EVERY2', () => {
            const result = isSlotRepeat1Branch(
                {type:'branch', value: [
                    'this_week'               
                ], flags: ['EVERY2']});
            expect(result).toBeTruthy();
        })    
    });

    describe('multi', () => {
        describe('multi at level 1', () => {
            test('multi with recurrence on first', () => {
                const result = isSlotRepeat1Branch(
                    {type:'multi', value: [
                        {type:'branch', value: ['lundi'], flags:['chaque']},
                        {type:'branch', value: ['mardi']}
                    ]});
                expect(result).toBeTruthy();
            });
            
            test('multi with recurrence on second', () => {
                const result = isSlotRepeat1Branch({type:'multi', value: [
                    {type:'branch', value: ['lundi']},
                    {type:'branch', value: ['mardi'], flags:['chaque']}
                ]});
                expect(result).toBeTruthy();
            });
            
            test('multi without recurrence', () => {
                const result = isSlotRepeat1Branch({type:'multi', value: [
                    {type:'branch', value: ['lundi']},
                    {type:'branch', value: ['mardi']}
                ]});
                expect(result).toBeFalsy();
            });
        });

        test('multi at final depth' , () => {
            const result = isSlotRepeat1Branch(
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
            const result = isSlotRepeat1Branch(
                {type:'branch', value: [
                    'this_month', 
                    {type:'multi', value: [
                        {type:'branch', value: ['this_week', 'lundi'], flags:['EVERY2']},
                        {type:'branch', value: ['next_week', 'mardi']}
                    ]}
                ]});
            expect(result).toBeTruthy();
        });

        test('multi at level 1, EVERY2 on branch one', () => {
            const result = isSlotRepeat2Branch(
                {type:'multi', value: [
                    {type:'branch', value: ['this_week', 'lundi'], flags:['EVERY2']},
                    {type:'branch', value: ['next_week', 'mardi']}
                ]});
            expect(result).toBeTruthy();
        });

        test('multi at level1, no repeat', () => {
            const result = isSlotRepeat2Branch(
                {type:'multi', value: [
                    {type:'branch', value: ['this_week', 'lundi']},
                    {type:'branch', value: ['next_week', 'mardi']}
                ]});
            expect(result).toBeFalsy();
        })

        test('deep multi without recurrence', () => {
            const result = isSlotRepeat1Branch(
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
        const result = isSlotRepeat2Branch(
            {type:'branch', value: [
                'this_week'               
            ], flags: ['EVERY2']});
        expect(result).toBeTruthy();
    })

    test('isRepeat with chaque', () => {
        const result = isSlotRepeat2Branch(
            {type:'branch', value: [
                'this_week'               
            ], flags: ['chaque']});
        expect(result).toBeFalsy();
    })
});