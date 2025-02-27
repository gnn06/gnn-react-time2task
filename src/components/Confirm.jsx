import Dialog from '@mui/material/Dialog';

import Button from "./button";

export default function Confirm({titre, children, handleConfirm, handleCancel}) {
    return <Dialog open={true} maxWidth="lg" onClose={handleCancel} >
        <div className='p-5'>
            <div className='text-xl mb-3'>{titre}</div>
            {children}            
            <div className='flex flex-row justify-end space-x-1 mt-5'>
                <Button label="Annuler" clickToto={handleCancel} />
                <Button label="Confirmer" clickToto={handleConfirm} />
            </div>
        </div>
    </Dialog>
}