import { gethoraLimitePresenca } from '../configuracoes/configuracoes.service.js';
import { supabase } from '../../config/supabase.js';
import { ensureViagem } from '../viagens/viagens.service.js';
import { formatHHMM } from '../../utils/functions.js';

export async function listarPresencasPorRota(rotaId, data) {
    const filtroData = data || new Date().toISOString().split('T')[0];

    const { data: presencas, error } = await supabase
        .from('presencas')
        .select('*, alunos(nome), rotas(nome)')
        .eq('rota_id', rotaId)
        .eq('data', filtroData)
        .eq('status', 'ativo');

    if (error) throw error;
    return presencas;
}

export async function listarPresencasPorAluno(alunoId) {
    const { data, error } = await supabase
        .from('presencas')
        .select('*, rotas(nome)')
        .eq('aluno_id', alunoId)
        .eq('status', 'ativo')
        .order('data', { ascending: false });
    
    if (error) throw error;
    return data;
}

export async function desativarPresenca(presencaId) {
    const { data, error } = await supabase
        .from('presencas')
        .update({ status: 'inativo' })
        .eq('id', presencaId)
        .select()
        .maybeSingle();
    
    if (error) throw error;
    return data;
}

export async function marcarPresenca(alunoId, rotaId) {
    const hoje = new Date().toISOString().split('T')[0];
    const viagem = await ensureViagem(rotaId, hoje);

    const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .select('status_cadastro, usuarios(tipo, status)')
        .eq('usuario_id', alunoId)
        .maybeSingle();

    if(alunoError || !aluno) throw new Error("Aluno não encontrado");
    if(aluno.usuarios?.status !== "ativo") throw new Error("Aluno não está ativo no sistema");
    if(aluno.status_cadastro !== "aprovado") throw new Error("Aluno não está aprovado no sistema");
    if(aluno.usuarios?.tipo !== "aluno") throw new Error("Usuário não é do tipo aluno");

    const horaLimite = await gethoraLimitePresenca();
    if(!horaLimite) throw new Error("Horário limite para marcar presença não está configurado no sistema");
    const agora = new Date();
    const [limiteHoras, limiteMinutos] = horaLimite.split(':').map(Number);
    const limite = new Date();
    limite.setHours(limiteHoras, limiteMinutos, 0, 0);

    if (agora > limite) {
        throw new Error(`Horário limite para marcar presença é ${formatHHMM(limite)}.`);
    }

    const { data: existing } = await supabase
        .from('presencas')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('data', hoje)
        .maybeSingle();

    if (existing) {
        const { data, error } = await supabase
            .from('presencas')
            .update({
                confirmado: true,
            })
            .eq('id', existing.id)
            .select()
            .maybeSingle();

        if (error) throw error;
        return { message: "Presença atualizada (pré-checkin)", data };
    }

    const { data, error } = await supabase
        .from('presencas')
        .insert([{
            aluno_id: alunoId,
            rota_id: rotaId,
            viagem_id: viagem.id,
            data: hoje,
            confirmado: true,
            confirmado_qrcode: false
        }])
        .select()
        .single();

    if (error) throw error;
    return { message: "Presença confirmada com sucesso", data };        
}

export async function confirmarPresencaIdaQrCode(alunoId) {
    const hoje = new Date().toISOString().split('T')[0];

    const agora = new Date();

    const horaInicioIda = "16:50";
    const horaFimIda = "18:00";

    const [hInicio, mInicio] = horaInicioIda.split(':').map(Number);
    const [hFim, mFim] = horaFimIda.split(':').map(Number);

    const inicioIda = new Date();
    inicioIda.setHours(hInicio, mInicio, 0, 0);
    const fimIda = new Date();
    fimIda.setHours(hFim, mFim, 0, 0);

    if(agora < inicioIda) throw new Error(`A confirmação da ida só pode ser feita após as ${horaInicioIda}.`);
    if(agora > fimIda) throw new Error(`A confirmação da ida só pode ser feita até as ${horaFimIda}.`);

    const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .select('status_cadastro, usuarios(tipo, status)')
        .eq('usuario_id', alunoId)
        .maybeSingle();

    if(alunoError || !aluno) throw new Error("Aluno não encontrado");
    if(aluno.usuarios.status !== "ativo") throw new Error("Usuário não está ativo no sistema");
    if(aluno.status_cadastro !== "aprovado") throw new Error("Aluno não está aprovado no sistema");
    if(aluno.usuarios.tipo !== "aluno") throw new Error("Usuário não é um aluno");

    const { data: existing, error: findError } = await supabase
        .from('presencas')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('data', hoje)
        .maybeSingle();

    if (findError) throw findError;

    if (!existing) return { message: "Aluno não marcou presença antes do embarque" };

    // Se já confirmarou a presença via QR code, lançar erro informativo
    if (existing.confirmado_qrcode) {
        throw new Error("Aluno já confirmou presença via QR Code");
    }

    const { data, error } = await supabase
        .from('presencas')
        .update({
            confirmado_qrcode: true,
        })
        .eq('id', existing.id)
        .select()
        .maybeSingle();

    if (error) throw error;
    return { message: "Embarque confirmado via QR Code", data };
}

export async function confirmarPresencaVoltaQrCode(alunoId) {
    const hoje = new Date().toISOString().split('T')[0];
    const agora = new Date();

    const horaInicioVolta = "21:00";
    const horaFimVolta = "23:00";

    const [hInicio, mInicio] = horaInicioVolta.split(':').map(Number);
    const [hFim, mFim] = horaFimVolta.split(':').map(Number);

    const inicioVolta = new Date();
    inicioVolta.setHours(hInicio, mInicio, 0, 0);
    const fimVolta = new Date();
    fimVolta.setHours(hFim, mFim, 0, 0);

    if(agora < inicioVolta) throw new Error(`A confirmação da volta só pode ser feita após as ${horaInicioVolta}.`);
    if(agora > fimVolta) throw new Error(`A confirmação da volta só pode ser feita até as ${horaFimVolta}.`);

    const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .select('status_cadastro, usuarios(tipo, status)')
        .eq('usuario_id', alunoId)
        .maybeSingle();

    if(alunoError || !aluno) throw new Error("Aluno não encontrado");
    if(aluno.usuarios.status !== "ativo") throw new Error("Usuário não está ativo no sistema");
    if(aluno.status_cadastro !== "aprovado") throw new Error("Aluno não está aprovado no sistema");
    if(aluno.usuarios.tipo !== "aluno") throw new Error("Usuário não é um aluno");

    const { data: existing, error } = await supabase
        .from('presencas')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('rota_id', rotaId)
        .eq('data', hoje)
        .maybeSingle();

    if (error) throw error;

    if(!existing) throw new Error("Aluno confirmou embarque na ida.");

    if(!existing.confirmado_qrcode) throw new Error("Aluno não embarcou na ida.");

    if(existing.confirmado_volta) throw new Error("Aluno já confirmou volta via QR Code");

    const { data, error: updateError } = await supabase
        .from('presencas')
        .update({
            confirmado_volta: true,
        })
        .eq('id', existing.id)
        .select()
        .maybeSingle();

    if (updateError) throw updateError;
    return { message: "Embarque de volta confirmado via QR Code", data };
    
}