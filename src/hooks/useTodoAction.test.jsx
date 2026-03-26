import { renderHook, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';

import { useTodoAction } from './useTodoAction';
import tasksReducer from '../features/taskSlice';

// Mock des dépendances
vi.mock('../features/apiSlice', () => ({
  useGetTasksQuery: vi.fn(),
  useUpdateTaskMutation: vi.fn(),
}));

vi.mock('../data/task', () => ({
  filterSlotExpr: vi.fn(),
}));

import { useGetTasksQuery, useUpdateTaskMutation } from '../features/apiSlice';
import { filterSlotExpr } from '../data/task';

// Mock du store Redux
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
    },
    preloadedState: {
      tasks: {
        user: { id: 'user123' },
        currentActivity: 'activity1',
        currentFilter: 'this_week',
        ...initialState.tasks,
      },
    },
  });
};

// Wrapper pour les tests
const wrapper = ({ children, initialState = {} }) => (
  <Provider store={createMockStore(initialState)}>
    {children}
  </Provider>
);

describe('useTodoAction', () => {
  const mockUpdateTask = vi.fn();
  const mockTasksData = [
    { id: '1', status: 'En cours', slotExpr: 'this_week lundi' },
    { id: '2', status: 'A faire', slotExpr: 'this_week mardi' },
    { id: '3', status: 'En cours', slotExpr: 'this_week mercredi' },
    { id: '4', status: 'terminé', slotExpr: 'this_week jeudi' },
    { id: '4', status: 'fait-à repositionner', slotExpr: 'this_week vendredi' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuration par défaut des mocks
    useGetTasksQuery.mockReturnValue({
      data: mockTasksData,
      isLoading: false,
      error: null,
    });

    useUpdateTaskMutation.mockReturnValue([
      mockUpdateTask,
      { error: null },
    ]);

    filterSlotExpr.mockImplementation((tasks, filter) => tasks);
  });

  test('should return initial state correctly', () => {
    const { result } = renderHook(() => useTodoAction(), { wrapper });

    expect(result.current).toEqual({
      tasks: expect.any(Array),
      show: false,
      updateError: null,
      hideErrorDialog: false,
      onTodo: expect.any(Function),
      handleTodoCancel: expect.any(Function),
      handleTodoConfirm: expect.any(Function),
      handleErrorDialogConfirm: expect.any(Function),
    });
  });

  test('should filter tasks correctly', () => {
    filterSlotExpr.mockReturnValue([
      { id: '1', status: 'En cours' },
      { id: '3', status: 'En cours' },
    ]);

    const { result } = renderHook(() => useTodoAction(), { wrapper });

    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.tasks.map(t => t.id)).toEqual(['1', '3']);
  });

  test('should exclude tasks with "A faire", "terminé", "fait-à repostionner" status', () => {
    const { result } = renderHook(() => useTodoAction(), { wrapper });

    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.tasks.every(t => t.status !== 'A faire')).toBe(true);
    expect(result.current.tasks.every(t => t.status !== 'terminé')).toBe(true);
  });

  test('should handle onTodo correctly', async () => {
    const { result } = renderHook(() => useTodoAction(), { wrapper });

    // Appel de onTodo dans act
    await act(async () => {
      result.current.onTodo();
    });

    // Vérification après l'appel
    expect(result.current.show).toBe(true);
  });

  test('should handle handleTodoCancel correctly', async () => {
    const { result } = renderHook(() => useTodoAction(), { wrapper });

    // D'abord ouvrir le dialogue
    await act(async () => {
      result.current.onTodo();
    });
    expect(result.current.show).toBe(true);

    // Puis l'annuler
    await act(async () => {
      result.current.handleTodoCancel();
    });

    expect(mockUpdateTask).not.toHaveBeenCalled();
    expect(result.current.show).toBe(false);
  });

  test('should handle handleTodoConfirm correctly', async () => {
    const { result } = renderHook(() => useTodoAction(), { wrapper });

    // Ouvrir le dialogue
    result.current.onTodo();

    // Confirmer
    result.current.handleTodoConfirm();

    expect(result.current.show).toBe(false);
    expect(result.current.hideErrorDialog).toBe(false);
    expect(mockUpdateTask).toHaveBeenCalledTimes(2);
    expect(mockUpdateTask).toHaveBeenCalledWith({ id: '1', status: 'A faire' });
    expect(mockUpdateTask).toHaveBeenCalledWith({ id: '3', status: 'A faire' });
  });

  test('should handle handleErrorDialogConfirm correctly', async () => {
    const { result } = renderHook(() => useTodoAction(), { wrapper });

    await act(() => {result.current.handleErrorDialogConfirm()});

    expect(result.current.hideErrorDialog).toBe(true);
  });

  test('should handle update error correctly', () => {
    const mockError = { data: { message: 'Update failed' } };
    useUpdateTaskMutation.mockReturnValue([
      mockUpdateTask,
      { error: mockError },
    ]);

    const { result } = renderHook(() => useTodoAction(), { wrapper });

    expect(result.current.updateError).toEqual(mockError);
  });

  test('should make GET request RTK with arguments from store', () => {
    const customState = {
      tasks: {
        user: { id: 'customUser' },
        currentActivity: 'customActivity',
        currentFilter: 'customFilter',
      },
    };

    const customWrapper = ({ children }) => (
      <Provider store={createMockStore(customState)}>
        {children}
      </Provider>
    );

    renderHook(() => useTodoAction(), { wrapper: customWrapper });

    expect(useGetTasksQuery).toHaveBeenCalledWith({
      userId: 'customUser',
      activity: 'customActivity',
    });
  });

  test('should handle empty tasks data', () => {
    useGetTasksQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTodoAction(), { wrapper });

    expect(result.current.tasks).toHaveLength(0);
  });

  test('should call filterSlotExpr with correct parameters', () => {
    renderHook(() => useTodoAction(), { wrapper });

    expect(filterSlotExpr).toHaveBeenCalledWith(mockTasksData, 'this_week');
  });

});
