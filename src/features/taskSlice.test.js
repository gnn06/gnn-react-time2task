import reducer, { selectTask, setFilterConf } from './taskSlice';

describe('setFilterConf', () => {
    const initial = { currentFilter: { expression: 'old', isMulti: true, taskId: 7, slots: ['today'], genericFilters: { status: ['todo'] } } };

    test('remplace expression, slots et genericFilters', () => {
        const pred = () => true;
        const result = reducer(initial, setFilterConf({ expression: 'lundi', slots: ['this_week lundi'], genericFilters: { isRepeat: pred } }));
        expect(result.currentFilter.expression).toBe('lundi');
        expect(result.currentFilter.slots).toEqual(['this_week lundi']);
        expect(result.currentFilter.genericFilters).toEqual({ isRepeat: pred });
    });

    test('ne touche pas aux autres champs de currentFilter', () => {
        const result = reducer(initial, setFilterConf({ expression: '', slots: [], genericFilters: {} }));
        expect(result.currentFilter.isMulti).toBe(true);
        expect(result.currentFilter.taskId).toBe(7);
    });
});

test('should select task', () => {
    const result = reducer({ selectedTaskId: [] }, selectTask('task1'));
    expect(result.selectedTaskId).toContain('task1')
});

test('should unselect task', () => {
    const result = reducer({ selectedTaskId: [ 'task1' ] }, selectTask('task1'));
    expect(result.selectedTaskId).not.toContain('task1')
});
