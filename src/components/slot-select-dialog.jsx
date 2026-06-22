import { useMemo, useState } from 'react';
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import ShiftNextIcon from '@mui/icons-material/ArrowForward';
import ShiftPreviousIcon from '@mui/icons-material/ArrowBack';
import RepeatIcon from '@mui/icons-material/Loop';
import DisableIcon from '@mui/icons-material/Block';

import SlotTreeSelect from './slot-tree-select';

import SlotSelect from './slot-select';
import { slotViewFilterSelection } from "../data/slot-view";
import { selectionMove } from '../data/selection-tree';
import {
  exprToSelection, selectionToExpr,
  selectionToggle, selectionShift, selectionSetRepetition, selectionSetDisable,
} from '../data/slot-selection';
import { IDizer } from '../utils/stringUtil';

/**
 * Génère les slots à afficher à partir de la conf et des slots nécessaires
 * à l'expression (exemple pour un next_month+6)
 * @param {*} conf 
 * @param {*} selection 
 * @returns 
 */
function makeSlotWithSelection(conf, selection) {
  return slotViewFilterSelection(
    { ...conf, levelMaxIncluded: null },
    Array.from(selection.keys()).map(el => IDizer(el))
  )
}

// today/tomorrow sont des feuilles localisées niveau 3 sous this_week (chemins
// complets, comme les weekdays) : cliquer today raffine this_week en
// 'this_month this_week today', homogène avec un clic mardi.
const PRESENT_DAY_SLOTS = [
  { id: 'today',    path: 'this_month this_week today',    inner: [
      { id: 'matin', path: 'this_month this_week today matin',    inner: [] },
      { id: 'aprem', path: 'this_month this_week today aprem',    inner: [] },
  ]},
  { id: 'tomorrow', path: 'this_month this_week tomorrow', inner: [
      { id: 'matin', path: 'this_month this_week tomorrow matin', inner: [] },
      { id: 'aprem', path: 'this_month this_week tomorrow aprem', inner: [] },
  ]},
]

function removePresentDayNodes(slots) {
  return slots
    .filter(s => s.id !== 'today' && s.id !== 'tomorrow')
    .map(s => ({ ...s, inner: removePresentDayNodes(s.inner) }))
}

function withPresentDaySlots(slots) {
  return removePresentDayNodes(slots).map(slot => {
    if (slot.id !== 'this_month') return slot
    return {
      ...slot,
      inner: slot.inner.map(week => {
        if (week.id !== 'this_week') return week
        return { ...week, inner: [...PRESENT_DAY_SLOTS, ...week.inner] }
      })
    }
  })
}

/**
 * slotSelectDialog affiche l'arbre des slots en utilisant SlotTreeSelect.
 * transforme l'expression en selection, gère les handlers et calcule l'expr finale.
 * Génère les slots à afficher à partir de la conf et de la selection.
 * @param {*} param0 
 * @returns 
 */
export default function SlotSelectDialog({ selectionExpr, conf, onConfirm, onCancel, title }) {

  const [ selection, setSelection] = useState(exprToSelection(selectionExpr))
  // slotsFromConf dérivé de selection via useMemo (pas d'état séparé) : évite la désynchronisation
  // et les stale closures — les handlers utilisent setSelection(prev => ...) pour la même raison :
  // deux clics rapides sur des créneaux différents causaient la perte du premier créneau sélectionné.
  const slotsFromConf = useMemo(() => makeSlotWithSelection(conf, selection), [conf, selection])

  const handleConfirm = () => {
    const expression = selectionToExpr(selection)
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

  const handleClick = (pathExpr) => {
    setSelection(prev => selectionToggle(prev, pathExpr))
  }

  const handleRepetition = (path) => {
    setSelection(prev => selectionSetRepetition(prev, path))
  }

  const handleDisable = (path) => {
    setSelection(prev => selectionSetDisable(prev, path))
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
        {withPresentDaySlots(slotsFromConf).map((slot, index) => {
          return <SlotTreeSelect key={slot.id} slot={slot} selection={selection}
                    handleSelection={handleSelection}
                    handleShift={handleShift}
                    handleClick={handleClick}
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
      { import.meta.env.DEV && <div className='text-green-500'><span className='font-mono'>Debug output&nbsp;: {selectionToExpr(selection)}</span></div>}
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogActions>
  </Dialog>
  
}
