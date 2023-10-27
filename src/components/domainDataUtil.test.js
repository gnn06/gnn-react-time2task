import { filterNoSlot, findTaskWithSlot, findTaskBySlotExpr, slotMatchExpr, slotIsInOther, firstSlot, lowerSlot, filterSlotExpr, completeSlot, slotDepth, setSlotPath, slotEqual } from './domainDataUtil';

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
    it('test findTaskBySlotExpr empty slotExpr', () => {
        const tasks = [ {
            id: 'task1'
        }];
        const expected = [];
        const result = findTaskBySlotExpr(tasks, 'slot1');
        expect(result).toEqual(expected);
    });

    it('test findTaskBySlotExpr match', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'lundi'
        }, {
            id: 'task2',
            slotExpr: ''
        }];
        const expected = [ {
            id: 'task1',
            slotExpr: 'lundi'
        }];
        const result = findTaskBySlotExpr(tasks, 'this_month week lundi');
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
        const expected = [ {
            id: 'task1',
            slotExpr: 'week'
        }];
        const result = findTaskBySlotExpr(tasks, 'this_month week');
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
        const expected = [ {
            id: 'task2',
            slotExpr: 'next_week'
        }];
        const result = findTaskBySlotExpr(tasks, 'this_month next_week');
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
        const result = findTaskBySlotExpr(tasks, 'slot1');
        expect(result).toEqual([]);
    });

    it('endWith not on final', () => {
        const tasks = [ {
            id: 'task1',
            slotExpr: 'week'
        },{
            id: 'task2',
            slotExpr: 'week vendredi'
        }];
        const expected = [{
            id: 'task1',
            slotExpr: 'week'
        }];
        const result = findTaskBySlotExpr(tasks, 'this_month week');
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
        const expected = [{
            id: 'task2',
            slotExpr: 'week vendredi'
        }];
        const result = findTaskBySlotExpr(tasks, 'this_month week vendredi');
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

describe('slotIsInOther', () => {
    it('slotIsInOther true by first level', () => {
        const result = slotIsInOther('S32 mercredi matin','S32');
        expect(result).toBeTruthy();
    })

    it('slotIsInOther true by second level', () => {
        const result = slotIsInOther('S32 mercredi matin','S32 mercredi');
        expect(result).toBeTruthy();
    })

    it('slotIsInOther true by last level', () => {
        const result = slotIsInOther('S32 mercredi matin','S32 mercredi matin');
        expect(result).toBeTruthy();
    })

    it('slotIsInOther false by last level', () => {
        const result = slotIsInOther('S32 mercredi aprem','S32 mercredi matin');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther false by second level', () => {
        const result = slotIsInOther('S32 mercredi aprem','S32 lundi aprem');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther false by first level', () => {
        const result = slotIsInOther('S32 mercredi aprem','S33 mercredi aprem');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther true other less deeper', () => {
        const result = slotIsInOther('S32 mercredi aprem','S32 mercredi');
        expect(result).toBeTruthy()
    })

    it('slotIsInOther false other less deeper', () => {
        const result = slotIsInOther('S32 mercredi aprem','S32 lundi');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther true other has 1 level', () => {
        const result = slotIsInOther('S32 mercredi aprem','S32');
        expect(result).toBeTruthy()
    })

    it('slotIsInOther false other has 1 level', () => {
        const result = slotIsInOther('S32 mercredi aprem','S33');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther incomplet expr', () => {
        const result = slotIsInOther('S33','S33');
        expect(result).toBeTruthy()
    })

    it('slotIsInOther incomplet expr trop précis', () => {
        const result = slotIsInOther('S33','S33 mercredi');
        expect(result).toBeFalsy()
    })

    it('slotIsInOther incomplet expr false', () => {
        const result = slotIsInOther('S32 mercredi','S33');
        expect(result).toBeFalsy()
    })
})

describe('firstSlot', () => {
    it('firstSlot', () => {
        const result = firstSlot('S32 mercredi matin');
        expect(result).toEqual('S32')
    })

    it('firstSlot one level', () => {
        const result = firstSlot('matin');
        expect(result).toEqual('matin')
    })

    it('firstSlot empty', () => {
        const result = firstSlot('');
        expect(result).toEqual('')
    })
})

describe('lowerSlot', () => {
    it('lowerSlot', () => {
        expect(lowerSlot('S32 mercredi matin')).toEqual('mercredi matin')
    })

    it('lowerSlot no lower', () => {
        expect(lowerSlot('matin')).toEqual('')
    })

    it('lowerSlot empty', () => {
        expect(lowerSlot('')).toEqual('')
    })
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

describe('completeSlot', () => {
    it('completeSlot level1', () => {
        const result = completeSlot('week');
        expect(result).toEqual('this_month week');
    })

    it('completeSlot level2', () => {
        const result = completeSlot('vendredi');
        expect(result).toEqual('this_month week vendredi');

    })

    it('completeSlot level3', () => {
        const result = completeSlot('aprem');
        expect(result).toEqual('this_month week lundi aprem');
    })

    it('completeSlot level1 level2', () => {
        const result = completeSlot('week vendredi');
        expect(result).toEqual('this_month week vendredi');

    })

    it('completeSlot level1_bis level2', () => {
        const result = completeSlot('next_week vendredi');
        expect(result).toEqual('this_month next_week vendredi');
    })

    it('completeSlot unidefined', () => {
        const result = completeSlot(undefined);
        expect(result).toEqual(undefined);

    })
})

describe('slotDepth', () => {
    it('one level', () => {
        const result = slotDepth('week');
        expect(result).toEqual(1);
    })

    it('two levels', () => {
        const result = slotDepth('week lundi');
        expect(result).toEqual(2);
    })

    it('three levels', () => {
        const result = slotDepth('week lundi aprem');
        expect(result).toEqual(3);
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

describe('slotEqual', () => {
    it('equal one level', () => {
        const result = slotEqual('week', 'week');
        expect(result).toEqual(true);
    })
    it('not equal one level', () => {
        const result = slotEqual('week', 'next_week');
        expect(result).toEqual(false);
    })
    it('equal two level', () => {
        const result = slotEqual('week lundi', 'week lundi');
        expect(result).toEqual(true);
    })
    it('not equal tow level', () => {
        const result = slotEqual('week lundi', 'week mardi');
        expect(result).toEqual(false);
    })
    it('other empty', () => {
        const result = slotEqual('week lundi', 'week');
        expect(result).toEqual(false);
    })
    it('this empty', () => {
        const result = slotEqual('week', 'week lundi');
        expect(result).toEqual(false);
    })    
})