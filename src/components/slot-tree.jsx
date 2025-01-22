import Slot from "./slot";

export default function SlotTree({slot, tasks}) {
    
    const { inner } = slot;

    if (tasks === undefined) {
        return 'error'
    }

    const innerClass = 'ml-3' 
        + (slot.id === 'this_week' ? ' flex flex-row' : '');

    return (
        <div>            
            <Slot slot={slot} tasks={tasks}/>
            <div className={innerClass}>
                {inner != null && inner.map((innerSlot, index) => 
                <SlotTree key={innerSlot.id} slot={innerSlot} tasks={tasks}/>)}
            </div>
        </div>
        )
    }