import React from "react";
import { useState } from "react";

export default function SyntaxInput() {

  const [items, setItems] = useState(['gilles']);
  const [value, setValue] = useState('exemple');
  const [show, setShow] = useState(false);
  const search = (event) => {
    setItems(['gilles']);
  }
  const onChange = (e) => {
    console.debug('onChange', e)
    setValue(e.target.value)
  }
  const onSelect = (value) => {
    console.debug('onSelect', value)
  }

  const onItemClick = (e) => {
    console.debug('click', e.target)
    setValue(value + e.target.textContent)
  }
  const onFocus = () => {
    setShow(true)
  }
  const onBlur = () => {
    setShow(false)
  }

  return <div>
      <input  value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} />
      { show &&  
      <ul onMouseDown={(e) => e.preventDefault()} >
        <li onClick={onItemClick}>this_week</li>
        <li onClick={onItemClick}>mardi</li>
      </ul>
      }
    </div>
  ;
};