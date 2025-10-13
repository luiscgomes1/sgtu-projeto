import React, { createContext, useState, useCallback } from 'react';
//                                        ↑ adiciona useCallback
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    }, []); // ← função estável agora!

    const ToastContainer = () => {
        if (!toast) return null;
        
        const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl z-[90] flex items-center gap-3 font-semibold transition-all duration-300";
        
        let classes = "";
        let Icon = FaInfoCircle;

        if (toast.type === 'success') {
            classes = "bg-green-600 text-white";
            Icon = FaCheckCircle;
        } else if (toast.type === 'error') {
            classes = "bg-red-600 text-white";
            Icon = FaTimesCircle;
        } else if (toast.type === 'info') {
            classes = "bg-blue-600 text-white";
            Icon = FaInfoCircle;
        } else if (toast.type === 'warning') {
            classes = "bg-yellow-500 text-black";
            Icon = FaExclamationTriangle;
        } else {
            classes = "bg-gray-700 text-white";
        }

        return (
            <div className={`${baseClasses} ${classes}`}>
                <Icon className="text-xl" />
                <span>{toast.message}</span>
            </div>
        );
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
}

export { ToastContext };