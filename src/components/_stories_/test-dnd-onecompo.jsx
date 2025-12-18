import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import DndContainer from "./dnd-container"
import { Button } from "@mui/material"
import { useState } from "react";

export default function TestDnd() {
    const [message, setMessage] = useState("")
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
        // useSensor(KeyboardSensor, {
        //   coordinateGetter: sortableKeyboardCoordinates,
        // }),
      );
    return <div>
        <DndContext onDragEnd={dnd} sensors={sensors}>
            <DndContainer id="drag1" mode="drag">
                <div style={{color:"red"}}>ContenuDuPère1</div>
                <Button onClick={() => {window.alert('button')}}>goi</Button>
            </DndContainer>
            <DndContainer id="drag2" ><div><input /></div></DndContainer>
            <DndContainer id="drop1" mode="drop">ContenuDuPère3</DndContainer>
        </DndContext>
        {message}
    </div>
    function dnd(event) {
        setMessage('drag and drop done')
        setTimeout(() => {
            setMessage("")
        }, 2000);
    }
}
