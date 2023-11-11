import { filterNoSlot, findTaskWithSlot, findTaskBySlotExpr, slotMatchExpr, filterSlotExpr, setSlotPath } from './domainDataUtil';

describe('filterNoSlot', () => {
    it('test filterNoSlot one slot', () => {
        const tasks = [ {
            id: 'task1'
        }, {
            id: 'task2'
        }];
        const association = {
            'task1': 'slot1'
        };
        const result = filterNoSlot(tasks, association);
        expect(result.length).toEqual(1);
    });
    
    it('test filterNoSlot no slot', () => {
        const tasks = [ {
            id: 'task1'
        }, {
            id: 'task2'
        }];
        const association = {};
        
        const result = filterNoSlot(tasks, association);
        
        expect(result.length).toEqual(2);
    });
    
    it('test filterNoSlot all slot', () => {
        const tasks = [ {
            id: 'task1'
        }, {
            id: 'task2'
        }];
        const association = {
            'task1': 'slot1',
            'task2': 'slot1',
        };
        
        const result = filterNoSlot(tasks, association);
        
        expect(result.length).toEqual(0);
    });
})

describe('findTaskWithSlot', () => {
    it('test findTaskWithSlot', () => {
        const slots = [ {
            id: 'slot1'
        }, {
            id: 'slot2'
        }];
        const tasks = [ {
            id: 'task1'
        }, {
            id: 'task2'
        }];
        const association = {
            'task1': 'slot1'
        };
        const slotId = 'slot1';
        const result = findTaskWithSlot(tasks, slotId, association);
        expect(result.length).toEqual(1);
    });
    
    it('test findTaskWithSlot no found', () => {
        const slots = [ {
            id: 'slot1'
        }, {
            id: 'slot2'
        }];
        const tasks = [ {
            id: 'task1'
        }, {
            id: 'task2'
        }];
        const association = {
            'task1': 'slot1'
        };
        const slotId = 'slot2';
        const result = findTaskWithSlot(tasks, slotId, association);
        expect(result.length).toEqual(0);
    });
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
            slotExpr: 'this_month week mardi aprem'
        }, {
            id: 'task3',
            slotExpr: 'this_month week jeudi'
        }];
        const slot = { id: 'slot1', path: 'this_month week mardi' };
        const result = findTaskBySlotExpr(tasks, slot);
        const expected = [ {
            id: 'task2',
            slotExpr: 'this_month week mardi aprem'
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
        const slot = { id: 'slot1', path: 'this_month week mardi' }
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
        const slots = [ {
            id: 'slot1'
        }, {
            id: 'slot2'
        }];
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

describe('slotMatchExpr', () => {
    it('test slotMatchExpr match', () => {
        const result = slotMatchExpr('slot1', 'slot1'); 
        expect(result).toEqual(true);
    });

    it('test slotMatchExpr not match', () => {
        const result = slotMatchExpr('slot1', 'slot2'); 
        expect(result).toEqual(false);
    });

    it('test slotMatchExpr empty expr', () => {
        const result = slotMatchExpr('slot1', ''); 
        expect(result).toEqual(false);
    });
})

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
        const result = filterSlotExpr(tasks, 'week');
        expect(result).toEqual(tasks)
    })

    it('uncomplete level2 match level1 level2', () => {
        const tasks = [ { slotExpr: 'week vendredi' } ];
        const result = filterSlotExpr(tasks, 'vendredi');
        expect(result).toEqual(tasks)
    })
})

describe('setSlotPath', () => {
    it('final node', () => {
        const given = {
            id: 'id',
            title: 'slot',
            inner: []
        };
        const expected = {
            id: 'id',
            title: 'slot',
            inner: [],
            path: 'parent id'
        };
        const result = setSlotPath(given, 'parent')
        expect(result).toEqual(expected);
    })

    it('tree', () => {
        const given = {
            id: 'id1',
            title: 'slot1',
            inner: [ {
                id: 'id2',
                title: 'slot2',
                inner: [{
                    id: 'id3',
                    title: 'slot3',
                    inner: []
                }]
            },{
                id: 'id4',
                title: 'slot4',
                inner: []
            }]
        };
        const expected = {
            id: 'id1',
            title: 'slot1',
            path: 'id1',
            inner: [ {
                id: 'id2',
                title: 'slot2',
                path: 'id1 id2',
                inner: [{
                    id: 'id3',
                    title: 'slot3',
                    path: 'id1 id2 id3',
                    inner: []
                }]
            },{
                id: 'id4',
                title: 'slot4',
                path: 'id1 id4',
                inner: []
            }]
        };
        const result = setSlotPath(given, '')
        expect(result).toEqual(expected);
    })

})
