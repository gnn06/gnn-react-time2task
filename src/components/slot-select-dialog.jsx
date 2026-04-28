import { useMemo, useState } from 'react';
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

  const [ selection, setSelection] = useState(exprToSelectionMap(selectionExpr))
  // slotsFromConf dérivé de selection via useMemo (pas d'état séparé) : évite la désynchronisation
  // et les stale closures — les handlers utilisent setSelection(prev => ...) pour la même raison :
  // deux clics rapides sur des créneaux différents causaient la perte du premier créneau sélectionné.
  const slotsFromConf = useMemo(() => makeSlotWithSelection(conf, selection), [conf, selection])

  const handleConfirm = () => {
    const expression = selectionMapToExpr(selection)
    onConfirm(expression)
  }

  const handleClose = () => {
    onCancel()
  }

  const handleSelection = (path, val) => {
    setSelection(prev => {
      const next = new Map(prev)
      if (val.selected) { next.set(path, val) } else { next.delete(path) }
      return next
    })
  }

  const handleShift = (pathExpr, direction) => {
    setSelection(prev => selectionShift(prev, pathExpr, direction))
  }

  const handleDelete = (pathExpr) => {
    setSelection(prev => selectionDelete(prev, pathExpr))
  }

  const handleAdd = (pathExpr) => {
    setSelection(prev => selectionAdd(prev, pathExpr))
  }

  const handleRepetition = (path) => {
    setSelection(prev => {
      const next = new Map(prev)
      next.set(path, {...(prev.get(path) || {selected: true}), repetition: 1})
      return next
    })
  }

  const handleDisable = (path) => {
    setSelection(prev => {
      const next = new Map(prev)
      next.set(path, {...(prev.get(path) || {selected: true}), disable: true})
      return next
    })
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
    setSelection(prev => selectionMove(prev, source, dest))
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
