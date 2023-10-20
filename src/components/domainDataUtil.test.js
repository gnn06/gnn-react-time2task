import { filterNoSlot, findTaskWithSlot, findTaskBySlotExpr, slotMatchExpr, slotIsInOther, firstSlot, lowerSlot, filterSlotExpr, completeSlot } from './domainDataUtil';

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
            slotExpr: 'slot1'
        }, {
            id: 'task2',
            slotExpr: ''
        }];
        const expected = [ {
            id: 'task1',
            slotExpr: 'slot1'
        }];
        const result = findTaskBySlotExpr(tasks, 'slot1');
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
        const result = findTaskBySlotExpr(tasks, 'week');
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
        const result = findTaskBySlotExpr(tasks, 'next_week');
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
    it('completeSlot no_level1 level2', () => {
        const result = completeSlot('vendredi');
        expect(result).toEqual('week vendredi');

    })

    it('completeSlot level1 level2', () => {
        const result = completeSlot('week vendredi');
        expect(result).toEqual('week vendredi');

    })

    it('completeSlot level1 bis level2', () => {
        const result = completeSlot('next_week vendredi');
        expect(result).toEqual('next_week vendredi');

    })

    it('completeSlot level 1 no level2', () => {
        const result = completeSlot('week');
        expect(result).toEqual('week');

    })

    it('completeSlot unidefined', () => {
        const result = completeSlot(undefined);
        expect(result).toEqual(undefined);

    })
})