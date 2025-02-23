import { useState } from 'react';
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import ShiftNextIcon from '@mui/icons-material/ArrowForward';
import ShiftPreviousIcon from '@mui/icons-material/ArrowBack';
import RepeatIcon from '@mui/icons-material/Loop';
import DisableIcon from '@mui/icons-material/Block';

import SlotTreeSelect from './slot-tree-select';

import SlotSelect from './slot-select';
import { slotViewAdd, slotViewFilterSelection } from "../data/slot-view";
import { selectionToTree, selectionShift, selectionDelete, treeToSelection, selectionAdd, selectionMove } from '../data/selection-tree';
import { branchComplete, branchToExpr } from '../data/slot-branch';
import { Parser } from '../data/parser';
import { IDizer } from '../utils/stringUtil';
import { branchToTree, treetoBranch } from '../data/tree';

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

export default function SlotSelectDialog({ selectionExpr, conf, onConfirm, onCancel, title }) {

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

  // sensors is necessary to prevent drag even to block click event
  const sensors = useSensors(
          useSensor(MouseSensor, {
            activationConstraint: {
              distance: 8,
            },
          }),
          useSensor(TouchSensor, {
            activationConstraint: {
              delay: 200,
              tolerance: 6,
            },
          }),
          // useSensor(KeyboardSensor, {
          //   coordinateGetter: sortableKeyboardCoordinates,
          // }),
        );

  function dnd(event) {
    const source = event.active.id
    const dest   = (event.over && event.over.id) || undefined
    if (dest === undefined) return
    //console.log("dnd source=" + source + ", dest=" + dest)
    const newSelection = selectionMove(selection, source, dest)
    setSelection(newSelection)
    setSlots(makeSlotWithSelection(conf, newSelection))
  }
  
  return <Dialog open={true} onClose={handleClose} maxWidth="lg">
    <DialogContent>
      <div className='mb-3'>Tâche : {title}</div>
      <DndContext onDragEnd={dnd} sensors={sensors}>
        {slotsFromConf.map((slot, index) => {
          return <SlotTreeSelect key={slot.id} slot={slot} selection={selection}
                    handleSelection={handleSelection} 
                    handleShift={handleShift}
                    handleDelete={handleDelete}
                    handleAdd={handleAdd}
                    handleRepetition={handleRepetition}
                    handleDisable={handleDisable}/>
        })}
      </DndContext>
      {/* {<pre>{JSON.stringify(flatToTree(selection), null, ' ')}</pre>} */}
      {/* {<pre>{JSON.stringify(treetoBranch(flatToTree(selection)), null, ' ')}</pre>} */}
      {/* {selectionMapToExpr(selection)}     */}
      <div className='mt-3 mb-3'>
        <p className='underline'>Aide : </p>
        <p>Sélectionnez les créneaux auxquels la tâche doit être réalisée.</p>
        <p><RepeatIcon/> pour rendre le créneau récurrent. <DisableIcon/> pour désactiver temporairement le créneau.</p>
        <p><ShiftPreviousIcon/> et <ShiftNextIcon/> ( ou Drag&Drop) pour déplacer sur le créneau 
          avec ses sous-créneaux vers le créneau suivant.</p>
      </div>
      { import.meta.env.DEV && <div className='text-green-500'><span className='font-mono'>Debug input&nbsp;&nbsp;: {selectionExpr}</span></div> }
      { import.meta.env.DEV && <div className='text-green-500'><span className='font-mono'>Debug output&nbsp;: {selectionMapToExpr(selection)}</span></div>}
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogActions>
  </Dialog>
  
}
