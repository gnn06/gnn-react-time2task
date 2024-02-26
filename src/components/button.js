import React from "react";

export default function Button({clickToto, label, className, type = 'button'}) {
    
    return (
        <button type={type}
            className={"bg-gray-400 text-black hover:bg-gray-300 p-1 m-0 rounded " + className}
            onClick={clickToto}
        >
            {label}
        </button>
    )
}        