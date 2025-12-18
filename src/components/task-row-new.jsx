import CreateTask from './create-task';

export default function TaskNew () {

    const myClassName = 'rounded p-1 my-1 '
        + (false ? 
           'hover:bg-gray-300  bg-gray-400  border-gray-500 border-2'
         : 'hover:bg-green-100 bg-green-200 border-gray-500 border-2');
      
    return <tr className={myClassName} >
        <td></td>
        <td colSpan="8" className='p-2'><CreateTask /></td>
    </tr>
    
}