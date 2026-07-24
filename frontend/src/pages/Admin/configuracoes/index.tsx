import { useEffect, useState, useRef } from "react";
import api from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Settings, Upload, ImageIcon } from "lucide-react";

export default function AdminConfiguracoes() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [horaLimite, setHoraLimite] = useState("");
  const [horaInicioIda, setHoraInicioIda] = useState("");
  const [horaFimIda, setHoraFimIda] = useState("");
  const [horaInicioVolta, setHoraInicioVolta] = useState("");
  const [horaFimVolta, setHoraFimVolta] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [nomeOrganizacao, setNomeOrganizacao] = useState("");

  function timeToString(t) {
    if (!t) return "";
    const d = new Date(t);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/configuracoes");
        setHoraLimite(timeToString(data.horaLimitePresenca));
        setHoraInicioIda(timeToString(data.horaInicioIda));
        setHoraFimIda(timeToString(data.horaFimIda));
        setHoraInicioVolta(timeToString(data.horaInicioVolta));
        setHoraFimVolta(timeToString(data.horaFimVolta));
        setLogoUrl(data.logoUrl || "");
        setNomeOrganizacao(data.nomeOrganizacao || "");
      } catch {
        showToast("error", "Erro ao carregar configurações.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(field, value, endpoint, bodyKey) {
    setSaving(field);
    try {
      await api.put(endpoint, { [bodyKey]: value });
      showToast("success", `${field} atualizado com sucesso.`);
    } catch (err) {
      showToast("error", err.response?.data?.error || `Erro ao atualizar ${field}.`);
    } finally {
      setSaving(null);
    }
  }

  async function handleLogoUpload() {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("logo", selectedFile);

    setSaving("logo");
    try {
      const { data } = await api.post("/configuracoes/logo/upload", formData, {
        headers: { "Content-Type": undefined },
      });
      setLogoUrl(data.logoUrl || "");
      setLogoPreview(null);
      setSelectedFile(null);
      showToast("success", "Logo enviada com sucesso.");
    } catch (err) {
      showToast("error", err.response?.data?.error || "Erro ao enviar logo.");
    } finally {
      setSaving(null);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const hasHorarios = horaInicioIda || horaFimIda || horaInicioVolta || horaFimVolta;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hora limite para marcar presença</label>
              <div className="flex gap-2">
                <Input type="time" value={horaLimite} onChange={(e) => setHoraLimite(e.target.value)} placeholder="HH:mm" />
                <Button size="sm" onClick={() => handleSave("hora limite", horaLimite, "/configuracoes/hora-limite", "horaLimite")} disabled={!horaLimite || saving === "hora limite"}>
                  {saving === "hora limite" ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Início confirmação (ida)
                {!horaInicioIda && <Badge variant="outline" className="text-xs">Não configurado</Badge>}
              </label>
              <Input type="time" value={horaInicioIda} onChange={(e) => setHoraInicioIda(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Fim confirmação (ida)
                {!horaFimIda && <Badge variant="outline" className="text-xs">Não configurado</Badge>}
              </label>
              <Input type="time" value={horaFimIda} onChange={(e) => setHoraFimIda(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Início confirmação (volta)
                {!horaInicioVolta && <Badge variant="outline" className="text-xs">Não configurado</Badge>}
              </label>
              <Input type="time" value={horaInicioVolta} onChange={(e) => setHoraInicioVolta(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Fim confirmação (volta)
                {!horaFimVolta && <Badge variant="outline" className="text-xs">Não configurado</Badge>}
              </label>
              <Input type="time" value={horaFimVolta} onChange={(e) => setHoraFimVolta(e.target.value)} />
            </div>
          </div>

          <Button
            onClick={async () => {
              setSaving("horários de viagem");
              try {
                await api.put("/configuracoes/horarios-viagem", { horaInicioIda, horaFimIda, horaInicioVolta, horaFimVolta });
                showToast("success", "Horários atualizados com sucesso.");
              } catch (err) {
                showToast("error", err.response?.data?.error || "Erro ao atualizar horários.");
              } finally {
                setSaving(null);
              }
            }}
            disabled={!hasHorarios || saving === "horários de viagem"}
          >
            {saving === "horários de viagem" ? "Salvando..." : "Salvar Horários"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome da Organização</label>
            <div className="flex gap-2">
              <Input value={nomeOrganizacao} onChange={(e) => setNomeOrganizacao(e.target.value)} placeholder="Ex: Prefeitura Municipal de Pirajuba" />
              <Button size="sm" onClick={() => handleSave("nome da organização", nomeOrganizacao, "/configuracoes/nome-organizacao", "nomeOrganizacao")} disabled={!nomeOrganizacao || saving === "nome da organização"}>
                {saving === "nome da organização" ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Logo
              {!logoUrl && !logoPreview && <Badge variant="outline" className="text-xs">Nenhuma</Badge>}
            </label>
            {(logoPreview || logoUrl) && (
              <div className="mb-3">
                <img src={logoPreview || logoUrl} alt="Logo" className="max-h-20 rounded border" />
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={saving === "logo"}>
                <Upload className="mr-2 h-4 w-4" />
                Selecionar Imagem
              </Button>
              {selectedFile && (
                <Button onClick={handleLogoUpload} disabled={saving === "logo"}>
                  {saving === "logo" ? "Enviando..." : "Enviar"}
                </Button>
              )}
              {!logoPreview && !logoUrl && !selectedFile && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <ImageIcon className="mr-1 h-4 w-4" />
                  Nenhum logo configurado
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
