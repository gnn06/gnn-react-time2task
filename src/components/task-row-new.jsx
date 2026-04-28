import CreateTask from './create-task';

export default function TaskNew () {

    const myClassName = 'rounded p-1 my-1';
      
    return <tr className={myClassName} >
        <td></td>
        <td colSpan="9" className='p-2'><CreateTask /></td>
    </tr>
    
}