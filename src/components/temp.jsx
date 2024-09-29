import { produce } from "immer"
import { useState } from "react"

function isSet(array) {
    return array.reduce((acc, current) => acc + current) !== -4
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
    return <div key={row}>
        <select onChange={e => modValue(0, e.target.value)}>
            <option value="-1">aucun</option>
            <option value="0">this_month</option>
            <option value="1">next_month</option>
        </select>
        <select onChange={e => modValue(1, e.target.value)}>
            <option value="-1">aucun</option>
            <option value="0">this_week</option>
            <option value="1">next_week</option>
        </select>
        <select onChange={e => modValue(2, e.target.value)}>
            <option value="-1">aucun</option>
            <option value="0">lundi</option>
            <option value="1">mardi</option>
            <option value="2">mercredi</option>
            <option value="3">jeudi</option>
            <option value="4">vendredi</option>
        </select>
        <select onChange={e => modValue(3, e.target.value)}>
            <option value="-1">aucun</option>
            <option value="0">matin</option>
            <option value="1">aprem</option>
        </select>
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