import { makeFilter, makeTitleFilterFunc } from './filter-engine';

const task1 = {title:'toto', slotExpr: 'lundi jeudi'};
const task2 = {title:'titi', slotExpr: 'this_week mardi'};
const task3 = {title:'tata', slotExpr: 'mercredi'};
const task4 = {title:'tutu', slotExpr: 'mercredi'};
const data = [task1, task2, task3, task4];

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
    const result = data.filter(makeFilter('title:tata'));
    expect(result).toEqual([task3])
})

test('slotExpr AND title', () => {
    const result = data.filter(makeFilter('mercredi AND title:tata'));
    expect(result).toEqual([task3])
})

test('makeTitleFilterFunc', () => {
    const result = data.filter(task => makeTitleFilterFunc(task, 'tata'));
    expect(result).toEqual([task3])
})