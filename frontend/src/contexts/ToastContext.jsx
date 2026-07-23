import React, { createContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext();

function ToastContainer({ toast }) {
    if (!toast) return null;

    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl z-[90] flex items-center gap-3 font-semibold transition-all duration-300";
    let classes = "";
    let Icon = Info;

    if (toast.type === 'success') {
        classes = "bg-green-600 text-white";
        Icon = CheckCircle2;
    } else if (toast.type === 'error') {
        classes = "bg-red-600 text-white";
        Icon = XCircle;
    } else if (toast.type === 'info') {
        classes = "bg-blue-600 text-white";
        Icon = Info;
    } else if (toast.type === 'warning') {
        classes = "bg-yellow-500 text-black";
        Icon = AlertTriangle;
    } else {
        classes = "bg-gray-700 text-white";
    }

    return (
        <div className={`${baseClasses} ${classes}`}>
            <Icon className="text-xl" />
            <span>{toast.message}</span>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toast={toast} />
        </ToastContext.Provider>
    );
}

export { ToastContext };
