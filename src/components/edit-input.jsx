export default function InputEdit({defaultValue, saveHandler, className}) {
    const onOrderKeyPressed = e => {
        if (e.code === 'Enter' || e.code === 'NumpadEnter') { // ENTER
            saveHandler(e)
        }
    };
    const noPropagation = (e) => {
        e.stopPropagation();
    }
    return <input defaultValue={defaultValue} onKeyDown={onOrderKeyPressed} onBlur={saveHandler} onClick={noPropagation} 
                  className={"border p-1 bg-transparent " + className}/>
}