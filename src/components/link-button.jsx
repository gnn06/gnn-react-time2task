import { Button, Snackbar } from "@mui/material";
import { useState } from "react";

export default function LinkButton() {
    const [ isDragging, setIsDragging ] = useState(false)

    const onClick = () => {
        setIsDragging(true)
    }

    const onBlur = () => {
        setIsDragging(false)
    }

    return <div onBlur={onBlur}>
        {!isDragging ? <Button variant="contained" size="small" onClick={onClick}>Lier une tâche à un créneau</Button> : 
            <Button variant="text" size="small" onClick={onClick}>Déplacez une tâche sur un créneau</Button>}
        <Snackbar open={isDragging}
            autoHideDuration={6000}
            anchorOrigin={{vertical:'top',horizontal:'right'}}
            onClose={null}
            message="Drag & Dropez une tâche sur un créneau"
            action={null}  />
    </div>
}