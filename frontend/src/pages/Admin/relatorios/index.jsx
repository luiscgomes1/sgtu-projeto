import { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import { format, subDays, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

import {
  Users, Truck, Route, Building2, CalendarCheck, Download, FileText,
  FileSpreadsheet, RefreshCw, Loader2, AlertCircle,
} from "lucide-react";

const periodos = [
  { label: "Este Mês", days: 0 },
  { label: "Últimos 30 Dias", days: 30 },
  { label: "Últimos 7 Dias", days: 7 },
  { label: "Este Ano", days: "ano" },
];

export default function AdminRelatorios() {
  const { showToast } = useToast();
  const [dataInicial, setDataInicial] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dataFinal, setDataFinal] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [erro, setErro] = useState(null);

  const carregarRelatorio = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const params = {
        dataInicial: format(dataInicial, "yyyy-MM-dd"),
        dataFinal: format(dataFinal, "yyyy-MM-dd"),
      };
      const { data } = await api.get("/relatorios/geral", { params });
      setRelatorio(data);
    } catch (err) {
      const msg = err.response?.data?.error || "Erro ao carregar relatório.";
      setErro(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [dataInicial, dataFinal, showToast]);

  useEffect(() => {
    carregarRelatorio();
  }, [carregarRelatorio]);

  function aplicarPeriodo(tipo) {
    const hoje = new Date();
    if (tipo === "ano") {
      setDataInicial(startOfYear(hoje));
      setDataFinal(hoje);
    } else if (tipo === 0) {
      setDataInicial(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
      setDataFinal(hoje);
    } else {
      setDataInicial(subDays(hoje, tipo));
      setDataFinal(hoje);
    }
  }

  async function handleExport(tipo) {
    setExportLoading(true);
    try {
      const params = `dataInicial=${format(dataInicial, "yyyy-MM-dd")}&dataFinal=${format(dataFinal, "yyyy-MM-dd")}`;
      const endpoint = tipo === "pdf"
        ? `/relatorios/completo/pdf?${params}`
        : `/relatorios/completo/excel?${params}`;

      const { data } = await api.get(endpoint, { responseType: "blob" });

      const ext = tipo === "pdf" ? "pdf" : "xlsx";
      const mime = tipo === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const fileName = `relatorio_completo_${format(dataInicial, "yyyy-MM-dd")}_a_${format(dataFinal, "yyyy-MM-dd")}.${ext}`;

      const blob = new Blob([data], { type: mime });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("error", "Erro ao gerar relatório.");
    } finally {
      setExportLoading(false);
    }
  }

  const kpis = relatorio ? [
    { label: "Alunos Ativos", valor: relatorio.totals?.alunos, icon: Users, cor: "text-primary bg-primary/10" },
    { label: "Motoristas Ativos", valor: relatorio.totals?.motoristas, icon: Truck, cor: "text-amber-500 bg-amber-500/10" },
    { label: "Rotas Ativas", valor: relatorio.totals?.rotas, icon: Route, cor: "text-emerald-500 bg-emerald-500/10" },
    { label: "Faculdades Ativas", valor: relatorio.totals?.faculdades, icon: Building2, cor: "text-purple-500 bg-purple-500/10" },
    { label: "Presenças no Período", valor: relatorio.presencasMes, icon: CalendarCheck, cor: "text-rose-500 bg-rose-500/10" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={exportLoading || !relatorio}>
                {exportLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {exportLoading ? "Gerando..." : "Exportar"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={exportLoading}>
                <FileText className="mr-2 h-4 w-4 text-red-500" /> Baixar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")} disabled={exportLoading}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Baixar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Data Inicial</label>
              <DatePicker
                selected={dataInicial}
                onChange={(d) => setDataInicial(d)}
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
                className="flex h-9 w-40 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Data Final</label>
              <DatePicker
                selected={dataFinal}
                onChange={(d) => setDataFinal(d)}
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
                className="flex h-9 w-40 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              />
            </div>
            <Button variant="outline" size="sm" onClick={carregarRelatorio} disabled={loading}>
              <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <div className="flex gap-1.5 ml-2 flex-wrap">
              {periodos.map((p) => (
                <Badge
                  key={p.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => aplicarPeriodo(p.days)}
                >
                  {p.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && !relatorio ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : erro ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-lg font-medium text-destructive">{erro}</p>
          </CardContent>
        </Card>
      ) : relatorio ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${kpi.cor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className="text-2xl font-bold">{kpi.valor ?? 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 5 Faculdades</CardTitle>
              </CardHeader>
              <CardContent>
                {relatorio.topFaculdades?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={relatorio.topFaculdades}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado no período.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 5 Cursos</CardTitle>
              </CardHeader>
              <CardContent>
                {relatorio.topCursos?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={relatorio.topCursos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado no período.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {(relatorio.topFaculdades?.length > 0 || relatorio.topCursos?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ranking Detalhado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Faculdades</p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">#</TableHead>
                          <TableHead>Faculdade</TableHead>
                          <TableHead className="text-right">Presenças</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatorio.topFaculdades?.map((f, i) => (
                          <TableRow key={f.nome}>
                            <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                            <TableCell>{f.nome}</TableCell>
                            <TableCell className="text-right font-medium">{f.total}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Cursos</p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">#</TableHead>
                          <TableHead>Curso</TableHead>
                          <TableHead className="text-right">Presenças</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatorio.topCursos?.map((c, i) => (
                          <TableRow key={c.nome}>
                            <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                            <TableCell>{c.nome}</TableCell>
                            <TableCell className="text-right font-medium">{c.total}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            Selecione um período e clique em "Atualizar".
          </CardContent>
        </Card>
      )}
    </div>
  );
}
