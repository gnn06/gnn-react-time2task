import { useMemo, useState } from 'react';

import SlotSelect from './slot-select';
import { slotViewAdd, slotViewFilterSelection } from "../data/slot-view";
import { branchToTree, selectionToTree, selectionShift, selectionDelete, treeToSelection, treetoBranch, selectionAdd } from '../data/selection-tree';
import { branchComplete, branchToExpr } from '../data/slot-branch';
import { Parser } from '../data/parser';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { IDizer } from '../utils/stringUtil';

function selectionMapToExpr(selection) {
  let result = selectionToTree(selection)
  result = treetoBranch(result)
  return branchToExpr(result)
}

const parser = new Parser();

function exprToSelectionMap(expr) {
  let result = parser.parse(expr)
  if (result === undefined) return new Map()
  result = branchToTree(branchComplete(result, 1))
  result = treeToSelection(result)
  result = new Map(result)
  return result
}

function makeSlotWithSelection(conf, selection) {
  return slotViewFilterSelection(
    conf, 
    Array.from(selection.keys()).map(el => IDizer(el))
  )
}

export default function SlotViewSelect({ selectionExpr, conf, onConfirm, onCancel, title }) {

  // const selection = useMemo(() => exprToSelectionMap(selectionExpr), [selectionExpr])
  const [ selection, setSelection] = useState(exprToSelectionMap(selectionExpr))
  const [ slotsFromConf, setSlots ] = useState(makeSlotWithSelection(conf, selection))

  const handleConfirm = () => {
    const expression = selectionMapToExpr(selection)
    onConfirm(expression)
  }

  const handleClose = () => {
    onCancel()
  }
  
  const handleSelection = (path, val) => {
    if (val.selected) {
      selection.set(path, val)
    } else {
      selection.delete(path)
    }
    setSelection(new Map(selection))
  }

  const handleShift = (pathExpr, direction) => {
    const newSeletion = selectionShift(selection, pathExpr, direction)
    setSelection(newSeletion)
    setSlots(makeSlotWithSelection(conf, newSeletion))
  }

  const handleDelete = (pathExpr) => {
    const newSeletion = selectionDelete(selection, pathExpr)
    setSelection(newSeletion)
    setSlots(makeSlotWithSelection(conf, newSeletion))
  }

  const handleAdd = (pathExpr) => {
    const newSeletion = selectionAdd(selection, pathExpr)
    setSelection(newSeletion)
    setSlots(makeSlotWithSelection(conf, newSeletion))
  }

  const handleRepetition = (path, val /* defined or undefined */) => {
    const oldSelection = selection.get(path)    
    const newSelection = {...(oldSelection || {selected: true}), repetition: 1} 
    selection.set(path, newSelection)
    setSelection(new Map(selection))
  }

  const handleDisable = (path, val) => {
    const oldSelection = selection.get(path)    
    const newSelection = {...(oldSelection || {selected: true}), disable: true} 
    selection.set(path, newSelection)
    setSelection(new Map(selection))
  }
  
  return <Dialog open={true} onClose={handleClose} maxWidth="lg">
    <DialogContent>
      <div>Tâche : {title}</div>
      {slotsFromConf.map((slot, index) => {
        return <SlotSelect key={slot.id} slot={slot} selection={selection}
          handleSelection={handleSelection} 
          handleShift={handleShift}
          handleDelete={handleDelete}
          handleAdd={handleAdd}
          handleRepetition={handleRepetition}
          handleDisable={handleDisable}/>
      })}
      {/* {<pre>{JSON.stringify(flatToTree(selection), null, ' ')}</pre>} */}
      {/* {<pre>{JSON.stringify(treetoBranch(flatToTree(selection)), null, ' ')}</pre>} */}
      {/* {selectionMapToExpr(selection)}     */}
      { import.meta.env.DEV && <div className='text-green-500'><span className='font-mono'>Debug input&nbsp;&nbsp;: {selectionExpr}</span></div> }
      { import.meta.env.DEV && <div className='text-green-500'><span className='font-mono'>Debug output&nbsp;: {selectionMapToExpr(selection)}</span></div>}
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogActions>
  </Dialog>
  
}
