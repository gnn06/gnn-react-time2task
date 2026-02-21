import { makeFilterExpr, makeTitleFilterFunc, makeNoRepeatFilterFunc, makeIsMultiFilterFunc, makeFilterMulti, makeFilterCombine } from './filter-engine';

const task1 = {title:'toto',  slotExpr: 'lundi jeudi', status: 'done'};
const task2 = {title:'titi',  slotExpr: 'this_week mardi', status: 'todo'};
const task3 = {title:'TATA',  slotExpr: 'mercredi', status: 'todo'};
const task4 = {title:'tutu',  slotExpr: 'mercredi aprem', status: 'todo'};
const task5 = {title:'task5', slotExpr: 'chaque vendredi', status: 'todo'};
const task6 = {title:'task6', slotExpr: 'every 2 this_week mardi', status: 'todo'};
const task7 = {title:'task7', slotExpr: 'every 2 this_week vendredi', status: 'todo'};
const task8 = {title:'task8', slotExpr: 'week vendredi', status: 'todo'};
const task9 = {title:'task9', slotExpr: 'every 2 next_week lundi this_week vendredi', status: 'done'};
const data = [task1, task2, task3, task4, task5, task6, task7, task8, task9];

describe('makeFilter', () => {
    test('slotExpr with task complete', () => {
        const result = data.filter(makeFilterExpr('this_week lundi').func);
        expect(result).toEqual([task1])
    })
    
    test('slotExpr with multiSlot', () => {
        const result = data.filter(makeFilterExpr('this_week jeudi').func);
        expect(result).toEqual([task1])
    })
    
    test('slotExpr with filter complete', () => {
        const result = data.filter(makeFilterExpr('mardi').func);
        expect(result).toEqual([task2,task6])
    })
    
    test('OR', () => {
        const result = data.filter(makeFilterExpr('lundi OR mardi').func);
        expect(result).toEqual([task1, task2, task6])
    })
    
    test('no filter', () => {
        const result = data.filter(makeFilterExpr('').func);
        expect(result).toEqual(data)
    })
    
    test('filter by title keyword', () => {
        const result = data.filter(makeFilterExpr('title:TATA').func);
        expect(result).toEqual([task3])
    })

    test('filter by title', () => {
        const result = data.filter(makeFilterExpr('TATA').func);
        expect(result).toEqual([task3])
    })
    
    test('slotExpr AND title', () => {
        const result = data.filter(makeFilterExpr('mercredi AND title:TATA').func);
        expect(result).toEqual([task3])
    })

    test('AND with space and nothing', () => {
        const result = data.filter(makeFilterExpr('mercredi AND ').func);
        expect(result).toEqual([task3, task4])
    })

    test('AND without space', () => {
        const result = data.filter(makeFilterExpr('mercredi AND').func);
        expect(result).toEqual([task3, task4])
    })

    test('title case insensitive', () => {
        const result = data.filter(makeFilterExpr('title:tata').func);
        expect(result).toEqual([task3])
    })

    test('title case insensitive task', () => {
        const result = data.filter(makeFilterExpr('title:TUTU').func);
        expect(result).toEqual([task4])
    })

    test('NOREPEAT', () => {
        const result = data.filter(makeFilterExpr('NOREPEAT').func);
        expect(result).toEqual([task1, task2, task3, task4])
    })

    test('MERCREDI AND NOREPEAT', () => {
         const result = data.filter(makeFilterExpr('mercredi AND NOREPEAT').func);
         expect(result).toEqual([task3, task4])
    })

    test('without NONE', () => {
        const result = data.filter(makeFilterExpr('mercredi').func);
        expect(result).toEqual([task3, task4])
   })

   test('with NONE', () => {
    const result = data.filter(makeFilterExpr('mercredi NONE').func);
    expect(result).toEqual([task3])
    })

    test('NONE only match this and not next', () => {
        const data = [{title:'toto', slotExpr: 'this_week mercredi'}, {title:'titi', slotExpr: 'next_week mercredi'}]
        const result = data.filter(makeFilterExpr('mercredi NONE').func);
        expect(result).toEqual([{title:'toto', slotExpr: 'this_week mercredi'}])
    })

    test('jeudi NONE with week mardi jeudi', () => {
        const data = [{title:'toto', slotExpr: 'week mardi jeudi'}]
        const result = data.filter(makeFilterExpr('jeudi NONE').func);
        expect(result).toEqual(data)
    })
    
    test('EVERY2+ filter', () => {
        const result = data.filter(makeFilterExpr('EVERY2+').func);
        expect(result).toEqual([task6, task7, task9])
    })

    test('EVERY filter', () => {
        const result = data.filter(makeFilterExpr('EVERY1').func);
        expect(result).toEqual([task5, task6, task7, task8, task9])
    })

    test('error', () => {
        const result = makeFilterExpr('mardi jeudi');
        expect(result.error).toBeDefined();
        expect(data.filter(result.func)).toEqual(data)
    })

    describe('isMulti', () => {
        test('isMulti true', () => {
            const result = data.filter(makeFilterMulti(true).func);
            expect(result).toEqual([task1, task9])
        })
    
        test('isMulti false', () => {
            const result = data.filter(makeFilterMulti(false).func);
            expect(result).toEqual(data)
        })
    });
    
    describe('filter combine', () => {
        test('expr and multi filter', () => {
            const result = data.filter(makeFilterCombine({expression:null, isMulti: true}).func);
            expect(result).toEqual([task1, task9])
        })
        test('only expr', () => {
            const result = data.filter(makeFilterCombine({expression: 'vendredi', isMulti: false}).func);
            expect(result).toEqual([task5, task7, task8, task9])
        })
        test('expr and isMulti', () => {
            const result = data.filter(makeFilterCombine({expression: 'vendredi', isMulti: true}).func);
            expect(result).toEqual([task9])
        })
        test('no expr and no isMulti', () => {
            const result = data.filter(makeFilterCombine({expression: null, isMulti: false}).func);
            expect(result).toEqual(data)
        })
        test('generic filters', () => {
            const result = data.filter(makeFilterCombine({genericFilters: {status: ['done']}}).func);
            expect(result).toEqual([task1, task9])
        })
        test('generic filters and other', () => {
            const result = data.filter(makeFilterCombine({expression: 'vendredi', genericFilters: {status: ['done']}}).func);
            expect(result).toEqual([task9])
        })
    });
});

describe('makexxxFilterFunc', () => {
    test('makeTitleFilterFunc', () => {
        const result = data.filter(task => makeTitleFilterFunc(task, 'TATA'));
        expect(result).toEqual([task3])
    })
    
    test('makeNoRepeatFilterFunc', () => {
        const result = data.filter(task => makeNoRepeatFilterFunc(task));
        expect(result).toEqual([task1, task2, task3, task4])
    })

    test('makeIsMultiFilterFunc', () => {
        const result = data.filter(task => makeIsMultiFilterFunc(task));
        expect(result).toEqual([task1, task9])
    })
});