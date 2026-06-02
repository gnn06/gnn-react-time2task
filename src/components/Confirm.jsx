import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';

export default function Confirm({titre, children, handleConfirm, handleCancel, handleDelete}) {
    return <Dialog open={true}  maxWidth="lg" fullWidth={true} onClose={handleCancel} data-testid="confirm-dialog">
        <div className='p-5'>
            <div className='text-xl mb-3'>{titre}</div>
            {children}
            <div className='flex flex-row justify-between mt-5'>
                <div>
                    {handleDelete && <Button onClick={handleDelete} color="error">Supprimer</Button>}
                </div>
                <div className='flex flex-row space-x-1'>
                    <Button onClick={handleCancel}>Annuler</Button>
                    <Button onClick={handleConfirm}>Confirmer</Button>
                </div>
            </div>
        </div>
    </Dialog>
}