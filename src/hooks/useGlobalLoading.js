import { useSelector } from 'react-redux';
import { useAppInitialized } from './useAppInitialized';

// useIsFetching / useIsMutating ont été retirés de RTK Query v2 ;
// on lit directement state.api pour détecter les requêtes en pending.
export const selectAnyPending = (state) => {
    const queries = Object.values(state.api.queries);
    const mutations = Object.values(state.api.mutations);
    return queries.some(q => q?.status === 'pending') ||
           mutations.some(m => m?.status === 'pending');
};

export function useGlobalLoading() {
    const appInitialized = useAppInitialized();
    const anyPending = useSelector(selectAnyPending);
    // Le spinner global est masqué pendant le démarrage (appInitialized = false)
    // pour ne pas interférer avec l'AppLoader qui couvre déjà l'écran.
    return appInitialized && anyPending;
}
