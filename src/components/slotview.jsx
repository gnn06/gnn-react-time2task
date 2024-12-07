import { useState } from 'react';

import Slot from './slot';
import { slotViewFilter } from "../data/slot-view";

function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

// { value: '', child: [] }
const givenTree = {
  value: 'this_month', child: [
    {
      value: 'this_week', child: [
        { value: 'mercredi', child: [] },
        { value: 'jeudi', child: [], disable: true }
      ], repeat: 2
    },
    { value: 'next_week', child: [] }
  ]
}

function concatWithSep(str1, str2) {
  return str1 + (str1 ? ' ' : '') + str2;
}

function tree2selection(tree, currentString = '') {

  function makeSelection(repeat, disable) {
    return { selected: true, repeat: tree.repeat, disable: tree.disable || false }
  }

  const result = [];

  if (!tree.child || tree.child.length === 0) {
    result.push([concatWithSep(currentString, tree.value), makeSelection(tree.repeat, tree.disable)])
  } else {
    if (tree.repeat !== undefined && tree.repeat > 0) {
      result.push([concatWithSep(currentString, tree.value), makeSelection(tree.repeat, tree.disable)]);
    }
    for (const child of tree.child) {
      result.push(...tree2selection(child, concatWithSep(currentString, tree.value)));
    }
  }

  return result;
}

const givenSelection = tree2selection(givenTree)

export default function SlotView({ tasks, conf }) {

  const [selection, setSelection] = useState(new Map());

  const handleSelection = (path, val) => {
    if (val.selected) {
      setSelection(new Map(selection.set(path, val)))
    } else {
      selection.delete(path)
      setSelection(new Map(selection))
    }
  }

  const slots = slotViewFilter(conf)

  return <div>
    {slots.map((slot, index) => {
      return <Slot key={slot.id} slot={slot} tasks={tasks} selection={selection} handleSelection={handleSelection} />
    })}
  </div>
}