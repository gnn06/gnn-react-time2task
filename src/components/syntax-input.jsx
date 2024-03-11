import React from "react";
import { useState, useRef } from "react";
import { wordBefore, insertItemInInput } from "../utils/stringUtil";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

/**
 * when CLICK inside => show dropdown
 * when CLICK outside (blur) => hide dropdown
 * when TYPING => show dropdown
 * when ENTER => dropdown disappears
 * when ENTER, IF selected > -1
 *             THEN insert item
 *             ELSE call parent handler
 * when ESC => hide dropdown 
 * when arrowDown => show dropdown and select next item
 * when typing text, filter dropdown
 * when only one suggestion, select it
 */

export default function SyntaxInput({id, items, placeHolderInput, initialInputValue, classNameInput, onInputChange, closeIcon}) {

  const [value, setValue] = useState(initialInputValue || '');
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(-1);
  const inputRef = useRef(null);

  function insertItemInInputFOOO  (valueToInsert) {
    // selectionEnd is first not selected 'x[xx]x'=> start = 1 and end = 3
    const startP = inputRef.current.selectionStart;
    const endP   = inputRef.current.selectionEnd;
    const result = insertItemInInput(value, startP, endP, valueToInsert);
    // const begin = value.substring(0, startP);
    // const end   = value.substring(endP);
    // const valuetoInsert = insertSeparator(begin, end, valueToInsert);
    // console.log('setValue')
    setValue(result);
    
  }
  
  function currentWord() {
    if (inputRef.current === null) return ''
    return wordBefore(inputRef.current.value, inputRef.current.selectionStart);
  }

  function getFilterLst() {
    return items.filter(item => item.indexOf(currentWord()) === 0)
  }

  const onChange = (e) => {
    const word = wordBefore(e.target.value, e.target.selectionStart)
    const newLst = items.filter(item => item.indexOf(word) === 0)
    if (newLst.length === 1) { setSelected(0) }
    setShow(true)
    // console.log('setValue')
    setValue(e.target.value)
  }

  const onDropdownClick = (e) => {
    insertItemInInputFOOO(e.target.textContent)
    onInputChange && onInputChange(value)
    e.stopPropagation();
  }

  const onInputFocus = () => {
    // console.log('input focus')
    // setShow(true)
  }

  const onInputClick = (e) => {
    setShow(true)
    e.stopPropagation();
  }
  
  const onInputBlur = (event) => {
    // console.log('blur')
    setShow(false)
    onInputChange && onInputChange(value)
  }

  const onKeyDown = (e) => {
    if (e.code === 'Escape') { // ESC
        setShow(false)
        setSelected(-1)
    } else if (e.code === 'Enter') { // ENTER
      if (selected > -1) {
        insertItemInInputFOOO(getFilterLst()[selected])
        setSelected(-1)
      } else {
        onInputChange && onInputChange(value)
      }
      setShow(false)
    } else if (e.code === 'ArrowDown') {
      e.preventDefault()
      if (!show) {
        setShow(true);
      }
      if (selected < getFilterLst().length - 1) { setSelected(selected + 1) }
    } else if (e.code === 'ArrowUp') {
      e.preventDefault()
      if (selected > -1) { setSelected(selected - 1) }
      if (selected === -1) {
        setShow(false)
      }
    }
  }

  const onInputClear = function(e) {
    setValue('')
    onInputChange && onInputChange('')
  }

  const Dropdown = <ul className="absolute z-10 mt-1 border rounded shadow-lg bg-gray-400 divide-y divide-gray-400 py-1" onMouseDown={(e) => e.preventDefault()} >
    { getFilterLst().map((item, index)=> <li key={item} className={"py-1 px-2 hover:bg-gray-300 " + (selected === index ? 'bg-gray-300' : '')} onClick={onDropdownClick}>
    {item}
    </li>) }
  </ul>

  const classNameIconn = "bg-gray-400 text-black ml-0.5 text-xs "

  return <div className="flex-1 ">
    <div className="flex flex-row items-center border rounded focus-within:border-red-500 p-0.5">
      <input id={id} ref={inputRef} className={'focus:outline-none  p-1 w-full ' + classNameInput} placeholder={placeHolderInput} value={value} onChange={onChange} onFocus=
        {onInputFocus} onBlur={onInputBlur} onKeyDown={onKeyDown} onClick={onInputClick} />
      { closeIcon && <CloseIcon className={classNameIconn} onClick={onInputClear}/>} <KeyboardArrowDownIcon className={classNameIconn} />
    </div>
    {show && Dropdown}
    </div>
  ;
};