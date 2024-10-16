import { taskCompare, taskPredicateEqualAndInclude, taskPredicateEqual, taskPredicateNoRepeat, filterSlotExpr, findTaskBySlotExpr, taskPredicateEvery2,
        taskGroup, taskShiftFilter,
        taskPredicateEvery1,
        taskPredicateError} from "./task";
import { branchComplete, branchTruncate, getBranchHash } from './slot-branch.js';
import { Parser } from './parser.js';
import { vi } from "vitest";

vi.useFakeTimers()
vi.setSystemTime(new Date('2023-12-20')) // mercredi

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
        expect(result).toBe(1) 
    })

    it('compare task by slot and order with param2 undefined', () => {
        const task1 = { slotExpr: 'this_month this_week jeudi', order: 2}
        const task2 = { slotExpr: 'this_month this_week jeudi'}
        const result = taskCompare(task1, task2)
        expect(result).toBe(-1) 
    })

    it('compare task with null', () => {
        const task1 = { slotExpr: 'this_month', order: null }
        const task2 = { slotExpr: 'this_month', order: 2    }
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

    it('debug', () => {
        vi.setSystemTime(new Date('2024-2-9')) // vendredi
        const tasks = [{ id:0, slotExpr: 'this_week vendredi aprem',                       order: 40 }, // 5
                       { id:1, slotExpr: 'vendredi aprem',                                 order: 50 }, // 6
                       { id:2, slotExpr: 'vendredi aprem',                                 order: 10 }, // 1
                       { id:3, slotExpr: 'chaque jeudi aprem vendredi aprem',              order: 35 }, // 4
                       { id:4, slotExpr: 'vendredi',                                       order: 36 }, // 8
                       { id:5, slotExpr: 'chaque lundi aprem chaque vendredi aprem',       order: 20 }, // 2
                       { id:6, slotExpr: 'disable chaque mercredi aprem vendredi aprem',   order: 55 }, // 7
                       { id:7, slotExpr: 'chaque vendredi aprem',                          order: 30 }] // 3
        
        expect(taskCompare(tasks[0], tasks[1])).toEqual(-1)
        expect(taskCompare(tasks[1], tasks[2])).toEqual(1)
        expect(taskCompare(tasks[2], tasks[3])).toEqual(-1)
        expect(taskCompare(tasks[3], tasks[4])).toEqual(-1)
        expect(taskCompare(tasks[4], tasks[5])).toEqual(1)
        expect(taskCompare(tasks[5], tasks[6])).toEqual(-1)
        expect(tasks.sort(taskCompare).map(task => task.id)).toEqual([2, 5, 7, 3, 0, 1, 6, 4])
    })
})

describe('taskFilter', () => {
    test('false', () => {
        const task = { slotExpr: 'mardi aprem' }
        const filter = 'mardi matin'
        const result = taskPredicateEqualAndInclude(task, filter)
        expect(result).toBeFalsy()
    });
    test('true', () => {
        const task = { slotExpr: 'mardi aprem' }
        const filter = 'mardi'
        const result = taskPredicateEqualAndInclude(task, filter)
        expect(result).toBeTruthy()
    });
    test('slotFilter keep', () => {
        const task = { slotExpr: 'mardi' }
        const filter = 'mardi'
        const result = taskPredicateEqualAndInclude(task, filter)
        expect(result).toBeTruthy()
    });

    test('slotFilter discard', () => {
        const task = { slotExpr: 'mardi' }
        const result = taskPredicateEqualAndInclude(task, 'mercredi')
        expect(result).toBeFalsy()
    });

    test('slotFilter level 3 keep', () => {
        const task = { slotExpr: 'mardi matin' }
        const result = taskPredicateEqualAndInclude(task, 'mardi matin')
        expect(result).toBeTruthy()
    });

    test('slotFilter level 3 discard', () => {
        const task = { slotExpr: 'mardi aprem' }
        const result = taskPredicateEqualAndInclude(task, 'mardi matin')
        expect(result).toBeFalsy()
    })

});

describe('taskFilterExact', () => {
    test('false', () => {
        const task = { slotExpr: 'this_week mardi aprem' }
        const result = taskPredicateEqual(task, 'this_week mardi')
        expect(result).toBeFalsy()
    })
    test('true', () => {
        const task = { slotExpr: 'this_week mardi' }
        const result = taskPredicateEqual(task, 'this_week mardi')
        expect(result).toBeTruthy()
    })
})

describe('taskFilterPredicate Repeat', () => {
    test('norepeat keep true', () => {
        const task = { slotExpr: 'mardi' }
        const result = taskPredicateNoRepeat(task)
        expect(result).toBeTruthy()
    });
    test('repeat discard false', () => {
        const task = { slotExpr: 'chaque mardi' }
        const result = taskPredicateNoRepeat(task)
        expect(result).toBeFalsy()
    });
    test('repeat at sub level', () => {
        const task = { slotExpr: 'this_week chaque mardi aprem' }
        const result = taskPredicateNoRepeat(task)
        expect(result).toBeFalsy()
    });
    test('every2', () => {
        const task = { slotExpr: 'EVERY2 this_week mardi aprem' }
        const result = taskPredicateEvery2(task)
        expect(result).toBeTruthy()
    });
    test('bug', () => {
        const task = { slotExpr: 'lundi' }
        const result = taskPredicateEvery2(task)
        expect(result).toBeFalsy()
    });
    test('generic false', () => {
        const task = { slotExpr: 'week mardi aprem' }
        const result = taskPredicateEvery2(task)
        expect(result).toBeFalsy()
    });
    test('chaque', () => {
        const task = { slotExpr: 'chaque this_week mardi aprem' }
        const result = taskPredicateEvery1(task)
        expect(result).toBeTruthy()
    });
    test('every 1', () => {
        const task = { slotExpr: 'every 1 this_week mardi aprem' }
        const result = taskPredicateEvery1(task)
        expect(result).toBeTruthy()
    });
    test('every 2', () => {
        const task = { slotExpr: 'every 2 this_week mardi aprem' }
        const result = taskPredicateEvery1(task)
        expect(result).toBeTruthy()
    });
    test('generic', () => {
        const task = { slotExpr: 'week mardi aprem' }
        const result = taskPredicateEvery1(task)
        expect(result).toBeTruthy()
    });
    test('error', () => {
        const task = { slotExpr: 'lundi' }
        const result = taskPredicateError(task)
        expect(result).toBeFalsy()
    });
    test('error', () => {
        const task = { slotExpr: 'every 1 ' }
        const result = taskPredicateError(task)
        expect(result).toBeTruthy()
    });
})


describe('filterSlotExpr', () => {
    it('level1 match level1 level2', () => {
        const tasks = [ { slotExpr: 'this_week mercredi' } ];
        const result = filterSlotExpr(tasks, 'this_week');
        expect(result).toEqual(tasks)
    })

    it('level1 don\'t match level1 level2', () => {
        const tasks = [ { slotExpr: 'this_week mercredi' } ];
        const result = filterSlotExpr(tasks, {expression: 'next_week'});
        expect(result).toEqual([])
    })

    it('level1 level2 match level1 level2', () => {
        const tasks = [ { slotExpr: 'this_week mercredi' } ];
        const result = filterSlotExpr(tasks, 'this_week mercredi');
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
    test('error', () => {
        const tasks = [ { slotExpr: 'this_week vendredi' } ];
        const result = filterSlotExpr(tasks, 'mardi mercredi');
        expect(result).toEqual(tasks);
    })
})

describe('findTaskBySlotExpr', () => {
    it('feuille', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'this_month this_week mardi'
        }, {
            id: 'task3',
            slotExpr: 'this_month this_week jeudi'
        }];
        const slot = { id: 'slot1', path: 'this_month this_week mardi' };
        const result = findTaskBySlotExpr(tasks, slot);
        const expected = [ {
            id: 'task1',
            slotExpr: 'this_month this_week mardi'
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
            slotExpr: 'this_month this_week mardi'
        }, {
            id: 'task3',
            slotExpr: 'this_month this_week jeudi'
        }];
        const slot = { id: 'slot1', path: 'this_month this_week mardi',
            inner: [ { id: 'slot2', path: 'this_month this_week mardi aprem',
                inner: []
            }]
        };
        const result = findTaskBySlotExpr(tasks, slot);
        const expected = [ {
            id: 'task1',
            slotExpr: 'this_month this_week mardi'
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
            slotExpr: 'this_week'
        }, {
            id: 'task2',
            slotExpr: 'next_week'
        }];
        const slot = { id: 'slot1', path: 'this_month this_week' };
        const expected = [ {
            id: 'task1',
            slotExpr: 'this_week'
        }];
        const result = findTaskBySlotExpr(tasks, slot);
        expect(result).toEqual(expected);
    });

    it('test findTaskBySlotExpr exact max', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'this_week'
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
            slotExpr: 'mercredi'
        }];
        const slot = { id: 'mardi', path: 'mardi' };
        const result = findTaskBySlotExpr(tasks, slot);
        expect(result).toEqual([]);
    });

    it('endWith not on final', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'this_week mardi'
        },{
            id: 'task2',
            slotExpr: 'this_week vendredi'
        }];
        const slot = { id: 'slot1', path: 'this_month this_week mardi' };
        const expected = [{
            id: 'task1',
            slotExpr: 'this_week mardi'
        }];
        const result = findTaskBySlotExpr(tasks, slot);
        expect(result).toEqual(expected);
    })

    it('endWith on final', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'this_week'
        },{
            id: 'task2',
            slotExpr: 'this_week vendredi'
        }];
        const slot = { id: 'slot1', path: 'this_month this_week vendredi' };
        const expected = [{
            id: 'task2',
            slotExpr: 'this_week vendredi'
        }];
        const result = findTaskBySlotExpr(tasks, slot);
        expect(result).toEqual(expected);
    })
})

describe('groupTask', () => {
    test('taskGroup level 1', () => {
        const task1 = { id: 'task1', slotExpr: 'this_week mardi matin' }
        const task2 = { id: 'task2', slotExpr: 'this_week mardi aprem' }
        const task3 = { id: 'task3', slotExpr: 'next_week mardi aprem' }
        const tasks = [ task1, task2, task3 ]
        const result = taskGroup(tasks, 2)
        expect(result).toEqual({'this_month this_week': [task1, task2] ,
                                'this_month next_week': [task3] })
    })
    
    test('taskGroup level2', () => {
        const task1 = { slotExpr: 'this_week mardi matin'  }
        const task2 = { slotExpr: 'this_week mardi aprem'  }
        const task3 = { slotExpr: 'this_week mercredi aprem'  }
        const tasks = [ task1, task2, task3 ]
        const result = taskGroup(tasks, 3)
        expect(result).toEqual({'this_month this_week mardi':    [task1, task2],
                                'this_month this_week mercredi': [task3] })
    })
    
    test('taskGroup level 3', () => {
        const task1 = { slotExpr: 'this_week mardi matin' }
        const task2 = { slotExpr: 'this_week mardi aprem' }
        const task3 = { slotExpr: 'this_week mercredi aprem'  }
        const tasks = [ task1, task2, task3 ]
        const result = taskGroup(tasks,4)
        expect(result).toEqual({'this_month this_week mardi matin': [task1],
                                'this_month this_week mardi aprem': [task2],
                                'this_month this_week mercredi aprem': [task3]})
    })    

    test('taskGroup with shift', () => {
        const task1 = { slotExpr: 'this_week' }
        const task2 = { slotExpr: 'next_week' }
        const task3 = { slotExpr: 'this_week + 1'  }
        const tasks = [ task1, task2, task3 ]
        const result = taskGroup(tasks, 2)
        expect(result).toEqual({'this_month next_week':     [task2, task3],
                                'this_month this_week':     [task1]})
    })
});

describe('grouping', () => {
    test('multi', () => {
        const parser = new Parser()
        const given1 = 'chaque lundi aprem chaque jeudi mercredi matin';
        const result1 = parser.parse(given1)
        const result2 = branchTruncate(result1, 4)
        const result3 = branchComplete(result2)
        const result4 = getBranchHash(result3)
        
        expect(result4).toEqual('this_month this_week lundi aprem')
    });
    
    
    test('branch', () => {
        const parser = new Parser()
        const given1 = 'chaque lundi aprem';
        const result1 = parser.parse(given1)
        const result2 = branchComplete(result1)
        const result3 = branchTruncate(result2, 2)
        const result4 = getBranchHash(result3)
        
        expect(result4).toEqual('this_month this_week')
    });

    test('shift', () => {
        const parser = new Parser()
        const given1 = 'this_week + 1';
        const result1 = parser.parse(given1)
        const result2 = branchComplete(result1)
        const result3 = branchTruncate(result2, 2)
        const result4 = getBranchHash(result3)        
        expect(result4).toEqual('this_month next_week')
    });

    test('shift month', () => {
        const parser = new Parser()
        const given1 = 'this_month + 1';
        const result1 = parser.parse(given1)
        const result2 = branchComplete(result1)
        const result3 = branchTruncate(result2, 2)
        const result4 = getBranchHash(result3)        
        expect(result4).toEqual('this_month + 1')
    })
});

describe('taskShiftFilter', () => {
    test('shift list with filtering', () => {
        const given    = [ { slotExpr: 'next_week' }, { slotExpr: 'lundi' }, { slotExpr: 'next_month'}, { slotExpr: 'this_month + 1'} ] 
        const expected = [ { slotExpr: 'this_week', oldSlotExpr: 'next_week' } ] ;
        const result = taskShiftFilter(given, 'this_week')
        expect(result).toEqual(expected)
    });

    test('expression with space', () => {
        const given    = [ { slotExpr: 'this_week ' } ] 
        const expected = [  ] ;
        const result = taskShiftFilter(given, 'this_week')
        expect(result).toEqual(expected)
    })
});