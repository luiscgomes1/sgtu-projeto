import { supabase } from '../../config/supabase.js';

export async function vincularAlunoPonto(alunoId, pontoId) {
    await supabase
        .from('alunos_pontos')
        .update({ status: "inativo" })
        .eq('aluno_id', alunoId)
        .eq('status', 'ativo');

    const { data: existing } = await supabase
        .from('alunos_pontos')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('ponto_id', pontoId)
        .maybeSingle();

    if (existing) {
        const { data, error } = await supabase
            .from('alunos_pontos')
            .update({ status: 'ativo' })
            .eq('aluno_id', alunoId)
            .eq('ponto_id', pontoId)
            .select()
            .single();
        if (error) throw error;
        return { message: "Vínculo reativado com sucesso.", data };
    }

    const { data, error } = await supabase
        .from('alunos_pontos')
        .insert([{ aluno_id: alunoId, ponto_id: pontoId, status: 'ativo' }])
        .select()
        .single();
    if (error) throw error;
    return { message: "Aluno vinculado ao ponto com sucesso.", data };
}

export async function desvincularAlunoPonto(alunoId, pontoId) {
    const { error } = await supabase
        .from('alunos_pontos')
        .update({ status: 'inativo' })
        .eq('aluno_id', alunoId)
        .eq('ponto_id', pontoId)
        .eq('status', 'ativo');
    if (error) throw error;
    return { message: "Aluno desvinculado do ponto com sucesso." };
}

export async function listarPontoDoAluno(alunoId) {
    // 1. Busca o ponto ativo do aluno
    const { data: alunoPonto, error } = await supabase
        .from('alunos_pontos')
        .select('id, status, aluno_id, ponto_id, pontos(id, nome, endereco)')
        .eq('aluno_id', alunoId)
        .eq('status', 'ativo')
        .maybeSingle();
    if (error) throw error;
    if (!alunoPonto) return null;

    // 2. Descobre a faculdade do aluno
    const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .select('curso_id, cursos(faculdade_id)')
        .eq('usuario_id', alunoId)
        .maybeSingle();
    if (alunoError) throw alunoError;
    const faculdadeId = aluno?.cursos?.faculdade_id;
    if (!faculdadeId) return { ...alunoPonto, rota: null };

    // 3. Busca as rotas que passam no ponto
    const { data: rotaPontos, error: rotaPontosError } = await supabase
        .from('rota_pontos')
        .select('rota_id')
        .eq('ponto_id', alunoPonto.ponto_id)
        .eq('status', 'ativo');
    if (rotaPontosError) throw rotaPontosError;
    const rotaIds = rotaPontos.map(rp => rp.rota_id);

    if (!rotaIds.length) return { ...alunoPonto, rota: null };

    // 4. Busca a rota que atende a faculdade do aluno
    const { data: rotaFaculdade, error: rotaFaculdadeError } = await supabase
        .from('rota_faculdades')
        .select('rota_id')
        .in('rota_id', rotaIds)
        .eq('faculdade_id', faculdadeId)
        .eq('status', 'ativo')
        .maybeSingle();
    if (rotaFaculdadeError) throw rotaFaculdadeError;
    if (!rotaFaculdade) return { ...alunoPonto, rota: null };

    // 5. Busca o nome da rota
    const { data: rota, error: rotaError } = await supabase
        .from('rotas')
        .select('id, nome')
        .eq('id', rotaFaculdade.rota_id)
        .maybeSingle();
    if (rotaError) throw rotaError;

    // Retorno final
    return {
        id: alunoPonto.ponto_id,
        nome: alunoPonto.pontos?.nome,
        endereco: alunoPonto.pontos?.endereco,
        status: alunoPonto.status,
        rota: rota || null
    };
}

export async function listarAlunosDoPonto(pontoId) {
    const { data, error } = await supabase
        .from('alunos_pontos')
        .select('aluno_id, status, alunos(usuario_id, nome, cpf, rg, email, telefone)')
        .eq('ponto_id', pontoId)
        .eq('status', 'ativo');
    
    if (error) throw error;
    return data.map(item => ({
        id: item.aluno_id,
        nome: item.alunos.nome,
        email: item.alunos.email,
        cpf: item.alunos.cpf,
        rg: item.alunos.rg,
        telefone: item.alunos.telefone,
        status: item.status
    }));
}
