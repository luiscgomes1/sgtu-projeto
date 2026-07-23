function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const s = String(dateString).slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
            const [year, month, day] = s.split('-');
            return `${day}/${month}/${year}`;
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (e) {
        return dateString;
    }
}

function formatCPF(cpf) {
    if (!cpf) return 'N/A';
    // Remove tudo que não for número
    cpf = cpf.replace(/\D/g, '');
    // Formata como "XXX.XXX.XXX-XX"
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatTelefone(telefone) {
    if (!telefone) return 'N/A';
    // Remove tudo que não for número
    telefone = telefone.replace(/\D/g, '');
    // Formata como "(XX) XXXXX-XXXX"
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

function cleanString(str) {
    if (typeof str !== 'string' || !str) return null;
    // Remove espaços em excesso no início e fim
    // E substitui múltiplos espaços por um único
    return str.trim().replace(/\s\s+/g, ' ');
}

function cleanNumeric(str) {
    if (typeof str !== 'string' || !str) return null;
    return str.replace(/\D/g, ''); // Remove todos os não-dígitos
}

const drawSeparator = (doc, y, color = '#cccccc') => {
    doc.fill(color).rect(50, y, 500, 0.5).fill();
};

const daysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR');
    } catch (e) {
        return dateString;
    }
};

function formatHHMM(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

const formatNumber = (num) => (num || 0).toLocaleString('pt-BR');

function truncDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export { formatDate, formatCPF, formatTelefone, drawSeparator, formatNumber, cleanString, cleanNumeric, daysBetween, formatTime, formatHHMM, truncDate };