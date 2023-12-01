import React from "react";
import { useState } from "react";
import { AutoComplete } from 'primereact/autocomplete';

export default function SyntaxInput() {

  const [items, setItems] = useState(['gilles']);
  const [value, setValue] = useState('exemple');
  const search = (event) => {
    setItems(['gilles']);
  }
  const onChange = (e) => {
    console.debug('onChange', e)
    setValue(e.value)
  }
  const onSelect = (value) => {
    console.debug('onSelect', value)
  }

  return <div>
      autcocomplete
      <AutoComplete value={value} 
        suggestions={items} completeMethod={search} 
        onChange={onChange}  onSelect={onSelect}/>
    </div>
  ;
};