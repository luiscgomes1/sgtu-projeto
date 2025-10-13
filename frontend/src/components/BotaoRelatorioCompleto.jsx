import { useState } from "react";
import api from "../services/api.js";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";

export default function BotaoRelatorioCompleto({ dataInicial, dataFinal }) {
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const handleDownload = async (tipo) => {
    try {
      setLoading(true);

      const endpoint =
        tipo === "pdf"
          ? `/relatorios/completo/pdf?dataInicial=${dataInicial}&dataFinal=${dataFinal}`
          : `/relatorios/completo/excel?dataInicial=${dataInicial}&dataFinal=${dataFinal}`;

      // 🔹 Importante: informar que é arquivo binário
      const { data } = await api.get(endpoint, { responseType: "blob" });

      // 🔹 Monta nome e tipo do arquivo
      const fileName =
        tipo === "pdf"
          ? `relatorio_completo_${dataInicial}_a_${dataFinal}.pdf`
          : `relatorio_completo_${dataInicial}_a_${dataFinal}.xlsx`;

      const blob = new Blob([data], {
        type: tipo === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // 🔹 Cria URL temporária e força o download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert("Erro ao gerar o relatório. Verifique o console.");
    } finally {
      setLoading(false);
      setOpenMenu(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpenMenu(!openMenu)}
        disabled={loading}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2 ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {loading ? "Gerando..." : "Gerar Relatório Completo"}
      </button>

      {openMenu && !loading && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
          <button
            onClick={() => handleDownload("pdf")}
            className="flex items-center w-full px-3 py-2 hover:bg-gray-100 text-sm text-gray-700"
          >
            <FileText className="w-4 h-4 mr-2 text-red-500" />
            Baixar PDF
          </button>
          <button
            onClick={() => handleDownload("excel")}
            className="flex items-center w-full px-3 py-2 hover:bg-gray-100 text-sm text-gray-700"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
            Baixar Excel
          </button>
        </div>
      )}
    </div>
  );
}