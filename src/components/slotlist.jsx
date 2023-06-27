import React from "react";
import Slot from './slot';

export default class SlotList extends React.Component {
    render() {
        const lStSlot = this.props.slots;
        const tasks = this.props.tasks;

        return (
            <div className="m-1">
                <h1>Slots</h1>
                {lStSlot.map((slot, index) => {
                    return <Slot key={slot.id} slot={slot} tasks={tasks}/>
                })}
            </div>
        )
    }
}