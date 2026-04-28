import React from "react";

export function DashedColumnHeader({ children, className = "", style }) {
    return (
        <div className={`bg-gray-100 text-center ${className}`} style={{ borderTopWidth: 1, ...style }}>
            {children}
        </div>
    );
}

export function DashedRowHeader({ children, className = "" }) {
    return (
        <div style={{ writingMode: "sideways-lr", borderLeftWidth: 1,borderRightWidth: 1 }} className={`bg-gray-100 text-center ${className}`}>
            {children}
        </div>
    );
}

export function DashedCell({ children, className = "", style }) {
    return (
        <div className={`p-2 ${className}`} style={style}>
            {children}
        </div>
    );
}

export function DashedTable({ columns, children }) {
    return (
        <div
            className="inline-grid border-none divide-dashed border-gray-400 divide-gray-400 divide-x divide-y border-e-2 border-b-2 p-0 bg-white"
            style={{ gridTemplateColumns: `auto repeat(${columns}, 1fr)` }}
        >
            <div></div>
            {children}
        </div>
    );
}
