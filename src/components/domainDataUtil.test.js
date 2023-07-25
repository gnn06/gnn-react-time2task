import { filterNoSlot, findTaskWithSlot, findTaskBySlotExpr, slotMatchExpr } from './domainDataUtil';

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