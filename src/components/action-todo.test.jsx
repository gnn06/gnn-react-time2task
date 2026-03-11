import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';

import TodoAction from './action-todo';
import tasksReducer from '../features/taskSlice';

// Mock du hook useTodoAction
vi.mock('../hooks/useTodoAction', () => ({
  useTodoAction: vi.fn(),
}));

import { useTodoAction } from '../hooks/useTodoAction';

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

describe('TodoAction Component', () => {
  const mockOnTodo = vi.fn();
  const mockHandleTodoCancel = vi.fn();
  const mockHandleTodoConfirm = vi.fn();
  const mockHandleErrorDialogConfirm = vi.fn();

  const mockHookReturn = {
    tasks: [
      { id: '1', status: 'En cours' },
      { id: '2', status: 'En cours' },
    ],
    show: false,
    updateError: null,
    hideErrorDialog: false,
    onTodo: mockOnTodo,
    handleTodoCancel: mockHandleTodoCancel,
    handleTodoConfirm: mockHandleTodoConfirm,
    handleErrorDialogConfirm: mockHandleErrorDialogConfirm,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useTodoAction.mockReturnValue(mockHookReturn);
  });

  test('should render Todo button, don\'t show confirm dialog, don\'t show error dialog, task count', () => {
    render(<TodoAction />, { wrapper });

    const todoButton = screen.getByText('Todo');
    expect(todoButton).toBeInTheDocument();

    const confirmDialog = screen.queryByTestId('confirm-dialog');
    expect(confirmDialog).not.toBeInTheDocument();

    const errorDialog = screen.queryByTestId('error-dialog');
    expect(errorDialog).not.toBeInTheDocument();

  });

  test('should show confirm dialog when show is true', () => {
    useTodoAction.mockReturnValue({
      ...mockHookReturn,
      show: true,
    });

    render(<TodoAction />, { wrapper });

    const confirmDialog = screen.getByTestId('confirm-dialog');
    expect(confirmDialog).toBeInTheDocument();
    
    expect(screen.getByText('Confirmez-vous le passage à l\'état \'à faire\' ?')).toBeInTheDocument();
    expect(screen.getByText(/Les 2 tâches visibles n'étant pas déjà 'à faire' vont être passées à 'à faire'\./)).toBeInTheDocument();
  });

  test('should show error dialog when there is an error and hideErrorDialog is false', () => {
    useTodoAction.mockReturnValue({
      ...mockHookReturn,
      updateError: { data: { message: 'Update failed' } },
      hideErrorDialog: false,
    });

    render(<TodoAction />, { wrapper });

    const errorDialog = screen.getByTestId('error-dialog');
    expect(errorDialog).toBeInTheDocument();
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
    expect(screen.getByText('Update failed')).toBeInTheDocument();
  });

  test('should not show error dialog when hideErrorDialog is true', () => {
    useTodoAction.mockReturnValue({
      ...mockHookReturn,
      updateError: { data: { message: 'Update failed' } },
      hideErrorDialog: true,
    });

    render(<TodoAction />, { wrapper });

    const errorDialog = screen.queryByTestId('error-dialog');
    expect(errorDialog).not.toBeInTheDocument();
  });

  test('should call onTodo when Todo button is clicked', () => {
    render(<TodoAction />, { wrapper });

    const todoButton = screen.getByText('Todo');
    fireEvent.click(todoButton);

    expect(mockOnTodo).toHaveBeenCalledTimes(1);
  });

  test('should call handleTodoConfirm when confirm dialog confirm button is clicked', () => {
    useTodoAction.mockReturnValue({
      ...mockHookReturn,
      show: true,
    });

    render(<TodoAction />, { wrapper });

    const confirmButton = screen.getByText('Confirmer');
    fireEvent.click(confirmButton);

    expect(mockHandleTodoConfirm).toHaveBeenCalledTimes(1);
  });

  test('should call handleTodoCancel when confirm dialog cancel button is clicked', () => {
    useTodoAction.mockReturnValue({
      ...mockHookReturn,
      show: true,
    });

    render(<TodoAction />, { wrapper });

    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    expect(mockHandleTodoCancel).toHaveBeenCalledTimes(1);
  });

  test('should call handleErrorDialogConfirm when error dialog OK button is clicked', () => {
    const mockError = { data: { message: 'Update failed' } };
    useTodoAction.mockReturnValue({
      ...mockHookReturn,
      updateError: mockError,
      hideErrorDialog: false,
    });

    render(<TodoAction />, { wrapper });

    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);

    expect(mockHandleErrorDialogConfirm).toHaveBeenCalledTimes(1);
  });

  test('should call useTodoAction hook', () => {
    render(<TodoAction />, { wrapper });

    expect(useTodoAction).toHaveBeenCalledTimes(1);
  });
});
