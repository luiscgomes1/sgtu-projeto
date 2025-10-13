function normalizarUsuario(usuario) {
    return {
        id: usuario.id,
        usuario_id: usuario.usuario_id || usuario.usuarios?.id || null,
        nome: usuario.nome || usuario.usuarios?.nome || null,
        email: usuario.email || usuario.usuarios?.email || null,
        tipo: usuario.tipo || usuario.usuarios?.tipo || null,
        status: usuario.status || usuario.usuarios?.status || null,
        status_cadastro: usuario.status_cadastro || usuario.alunos?.status_cadastro || null,
        rg: usuario.rg || null,
        cpf: usuario.cpf || null,
        telefone: usuario.telefone || null,
        data_nascimento: usuario.data_nascimento || null,
        endereco: usuario.endereco || null,
        tipo_sanguineo: usuario.tipo_sanguineo || null,
        curso_id: usuario.curso_id || null,
        curso_nome: usuario.cursos?.nome || usuario.curso_nome || usuario.alunos?.cursos?.nome || null,
        faculdade_id: usuario.cursos?.faculdade_id || usuario.faculdade_id || usuario.alunos?.cursos?.faculdade_id || null,
        faculdade_nome: usuario.cursos?.faculdades?.nome || usuario.faculdade_nome || usuario.alunos?.cursos?.faculdades?.nome || null,
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        // Se for só "YYYY-MM-DD", trata como local
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        // Se for ISO completo, usa o Date normalmente
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

export { normalizarUsuario, formatDate, formatCPF, formatTelefone, drawSeparator, formatNumber, cleanString, cleanNumeric, daysBetween, formatTime, formatHHMM };