import { useSelector } from 'react-redux';
import { useGetTasksQuery, useGetActivitiesQuery } from '../features/apiSlice';

export function useAppInitialized() {
    const userId = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);
    const userConfLoaded = useSelector(state => state.tasks.userConfLoaded);
    // isLoading (pas isFetching) : true uniquement au premier fetch, jamais sur les refetch.
    // C'est ce qui distingue le démarrage de l'utilisation normale.
    const { isLoading: isTasksLoading } = useGetTasksQuery({ userId, activity }, { skip: !userId });
    const { isLoading: isActivitiesLoading } = useGetActivitiesQuery(undefined, { skip: !userId });
    // Sans utilisateur (écran de login), il n'y a pas de conf à attendre.
    const isConfPending = Boolean(userId) && !userConfLoaded;
    return !isTasksLoading && !isActivitiesLoading && !isConfPending;
}
