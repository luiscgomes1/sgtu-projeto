export function formatCPF(cpf) {
  if (!cpf) return "";
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatTelefone(telefone) {
  if (!telefone) return "";
  const cleaned = telefone.replace(/\D/g, "");
  if (cleaned.length === 11)
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (cleaned.length === 10)
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return telefone;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR");
}

export function cleanNumeric(value) {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

export function cleanString(value) {
  if (!value) return "";
  return value.trim().replace(/\s+/g, " ");
}

export function formatTime(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR");
  } catch {
    return dateString;
  }
}

export function joinEndereco(parts) {
  return [parts.enderecoRua, parts.enderecoNumero, parts.enderecoBairro, parts.enderecoCidade]
    .map((p) => p.trim()).filter(Boolean).join(", ");
}

export function parseEndereco(endereco) {
  if (!endereco) return { enderecoRua: "", enderecoNumero: "", enderecoBairro: "", enderecoCidade: "" };
  const partes = endereco.split(",").map((p) => p.trim());
  return { enderecoRua: partes[0] || "", enderecoNumero: partes[1] || "", enderecoBairro: partes[2] || "", enderecoCidade: partes[3] || "" };
}
