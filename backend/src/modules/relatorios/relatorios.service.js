import { supabase } from "../../config/supabase.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { daysBetween, drawSeparator, formatNumber } from "../../utils/functions.js";

export async function presencasPorRota(rotaId, dataInicial, dataFinal) {
    let query = supabase
        .from('presencas')
        .select('id, data, aluno_id, alunos(usuario_id, usuarios(nome), curso_id, cursos(nome, faculdade_id, faculdades(nome)))', { count: 'exact' })
        .eq('rota_id', rotaId)
        .eq('status', 'ativo');

    if (dataInicial) query = query.gte('data', dataInicial);
    if (dataFinal) query = query.lte('data', dataFinal);

    const { data, error, count } = await query;
    if (error) throw error;

    const totalPresencas = count || 0;
    const alunosUnicos = [...new Set(data.map(p => p.aluno_id))].length;

    return {
        rotaId,
        nomeRota: data[0]?.rotas?.nome || '(Rota sem nome)',
        periodo: {de: dataInicial, ate: dataFinal},
        totalPresencas,
        alunosUnicos,
        registros: data.map(p => ({
            id: p.id,
            data: p.data,
            aluno: {
                id: p.aluno_id,
                nome: p.alunos?.usuarios?.nome,
                curso: p.alunos?.cursos?.nome,
                faculdade: p.alunos?.cursos?.faculdades?.nome
            }
        }))
    };
}

export async function presencasPorAluno(alunoId, dataInicial, dataFinal) {
    let query = supabase
        .from('presencas')
        .select('id, data, rota_id, alunos(usuario_id, usuarios(nome)), rotas(nome)', { count: 'exact' })
        .eq('aluno_id', alunoId)
        .eq('status', 'ativo');

    if (dataInicial) query = query.gte('data', dataInicial);
    if (dataFinal) query = query.lte('data', dataFinal);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
        alunoId,
        nomeAluno: data[0]?.alunos?.usuarios?.nome || null,
        periodo: {de: dataInicial, ate: dataFinal},
        totalPresencas: count || 0,
        registros: data.map(p => ({
            id: p.id,
            data: p.data,
            rota: {
                id: p.rota_id,
                nome: p.rotas.nome
            }
        }))
    };
}

export async function presencasPorMotorista(motoristaId, dataInicial, dataFinal) {
    // 1. Busca todas as viagens no período
    let query = supabase
        .from('viagens')
        .select('id, data, rota_id, rotas(nome), presencas(id)', { count: 'exact' });

    if (dataInicial) query = query.gte('data', dataInicial);
    if (dataFinal) query = query.lte('data', dataFinal);

    const { data: viagens, error } = await query;
    if (error) throw error;

    // 2. Para cada viagem, busca o motorista da rota naquela data
    // (pode otimizar buscando todos os rota_motoristas de uma vez)
    const rotaIds = [...new Set(viagens.map(v => v.rota_id))];
    const { data: rotaMotoristas, error: rmError } = await supabase
        .from('rota_motoristas')
        .select('id, rota_id, motorista_id, motoristas(nome), inicio, fim, status')
        .in('rota_id', rotaIds)
        .eq('status', 'ativo');
    if (rmError) throw rmError;

    // 3. Filtra viagens do motorista
    const viagensDoMotorista = viagens.filter(viagem => {
        // Encontra o vínculo do motorista para a rota e data da viagem
        return rotaMotoristas.some(rm =>
            rm.rota_id === viagem.rota_id &&
            rm.motorista_id === motoristaId &&
            new Date(viagem.data) >= new Date(rm.inicio) &&
            (!rm.fim || new Date(viagem.data) <= new Date(rm.fim))
        );
    });

    const totalPresencas = viagensDoMotorista.reduce((sum, v) => sum + (v.presencas.length || 0), 0);

    return {
        motoristaId,
        nomeMotorista: rotaMotoristas.find(rm => rm.motorista_id === motoristaId)?.motoristas?.nome || 'Motorista sem nome',
        periodo: { de: dataInicial, ate: dataFinal },
        totalViagens: viagensDoMotorista.length,
        totalPresencas,
        viagens: viagensDoMotorista.map(v => ({
            id: v.id,
            data: v.data,
            rota: {
                id: v.rota_id,
                nome: v.rotas.nome
            },
            presencas: v.presencas?.length || 0
        }))
    };
}

export async function presencasPorFaculdade(faculdadeId, dataInicial, dataFinal) {
    let query = supabase
        .from('presencas')
        .select('id, data, aluno_id, alunos(usuario_id, usuarios(nome), curso_id, cursos(faculdade_id, faculdades(nome)))', { count: 'exact' })
        .eq('status', 'ativo')

    if (dataInicial) query = query.gte('data', dataInicial);
    if (dataFinal) query = query.lte('data', dataFinal);

    const { data, error, count } = await query;
    if (error) throw error;

    const filtrados = data.filter(p => p.alunos?.cursos?.faculdade_id === faculdadeId);

    return {
        faculdadeId,
        faculdadeNome: filtrados[0]?.alunos?.cursos?.faculdades?.nome || '(Faculdade sem nome)',
        periodo: {de: dataInicial, ate: dataFinal},
        totalPresencas: filtrados.length,
        alunosUnicos: [...new Set(filtrados.map(p => p.aluno_id))].length,
        registros: filtrados.map(p => ({
            id: p.id,
            data: p.data,
            aluno: {
                id: p.aluno_id,
                nome: p.alunos?.usuarios?.nome,
                curso: p.alunos?.cursos?.nome,
                faculdade: p.alunos?.cursos?.faculdades?.nome
            }
        }))
    };
}

export async function presencasPorCurso(cursoId, dataInicial, dataFinal) {
    let query = supabase
        .from('presencas')
        .select('id, data, aluno_id, alunos(usuario_id, usuarios(nome), curso_id, cursos(nome, faculdade_id, faculdades(nome)))', { count: 'exact' })
        .eq('status', 'ativo')

    if (dataInicial) query = query.gte('data', dataInicial);
    if (dataFinal) query = query.lte('data', dataFinal);

    const { data, error, count } = await query;
    if (error) throw error;

    const filtrados = data.filter(p => p.alunos?.curso_id === cursoId);

    return {
        cursoId,
        cursoNome: filtrados[0]?.alunos?.cursos?.nome || '(Curso sem nome)',
        periodo: {de: dataInicial, ate: dataFinal},
        totalPresencas: filtrados.length,
        alunosUnicos: [...new Set(filtrados.map(p => p.aluno_id))].length,
        registros: filtrados.map(p => ({
            id: p.id,
            data: p.data,
            aluno: {
                id: p.aluno_id,
                nome: p.alunos?.usuarios?.nome,
                faculdade: p.alunos?.cursos?.faculdades?.nome
            }
        }))
    };
}

export async function relatorioGeral(dataInicial, dataFinal) {

    const [{ count: alunos }, { count: motoristas }, { count: rotas }, { count: faculdades }] = await Promise.all([
        supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('status_cadastro', 'aprovado'),
        supabase.from('motoristas').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
        supabase.from('rotas').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
        supabase.from('faculdades').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    ]);
    
    if (dataInicial && dataFinal && daysBetween(dataInicial, dataFinal) > 31) {
        throw new Error("O intervalo entre as datas não pode ser maior que 31 dias.");
    }

    let inicioMes = new Date();
    let hoje = new Date();
    if (dataInicial && dataFinal) {
        inicioMes = new Date(dataInicial);
        hoje = new Date(dataFinal);
    } else {
        inicioMes.setDate(1);
    }

    const { count: presencasMes } = await supabase
        .from('presencas')
        .select('*', { count: 'exact', head: true })
        .gte('data', inicioMes.toISOString().split('T')[0])
        .lte('data', hoje.toISOString().split('T')[0])
        .eq('status', 'ativo');

    const { data: presFaculdades, error: faculdadesError } = await supabase
        .from('presencas')
        .select('aluno_id, alunos(curso_id, cursos(faculdade_id, faculdades(nome)))')
        .gte('data', inicioMes.toISOString().split('T')[0])
        .lte('data', hoje.toISOString().split('T')[0])
        .eq('status', 'ativo');

    if (faculdadesError) throw faculdadesError;

    const faculdadesCount = {};
    const cursoCount = {};

    presFaculdades.forEach(p => {
        const faculdade = p.alunos?.cursos?.faculdades?.nome;
        const curso = p.alunos?.cursos?.nome;

        if (faculdade) faculdadesCount[faculdade] = (faculdadesCount[faculdade] || 0) + 1;
        if (curso) cursoCount[curso] = (cursoCount[curso] || 0) + 1;
    });

    const topFaculdades = Object.entries(faculdadesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nome, total]) => ({ nome, total }));

    const topCursos = Object.entries(cursoCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nome, total]) => ({ nome, total }));

    return { 
        totals: {
            alunos: alunos || 0,
            motoristas: motoristas || 0,
            rotas: rotas || 0,
            faculdades: faculdades || 0,
        },
        presencasMes: presencasMes || 0,
        topFaculdades,
        topCursos
    };
}

/**
 * @param {Object} data - Dados do relatório {totals: {}, presencasMes: number, topFaculdades: [], topCursos: []}
 * @returns {Promise<Buffer>} - Buffer do PDF gerado
 */
export async function gerarRelatorioGeralPDF() {
    // Simulação da chamada de dados (substitua pela sua função real)
    const data = await relatorioGeral();

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const endPromise = new Promise((resolve, reject) => {
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });
    
    // --- VARIÁVEIS DE POSIÇÃO E ESTILO ---
    const MARGIN_LEFT = 50;
    const ROW_HEIGHT = 18;
    const FONT_SIZE_DATA = 10;
    
    // Posições X das Colunas na Tabela
    const POS_X = {
        POS: MARGIN_LEFT + 20, // 70
        NOME: MARGIN_LEFT + 60, // 110 (Recuado um pouco)
        PRESENCAS_COL: MARGIN_LEFT + 390 // 390 (Posição onde o texto de PRESENÇAS deve terminar)
    };
    
    // Larguras das Colunas (Ajustadas para dar mais espaço à PRESENÇAS)
    const WIDTHS = {
        POS: 30,
        NOME: 350, // Aumentado ligeiramente para nomes longos
        PRESENCAS: 90 // AUMENTADO: Garante que 'PRESENÇAS' caiba em 9pt
    };


    // ----------------------------------------------------
    // 1. CABEÇALHO PROFISSIONAL
    // ----------------------------------------------------
    const HEADER_HEIGHT = 50;
    const START_CONTENT_Y = HEADER_HEIGHT + 40; 
    let currentY = START_CONTENT_Y;

    // Fundo Azul para o Título (Banner)
    doc.fill('#003366')
       .rect(0, 0, doc.page.width, HEADER_HEIGHT)
       .fill();
    
    // Título Centralizado
    doc.fill('white')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text("RELATÓRIO GERAL DE TRANSPORTE UNIVERSITÁRIO", 0, 18, { align: "center" });

    // Data de Geração (Posicionada abaixo do banner, à direita)
    doc.fill('#444444')
       .fontSize(9)
       .font('Helvetica')
       .text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, MARGIN_LEFT, HEADER_HEIGHT + 15, { align: "right" });
    
    // ----------------------------------------------------
    // 2. TOTAIS E KPIs (Layout em Colunas)
    // ----------------------------------------------------
    doc.fontSize(14)
       .fill('#003366')
       .font('Helvetica-Bold')
       .text("RESUMO DE DADOS (KPIs)", MARGIN_LEFT, currentY);
    currentY += 20;
    
    const COL1_X = MARGIN_LEFT;
    const COL2_X = MARGIN_LEFT + 200; 
    const TOTALS_BOX_WIDTH = 180;
    
    const totals = [
        { label: "Alunos Ativos", value: formatNumber(data.totals.alunos), color: '#3366CC' },
        { label: "Motoristas Ativos", value: formatNumber(data.totals.motoristas), color: '#3366CC' },
        { label: "Rotas Ativas", value: formatNumber(data.totals.rotas), color: '#3366CC' },
        { label: "Faculdades Ativas", value: formatNumber(data.totals.faculdades), color: '#3366CC' },
    ];
    
    const drawKpiBox = (label, value, x, y, color) => {
        // Desenha o fundo da caixa
        doc.fill('#F0F0F0')
           .rect(x, y, TOTALS_BOX_WIDTH, 40)
           .fill();
        
        // Borda lateral para cor
        doc.fill(color)
           .rect(x, y, 5, 40)
           .fill();
           
        // Label
        doc.fill('#555555')
           .fontSize(8)
           .font('Helvetica-Bold')
           .text(label.toUpperCase(), x + 15, y + 5);
           
        // Valor
        doc.fill('black')
           .fontSize(16)
           .font('Helvetica')
           .text(value, x + 15, y + 18);
    };
    
    // Desenha as caixas em grid 2x2
    currentY += 5;
    
    drawKpiBox(totals[0].label, totals[0].value, COL1_X, currentY, totals[0].color);
    drawKpiBox(totals[1].label, totals[1].value, COL2_X, currentY, totals[1].color);
    
    currentY += 50;
    
    drawKpiBox(totals[2].label, totals[2].value, COL1_X, currentY, totals[2].color);
    drawKpiBox(totals[3].label, totals[3].value, COL2_X, currentY, totals[3].color);
    
    currentY += 60;
    
    // Destaque para Presenças do Mês
    doc.fontSize(12).fill('#CC0000').font('Helvetica-Bold')
       .text(`TOTAL DE PRESENÇAS NO MÊS ATUAL: ${formatNumber(data.presencasMes)}`, COL1_X, currentY);
       
    currentY += 30;
    drawSeparator(doc, currentY); // Separador
    currentY += 15;

    // ----------------------------------------------------
    // 3. TOP FACULDADES (Corrigido o layout de colunas)
    // ----------------------------------------------------
    doc.y = currentY; 
    
    doc.fontSize(14)
       .fill('#003366')
       .font('Helvetica-Bold')
       .text("RANKING: TOP 10 FACULDADES POR PRESENÇA", MARGIN_LEFT, doc.y);
    doc.moveDown(0.8);

    let tableY = doc.y;

    // Cabeçalho da Tabela
    doc.fill('#444444')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('POS.', POS_X.POS, tableY, { width: WIDTHS.POS })
       .text('FACULDADE', POS_X.NOME, tableY, { width: WIDTHS.NOME })
       .text('PRESENÇAS', POS_X.PRESENCAS_COL, tableY, { width: WIDTHS.PRESENCAS, align: 'right' }); // CORRIGIDO: Largura do cabeçalho
    
    drawSeparator(doc, tableY + 12, '#003366');
    
    // Corpo da Tabela
    tableY += ROW_HEIGHT;
    
    data.topFaculdades.slice(0, 10).forEach((f, index) => { 
        // Fundo zebrado (cinza claro)
        if (index % 2 !== 0) {
            doc.fill('#FAFAFA')
               .rect(50, tableY - 5, 500, ROW_HEIGHT)
               .fill();
        }
        
        doc.fill('black')
           .fontSize(FONT_SIZE_DATA)
           .font('Helvetica-Bold')
           .text(`${index + 1}.`, POS_X.POS, tableY, { width: WIDTHS.POS })
           .font('Helvetica')
           .text(f.nome, POS_X.NOME, tableY, { width: WIDTHS.NOME, ellipsis: true }) 
           .font('Helvetica-Bold')
           .text(formatNumber(f.total), POS_X.PRESENCAS_COL, tableY, { width: WIDTHS.PRESENCAS, align: 'right' }); 
           
        tableY += ROW_HEIGHT;
    });

    currentY = tableY + 10;
    drawSeparator(doc, currentY); // Separador
    currentY += 15;

    // ----------------------------------------------------
    // 4. TOP CURSOS (Corrigido o layout de colunas)
    // ----------------------------------------------------
    doc.y = currentY; // Garante que o cursor Y esteja na posição correta
    
    doc.fontSize(14)
       .fill('#003366')
       .font('Helvetica-Bold')
       .text("RANKING: TOP 10 CURSOS POR PRESENÇA", MARGIN_LEFT, doc.y);
    doc.moveDown(0.8);

    tableY = doc.y; // Reinicia o Y da tabela

    // Cabeçalho da Tabela
    doc.fill('#444444')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('POS.', POS_X.POS, tableY, { width: WIDTHS.POS })
       .text('CURSO', POS_X.NOME, tableY, { width: WIDTHS.NOME })
       .text('PRESENÇAS', POS_X.PRESENCAS_COL, tableY, { width: WIDTHS.PRESENCAS, align: 'right' }); // CORRIGIDO: Largura do cabeçalho
    
    drawSeparator(doc, tableY + 12, '#003366'); 
    
    // Corpo da Tabela
    tableY += ROW_HEIGHT;
    
    data.topCursos.slice(0, 10).forEach((c, index) => { 
        // Fundo zebrado
        if (index % 2 !== 0) {
            doc.fill('#FAFAFA')
               .rect(50, tableY - 5, 500, ROW_HEIGHT)
               .fill();
        }
        
        doc.fill('black')
           .fontSize(FONT_SIZE_DATA)
           .font('Helvetica-Bold')
           .text(`${index + 1}.`, POS_X.POS, tableY, { width: WIDTHS.POS })
           .font('Helvetica')
           .text(c.nome, POS_X.NOME, tableY, { width: WIDTHS.NOME, ellipsis: true }) 
           .font('Helvetica-Bold')
           .text(formatNumber(c.total), POS_X.PRESENCAS_COL, tableY, { width: WIDTHS.PRESENCAS, align: 'right' }); 
           
        tableY += ROW_HEIGHT;
    });

    doc.end();
    return await endPromise;
}

export async function gerarRelatorioGeralExcel() {
    const data = await relatorioGeral();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Relatório Geral');

    sheet.mergeCells('A1', 'B1');
    sheet.getCell('A1').value = 'Relatório Geral - Transporte Universitário';
    sheet.getCell('A1').font = { size: 16, bold: true };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    sheet.addRow([]);
    sheet.addRow(['Gerado em:', new Date().toLocaleString('pt-BR')]);
    sheet.addRow([]);

    sheet.addRow(['Totais']);
    sheet.addRow(['Alunos ativos', data.totals.alunos]);
    sheet.addRow(['Motoristas ativos', data.totals.motoristas]);
    sheet.addRow(['Rotas ativas', data.totals.rotas]);
    sheet.addRow(['Faculdades ativas', data.totals.faculdades]);
    sheet.addRow(['Presenças no mês atual', data.presencasMes]);
    sheet.addRow([]);

    sheet.addRow(['Top Faculdades']);
    sheet.addRow(['Posição', 'Faculdade', 'Total de Presenças']);
    data.topFaculdades.forEach((f, index) => {
        sheet.addRow([index + 1, f.nome, f.total]);
    });
    sheet.addRow([]);

    sheet.addRow(['Top Cursos']);
    sheet.addRow(['Posição', 'Curso', 'Total de Presenças']);
    data.topCursos.forEach((c, index) => {
        sheet.addRow([index + 1, c.nome, c.total]);
    });

    sheet.columns.forEach(column => {
        column.width = 30;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}

export async function gerarRelatorioCompleto(dataInicial, dataFinal) {
    const [
        geral,
        { data: rotas },
        { data: faculdades },
        { data: cursos },
        { data: alunos },
        { data: motoristas },
    ] = await Promise.all([
        relatorioGeral(),
        supabase.from("rotas").select("id, nome").eq("status", "ativo"),
        supabase.from("faculdades").select("id, nome").eq("status", "ativo"),
        supabase.from("cursos").select("id, nome, faculdade_id").eq("status", "ativo"),
        supabase.from("alunos").select("usuario_id, usuarios(nome)").eq("status_cadastro", "aprovado"),
        supabase.from("motoristas").select("id, nome").eq("status", "ativo"),
    ]);

    const alunosValidos = (alunos || []).filter(a => a?.usuario_id && a?.usuarios);
    const motoristasValidos = (motoristas || []).filter(m => m?.id);
    const rotasValidas = (rotas || []).filter(r => r?.id && r?.nome);
    const faculdadesValidas = (faculdades || []).filter(f => f?.id && f?.nome);
    const cursosValidos = (cursos || []).filter(c => c?.id && c?.nome);


    // Validações básicas
    if (alunosValidos.length === 0) throw new Error("Nenhum aluno ativo encontrado.");
    if (motoristasValidos.length === 0) throw new Error("Nenhum motorista ativo encontrado.");
    if (rotasValidas.length === 0) throw new Error("Nenhuma rota ativa encontrada.");
    if (faculdadesValidas.length === 0) throw new Error("Nenhuma faculdade ativa encontrada.");
    if (cursosValidos.length === 0) throw new Error("Nenhum curso ativo encontrado.");

    // Reúne os relatórios detalhados
    const [porRota, porFaculdade, porMotorista, porAluno] = await Promise.all([
        Promise.all(rotasValidas.map(r => presencasPorRota(r.id, dataInicial, dataFinal))),
        Promise.all(faculdadesValidas.map(f => presencasPorFaculdade(f.id, dataInicial, dataFinal))),
        Promise.all(motoristasValidos.map(m => presencasPorMotorista(m.id, dataInicial, dataFinal))),
        Promise.all(alunosValidos.map(a => presencasPorAluno(a.usuario_id, dataInicial, dataFinal))),
    ]);

    // Gera também o agrupamento “Faculdade > Curso”
    const faculdadesCursos = await gerarRelatorioPorFaculdadeCurso(dataInicial, dataFinal);

    return {
        periodo: { de: dataInicial, ate: dataFinal },
        geral,
        detalhado: {
            porRota,
            porFaculdade,
            porMotorista,
            porAluno,
            porFaculdadeCurso: faculdadesCursos
        }
    };
}

export async function gerarRelatorioPorFaculdadeCurso(dataInicial, dataFinal) {
    const { data, error } = await supabase
        .from('presencas')
        .select(`
            id, data, aluno_id,
            alunos(usuario_id, curso_id, cursos(nome, faculdade_id, faculdades(nome)))
        `)
        .eq('status', 'ativo');

    if (error) throw error;

    // Aplica filtro de datas
    const filtradas = data.filter(p => {
        const d = new Date(p.data);
        const ini = dataInicial ? new Date(dataInicial) : null;
        const fim = dataFinal ? new Date(dataFinal) : null;
        if (ini && d < ini) return false;
        if (fim && d > fim) return false;
        return true;
    });

    // Agrupa por faculdade e curso
    const resultado = {};
    filtradas.forEach(p => {
        const faculdade = p.alunos?.cursos?.faculdades?.nome;
        const curso = p.alunos?.cursos?.nome;

        if (!faculdade || !curso) return;

        if (!resultado[faculdade]) resultado[faculdade] = {};
        resultado[faculdade][curso] = (resultado[faculdade][curso] || 0) + 1;
    });

    return Object.entries(resultado).map(([faculdade, cursos]) => ({
        faculdade,
        total_presencas: Object.values(cursos).reduce((a, b) => a + b, 0),
        cursos: Object.entries(cursos).map(([curso, total]) => ({ curso, total }))
    }));
}

export async function gerarRelatorioCompletoPDF(dataInicial, dataFinal) {
    const data = await gerarRelatorioCompleto(dataInicial, dataFinal);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", chunk => chunks.push(chunk));
    const endPromise = new Promise((resolve, reject) => {
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);
    });

    // Cabeçalho principal (mesmo estilo do seu atual)
    doc.fill('#003366')
       .rect(0, 0, doc.page.width, 50)
       .fill();
    doc.fill('white')
       .font('Helvetica-Bold')
       .fontSize(18)
       .text('RELATÓRIO COMPLETO DE TRANSPORTE UNIVERSITÁRIO', 0, 18, { align: 'center' });

    doc.moveDown(2);
    doc.font('Helvetica').fontSize(10).fill('#444')
       .text(`Período: ${data.periodo.de || '-'} até ${data.periodo.ate || '-'}`, { align: 'center' });
    doc.moveDown();

    // Chama a função de relatório geral (reutiliza seu layout atual)
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).fill('#003366').text("RESUMO GERAL");
    doc.moveDown();
    doc.fontSize(10).fill('black').text(`Alunos Ativos: ${data.geral.totals.alunos}`);
    doc.text(`Motoristas Ativos: ${data.geral.totals.motoristas}`);
    doc.text(`Rotas Ativas: ${data.geral.totals.rotas}`);
    doc.text(`Faculdades Ativas: ${data.geral.totals.faculdades}`);
    doc.moveDown();
    doc.font('Helvetica-Bold').text(`Presenças no mês atual: ${data.geral.presencasMes}`);

    // ------------------------------------------------------
    // Seções Detalhadas
    // ------------------------------------------------------
    const addSection = (titulo) => {
        doc.addPage();
        doc.fill('#003366')
           .font('Helvetica-Bold')
           .fontSize(14)
           .text(titulo, { align: 'center' });
        doc.moveDown();
    };

    // Por Rota
    addSection("DETALHADO POR ROTA");
    data.detalhado.porRota.forEach(r => {
        doc.font('Helvetica-Bold').fill('#000').text(r.nomeRota);
        doc.font('Helvetica').text(`Total presenças: ${r.totalPresencas}`);
        doc.moveDown(0.5);
    });

    // Por Faculdade e Curso
    addSection("DETALHADO POR FACULDADE E CURSO");
    data.detalhado.porFaculdadeCurso.forEach(f => {
        doc.font('Helvetica-Bold').fill('#000').text(f.faculdade);
        f.cursos.forEach(c => {
            doc.font('Helvetica').text(`• ${c.curso}: ${c.total}`);
        });
        doc.moveDown(0.5);
    });

    // Por Motorista
    addSection("DETALHADO POR MOTORISTA");
    data.detalhado.porMotorista.forEach(m => {
        doc.font('Helvetica-Bold').fill('#000').text(m.nomeMotorista);
        doc.font('Helvetica').text(`Total viagens: ${m.totalViagens}`);
        doc.text(`Total presenças: ${m.totalPresencas}`);
        doc.moveDown(0.5);
    });

    // Por Aluno
    addSection("DETALHADO POR ALUNO");
    data.detalhado.porAluno.forEach(a => {
        doc.font('Helvetica-Bold').text(a.nomeAluno);
        doc.font('Helvetica').text(`Total presenças: ${a.totalPresencas}`);
        doc.moveDown(0.5);
    });

    doc.end();
    return await endPromise;
}

export async function gerarRelatorioCompletoExcel(dataInicial, dataFinal) {
    const data = await gerarRelatorioCompleto(dataInicial, dataFinal);
    const workbook = new ExcelJS.Workbook();

    // Aba Geral
    const geral = workbook.addWorksheet('Resumo Geral');
    geral.addRow(['Resumo do Transporte Universitário']);
    geral.addRow([]);
    geral.addRow(['Alunos Ativos', data.geral.totals.alunos]);
    geral.addRow(['Motoristas Ativos', data.geral.totals.motoristas]);
    geral.addRow(['Rotas Ativas', data.geral.totals.rotas]);
    geral.addRow(['Faculdades Ativas', data.geral.totals.faculdades]);
    geral.addRow(['Presenças no mês', data.geral.presencasMes]);
    geral.addRow([]);

    // Aba Faculdades e Cursos
    const fac = workbook.addWorksheet('Faculdades e Cursos');
    fac.addRow(['Faculdade', 'Curso', 'Presenças']);
    data.detalhado.porFaculdadeCurso.forEach(f => {
        f.cursos.forEach(c => {
            fac.addRow([f.faculdade, c.curso, c.total]);
        });
    });

    // Aba Rotas
    const rotas = workbook.addWorksheet('Rotas');
    rotas.addRow(['Rota', 'Total Presenças']);
    data.detalhado.porRota.forEach(r => {
        rotas.addRow([r.nomeRota, r.totalPresencas]);
    });

    // Aba Motoristas
    const mot = workbook.addWorksheet('Motoristas');
    mot.addRow(['Motorista', 'Total Viagens', 'Total Presenças']);
    data.detalhado.porMotorista.forEach(m => {
        mot.addRow([m.nomeMotorista, m.totalViagens, m.totalPresencas]);
    });

    // Aba Alunos
    const alunos = workbook.addWorksheet('Alunos');
    alunos.addRow(['Aluno', 'Total Presenças']);
    data.detalhado.porAluno.forEach(a => {
        alunos.addRow([a.nomeAluno, a.totalPresencas]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}
