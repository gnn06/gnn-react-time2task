import { taskCompare, chooseSlotForSort } from "./task";

jest.useFakeTimers()
jest.setSystemTime(new Date('2023-12-20')) // mercredi

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
    
    it('compare task by slot and order with param1 undefined', () => {
        const task1 = { slotExpr: 'this_month this_week jeudi'}
        const task2 = { slotExpr: 'this_month this_week jeudi', order: 2}
        const result = taskCompare(task1, task2)
        expect(result).toBe(-1) 
    })

    it('compare task by slot and order with param2 undefined', () => {
        const task1 = { slotExpr: 'this_month this_week jeudi', order: 2}
        const task2 = { slotExpr: 'this_month this_week jeudi'}
        const result = taskCompare(task1, task2)
        expect(result).toBe(1) 
    })

    it('compare task with task1 incomplete slot', () => {
        const task1 = { slotExpr: 'mardi' }
        const task2 = { slotExpr: 'this_month this_week jeudi' }
        const result = taskCompare(task1, task2)
        expect(result).toBe(-1)
    })

    it('compare task with task2 incomplete slot', () => {
        const task1 = { slotExpr: 'this_month next_week jeudi' }
        const task2 = { slotExpr: 'this_month this_week' }
        const result = taskCompare(task1, task2)
        expect(result).toBe(1)
    })

    describe('multi slot', () => {
        it('compare task with param1 multislot', () => {
            const task1 = { slotExpr: 'this_month next_week jeudi mardi' }
            const task2 = { slotExpr: 'this_month this_week lundi' }
            const result = taskCompare(task1, task2)
            expect(result).toBe(1)
        })
    
        it('compare task with param2 multislot', () => {
            const task1 = { slotExpr: 'this_month next_week vendredi' }
            const task2 = { slotExpr: 'this_month this_week mardi jeudi' }
            const result = taskCompare(task1, task2)
            expect(result).toBe(1)
        })

        it('compare task with param1 multislot', () => {
            const task1 = { slotExpr: 'this_month this_week lundi mercredi' }
            const task2 = { slotExpr: 'this_month this_week mardi' }
            const result = taskCompare(task1, task2)
            expect(result).toBe(1) // avec lundi => -1 avec mercredi => 1
        })
    });

    it('compare task with no slotExpr', () => {
        const task1 = {  }
        const task2 = { slotExpr: 'this_month this_week mardi jeudi' }
        const result = taskCompare(task1, task2)
        expect(result).toBe(1)
    })

    it('compare task with disable', () => {
        const task1 = { slotExpr: 'this_month this_week disable vendredi lundi' }
        const task2 = { slotExpr: 'this_month this_week mercredi' }
        const result = taskCompare(task1, task2)
        expect(result).toBe(-1)
    })
})

describe('chooseSlotForSort', () => {
    test('should take first and only slot', () => {
        expect(chooseSlotForSort(['this_week lundi'], 'this_week lundi')).toEqual('this_week lundi')
    });
    
    test('should take first and only slot', () => {
        expect(chooseSlotForSort(['this_week lundi'], 'this_week mardi')).toEqual('this_week lundi')
    });
    
    test('should take first slot', () => {
        expect(chooseSlotForSort(['this_week lundi', 'this_week mardi'], 'this_week lundi')).toEqual('this_week lundi')
    });

    test('should take first slot', () => {
        expect(chooseSlotForSort(['this_week lundi', 'this_week mardi'], 'this_week mardi')).toEqual('this_week mardi')
    });

    test('should take first slot', () => {
        expect(chooseSlotForSort(['this_week lundi', 'this_week mardi'], 'this_week mercredi')).toEqual('this_week lundi')
    });

    test('should take first slot', () => {
        expect(chooseSlotForSort(['this_week lundi', 'this_week mardi'], undefined)).toEqual('this_week lundi')
    });

    test('should take first slot', () => {
        expect(chooseSlotForSort(['this_week lundi'], undefined)).toEqual('this_week lundi')
    });
});