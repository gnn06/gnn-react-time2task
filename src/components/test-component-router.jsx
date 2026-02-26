import { useParams } from 'react-router-dom'
import TestTaskDialog from './_stories_/test-task-dialog'
import TestTaskInSLot from './_stories_/test-task-in-slot'
import TestFilter from './_stories_/test-filter'
import TestSlotPicker from './_stories_/test-slot-picker'
import TestSlotPickerButton from './_stories_/test-slot-picker-button'

// Mapping des composants de test
const testComponents = {
  taskdialog: TestTaskDialog,
  taskinslot: TestTaskInSLot,
  filter: TestFilter,
  slotselect: TestSlotPicker,
  slotpickerbutton: TestSlotPickerButton
  // Ajoutez autant de composants que vous voulez
}

function TestComponentRouter() {
  const { componentName } = useParams()
  const Component = testComponents[componentName?.toLowerCase()]
  
  if (!Component) {
    return <div>Composant de test non trouvé: {componentName}</div>
  }
  
  return <Component />
}

export default TestComponentRouter