import React from "react";

export default function Button({clickToto, label}) {
    return (
        <button type="button"
            className="bg-gray-400 hover:bg-gray-500 text-black hover:text-white py-2 px-4 rounded"
            onClick={clickToto}
        >
            {label}
        </button>
    )        
}