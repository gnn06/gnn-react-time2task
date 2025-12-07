import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Slot from './slot';

export function Droppable() {
    const { isOver, setNodeRef } = useDroppable({ id: "droppable" });
    const style = {
        border: isOver ? '2px solid green' : '2px solid transparent',
    };

    return <div ref={setNodeRef} style={style} className='p-5' >Drop here</div>
}
export function SortableItem(props) {
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
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className='p-3 bg-gray-200 border border-gray-400 rounded mb-2'>
            {props.id} {props.item.order}
        </div>
    );
}

function App() {
}

export default function Test() {
    const [items, setItems] = useState([{ id: 123, order: 15.0 }, { id: 121, order: 10.0 }, { id: 122, order: 10.5 }]);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event) {
        const { active, over } = event;

        if (active.id !== over.id) {
            if (over.id === "droppable") {
                // If dropped over the droppable area, we can handle it here if needed
                console.log("Dropped over the droppable area", active.id);
            } else {
                setItems((items) => {
                    const oldIndex = items.findIndex(el => el.id === active.id);
                    const newIndex = items.findIndex(el => el.id === over.id);

                    const newSorted = arrayMove(items, oldIndex, newIndex);

                    const prev = newSorted[newIndex - 1];
                    const next = newSorted[newIndex + 1];

                    let newOrder;
                    if (!prev && next) {
                        newOrder = next.order - 1;
                    } else if (prev && !next) {
                        newOrder = prev.order + 1;
                    } else if (prev && next) {
                        newOrder = (prev.order + next.order) / 2;
                    } else {
                        newOrder = 0;
                    }

                    const newItem = { ...items[oldIndex], order: newOrder };

                    const newItems = items.toSpliced(oldIndex, 1, newItem)
                    return newItems;
                });
            }
        }
    }

    function toto() {
        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div class="flex flex-row ">
                    
                    <div>
                        <SortableContext
                            items={items}
                            strategy={verticalListSortingStrategy}
                        >
                            {items.sort((a, b) => a.order > b.order).map(el => <SortableItem key={el.id} id={el.id} item={el} />)}
                        </SortableContext>
                    </div>
                </div>
            </DndContext>
        );
    }

    const slot = { id:'mercredi', path:'this_month this_week mercredi', inner:[] };
    const tasks = [
        { id: "task1", title: "Task 1", slotExpr: "this_month this_week mercredi", activity: null, order: 1 },
        { id: "task2", title: "Task 2", slotExpr: "this_month this_week mercredi", activity: null, order: 3 },
        { id: "task3", title: "Task 3", slotExpr: "this_month this_week mercredi", activity: null, order: 5 }
    ];
    
    return <div className='w-64'>
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <Slot slot={slot} tasks={tasks} />
        </DndContext></div>
}