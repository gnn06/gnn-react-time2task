import { useDroppable } from "@dnd-kit/core"

export default function Droppable({isActive, children}) {
    const { isOver, setNodeRef: setNodeRefDrop } = useDroppable({ id: "droppable" })
    const styleDrop = { backgroundColor: isOver ? 'green' : undefined, };
    const dropProps = isActive ? { ref: setNodeRefDrop, ...{style: styleDrop} } : {}
    return <div className="p-5 m-5 border" { ...dropProps }>{children}</div>
}