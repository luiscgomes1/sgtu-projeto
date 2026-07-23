import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react";

const iconMap = {
  FaSort: <ArrowUpDown className="text-muted-foreground h-4 w-4" />,
  FaSortUp: <ArrowUp className="text-muted-foreground h-4 w-4" />,
  FaSortDown: <ArrowDown className="text-muted-foreground h-4 w-4" />,
};

function cleanStatus(status) {
  return String(status || "").toUpperCase().replace(/['":;]/g, "").replace(/TEXT/g, "").trim();
}

export default function RotaTable({
  data, loading, total, page, limit, totalPages, offset, onPageChange,
  filterStatus, onFilterChange, requestSort, getSortIcon, onView,
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div />
        <Select value={filterStatus} onValueChange={onFilterChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => requestSort("nome")}>
                  <span className="flex items-center gap-1">
                    Nome da Rota {iconMap[getSortIcon("nome")]}
                  </span>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort("status")}>
                  <span className="flex items-center gap-1">
                    Status {iconMap[getSortIcon("status")]}
                  </span>
                </TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Nenhuma rota encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((rota) => {
                  const statusExibicao = cleanStatus(rota.status);
                  const isAtivo = statusExibicao === "ATIVO";
                  return (
                    <TableRow key={rota.id}>
                      <TableCell className="font-medium">{rota.nome}</TableCell>
                      <TableCell>
                        <Badge variant={isAtivo ? "default" : "secondary"}>
                          {isAtivo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => onView(rota)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {Math.min(total, offset + 1)}–{Math.min(total, offset + limit)} de {total}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          <span className="px-2">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}>
            Próxima
          </Button>
        </div>
      </div>
    </>
  );
}
