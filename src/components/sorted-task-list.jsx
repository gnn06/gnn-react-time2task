import {DndContext,closestCenter,useSensors, MouseSensor, TouchSensor, useSensor,} from '@dnd-kit/core';
import {SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import TaskInSlot from "./task-in-slot";
import { getNewOrder } from "../data/task";
import { useUpdateTaskMutation } from "../features/apiSlice.js";

export function SortedTaskList({ tasks }) {
    // sensors is necessary to prevent drag even to block click event
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 6,
            },
        }),
    );
    const [ updateTask, { error: updateError } ] = useUpdateTaskMutation();
    
    function handleDragEnd(event) {
        const { active, over } = event;
        if (active.id !== over.id) {
            const newOrder = getNewOrder(tasks, active.id, over.id);
            updateTask({ id: active.id, order: newOrder })
        }
    };
    
    function SortableItem(props) {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
        } = useSortable({ id: props.id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} >
                <TaskInSlot key={props.item.id} task={props.item} />
            </div>
        );
    }
    if (tasks.length <= 0) return <></>;
    return <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
    >
        <SortableContext
            items={tasks}
            strategy={verticalListSortingStrategy}
        >
            {tasks.map(task => <SortableItem key={task.id} id={task.id} item={task} />)}
        </SortableContext>
    </DndContext>;
}