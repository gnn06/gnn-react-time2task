import React from "react";

export default function Button({clickToto, label}) {
    return (
        <button type="button"
            className="bg-gray-400 hover:bg-gray-500 text-black hover:text-white p-2 m-1 rounded"
            onClick={clickToto}
        >
            {label}
        </button>
    )        
}