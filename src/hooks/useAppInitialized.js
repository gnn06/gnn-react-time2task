import { useSelector } from 'react-redux';
import { useGetTasksQuery, useGetActivitiesQuery } from '../features/apiSlice';

export function useAppInitialized() {
    const userId = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);
    const { isLoading: isTasksLoading } = useGetTasksQuery({ userId, activity }, { skip: !userId });
    const { isLoading: isActivitiesLoading } = useGetActivitiesQuery(undefined, { skip: !userId });
    return !isTasksLoading && !isActivitiesLoading;
}
