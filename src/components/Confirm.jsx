import Dialog from '@mui/material/Dialog';

import Button from "./button";

export default function Confirm({titre, children, handleConfirm, handleCancel}) {
    return <Dialog open={true} maxWidth="xl" onClose={handleCancel} >
        <div className='p-3'>
            <div className='text-xl mb-3'>{titre}</div>
            <div>{children}</div>            
            <div className='flex flex-row justify-end space-x-1 mt-5'>
                <Button label="Annuler" clickToto={handleCancel} />
                <Button label="Confirmer" clickToto={handleConfirm} />
            </div>
        </div>
    </Dialog>
}