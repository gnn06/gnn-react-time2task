export function composeFuncAnd(funcsArray) {
    
    if (funcsArray.length === 0) {
        return (item) => true
    } else if (funcsArray.length === 1) {
        return funcsArray.reduce((accumultaeur, func) => (value, concat) => accumultaeur(value) && func(value))
    } else {
        return funcsArray.reduce((accumultaeur, func) => (value, concat) => accumultaeur(value) && func(value))
    }
}