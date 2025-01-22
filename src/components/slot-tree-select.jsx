import SlotSelect from "./slot-select";

export default function SlotTreeSelect({slot, selection, handleSelection, handleShift, handleDelete, handleAdd, handleRepetition, handleDisable}) {
    const { inner } = slot;

    const innerClass = 'ml-3' 
        + (slot.id === 'this_week' ? ' flex flex-row' : '');

    return (
        <div>
            <SlotSelect slot={slot} selection={selection} handleSelection={handleSelection} handleShift={handleShift} handleDelete={handleDelete} handleAdd={handleAdd} 
                        handleRepetition={handleRepetition} handleDisable={handleDisable}/>
            <div className={innerClass}>
                {inner != null && inner.map((innerSlot, index) => 
                <SlotTreeSelect key={innerSlot.id} slot={innerSlot} 
                    selection={selection}
                    handleSelection={(path, val) => handleSelection && handleSelection(path, val)} 
                    handleShift={handleShift}
                    handleDelete={handleDelete}
                    handleAdd={handleAdd}
                    handleRepetition={handleRepetition}
                    handleDisable={handleDisable}
                />)}
            </div>
        </div>
        )
    }