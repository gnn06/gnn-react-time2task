import { describe, it, expect } from 'vitest';
import { filterTasks, makeGenericFilter } from './generic-filter.ts';
import { taskPredicateMulti } from './task.js';

describe('filterTasks', () => {
  const sampleTasks = [
    { id: 1, title: 'Task 1', slotExpr: 'lundi', status: 'todo',   favorite:true  },
    { id: 2, title: 'Task 2', slotExpr: 'mardi jeudi', status: 'done',   favorite:false },
    { id: 3, title: 'Task 3', slotExpr: 'mercredi', status: 'todo', favorite:false },
    { id: 4, title: 'Task 4', slotExpr: 'jeudi', status: 'fait',    favorite:false },
    { id: 5, title: 'Task 5', slotExpr: 'vendredi', status: 'todo', favorite:false }
  ];

  it('should return all tasks when no filters are provided', () => {
    const filters = {};
    const result = filterTasks(sampleTasks, filters);
    expect(result).toHaveLength(5);
    expect(result).toEqual(sampleTasks);
  });

  it('should filter tasks by status todo', () => {
    const filters = { status: ['todo'] };
    const result = filterTasks(sampleTasks, filters);
    expect(result).toEqual([sampleTasks[0], sampleTasks[2], sampleTasks[4]]);
  });

  it('should filter tasks by multiple string values', () => {
    const filters = { status: ['todo', 'done'] };
    const result = filterTasks(sampleTasks, filters);
    expect(result).toHaveLength(4);
    expect(result).toEqual([sampleTasks[0], sampleTasks[1], sampleTasks[2], sampleTasks[4]]);
  });

  it('should filter tasks by boolean property', () => {
    const filters = { favorite: [true] };
    const result = filterTasks(sampleTasks, filters);
    expect(result).toEqual([sampleTasks[0]]);
  });

  it('should filter tasks by multiple properties (AND logic)', () => {
    const filters = { 
      status: ['todo'], 
      favorite: [true]
    };
    const result = filterTasks(sampleTasks, filters);
    expect(result).toEqual([sampleTasks[0]]);
  });

  it('should return empty array when no task matches filters', () => {
    const filters = { status: ['cancelled'] };
    const result = filterTasks(sampleTasks, filters);
    expect(result).toHaveLength(0);
  });

  it('should ignore filters with empty arrays', () => {
    const filters = { status: ['todo'], favorite: [] };
    const result = filterTasks(sampleTasks, filters);
    expect(result).toEqual([sampleTasks[0], sampleTasks[2], sampleTasks[4]]);
  });

  it('should filter tasks by slotExpr predicates', () => {
    const filters = { isMulti: taskPredicateMulti };
    const result = filterTasks(sampleTasks, filters);
    expect(result).toEqual([sampleTasks[1]]);
  });
});

;
