import React from "react";
import { useState } from "react";

export default function SyntaxInput() {

  const [value, setValue] = useState();
  const [show, setShow] = useState(false);

  const onChange = (e) => {
    setValue(e.target.value)
  }

  const onItemClick = (e) => {
    const inputElem = document.getElementById('filter-input');
    const startP = inputElem.selectionStart;
    const endP   = inputElem.selectionEnd;
    const begin = value.substring(0, startP);
    const end   = value.substring(endP);
    const valuetoInsert = (end === '' ? ' ' : '') + e.target.textContent + (end !== '' ? ' ' : '');
    const newValue = begin + valuetoInsert + end;
    setValue(newValue);
  }

  const onFocus = () => {
    setShow(true)
  }
  
  const onBlur = () => {
    setShow(false)
  }

  return <div>
      <input  id="filter-input" className="border rounded p-1 w-full" placeholder="expression" value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} />
      { show &&  
      <ul onMouseDown={(e) => e.preventDefault()} >
        <li onClick={onItemClick}>this_week</li>
        <li onClick={onItemClick}>mardi</li>
      </ul>
      }
    </div>
  ;
};