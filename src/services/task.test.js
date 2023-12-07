import { taskCompare } from "./task";

describe('taskCompare', () => {
    it('compare task by slot', () => {
        const task1 = { slotExpr: 'this_month this_week jeudi', order: 3 }
        const task2 = { slotExpr: 'this_month this_week vendredi', order: 2 }
        const result = taskCompare(task1, task2)
        expect(result).toEqual(-1)
    })

    it('compare task by slot and order lower', () => {
        const task1 = { slotExpr: 'this_month this_week jeudi', order: 1}
        const task2 = { slotExpr: 'this_month this_week jeudi', order: 2}
        const result = taskCompare(task1, task2)
        expect(result).toBe(-1)    
    })

    it('compare task by slot and order bigger', () => {
        const task1 = { slotExpr: 'this_month this_week jeudi', order: 3}
        const task2 = { slotExpr: 'this_month this_week jeudi', order: 2}
        const result = taskCompare(task1, task2)
        expect(result).toBe(1)    
    })

    it('compare task by slot and order equal', () => {
        const task1 = { slotExpr: 'this_month this_week jeudi', order: 2}
        const task2 = { slotExpr: 'this_month this_week jeudi', order: 2}
        const result = taskCompare(task1, task2)
        expect(result).toBe(0) 
    })
})