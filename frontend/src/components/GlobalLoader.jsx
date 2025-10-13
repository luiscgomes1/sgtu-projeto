import React from 'react';
import { FaBusAlt } from 'react-icons/fa';

export function GlobalLoader() {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-[100]">
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg shadow-xl border border-blue-200">
                <FaBusAlt className="text-4xl text-blue-600 animate-bounce mb-3" />
                <p className="text-lg text-blue-700 font-semibold">Carregando, por favor aguarde...</p>
            </div>
        </div>
    );
}