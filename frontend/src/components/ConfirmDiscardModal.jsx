import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export default function ConfirmDiscardModal({ onConfirm, onCancel }) {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]"
            onClick={onCancel} // Fecha ao clicar fora
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
                onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar no modal
            >
                <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                        <FaExclamationTriangle /> Descartar Alterações?
                    </h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">
                        <FaTimes />
                    </button>
                </div>

                <p className="text-gray-700 mb-6">
                    Você possui alterações não salvas. Deseja descartar as mudanças e fechar?
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                    >
                        Não, Continuar Editando
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        Sim, Descartar
                    </button>
                </div>
            </div>
        </div>
    );
}