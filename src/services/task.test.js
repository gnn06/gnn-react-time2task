import { taskCompare, taskFilter, filterSlotExpr, findTaskBySlotExpr } from "./task";

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

        it('compare task with param1 multislot bis', () => {
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

describe('taskFilter', () => {
    test('false', () => {
        const task = { slotExpr: 'mardi aprem' }
        const filter = 'mardi matin'
        const result = taskFilter(task, filter)
        expect(result).toBeFalsy()
    });
    test('true', () => {
        const task = { slotExpr: 'mardi aprem' }
        const filter = 'mardi'
        const result = taskFilter(task, filter)
        expect(result).toBeTruthy()
    });
    test('slotFilter keep', () => {
        const task = { slotExpr: 'mardi' }
        const filter = 'mardi'
        const result = taskFilter(task, filter)
        expect(result).toBeTruthy()
    });

    test('slotFilter discard', () => {
        const task = { slotExpr: 'mardi' }
        const result = taskFilter(task, 'mercredi')
        expect(result).toBeFalsy()
    });

    test('slotFilter level 3 keep', () => {
        const task = { slotExpr: 'mardi matin' }
        const result = taskFilter(task, 'mardi matin')
        expect(result).toBeTruthy()
    });

    test('slotFilter level 3 discard', () => {
        const task = { slotExpr: 'mardi aprem' }
        const result = taskFilter(task, 'mardi matin')
        expect(result).toBeFalsy()
    })

});

describe('filterSlotExpr', () => {
    it('level1 match level1 level2', () => {
        const tasks = [ { slotExpr: 'week mercredi' } ];
        const result = filterSlotExpr(tasks, 'week');
        expect(result).toEqual(tasks)
    })

    it('level1 don\'t match level1 level2', () => {
        const tasks = [ { slotExpr: 'week mercredi' } ];
        const result = filterSlotExpr(tasks, 'next_week');
        expect(result).toEqual([])
    })

    it('level1 level2 match level1 level2', () => {
        const tasks = [ { slotExpr: 'week mercredi' } ];
        const result = filterSlotExpr(tasks, 'week mercredi');
        expect(result).toEqual(tasks)
    })

    it('level1 match uncomplete level2', () => {
        const tasks = [ { slotExpr: 'vendredi' } ];
        const result = filterSlotExpr(tasks, 'this_week');
        expect(result).toEqual(tasks)
    })

    it('uncomplete level2 match level1 level2', () => {
        const tasks = [ { slotExpr: 'this_week vendredi' } ];
        const result = filterSlotExpr(tasks, 'vendredi');
        expect(result).toEqual(tasks)
    })
})

describe('findTaskBySlotExpr', () => {
    it('feuille', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'this_month week mardi'
        }, {
            id: 'task3',
            slotExpr: 'this_month week jeudi'
        }];
        const slot = { id: 'slot1', path: 'this_month week mardi' };
        const result = findTaskBySlotExpr(tasks, slot);
        const expected = [ {
            id: 'task1',
            slotExpr: 'this_month week mardi'
        }];
        expect(result).toEqual(expected);
    });

    it('feuille avec subtask', () => {
        const tasks = [ {
            id: 'task2',
            slotExpr: 'this_month this_week mardi aprem'
        }, {
            id: 'task3',
            slotExpr: 'this_month this_week jeudi'
        }];
        const slot = { id: 'slot1', path: 'this_month this_week mardi' };
        const result = findTaskBySlotExpr(tasks, slot);
        const expected = [ {
            id: 'task2',
            slotExpr: 'this_month this_week mardi aprem'
        }];
        expect(result).toEqual(expected);
    });

    it('pas feuille', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'this_month week mardi'
        }, {
            id: 'task3',
            slotExpr: 'this_month week jeudi'
        }];
        const slot = { id: 'slot1', path: 'this_month week mardi',
            inner: [ { id: 'slot2', path: 'this_month week mardi aprem',
                inner: []
            }]
        };
        const result = findTaskBySlotExpr(tasks, slot);
        const expected = [ {
            id: 'task1',
            slotExpr: 'this_month week mardi'
        }];
        expect(result).toEqual(expected);
    })
    
    it('test findTaskBySlotExpr empty slotExpr', () => {
        const tasks = [ {
            id: 'task1'
        }];
        const slot = { id: 'slot1', path: 'slot1' };
        const expected = [];
        const result = findTaskBySlotExpr(tasks, slot);
        expect(result).toEqual(expected);
    });

    it('test findTaskBySlotExpr match', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'mardi'
        }, {
            id: 'task2',
            slotExpr: ''
        }];
        const slot = { id: 'slot1', path: 'this_month this_week mardi' }
        const expected = [ {
            id: 'task1',
            slotExpr: 'mardi'
        }];
        const result = findTaskBySlotExpr(tasks, slot);
        expect(result).toEqual(expected);
    });

    it('test findTaskBySlotExpr exact min', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'week'
        }, {
            id: 'task2',
            slotExpr: 'next_week'
        }];
        const slot = { id: 'slot1', path: 'this_month week' };
        const expected = [ {
            id: 'task1',
            slotExpr: 'week'
        }];
        const result = findTaskBySlotExpr(tasks, slot);
        expect(result).toEqual(expected);
    });

    it('test findTaskBySlotExpr exact max', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'week'
        }, {
            id: 'task2',
            slotExpr: 'next_week'
        }];
        const slot = { id: 'slot1', path: 'this_month next_week' };
        const expected = [ {
            id: 'task2',
            slotExpr: 'next_week'
        }];
        const result = findTaskBySlotExpr(tasks, slot);
        expect(result).toEqual(expected);
    });

    it('test findTaskBySlotExpr no match', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'slot3'
        }];
        const slot = { id: 'slot1', path: 'slot1' };
        const result = findTaskBySlotExpr(tasks, slot);
        expect(result).toEqual([]);
    });

    it('endWith not on final', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'week mardi'
        },{
            id: 'task2',
            slotExpr: 'week vendredi'
        }];
        const slot = { id: 'slot1', path: 'this_month week mardi' };
        const expected = [{
            id: 'task1',
            slotExpr: 'week mardi'
        }];
        const result = findTaskBySlotExpr(tasks, slot);
        expect(result).toEqual(expected);
    })

    it('endWith on final', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'week'
        },{
            id: 'task2',
            slotExpr: 'week vendredi'
        }];
        const slot = { id: 'slot1', path: 'this_month week vendredi' };
        const expected = [{
            id: 'task2',
            slotExpr: 'week vendredi'
        }];
        const result = findTaskBySlotExpr(tasks, slot);
        expect(result).toEqual(expected);
    })
})