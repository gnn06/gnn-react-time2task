import reducer, { selectTask } from './taskSlice';

test('should select task', () => {
    const result = reducer({ selectedTask: [] }, selectTask('task1'));
    expect(result.selectedTask).toContain('task1')
});

test('should unselect task', () => {
    const result = reducer({ selectedTask: [ 'task1' ] }, selectTask('task1'));
    expect(result.selectedTask).not.toContain('task1')
});
