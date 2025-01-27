import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

export default function Draggable({id, isActive: isDraggable, children}) {
    const { attributes, listeners, setNodeRef: setNodeRefDrag, transform } = useDraggable({ id: id, data: { title: "goi" } }) 
    const draggableProps =  isDraggable ? {
        ref: setNodeRefDrag,
        style: {transform: CSS.Translate.toString(transform)},
        ...attributes,
        ...listeners} : {}
    return <div className="p-5 m-5 mt-10 border" {...draggableProps} >{children}</div>
}
