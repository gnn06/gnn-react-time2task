import { filterNoSlot, findWithSlot } from './domainDataUtil';

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

it('test findWithSlot', () => {
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
    const result = findWithSlot(tasks, slotId, association);
    expect(result.length).toEqual(1);
});

it('test findWithSlot no found', () => {
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
    const result = findWithSlot(tasks, slotId, association);
    expect(result.length).toEqual(0);
});