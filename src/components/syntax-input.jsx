import React from "react";
import { useState, useRef } from "react";
import { insertSeparator } from "../utils/stringUtil";

export default function SyntaxInput({items, placeHolderInput, initialInputValue, classNameInput, onInputChange}) {

  const [value, setValue] = useState(initialInputValue || '');
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);

  const onChange = (e) => {
    setValue(e.target.value)
  }

  const onSelectClick = (e) => {
    const startP = inputRef.current.selectionStart;
    const endP   = inputRef.current.selectionEnd;
    const begin = value.substring(0, startP);
    const end   = value.substring(endP);
    const valuetoInsert = insertSeparator(begin, end, e.target.textContent);
    setValue(valuetoInsert);
    onInputChange && onInputChange(valuetoInsert);
    e.stopPropagation();
  }

  const onFocus = () => {
    setShow(true)
  }

  const onItemClick = (e) => {
    setShow(true)
    e.stopPropagation();
  }
  
  const onInputBlur = (event) => {
    setShow(false)
    onInputChange && onInputChange(value)
  }

  const onKeyDown = (e) => {
    if (e.keyCode === 27) { // ESC
        setShow(false)
    } else if (e.keyCode === 13) { // ENTER
      onInputChange && onInputChange(value)
    }
  }
  return <div className="flex-1 ">
    <input  ref={inputRef} className={'border rounded p-1 w-full ' + classNameInput} placeholder={placeHolderInput} value={value} onChange={onChange} onFocus={onFocus} onBlur={onInputBlur} onKeyDown={onKeyDown} onClick={onItemClick} />
      <ul className={(show ? 'show' : 'hidden') + ' absolute z-10 mt-1 border rounded shadow-lg bg-gray-400 divide-y divide-gray-400 py-1'} onMouseDown={(e) => e.preventDefault()} >
        { items.map(item => <li key={item} className="py-1 px-2 hover:bg-gray-300" onClick={onSelectClick}>{item}</li>) }
      </ul>
    </div>
  ;
};