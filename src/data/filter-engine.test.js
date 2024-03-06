import { makeFilter, makeTitleFilterFunc, makeNoRepeatFilterFunc } from './filter-engine';

const task1 = {title:'toto', slotExpr: 'lundi jeudi'};
const task2 = {title:'titi', slotExpr: 'this_week mardi'};
const task3 = {title:'TATA', slotExpr: 'mercredi'};
const task4 = {title:'tutu', slotExpr: 'mercredi aprem'};
const task5 = {title:'task5', slotExpr: 'chaque vendredi'};
const task6 = {title:'task5', slotExpr: 'EVERY2 this_week mardi'};
const data = [task1, task2, task3, task4, task5, task6];

describe('makeFilter', () => {
    test('slotExpr with task complete', () => {
        const result = data.filter(makeFilter('this_week lundi').func);
        expect(result).toEqual([task1])
    })
    
    test('slotExpr with multiSlot', () => {
        const result = data.filter(makeFilter('this_week jeudi').func);
        expect(result).toEqual([task1])
    })
    
    test('slotExpr with filter complete', () => {
        const result = data.filter(makeFilter('mardi').func);
        expect(result).toEqual([task2,task6])
    })
    
    test('OR', () => {
        const result = data.filter(makeFilter('lundi OR mardi').func);
        expect(result).toEqual([task1, task2, task6])
    })
    
    test('no filter', () => {
        const result = data.filter(makeFilter('').func);
        expect(result).toEqual(data)
    })
    
    test('filter by title', () => {
        const result = data.filter(makeFilter('title:TATA').func);
        expect(result).toEqual([task3])
    })
    
    test('slotExpr AND title', () => {
        const result = data.filter(makeFilter('mercredi AND title:TATA').func);
        expect(result).toEqual([task3])
    })

    test('AND with space and nothing', () => {
        const result = data.filter(makeFilter('mercredi AND ').func);
        expect(result).toEqual([task3, task4])
    })

    test('AND without space', () => {
        const result = data.filter(makeFilter('mercredi AND').func);
        expect(result).toEqual([task3, task4])
    })

    test('title case insensitive', () => {
        const result = data.filter(makeFilter('title:tata').func);
        expect(result).toEqual([task3])
    })

    test('title case insensitive task', () => {
        const result = data.filter(makeFilter('title:TUTU').func);
        expect(result).toEqual([task4])
    })

    test('NOREPEAT', () => {
        const result = data.filter(makeFilter('NOREPEAT').func);
        expect(result).toEqual([task1, task2, task3, task4])
    })

    test('MERCREDI AND NOREPEAT', () => {
         const result = data.filter(makeFilter('mercredi AND NOREPEAT').func);
         expect(result).toEqual([task3, task4])
    })

    test('without NONE', () => {
        const result = data.filter(makeFilter('mercredi').func);
        expect(result).toEqual([task3, task4])
   })

   test('with NONE', () => {
    const result = data.filter(makeFilter('mercredi NONE').func);
    expect(result).toEqual([task3])
    })
    
    test('EVERY2 filter', () => {
        const result = data.filter(makeFilter('EVERY2').func);
        expect(result).toEqual([task6])
    })

    test('error', () => {
        const result = makeFilter('mardi jeudi');
        expect(result.error).toBeDefined();
        expect(data.filter(result.func)).toEqual(data)
    })
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
});