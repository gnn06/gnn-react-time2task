import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppLoader from './app-loader';

describe('AppLoader', () => {

    test('affiche l\'overlay avec le bon testid', () => {
        render(<AppLoader />);
        expect(screen.getByTestId('app-loader')).toBeInTheDocument();
    });

    test('affiche le texte "Time2Task"', () => {
        render(<AppLoader />);
        expect(screen.getByText('Time2Task')).toBeInTheDocument();
    });
});
