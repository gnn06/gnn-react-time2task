import { Dialog, Button } from '@mui/material';
 
import Confirm from './Confirm.jsx'
import { useTodoAction } from '../hooks/useTodoAction.js';

export default function TodoAction() {
    const {
        tasks,
        show,
        updateError,
        hideErrorDialog,
        onTodo,
        handleTodoCancel,
        handleTodoConfirm,
        handleErrorDialogConfirm
    } = useTodoAction();


    return <div className="grow">
        <Button variant='outlined' onClick={onTodo} >Todo</Button>
        { updateError && !hideErrorDialog &&
                    <Dialog open={true} data-testid="error-dialog">
                        <div className='p-3'>
                            <div className='text-xl mb-3'>Une erreur est survenue</div>
                            {updateError.data.message}
                            <div className='flex flex-row justify-end space-x-1 mt-5'>
                                <Button  onClick={handleErrorDialogConfirm} >OK</Button>
                            </div>
                        </div>
                    </Dialog> }
        { show && 
            <Confirm 
                titre="Confirmez-vous le passage à l'état 'à faire' ?" 
                handleConfirm={handleTodoConfirm}
                handleCancel={handleTodoCancel}
            >
                {`Les ${tasks.length} tâches visibles n'étant pas déjà 'à faire' vont être passées à 'à faire'.`}
            </Confirm> }
    </div>

}