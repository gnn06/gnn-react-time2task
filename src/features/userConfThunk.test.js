import { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { saveUserConfThunk } from './userConfThunk';
import taskSlice, { login, logout } from './taskSlice';

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock the apiSlice module
vi.mock('./apiSlice', () => ({
    apiSlice: {
        endpoints: {
            upsertUserConf: {
                initiate: vi.fn()
            }
        },
        reducer: {},
        reducerPath: 'api',
        middleware: () => (next) => (action) => next(action)
    }
}));

// Import after mocking
import { apiSlice } from './apiSlice';
import { DEFAULT_CONF } from '../data/slot-view';

describe('saveUserConfThunk', () => {
    let store;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();
        
        // Create a fresh store for each test using the same pattern as the real store
        store = configureStore({
            reducer: {
                tasks: taskSlice,
                [apiSlice.reducerPath]: apiSlice.reducer
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({
                    serializableCheck: false,
                }).concat(apiSlice.middleware)
        });

        // Setup default state with user
        store.dispatch(login({ id: 'user123', email: 'test@example.com' }));
    });

    afterAll(() => {
        mockConsoleError.mockRestore();
    });

    it('should call API when user is logged in', async () => {
        const mockApiCall = {
            unwrap: vi.fn().mockResolvedValue({ success: true })
        };
        apiSlice.endpoints.upsertUserConf.initiate.mockReturnValue(mockApiCall);

        const state = store.getState();

        // When
        await store.dispatch(saveUserConfThunk());

        // Check that API was called with correct parameters
        expect(apiSlice.endpoints.upsertUserConf.initiate).toHaveBeenCalledWith({
            userId: 'user123',
            conf: 'slotviewconf',
            value: { slotViewFilterConf: state.tasks.slotViewFilterConf }
        });
    });

    it('should return early when no user is logged in', async () => {
        // Logout user
        store.dispatch(logout());

        await store.dispatch(saveUserConfThunk());

        // API should not be called
        expect(apiSlice.endpoints.upsertUserConf.initiate).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
        const mockError = new Error('API Error');
        const mockApiCall = {
            unwrap: vi.fn().mockRejectedValue(mockError)
        };
        apiSlice.endpoints.upsertUserConf.initiate.mockReturnValue(mockApiCall);

        await store.dispatch(saveUserConfThunk());

        // Should log the error (checking that console.error was called)
        expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should not call API if userId is missing', async () => {
        // Create store without user login
        const storeWithoutUser = configureStore({
            reducer: {
                tasks: taskSlice,
                [apiSlice.reducerPath]: apiSlice.reducer
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({
                    serializableCheck: false,
                }).concat(apiSlice.middleware)
        });

        await storeWithoutUser.dispatch(saveUserConfThunk());

        // API should not be called
        expect(apiSlice.endpoints.upsertUserConf.initiate).not.toHaveBeenCalled();
    });
});
