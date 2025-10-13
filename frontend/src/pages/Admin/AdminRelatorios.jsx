import React, { useEffect, useState } from "react";
import api from "../../services/api";
import BotaoRelatorioCompleto from "../../components/BotaoRelatorioCompleto";
import DatePicker from "react-datepicker";
import { format, endOfMonth, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "../../hooks/useToast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";

export default function AdminRelatorios() {
  const [dataInicial, setDataInicial] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [dataFinal, setDataFinal] = useState(endOfMonth(dataInicial));
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const { showToast } = useToast();
  const validInterval = !intervalDurationInDays(dataInicial, dataFinal);

  useEffect(() => {
    carregarRelatorio();
  }, []);

  useEffect(() => {
    setDataFinal(endOfMonth(dataInicial));
  }, [dataInicial]);

  async function carregarRelatorio() {
    try {
      setLoading(true);
      if (intervalDurationInDays(dataInicial, dataFinal)) {
        showToast("error", "O intervalo entre as datas não pode ser maior que 31 dias.");
        return;
      }
      const { data } = await api.get("/relatorios/geral", {
      params: {
        dataInicial: format(dataInicial, "yyyy-MM-dd"),
        dataFinal: format(dataFinal, "yyyy-MM-dd"),
      },
    });
      setRelatorio(data);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setLoading(false);
    }
  }

  function intervalDurationInDays(dataInicial, dataFinal) {
    return Math.abs(differenceInCalendarDays(dataFinal, dataInicial)) > 31;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">📊 Relatórios Gerais</h1>
        <BotaoRelatorioCompleto
          dataInicial={format(dataInicial, "yyyy-MM-dd")}
          dataFinal={format(dataFinal, "yyyy-MM-dd")}
        />
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex flex-col">
          <label className="text-sm ml-2 font-medium text-gray-600">Data Inicial:</label>
          <DatePicker
            selected={dataInicial}
            onChange={(date) => setDataInicial(date)}
            dateFormat="dd/MM/yyyy"
            locale={ptBR}
            className="border px-2 py-1 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm ml-2 font-medium text-gray-600">Data Final:</label>
          <DatePicker
            selected={dataFinal}
            onChange={(date) => setDataFinal(date)}
            dateFormat="dd/MM/yyyy"
            locale={ptBR}
            className="border px-2 py-1 rounded-md"
          />
        </div>

        <button
          onClick={carregarRelatorio}
          disabled={!validInterval || loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md self-end"
        >
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        </div>
      ) : relatorio ? (
        <div className="space-y-8">
          {/* 🔹 Totais */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <CardInfo label="Alunos Ativos" valor={relatorio.totals.alunos} />
            <CardInfo label="Motoristas Ativos" valor={relatorio.totals.motoristas} />
            <CardInfo label="Rotas Ativas" valor={relatorio.totals.rotas} />
            <CardInfo label="Faculdades Ativas" valor={relatorio.totals.faculdades} />
            <CardInfo label="Presenças no Mês" valor={relatorio.presencasMes} />
          </div>

          {/* 🔹 Top Faculdades */}
          <SectionTitulo titulo="Top 5 Faculdades com mais Presenças" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={relatorio.topFaculdades}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>

          {/* 🔹 Top Cursos */}
          <SectionTitulo titulo="Top 5 Cursos com mais Presenças" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={relatorio.topCursos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-500">Nenhum dado encontrado.</p>
      )}
    </div>
  );
}

function CardInfo({ label, valor }) {
  return (
    <div className="bg-white border rounded-md p-4 shadow-sm text-center">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{valor ?? 0}</p>
    </div>
  );
}

function SectionTitulo({ titulo }) {
  return <h2 className="text-lg font-semibold text-gray-700 mt-6">{titulo}</h2>;
}
