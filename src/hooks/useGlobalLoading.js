import { useSelector } from 'react-redux';
import { useAppInitialized } from './useAppInitialized';

export const selectAnyPending = (state) => {
    const queries = Object.values(state.api.queries);
    const mutations = Object.values(state.api.mutations);
    return queries.some(q => q?.status === 'pending') ||
           mutations.some(m => m?.status === 'pending');
};

export function useGlobalLoading() {
    const appInitialized = useAppInitialized();
    const anyPending = useSelector(selectAnyPending);
    return appInitialized && anyPending;
}
