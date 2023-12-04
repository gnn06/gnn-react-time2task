import React from "react";
import { useState, useRef } from "react";

export default function SyntaxInput({items, placeHolderInput, initialInputValue, classNameInput, onClickInput, onBlurInput}) {

  const [value, setValue] = useState(initialInputValue);
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);

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
    e.stopPropagation();
  }

  const onFocus = () => {
    setShow(true)
  }
  
  const onBlur = (event) => {
    setShow(false)
    onBlurInput(event)
  }

  const onKeyDown = (e) => {
    if (e.keyCode === 27) { // ESC
        setShow(false)
    }
  }

  return <div>
    <input  ref={inputRef} className={'border rounded p-1 w-full ' + classNameInput} placeholder={placeHolderInput} value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown} onClick={onFocus} />
      <ul className={(show ? 'show' : 'hidden') + ' absolute z-10 mt-1 border rounded shadow-lg bg-gray-400 divide-y divide-gray-400 py-1'} onMouseDown={(e) => e.preventDefault()} >
        { items.map(item => <li key={item} className="py-1 px-2 hover:bg-gray-300" onClick={onItemClick}>{item}</li>) }
      </ul>
    </div>
  ;
};