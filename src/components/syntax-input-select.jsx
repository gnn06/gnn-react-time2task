import { useState } from "react";
import { useSelector } from "react-redux";

import SyntaxInput from "./syntax-input";
import SlotSelectDialog from "./slot-select-dialog";

export default function SyntaxInputWithSelection ({id, items, placeHolderInput, initialInputValue, classNameInput, onInputChange, closeIcon, title}) {

    const [ show, setShow ] = useState(false)
    const [ selectionExpr, setSelectionExpr ] = useState(initialInputValue)
    const conf = useSelector(state => state.tasks.slotViewFilterConf);

    const onExprChange = (e) => {
        const expr = e
        setSelectionExpr(expr)
        onInputChange(expr)
    }

    const onConfirm = (selExpr) => {
        setSelectionExpr(selExpr)
        //console.log('selection change expression from ', initialInputValue, ' to ', selExpr)
        onInputChange(selExpr)
        setShow(false)
    }

    const onCancel = () => {
        setShow(false)
    }

    const onShowSelection = () => {
        setShow(true)
    }

    return <div className="grow">
        <SyntaxInput id={id} items={items} placeHolderInput={placeHolderInput} initialInputValue={selectionExpr} classNameInput={classNameInput} closeIcon={closeIcon} 
            onInputChange={onExprChange} />
        { show && <SlotSelectDialog selectionExpr={selectionExpr} title={title} conf={conf} onConfirm={onConfirm} onCancel={onCancel}/>}
    </div>
}