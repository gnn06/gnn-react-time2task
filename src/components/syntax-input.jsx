import React from "react";
import { useState, useRef } from "react";

import { insertSeparator } from "../utils/stringUtil";

export default function SyntaxInput() {

  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);

  const items = ['this_week', 'mardi']

  const onChange = (e) => {
    setValue(e.target.value)
  }

  const onItemClick = (e) => {
    const startP = inputRef.current.selectionStart;
    const endP   = inputRef.current.selectionEnd;
    const begin = value.substring(0, startP);
    const end   = value.substring(endP);
    const valuetoInsert = insertSeparator(begin, end, e.target.textContent);
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
      <input  ref={inputRef} className="border rounded p-1 w-full" placeholder="expression" value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} />
      <ul className={(show ? 'show' : 'hidden') + ' absolute z-10 mt-1 border rounded shadow-lg bg-gray-400 divide-y divide-gray-400 py-1'} onMouseDown={(e) => e.preventDefault()} >
        { items.map(item => <li key={item} className="py-1 px-2 hover:bg-gray-300" onClick={onItemClick}>{item}</li>) }
      </ul>
    </div>
  ;
};