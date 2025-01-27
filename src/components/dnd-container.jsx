import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

export default function DndContainer({id, mode, children}) {
    const { isOver, setNodeRef: setNodeRefDrop } = useDroppable({ id: id })
    const { attributes, listeners, setNodeRef: setNodeRefDrag, transform } = useDraggable({ id: id }) 
    
    const isDraggable = mode === "drag"
    const      isDrop = mode === "drop"

    const dropProps = isDrop ? { ref: setNodeRefDrop, className: isOver ? "bg-blue-400" : undefined } : {}

    const dragProps =  isDraggable ? {
        ref: setNodeRefDrag,
        style: {transform: CSS.Translate.toString(transform)},
        ...attributes,
        ...listeners} : {}

    return <div {...dragProps} {...dropProps} >{children}</div>
}
