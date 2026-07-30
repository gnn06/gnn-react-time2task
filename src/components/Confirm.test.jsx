import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Confirm from './Confirm';

const baseProps = { titre: 'Test', handleConfirm: vi.fn(), handleCancel: vi.fn() };

test('sans handleDelete, le bouton Supprimer est absent', () => {
    render(<Confirm {...baseProps}>contenu</Confirm>);
    expect(screen.queryByRole('button', { name: /supprimer/i })).not.toBeInTheDocument();
});

test('avec handleDelete, le bouton Supprimer est visible', () => {
    render(<Confirm {...baseProps} handleDelete={vi.fn()}>contenu</Confirm>);
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument();
});

test('clic sur Supprimer appelle handleDelete', () => {
    const handleDelete = vi.fn();
    render(<Confirm {...baseProps} handleDelete={handleDelete}>contenu</Confirm>);
    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));
    expect(handleDelete).toHaveBeenCalledOnce();
});
