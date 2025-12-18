import { IconButton, Typography } from '@mui/material';
import TaskInSlot from './task-in-slot';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

export default function Test() {    
    const tasks = [
        { id: "task1", title: "Task 1 lorem ipsum", slotExpr: "this_month this_week mercredi", activity: 4, order: 1,status:'A faire' },
        { id: "task2", title: "préparer COPIL IFG / travailler slide", slotExpr: "this_month this_week mercredi", activity: null, order: 3,status:'fait-à repositionner' },
        { id: "task3", title: "Task 3", slotExpr: "this_month next_month", activity: null, order: 5, status:'fait' }
    ];
    
    return <div className='w-[338px] flex flex-row'>
        <div className='bg-red-500'>qsdqsd</div>
        <AcUnitIcon />
        <IconButton ><AccessAlarmIcon  /></IconButton>
    </div>
}
