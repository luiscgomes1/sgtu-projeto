export function shouldShowFull(requester, ownerId) {
  return requester?.tipo === 'admin' || requester?.id === ownerId;
}

export function maskCpf(cpf) {
  if (!cpf) return cpf;
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

export function maskRg(rg) {
  if (!rg) return rg;
  return rg.replace(/[^a-zA-Z0-9]/g, '').length > 2
    ? `**.***.${rg.replace(/\D/g, '').slice(-2)}`
    : rg;
}

export function maskTelefone(telefone) {
  if (!telefone) return telefone;
  const digits = telefone.replace(/\D/g, '');
  if (digits.length < 10) return telefone;
  const ddd = digits.length >= 11 ? digits.slice(0, 2) : digits.slice(0, 2);
  const finais = digits.slice(-4);
  return `(${ddd})*****-${finais}`;
}

const alunoFields = ['cpf', 'rg', 'telefone'];
const motoristaFields = ['cpf', 'telefone'];

export function maskAluno(aluno, requester) {
  if (!aluno) return aluno;
  const full = shouldShowFull(requester, aluno.usuarioId);
  if (full) return aluno;
  for (const field of alunoFields) {
    if (aluno[field]) {
      if (field === 'cpf') aluno[field] = maskCpf(aluno[field]);
      else if (field === 'rg') aluno[field] = maskRg(aluno[field]);
      else if (field === 'telefone') aluno[field] = maskTelefone(aluno[field]);
    }
  }
  return aluno;
}

export function maskMotorista(motorista, requester) {
  if (!motorista) return motorista;
  const full = shouldShowFull(requester, motorista.id);
  if (full) return motorista;
  for (const field of motoristaFields) {
    if (motorista[field]) {
      if (field === 'cpf') motorista[field] = maskCpf(motorista[field]);
      else if (field === 'telefone') motorista[field] = maskTelefone(motorista[field]);
    }
  }
  return motorista;
}
