import { supabase } from '../../config/supabase.js';

export async function ensureViagem(rotaId, data) {
    const {data: existing } = await supabase
        .from('viagens')
        .select('*')
        .eq('rota_id', rotaId)
        .eq('data', data)
        .maybeSingle();

    if (existing) return existing;

    const { data: created, error } = await supabase
        .from('viagens')
        .insert([{ rota_id: rotaId, data, status: "fechada" }])
        .select()
        .single();
    
    if (error) throw error;
    return created;
}

export async function listarViagens({ rotaId, data}) {
    let query = supabase.from('viagens').select('*, rotas(nome)');

    if (rotaId) query = query.eq('rota_id', rotaId);
    if (data) query = query.eq('data', data);

    const { data: viagens, error } = await query.order('data', { ascending: false });

    if (error) throw error;
    return viagens;
}

export async function detalharViagem(viagemId) {
    const { data, error } = await supabase
        .from('viagens')
        .select(`
            id, data, status,
            rotas(nome),
            presencas(
                id, confirmado, confirmado_qrcode,
                alunos(usuario_id, usuarios(nome))
            )
        `)
        .eq('id', viagemId)
        .single();

    if (error) throw error;
    return data;
}

export async function listarAlunosNaViagem(data) {
    let query = supabase
        .from('presencas')
        .select('*, alunos(usuario_id, usuarios(nome), curso_id, cursos(faculdades(nome))), rotas(nome)')
        .eq('data', data)
        .eq('status', 'ativo');

    const { data: presencas, error } = await query;

    if(error) throw error;

    if (process.env.NODE_ENV === 'development') {
        try {
            console.log('[debug] listarAlunosNaViagem - presencas count:', Array.isArray(presencas) ? presencas.length : 0);
            if (Array.isArray(presencas) && presencas.length > 0) {
                const sample = presencas.slice(0, 5).map(p => ({
                    rota: p?.rotas?.nome,
                    aluno_usuario_id: p?.alunos?.usuario_id,
                    aluno_nome: p?.alunos?.usuarios?.nome,
                    curso: p?.alunos?.curso_id
                }));
                console.log('[debug] listarAlunosNaViagem - sample:', JSON.stringify(sample, null, 2));
            }
        } catch (e) {
            console.warn('[debug] listarAlunosNaViagem - erro ao logar presencas:', e);
        }
    }

    const agrupado = {};

    for (const p of presencas) {
        const rota = p?.rotas?.nome || 'Rota desconhecida';
        const faculdade = p?.alunos?.cursos?.faculdades?.nome || 'Geral';
        const nomeAluno = p?.alunos?.usuarios?.nome || null;

        if (!nomeAluno) continue;

        if (!agrupado[rota]) agrupado[rota] = {};
        if (!agrupado[rota][faculdade]) agrupado[rota][faculdade] = [];
        agrupado[rota][faculdade].push({ nome: nomeAluno, faculdade });
    }

    return agrupado;
}

export async function listarResumoViagensHoje() {
    const hoje = new Date().toISOString().split('T')[0];
    const alunosPorRota = await listarAlunosNaViagem(hoje);

    const resumo = {};
    for (const rota in alunosPorRota) {
        resumo[rota] = Object.values(alunosPorRota[rota]).reduce((acc, arr) => acc + arr.length, 0);
    }
    return resumo;
}

export async function listarStatusVolta() {
    const hoje = new Date().toISOString().split('T')[0];

    const { data: presencas, error } = await supabase
        .from('presencas')
        .select(`id, confirmado_qrcode, confirmado_volta,
                alunos(usuario_id, telefone, usuarios(nome), curso_id, cursos(faculdades(nome))), rotas(nome)
            `)
        .eq('data', hoje)
        .eq('status', 'ativo')
        .eq('confirmado_qrcode', true);

    if (error) throw error;

    const resumo = {};
    const alunosFaltando = [];

    for (const p of presencas) {
        const rotaNome = p.rotas?.nome;
        const aluno = {
            id: p.alunos?.usuario_id,
            nome: p.alunos?.usuarios?.nome,
            telefone: p.alunos?.telefone,
            faculdade: p.alunos?.cursos?.faculdades?.nome,
            confirmadoVolta: !!p.confirmado_volta
        };

        if (!resumo[rotaNome]) {
            resumo[rotaNome] = {
                totalIda: 0,
                totalVolta: 0,
                detalhes: [],
            };
        }

        resumo[rotaNome].totalIda += 1;
        if (p.confirmado_volta) {
            resumo[rotaNome].totalVolta += 1;
        } else {
            alunosFaltando.push(aluno);
        }
        resumo[rotaNome].detalhes.push(aluno);
    }
    return {
        resumoPorRota: resumo,
        alunosFaltando: alunosFaltando,
        timestamp: new Date().toISOString(),
    };
}