import { vi, describe, it, expect } from 'vitest';
import { loadAllUserConfThunk } from './loadConfThunk';

const calls = [];
vi.mock('./userConfThunk', () => ({
    loadUserConfThunk: vi.fn((userId) => async () => {
        await Promise.resolve();
        calls.push(['view', userId]);
    }),
}));
vi.mock('./filterConfThunk', () => ({
    loadFilterConfThunk: vi.fn((userId) => async () => { calls.push(['filter', userId]); }),
}));

describe('loadAllUserConfThunk', () => {
    it('charge la conf de vue avant les filtres (les prédicats dépendent du niveau de la vue)', async () => {
        const dispatch = (thunk) => thunk(dispatch);
        await loadAllUserConfThunk('user123')(dispatch);
        expect(calls).toEqual([['view', 'user123'], ['filter', 'user123']]);
    });
});
