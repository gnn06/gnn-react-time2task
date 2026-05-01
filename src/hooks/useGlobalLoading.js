import { useSelector } from 'react-redux';
import { useGetTasksQuery, useGetActivitiesQuery } from '../features/apiSlice';

const selectAnyPending = (state) => {
    const queries = Object.values(state.api.queries);
    const mutations = Object.values(state.api.mutations);
    return queries.some(q => q?.status === 'pending') ||
           mutations.some(m => m?.status === 'pending');
};

export function useGlobalLoading() {
    const userId = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);

    const { isLoading: isTasksLoading } = useGetTasksQuery({ userId, activity }, { skip: !userId });
    const { isLoading: isActivitiesLoading } = useGetActivitiesQuery();

    const anyPending = useSelector(selectAnyPending);

    const appInitialized = !isTasksLoading && !isActivitiesLoading;
    return appInitialized && anyPending;
}
