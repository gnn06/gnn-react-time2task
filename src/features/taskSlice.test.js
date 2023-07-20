import reducer, { selectTask } from './taskSlice';

test('should select task', () => {
    const result = reducer({ selectedTaskId: [] }, selectTask('task1'));
    expect(result.selectedTaskId).toContain('task1')
});

test('should unselect task', () => {
    const result = reducer({ selectedTaskId: [ 'task1' ] }, selectTask('task1'));
    expect(result.selectedTaskId).not.toContain('task1')
});
