import { vi, describe, test, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import taskReducer from '../features/taskSlice';
import Login from './login';

vi.mock('../services/supabase', () => ({
    supabase: {
        auth: {
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } }
            }))
        }
    }
}));

vi.mock('../features/auth-thunk', () => ({
    loginThunk: vi.fn(),
}));

vi.mock('../services/browser-storage', () => ({
    localRemoveUser: vi.fn(),
    localRemoveAccessToken: vi.fn(),
    localStoreAccessToken: vi.fn(),
    localStoreUser: vi.fn(),
    localRetrieveAccessToken: vi.fn(),
    localRetrieveUser: vi.fn(),
}));

import { loginThunk } from '../features/auth-thunk';

const createStore = () => configureStore({ reducer: { tasks: taskReducer } });

describe('Login', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    function renderLogin() {
        render(
            <Provider store={createStore()}>
                <Login isSignIn={true} />
            </Provider>
        );
    }

    test('le bouton est désactivé pendant la soumission', async () => {
        let resolve;
        loginThunk.mockReturnValue(() => new Promise(r => { resolve = r; }));

        renderLogin();
        const user = userEvent.setup();

        await user.type(screen.getByRole('textbox', { name: 'email' }), 'test@test.com');
        await user.type(screen.getByLabelText('password'), 'password');
        await user.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
        });

        await act(async () => { resolve(); });
    });

    test('le bouton se réactive après une erreur (finally)', async () => {
        loginThunk.mockReturnValue(() => Promise.reject(new Error('Invalid credentials')));

        renderLogin();
        const user = userEvent.setup();

        await user.type(screen.getByRole('textbox', { name: 'email' }), 'test@test.com');
        await user.type(screen.getByLabelText('password'), 'mauvais');
        await user.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /login/i })).toBeEnabled();
        });
    });

    test('loginThunk est appelé avec email et mot de passe saisis', async () => {
        loginThunk.mockReturnValue(() => Promise.resolve());

        renderLogin();
        const user = userEvent.setup();

        await user.type(screen.getByRole('textbox', { name: 'email' }), 'user@test.com');
        await user.type(screen.getByLabelText('password'), 'secret');
        await user.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(loginThunk).toHaveBeenCalledWith('user@test.com', 'secret');
        });
    });

});
