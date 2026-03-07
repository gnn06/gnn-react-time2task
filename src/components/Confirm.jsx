import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';

export default function Confirm({titre, children, handleConfirm, handleCancel}) {
    return <Dialog open={true}  maxWidth="lg" fullWidth={true} onClose={handleCancel} >
        <div className='p-5'>
            <div className='text-xl mb-3'>{titre}</div>
            {children}            
            <div className='flex flex-row justify-end space-x-1 mt-5'>
                <Button onClick={handleCancel} >Annuler</Button>
                <Button onClick={handleConfirm} >Confirmer</Button>
            </div>
        </div>
    </Dialog>
}