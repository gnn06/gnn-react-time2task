import { produce } from "immer"
import { useState } from "react"

function isSet(array) {
    return array.reduce((acc, current) => acc + current) !== -4
}

function Cell({items, cell, onChange}) {
    return <select onChange={e => onChange(cell, e.target.value)}>
            <option value={-1}>aucun</option>
            {items.map((item, index) => <option value={index}>{item}</option>)}
        </select>
}

function Row({value, setValue, row}) {
    function modValue(col, newValue) {
        const newArray = produce(value, draft => {
            if (!isSet(draft[row])) { draft.push([-1,-1,-1,-1])}
            draft[row][col] = parseInt(newValue)
            if (!isSet(draft[draft.length - 2]) && !isSet(draft[draft.length - 1])) { draft.pop() }            
        })
        setValue(newArray)
    }
    return <div>
        <Cell items={['this_month', 'next_month']} cell={0} onChange={modValue}/>
        <Cell items={['this_week',  'next_week']}  cell={1} onChange={modValue}/>
        <Cell items={['lundi',  'mardi', 'mercredi', 'jeudi', 'vendredi']}  cell={2} onChange={modValue}/>
        <Cell items={['matin',  'aprem']}  cell={3} onChange={modValue}/>
    </div>
}
export default function Temp() {
    const [value, setValue] = useState([[-1, -1, -1, -1]])

    return (
        <div>
            {value.map((el, index) => <Row value={value} setValue={setValue} row={index}/>)}
            {''+JSON.stringify(value)}
        </div>)

}