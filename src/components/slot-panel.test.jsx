import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import SlotPanel from './slot-panel';
import taskSlice, { login, setFilterSlot } from '../features/taskSlice';
import { DEFAULT_CONF } from '../data/slot-view';

// Mock the apiSlice module
const { mockUpsertUserConfInitiate } = vi.hoisted(() => {
    return { mockUpsertUserConfInitiate: vi.fn() };
});

vi.mock('../features/apiSlice', () => ({
    apiSlice: {
        endpoints: {
            upsertUserConf: {
                initiate: mockUpsertUserConfInitiate
            },
            getSnapDates: {
                initiate: vi.fn()
            },
            getTasks: {
                initiate: vi.fn()
            },
            updateTask: {
                initiate: vi.fn()
            },
            addTask: {
                initiate: vi.fn()
            },
            deleteTask: {
                initiate: vi.fn()
            },
            getActivities: {
                initiate: vi.fn()
            },
            updateActivity: {
                initiate: vi.fn()
            },
            addActivity: {
                initiate: vi.fn()
            },
            deleteActivity: {
                initiate: vi.fn()
            },
            updateSnapDate: {
                initiate: vi.fn()
            },
            getUserConf: {
                initiate: vi.fn()
            }
        },
        reducer: {},
        reducerPath: 'api',
        middleware: () => (next) => (action) => next(action)
    },
    useUpsertUserConfMutation: () => [vi.fn(), { isLoading: false, error: null }],
    useGetSnapDatesQuery: () => ({ data: [], isLoading: false, error: null }),
    useGetTasksQuery: () => ({ data: [], isLoading: false, error: null }),
    useUpdateTaskMutation: () => [vi.fn(), { isLoading: false, error: null }],
    useAddTaskMutation: () => [vi.fn(), { isLoading: false, error: null }],
    useDeleteTaskMutation: () => [vi.fn(), { isLoading: false, error: null }],
    useGetActivitiesQuery: () => ({ data: [], isLoading: false, error: null }),
    useUpdateActivityMutation: () => [vi.fn(), { isLoading: false, error: null }],
    useAddActivityMutation: () => [vi.fn(), { isLoading: false, error: null }],
    useDeleteActivityMutation: () => [vi.fn(), { isLoading: false, error: null }],
    useUpdateSnapDateMutation: () => [vi.fn(), { isLoading: false, error: null }],
    useLazyGetUserConfQuery: () => [vi.fn(), { isLoading: false, error: null }]
}));

describe('SlotPanel', () => {
    let store;
    const mockTasks = [];

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();
        
        // Create a fresh store for each test
        store = configureStore({
            reducer: {
                tasks: taskSlice,
                api: {}
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({
                    serializableCheck: false,
                })
        });

        // Setup default state with user
        store.dispatch(login({ id: 'user123', email: 'test@example.com' }));
    });

    // Helper function to setup mock API call
    const setupMockApiCall = () => {
        const mockApiCall = {
            unwrap: vi.fn().mockResolvedValue({ success: true })
        };
        mockUpsertUserConfInitiate.mockReturnValue(mockApiCall);
        return mockApiCall;
    };

    // Helper function to render SlotPanel component
    const renderSlotPanel = () => {
        render(
            <Provider store={store}>
                <SlotPanel tasks={mockTasks} />
            </Provider>
        );
    };

    // Helper function to test configuration change
    const testConfigurationChange = async (
        elementSelector,
        interaction,
        configKey,
        expectedValue,
        setupStore = () => {}
    ) => {
        setupMockApiCall();
        setupStore();
        renderSlotPanel();

        // Check store before test
        const initialState = store.getState();
        expect(initialState.tasks.slotViewFilterConf[configKey]).not.toBe(expectedValue);

        // Get element using selector function
        const element = typeof elementSelector === 'function' ? elementSelector() : elementSelector;

        // Perform interaction
        await interaction(element);

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 0));

        const expectedConf = { ...DEFAULT_CONF, [configKey]: expectedValue };

        // Verify that store was modified
        const newState = store.getState();
        expect(newState.tasks.slotViewFilterConf[configKey]).toBe(expectedValue);

        // Verify that upsertUserConf.initiate was called with correct parameters
        expect(mockUpsertUserConfInitiate).toHaveBeenCalledWith({
            userId: 'user123',
            conf: 'slotviewconf',
            value: { slotViewFilterConf: expectedConf }
        });
    };

    it('should call upsertUserConf.initiate when onViewChange is triggered', async () => {
        await testConfigurationChange(
            () => screen.getByLabelText('slot-view-select'),
            async (element) => {
                await userEvent.click(element);
                const listOption = screen.getByText('List');
                await userEvent.click(listOption);
            },
            'view',
            'list'
        );
    });

    it('should call upsertUserConf.initiate when handleShowRepeat is triggered', async () => {
        await testConfigurationChange(
            () => screen.getByLabelText('voir les répétitions'),
            async (element) => {
                await userEvent.click(element);
            },
            'showRepeat',
            false
        );
    });

    it('should call upsertUserConf.initiate when handleSlotStrict is triggered', async () => {
        await testConfigurationChange(
            () => screen.getByLabelText('Slot strict'),
            async (element) => {
                await userEvent.click(element);
            },
            'slotStrict',
            false,
            () => store.dispatch(setFilterSlot('test-filter'))
        );
    });
});
