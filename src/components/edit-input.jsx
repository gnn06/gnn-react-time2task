export default function InputEdit({defaultValue, saveHandler, className}) {
    const onOrderKeyPressed = e => {
        if (e.keyCode === 13) { // ENTER
            saveHandler(e)
        }
    };
    const noPropagation = (e) => {
        e.stopPropagation();
    }
    return <input defaultValue={defaultValue} onKeyDown={onOrderKeyPressed} onBlur={saveHandler} onClick={noPropagation} 
                  className={"bg-transparent " + className}/>
}