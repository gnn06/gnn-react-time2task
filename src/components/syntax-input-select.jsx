import { useState } from "react";
import SyntaxInput from "./syntax-input";
import SlotViewSelect from "./slot-view-select";

const conf = {
    collapse: [
      "this_month next_week",
      "this_month following_week",
      "next_month"
    ],
    remove: [],
    levelMin: null,
    levelMaxIncluded: null
}

export default function SyntaxInputWithSelection ({id, items, placeHolderInput, initialInputValue, classNameInput, onInputChange, closeIcon, title}) {
    const [ show, setShow ] = useState(false)

    const [ selectionExpr, setSelectionExpr ] = useState(initialInputValue)

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
        { show && <SlotViewSelect selectionExpr={selectionExpr} title={title} conf={conf} onConfirm={onConfirm} onCancel={onCancel}/>}
    </div>
}