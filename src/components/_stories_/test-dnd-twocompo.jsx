import { useState } from "react"
import { DndContext } from "@dnd-kit/core"
import Droppable from "./droppable"
import Draggable from "./draggable"

export default function TestDnd() {

    const [drop, setDrop] = useState("")
    const [draggableID, setDraggableID] = useState("id1")

    return <div>
        <input value={draggableID} onChange={onChangeDraggableID} />
        <DndContext onDragEnd={dnd}>
            <Draggable id="id1" isActive={draggableID === "id1"}>drag1</Draggable>
            <Draggable id="id2" isActive={draggableID === "id2"}>drag2</Draggable>
            <Droppable isActive={true}>drop</Droppable>
            <div>debug</div>
            <div>{drop}</div>
        </DndContext>
    </div>

    function dnd(event) {
        const debug = {
            drag: (event.active ? event.active.id : "undefined"),
            drop: (event.over ? event.over.id : "undefined")
        }
        setDrop(JSON.stringify(debug, ' '));
    }

    function onChangeDraggableID(value) {
        setDraggableID(value.target.value)
        setDrop("")
    }
}