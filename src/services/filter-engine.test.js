import { makeFilter, makeTitleFilterFunc, makeNoRepeatFilterFunc } from './filter-engine';

const task1 = {title:'toto', slotExpr: 'lundi jeudi'};
const task2 = {title:'titi', slotExpr: 'this_week mardi'};
const task3 = {title:'TATA', slotExpr: 'mercredi'};
const task4 = {title:'tutu', slotExpr: 'mercredi aprem'};
const task5 = {title:'task5', slotExpr: 'chaque vendredi'};
const data = [task1, task2, task3, task4, task5];

describe('makeFilter', () => {
    test('slotExpr with task complete', () => {
        const result = data.filter(makeFilter('this_week lundi'));
        expect(result).toEqual([task1])
    })
    
    test('slotExpr with multiSlot', () => {
        const result = data.filter(makeFilter('this_week jeudi'));
        expect(result).toEqual([task1])
    })
    
    test('slotExpr with filter complete', () => {
        const result = data.filter(makeFilter('mardi'));
        expect(result).toEqual([task2])
    })
    
    test('OR', () => {
        const result = data.filter(makeFilter('lundi OR mardi'));
        expect(result).toEqual([task1, task2])
    })
    
    test('no filter', () => {
        const result = data.filter(makeFilter(''));
        expect(result).toEqual(data)
    })
    
    test('filter by title', () => {
        const result = data.filter(makeFilter('title:TATA'));
        expect(result).toEqual([task3])
    })
    
    test('slotExpr AND title', () => {
        const result = data.filter(makeFilter('mercredi AND title:TATA'));
        expect(result).toEqual([task3])
    })

    test('title case insensitive', () => {
        const result = data.filter(makeFilter('title:tata'));
        expect(result).toEqual([task3])
    })

    test('title case insensitive task', () => {
        const result = data.filter(makeFilter('title:TUTU'));
        expect(result).toEqual([task4])
    })

    test('NOREPEAT', () => {
        const result = data.filter(makeFilter('NOREPEAT'));
        expect(result).toEqual([task1, task2, task3, task4])
    })

    test('MERCREDI AND NOREPEAT', () => {
         const result = data.filter(makeFilter('mercredi AND NOREPEAT'));
         expect(result).toEqual([task3, task4])
    })

    test('without NONE', () => {
        const result = data.filter(makeFilter('mercredi'));
        expect(result).toEqual([task3, task4])
   })

   test('with NONE', () => {
    const result = data.filter(makeFilter('mercredi NONE'));
    expect(result).toEqual([task3])
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