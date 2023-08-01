import React from "react";

export default function Button({clickToto, label}) {
    return (
        <button type="button"
            className="bg-gray-400 text-black hover:bg-gray-300 p-2 m-0 rounded"
            onClick={clickToto}
        >
            {label}
        </button>
    )        
}