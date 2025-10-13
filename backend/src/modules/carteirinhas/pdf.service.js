import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import * as functionUtils from '../../utils/functions.js';
import { supabase } from '../../config/supabase.js'; 

// --- FUNÇÕES AUXILIARES ---

// Função para buscar imagem do Supabase Storage
async function fetchImageBuffer(url) {
    if (!url || typeof url !== 'string' || url.length < 5) return null;
    
    const bucketName = process.env.BUCKET_NAME;

    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(url, 60);

        if (error || !data?.signedUrl) {
            console.error("Erro ao criar URL assinada:", error || "URL não retornada.");
            return null; 
        }

        const signedUrl = data.signedUrl;
        
        const res = await fetch(signedUrl);
        
        if (res.ok) {
            const arr = new Uint8Array(await res.arrayBuffer());
            return Buffer.from(arr);
        } else {
            console.error(`Erro ao fazer fetch da imagem (Status: ${res.status}):`, signedUrl);
        }
    } catch (error) {
        console.error("Erro geral no fetchImageBuffer:", error);
    }
    return null;
}
// --- FUNÇÃO PRINCIPAL ---

export async function gerarCarteirinhaBuffer(alunoData, adminData, cursoData, carteirinhaData) {
    // Dimensões do Cartão
    const CARD_WIDTH = 10.2 * 28.35; // ~289.17 pts
    const CARD_HEIGHT = 6.7 * 28.35;  // ~190.00 pts
    
    // Margens do PDF
    const MARGIN_X = 30;
    const MARGIN_Y = 30;
    
    // Dimensões dos Elementos
    const PHOTO_SIZE_W = 75;
    const PHOTO_SIZE_H = 95;
    const QR_SIZE = 60;
    
    const doc = new PDFDocument({ size: 'A4', margin: 0 }); 
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    const endPromise = new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });

    // --- PRÉ-CARREGAR DADOS ---
    const [fotoBuffer, qrDataUrl] = await Promise.all([
        fetchImageBuffer(alunoData.foto_url), 
        QRCode.toDataURL(carteirinhaData.qrcode_token),
    ]);
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    
    // --- FRENTE DO CARTÃO ---
    
    // 1. FUNDO E BORDAS DO CARTÃO
    doc.save()
        .translate(MARGIN_X, MARGIN_Y)
        .rect(0, 0, CARD_WIDTH, CARD_HEIGHT)
        .fill('#003366')
        .rect(2, 2, CARD_WIDTH - 4, CARD_HEIGHT - 4)
        .fill('white');
        
    // 2. HEADER DA PREFEITURA E TÍTULO
    doc.fill('gray')
       .fontSize(7)
       .font('Helvetica')
       .text("PREFEITURA MUNICIPAL DE PIRAJUBA", 0, 5, { width: CARD_WIDTH, align: 'center' });
    
    doc.fill('#003366')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text("CARTEIRA DE IDENTIFICAÇÃO ESTUDANTIL", 0, 18, { width: CARD_WIDTH, align: 'center' });
             
    doc.rect(10, 36, CARD_WIDTH - 20, 1)
       .fill('#003366');
       
    // 3. ÁREA DA FOTO
    const PHOTO_X = CARD_WIDTH - PHOTO_SIZE_W - 8;
    const PHOTO_Y = 48;
    
    if (fotoBuffer) {
        doc.image(fotoBuffer, PHOTO_X, PHOTO_Y, { width: PHOTO_SIZE_W, height: PHOTO_SIZE_H });
    } else {
         doc.rect(PHOTO_X, PHOTO_Y, PHOTO_SIZE_W, PHOTO_SIZE_H)
            .stroke('#CCCCCC')
            .fill('white')
            .fill('gray')
            .fontSize(8)
            .text('FOTO 3X4', PHOTO_X, PHOTO_Y + PHOTO_SIZE_H / 2 - 4, { width: PHOTO_SIZE_W, align: 'center' });
    }

    // 4. INFORMAÇÕES DO ALUNO
    const INFO_X = 8;
    let y_cursor = 50; 
    
    // NOME COMPLETO
    doc.fill('black')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(alunoData.nome.toUpperCase(), INFO_X, y_cursor, { width: CARD_WIDTH - PHOTO_SIZE_W - 20 });
       
    y_cursor += 20;
    
    // DADOS PESSOAIS
    const DATA_WIDTH = CARD_WIDTH - PHOTO_SIZE_W - 20;

    const addFlowData = (label, value) => {
        doc.font('Helvetica-Bold').fontSize(8).text(label + ":", INFO_X, doc.y, { continued: true });
        doc.font('Helvetica').fontSize(9).text(` ${value}`, { continued: false, width: DATA_WIDTH - doc.widthOfString(label + ":") - 5 });
        doc.moveDown(0.1);
    }
    
    doc.y = y_cursor;
    
    addFlowData("RG", alunoData.rg);
    addFlowData("CPF", functionUtils.formatCPF(alunoData.cpf));
    addFlowData("DATA NASC.", functionUtils.formatDate(alunoData.data_nascimento));
    addFlowData("TEL.", functionUtils.formatTelefone(alunoData.telefone));
    addFlowData("TIPO SANGUÍNEO", alunoData.tipo_sanguineo);
    
    y_cursor = doc.y + 5; 

    // DADOS ACADÊMICOS
    doc.fill('#003366')
       .font('Helvetica-Bold')
       .fontSize(9)
       .text(`INSTITUIÇÃO: ${cursoData.faculdade_nome || 'N/A'}`, INFO_X, y_cursor, { width: DATA_WIDTH });
    y_cursor = doc.y;
    
    doc.text(`CURSO: ${cursoData.nome || 'N/A'}`, INFO_X, y_cursor, { width: DATA_WIDTH });
    y_cursor = doc.y + 10;

    // VALIDADE
    doc.fill('#CC0000') 
       .font('Helvetica-Bold')
       .fontSize(9)
       .text(`VALIDADE: ${functionUtils.formatDate(carteirinhaData.data_validade)}`, INFO_X, y_cursor);


    doc.restore();


    // --- VERSO DO CARTÃO (Card 2) ---
    
    const VERSO_Y = MARGIN_Y + CARD_HEIGHT + 5;
    
    // 1. FUNDO E BORDAS DO CARTÃO
    doc.save()
        .translate(MARGIN_X, VERSO_Y)
        .rect(0, 0, CARD_WIDTH, CARD_HEIGHT)
        .fill('#003366')
        .rect(2, 2, CARD_WIDTH - 4, CARD_HEIGHT - 4)
        .fill('white');
        
    // 2. QR CODE E ID DE AUTENTICAÇÃO
    const QR_VERSO_X = CARD_WIDTH / 2 - QR_SIZE / 2;
    const QR_VERSO_Y = 10;
    
    doc.fill('#003366')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text("CÓDIGO DE AUTENTICAÇÃO", 0, 5, { width: CARD_WIDTH, align: 'center' });

    doc.image(qrBuffer, QR_VERSO_X, QR_VERSO_Y + 5, { width: QR_SIZE, height: QR_SIZE });
    
    // ID DE AUTENTICAÇÃO
    doc.fill('gray')
       .font('Helvetica')
       .fontSize(6)
       .text(`ID: ${carteirinhaData.qrcode_token}`, 0, QR_VERSO_Y + QR_SIZE + 10, { width: CARD_WIDTH, align: 'center' });


    // 3. REGULAMENTO
    let regulamento_y = QR_VERSO_Y + QR_SIZE + 30; 

    doc.fill('#003366')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text("REGULAMENTO DE USO DO TRANSPORTE", 0, regulamento_y, { width: CARD_WIDTH, align: 'center' });
       
    regulamento_y += 15;
       
    doc.fill('black')
       .font('Helvetica')
       .fontSize(7)
       .list([
           'A carteirinha é de uso pessoal e intransferível. Mau uso resultará na suspensão imediata do benefício.',
           'O estudante deve apresentá-la ao embarcar, junto a um documento com foto.',
           'É obrigatório manter o cadastro do aluno atualizado junto à Secretaria Municipal de Educação.',
           'Em caso de perda, furto ou roubo, comunicar imediatamente à secretaria para emissão de nova via (sujeita a taxa).',
       ], 10, regulamento_y, { lineHeight: 1.3, width: CARD_WIDTH - 20 });
       
    // 4. INFORMAÇÕES DE CONTATO 
    const CONTACT_Y = CARD_HEIGHT - 30;
    
             
    // 5. RODAPÉ DE EMISSÃO
    doc.fill('black')
       .fontSize(6)
       .text(`Emitido digitalmente em: ${functionUtils.formatDate(new Date())} por ${adminData.nome}`, 
             5, CONTACT_Y + 10, { width: CARD_WIDTH - 10, align: 'right' });
             
    doc.restore();

    doc.end();

    return endPromise;
}