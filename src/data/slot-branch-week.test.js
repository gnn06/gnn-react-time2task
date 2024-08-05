import { getSlotIdLevel, getSlotIdPrevious, isSlotIdGeneric } from "./slot-id";
import { getBranchWeight, isBranchEqualShallow } from './slot-branch';
import { isBranchEqualDeep, isBranchEqualOrInclude, branchCompare, branchShift } from "./slot-branch++";
import { filterSlotExpr, findTaskBySlotExpr, taskGroup } from "./task";
import { Parser } from "./parser";
import { vi } from "vitest";
    
vi.useFakeTimers()
vi.setSystemTime(new Date('2023-12-20')) // mercredi

describe('path', () => {
    describe('getSlotLevel', () => {
        test('month', () => {
            expect(getSlotIdLevel('month')).toEqual(1)
        })
        test('week', () => {
            expect(getSlotIdLevel('week')).toEqual(2)
        });
        test('day', () => {
            expect(getSlotIdLevel('day')).toEqual(3)
        })
    });
    
    test('getSlotPrevious', () => {
        expect(getSlotIdPrevious('week', undefined)).toEqual('week')
    });
    
    describe('isGeneric', () => {
        test('week', () => {
            expect(isSlotIdGeneric('week')).toBeTruthy()
        });
        test('month', () => {
            expect(isSlotIdGeneric('month')).toBeTruthy()
        })
        test('day', () => {
            expect(isSlotIdGeneric('day')).toBeTruthy()
        })
    });
});

test('isRepetition', () => {
    
});

describe('branch', () => {
    test('weigth', () => {
        const result = getBranchWeight({ branch: 'branch', value: [ 'week' ] })
        expect(result).toEqual(1)
    });
    test('month', () => {
        const result = getBranchWeight({ branch: 'branch', value: [ 'month' ] })
        expect(result).toEqual(1)
    })

    describe('isBranchEqual', () => {
        test('no generic equals', () => {
            const result = isBranchEqualShallow({ branch: 'branch', value: [ 'this_week' ] }, { branch: 'branch', value: [ 'this_week' ] })
            expect(result).toBeTruthy()
        });
        test('no generic different', () => {
            const result = isBranchEqualShallow({ branch: 'branch', value: [ 'this_week' ] }, { branch: 'branch', value: [ 'next_week' ] })
            expect(result).toBeFalsy()
        });
        test('no generic equals with shift', () => {
            const result = isBranchEqualShallow({ branch: 'branch', value: [ 'this_week' ], shift: 1 }, { branch: 'branch', value: [ 'next_week' ] })
            expect(result).toBeTruthy()
        });
        test('generic next_week', () => {
            const result = isBranchEqualShallow({ branch: 'branch', value: [ 'week' ] }, { branch: 'branch', value: [ 'next_week' ] })
            expect(result).toBeTruthy()
        });
        test('generic this_week', () => {
            const result = isBranchEqualShallow({ branch: 'branch', value: [ 'week' ] }, { branch: 'branch', value: [ 'this_week' ] })
            expect(result).toBeTruthy()
        });
        test('month', () => {
            const result = isBranchEqualShallow({ branch: 'branch', value: [ 'month' ] }, { branch: 'branch', value: [ 'this_month' ] })
            expect(result).toBeTruthy()
        });
        test('depth = 1, equal', () => {
            const result = isBranchEqualDeep(
                { branch: 'branch', value: [ 'this_month' ] },
                { branch: 'branch', value: [ 'this_month' ] })
            expect(result).toBeTruthy()
        });
        test('depth = 1, different', () => {
            const result = isBranchEqualDeep(
                { branch: 'branch', value: [ 'this_month' ] },
                { branch: 'branch', value: [ 'next_month' ] })
            expect(result).toBeFalsy()
        });
        test('first level equal', () => {
            const result = isBranchEqualDeep(
                { branch: 'branch', value: [ 'this_month', 'next_week' ] },
                { branch: 'branch', value: [ 'this_month', 'follwoing_week' ] })
            expect(result).toBeFalsy()
        });
        test('first level equal, second level equal', () => {
            const result = isBranchEqualDeep(
                { branch: 'branch', value: [ 'this_month', 'next_week' ] },
                { branch: 'branch', value: [ 'this_month', 'next_week' ] })
            expect(result).toBeTruthy()
        });
        test('first level equal, tails haven\'t same depth, first deeper', () => {
            const result = isBranchEqualDeep(
                { branch: 'branch', value: [ 'this_month', 'next_week', 'lundi' ] },
                { branch: 'branch', value: [ 'this_month', 'next_week' ] })
            expect(result).toBeFalsy()
        });
        test('first level equal, tails haven\'t same depth, second deeper', () => {
            const result = isBranchEqualDeep(
                { branch: 'branch', value: [ 'this_month', 'next_week', 'lundi' ] },
                { branch: 'branch', value: [ 'this_month', 'next_week' ] })
            expect(result).toBeFalsy()
        })
        test('same depth = 3, first level equal, second differs', () => {
            const result = isBranchEqualDeep(
                { branch: 'branch', value: [ 'this_month', 'next_week', 'lundi' ] },
                { branch: 'branch', value: [ 'this_month', 'this_week', 'lundi' ] })
            expect(result).toBeFalsy()
        })

        test('same depth = 3, first level differs', () => {
            const result = isBranchEqualDeep(
                { branch: 'branch', value: [ 'this_month', 'next_week', 'lundi' ] },
                { branch: 'branch', value: [ 'next_month', 'this_week', 'lundi' ] })
            expect(result).toBeFalsy()
        })
        test('with flag', () => {
            const result = isBranchEqualDeep(
                { type: 'branch', value: [ 'this_month', 'this_week', {type: 'branch', value: ['lundi'], flags: ['chaque'] } ] },
                { type: 'branch', value: [ 'this_month', 'this_week', 'lundi']});
            expect(result).toBeTruthy()
        })
        test('multi', () => {
            const result = isBranchEqualDeep(
                { type: 'multi', value: [ { type: 'branch', value: [ 'mardi' ]},
                                          { type: 'branch', value: [ 'jeudi' ]} ] },
                { type: 'branch', value: [ 'jeudi' ]});
            expect(result).toBeTruthy()
        })
        test('undefined', () => {
            const result = isBranchEqualDeep(
                undefined,
                { type: 'branch', value: [ 'jeudi' ]});
            expect(result).toBeFalsy()
        })
    })
});

describe('branch++', () => {
    describe('isInOther', () => {
        test('week on this_week', () => {
            const result = isBranchEqualOrInclude(
                { type: 'branch', value: [ 'week'] },
                { type: 'branch', value: [ 'this_week']});
            expect(result).toBeTruthy()
        });
    
        test('week in next_week', () => {
            const result = isBranchEqualOrInclude(
                { type: 'branch', value: [ 'week'] },
                { type: 'branch', value: [ 'next_week']});
            expect(result).toBeTruthy()
        });

        test('month', () => {
            const result = isBranchEqualOrInclude(
                { type: 'branch', value: [ 'month'] },
                { type: 'branch', value: [ 'this_month']});
            expect(result).toBeTruthy()
        });

        test('day', () => {
            const result = isBranchEqualOrInclude(
                { type: 'branch', value: [ 'day'] },
                { type: 'branch', value: [ 'lundi']});
            expect(result).toBeTruthy()
        });

        test('multi match', () => {
            const result = isBranchEqualOrInclude(
                { type: 'multi', value: [ 'week', 
                    {type: 'branch', value: [ 'mardi'] },
                    {type: 'branch', value: [ 'jeudi'] }
                ] },
                { type: 'branch', value: [ 'mardi']});
            expect(result).toBeTruthy()
        });
    });

    describe('sort', () => {
        test('nominal', () => {
            const result = branchCompare(
                {type: 'branch', value: [ 'week' ] }, 
                {type: 'branch', value: [ 'this_week' ] })
            expect(result).toEqual(-1)
        });

        test('should', () => {
            const result = branchCompare(
                {type: 'branch', value: [ 'this_month', 'week'] },
                {type: 'branch', value: [ 'this_month', 'this_week'] })
            expect(result).toEqual(-1)
        });
    });
})

describe('parse', () => {
    const parser = new Parser();
    test('week', () => {
        const result = parser.parse('week lundi')
        expect(result).toEqual({ type: 'branch', value: [ 'week', 'lundi' ] })
    });
    test('month', () => {
        const result = parser.parse('month this_week')
        expect(result).toEqual({ type: 'branch', value: [ 'month', 'this_week' ] })
    });
    test('day', () => {
        const result = parser.parse('day matin')
        expect(result).toEqual({ type: 'branch', value: [ 'day', 'matin' ] })
    })
});

describe('filtreing task', () => {
    test('nominal', () => {
        const tasks = [{ slotExpr: 'week' }]
        const result = filterSlotExpr(tasks, 'next_week')
        expect(result).toEqual(tasks)
    });
    test('filter week should match week', () => {
        const tasks = [{ slotExpr: 'week' }]
        const result = filterSlotExpr(tasks, 'week')
        expect(result).toEqual(tasks)
    });
    test('filter week with multi hould match week', () => {
        const tasks = [{ slotExpr: 'week mardi jeudi' }]
        const result = filterSlotExpr(tasks, 'mardi')
        expect(result).toEqual(tasks)
    });
})

test('complete', () => {

});

describe('shift', () => {
    test('getSlotPrevious on week => identity', () => {
        const result = getSlotIdPrevious('week', undefined)
        expect(result).toEqual('week')
    });
    test('week with level week', () => {
        const branch = {type: 'branch', value: [ 'week' ] }
        const result = branchShift(branch, 'week')
        expect(result).toEqual(branch)
    });
    test('week with level month', () => {
        const branch = {type: 'branch', value: [ 'week' ] }
        const result = branchShift(branch, 'month')
        expect(result).toEqual(branch)
    })    
});

describe('grouping', () => {
    test('taskGroup level 1', () => {
        const task1 = { id: 'task1', slotExpr: 'week' }
        const task2 = { id: 'task2', slotExpr: 'this_week' }
        const task3 = { id: 'task3', slotExpr: 'next_week' }
        const tasks = [ task1, task2, task3 ]
        const result = taskGroup(tasks, 2)
        expect(result).toEqual({'this_month this_week': [task1, task2] ,
                                'this_month next_week': [task3] })
    })
});

describe('slot view', () => {    
    const tasks = [ {id:'1', slotExpr:'week'}, {id:'2', slotExpr:'week lundi'} ]

    test('week on this_week view final', () => {
       const result = findTaskBySlotExpr(tasks, { path: 'this_month this_week'})
       expect(result.map(el => el.id)).toEqual(['1', '2'])
    });
    
    test('week with next_week view final', () => {
       const result = findTaskBySlotExpr(tasks, { path: 'this_month next_week'})
       expect(result.map(el => el.id)).toEqual(['1', '2'])
    })

    test('task match view not final', () => {
        const result = findTaskBySlotExpr(tasks, { path: 'this_month this_week', inner: [ { path: 'this_month this_week lundi'}]})
        expect(result.map(el => el.id)).toEqual(['1'])
     })
    test('task match view final', () => {
        const result = findTaskBySlotExpr(tasks, { path: 'this_month this_week lundi'})
        expect(result.map(el => el.id)).toEqual(['2'])
     })
});