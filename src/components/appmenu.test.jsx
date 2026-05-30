import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import AppMenu from './appmenu';

vi.mock('react-router', () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

vi.mock('./logout', () => ({
    default: () => <button>Logout</button>,
}));

vi.mock('./changelog', () => ({
    RELEASE: '01/01/2025',
}));

vi.mock('../hooks/useGlobalLoading', () => ({
    useGlobalLoading: vi.fn(),
}));

import { useGlobalLoading } from '../hooks/useGlobalLoading';

describe('AppMenu', () => {

    test('affiche l\'icône nuage sans spinner quand pas de chargement', () => {
        useGlobalLoading.mockReturnValue(false);
        render(<AppMenu />);

        expect(screen.queryByTestId('global-spinner')).not.toBeInTheDocument();
    });

    test('affiche le spinner quand une requête est en cours', () => {
        useGlobalLoading.mockReturnValue(true);
        render(<AppMenu />);

        expect(screen.getByTestId('global-spinner')).toBeInTheDocument();
    });

    test('le spinner disparaît quand le chargement se termine', () => {
        useGlobalLoading.mockReturnValue(true);
        const { rerender } = render(<AppMenu />);
        expect(screen.getByTestId('global-spinner')).toBeInTheDocument();

        useGlobalLoading.mockReturnValue(false);
        rerender(<AppMenu />);
        expect(screen.queryByTestId('global-spinner')).not.toBeInTheDocument();
    });
});
