import { useState } from "react";
import {
  FaTimes,
  FaEdit,
  FaSave,
  FaBan,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import ConfirmDiscardModal from "./ConfirmDiscardModal";

export default function AdminDetailModal({
  title,
  children,
  details,
  isProcessing,
  formData,
  onClose,
  onSave,
  onToggleStatus,
  onCancel,
  editMode,
  setEditMode,
}) {
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const hasChanges = Object.keys(formData || {}).some((key) => {
    if (key === "status") return false;
    return String(formData[key] || "") !== String(details?.[key] || "");
  });

  const handleClose = (e) => {
    if (e.target !== e.currentTarget) return;

    if (hasChanges) {
      setShowDiscardModal(true);
      return;
    }
    onClose();
  };

  const handleExitClick = () => {
    if (hasChanges) {
      setShowDiscardModal(true);
      return;
    }
    onClose();
  };

  const handleDiscardAndClose = () => {
    if(editMode) {
        onCancel();
    }
    onClose();
  };

  const handleCancelEditButton = () => {
    if (hasChanges) {
        setShowDiscardModal(true);
        return;
    }
    setEditMode(false);
    onCancel();
  }

  const currentStatus = String(details?.status || "")
    .toUpperCase()
    .trim();
  const statusColor = currentStatus === "ATIVO" ? "bg-green-600" : "bg-red-600";

  const renderActionButtons = () => {
    if (editMode) {
      return (
        <div className="flex gap-3">
          <button
            onClick={onSave}
            disabled={isProcessing || !hasChanges}
            className={`flex-1 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              hasChanges
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            } text-white disabled:opacity-50`}
          >
            <FaSave />
            {isProcessing ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button
            onClick={handleCancelEditButton}
            disabled={isProcessing}
            className="w-1/3 bg-red-500 flex items-center justify-center gap-2 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
          >
            <FaBan /> Cancelar
          </button>
        </div>
      );
    } else {
      return (
        <>
          <button
            onClick={() => setEditMode(true)}
            disabled={isProcessing}
            className="w-full py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
          >
            <FaEdit /> Editar Dados
          </button>
          <button
            onClick={onToggleStatus}
            disabled={isProcessing}
            className={`w-full py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              currentStatus === "ATIVO"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white disabled:opacity-50`}
          >
            {currentStatus === "ATIVO" ? <FaToggleOff /> : <FaToggleOn />}
            {currentStatus === "ATIVO" ? "Desativar" : "Ativar"}
          </button>
        </>
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            {title}
          </h3>
          <button
            onClick={handleExitClick}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm font-medium text-gray-500">
            ID: {details?.id || details?.usuario_id}
          </p>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColor}`}
          >
            {currentStatus}
          </span>
        </div>

        <div className="space-y-4">{children}</div>

        <div className="flex flex-col gap-3 mt-6 justify-end">
          {renderActionButtons()}
        </div>
      </div>

      {showDiscardModal && (
        <ConfirmDiscardModal
          onCancel={() => setShowDiscardModal(false)}
          onConfirm={handleDiscardAndClose}
        />
      )}
    </div>
  );
}
