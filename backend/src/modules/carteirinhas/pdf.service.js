import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import * as functionUtils from '../../utils/functions.js';
import { getSignedUrl } from '../../config/storage.js';
import { logger } from '../../config/logger.js';

async function fetchImageBuffer(url) {
    if (!url || typeof url !== 'string' || url.length < 5) return null;

    try {
        const signedUrl = await getSignedUrl(url, 60);
        const res = await fetch(signedUrl);

        if (res.ok) {
            const arr = new Uint8Array(await res.arrayBuffer());
            return Buffer.from(arr);
        } else {
            logger.error({ status: res.status, url: signedUrl }, 'Erro ao fazer fetch da imagem');
        }
    } catch (error) {
        logger.error({ err: error }, "Erro geral no fetchImageBuffer");
    }
    return null;
}

export async function gerarCarteirinhaBuffer(alunoData, adminData, cursoData, carteirinhaData, configData) {
    const { logoUrl, nomeOrganizacao } = configData || {};
    const orgName = nomeOrganizacao || 'PREFEITURA MUNICIPAL DE PIRAJUBA';

    const CARD_WIDTH = 10.2 * 28.35;
    const CARD_HEIGHT = 6.7 * 28.35;

    const MARGIN_X = 30;
    const MARGIN_Y = 30;

    const PHOTO_SIZE_W = 75;
    const PHOTO_SIZE_H = 95;
    const QR_SIZE = 80;

    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    const endPromise = new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });

    const [fotoBuffer, logoBuffer, qrDataUrl] = await Promise.all([
        fetchImageBuffer(alunoData.foto_url),
        fetchImageBuffer(logoUrl),
        QRCode.toDataURL(carteirinhaData.qrcode_token),
    ]);
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    // --- FRENTE DO CARTÃO ---

    doc.save()
        .roundedRect(MARGIN_X, MARGIN_Y, CARD_WIDTH, CARD_HEIGHT, 6)
        .fill('#003366')
        .roundedRect(MARGIN_X + 2, MARGIN_Y + 2, CARD_WIDTH - 4, CARD_HEIGHT - 4, 5)
        .fill('white');

    // Logo 20x20 no canto esquerdo
    const LOGO_SIZE = 20;
    const LOGO_X = MARGIN_X + 6;
    const LOGO_Y = MARGIN_Y + 3;

    if (logoBuffer) {
        doc.save()
            .roundedRect(LOGO_X, LOGO_Y, LOGO_SIZE, LOGO_SIZE, 4)
            .clip()
            .image(logoBuffer, LOGO_X, LOGO_Y, { width: LOGO_SIZE, height: LOGO_SIZE })
            .restore();
    } else {
        doc.circle(LOGO_X + LOGO_SIZE / 2, LOGO_Y + LOGO_SIZE / 2, LOGO_SIZE / 2)
            .fill('#003366');
        doc.fillColor('white')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(orgName.charAt(0).toUpperCase(), LOGO_X + 6, LOGO_Y + 4);
    }

    // Nome da organização
    doc.fill('#6B7280')
        .fontSize(7)
        .font('Helvetica')
        .text(orgName, MARGIN_X, MARGIN_Y + 8, { width: CARD_WIDTH, align: 'center' });

    // Título
    doc.fill('#003366')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text("CARTEIRA DE IDENTIFICAÇÃO ESTUDANTIL", MARGIN_X, MARGIN_Y + 24, { width: CARD_WIDTH, align: 'center' });

    // Linha separadora
    doc.rect(MARGIN_X + 10, MARGIN_Y + 42, CARD_WIDTH - 20, 1)
        .fill('#003366');

    // Área da foto
    const PHOTO_X = MARGIN_X + CARD_WIDTH - PHOTO_SIZE_W - 8;
    const PHOTO_Y = MARGIN_Y + 54;

    if (fotoBuffer) {
        doc.image(fotoBuffer, PHOTO_X, PHOTO_Y, { width: PHOTO_SIZE_W, height: PHOTO_SIZE_H });
    } else {
        doc.roundedRect(PHOTO_X, PHOTO_Y, PHOTO_SIZE_W, PHOTO_SIZE_H, 3)
            .lineWidth(1)
            .stroke('#B0BEC5')
            .fill('#F5F5F5');
        doc.fill('#78909C')
            .font('Helvetica')
            .fontSize(8)
            .text('FOTO', PHOTO_X, PHOTO_Y + PHOTO_SIZE_H / 2 - 4, { width: PHOTO_SIZE_W, align: 'center' });
    }

    // Nome do aluno
    const INFO_X = MARGIN_X + 8;

    doc.fill('#1A1A1A')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(alunoData.nome.toUpperCase(), INFO_X, MARGIN_Y + 56, { width: CARD_WIDTH - PHOTO_SIZE_W - 22 });

    // Dados pessoais — usa doc.y dinâmico após o nome
    let y = doc.y + 2;

    const addField = (label, value) => {
        doc.font('Helvetica-Bold').fontSize(7).fill('#37474F')
            .text(label + ":", INFO_X, y, { continued: true });
        doc.font('Helvetica').fontSize(8).fill('#1A1A1A')
            .text(" " + (value || 'N/A'), { width: CARD_WIDTH - PHOTO_SIZE_W - 28 });
        y = doc.y + 1;
    };

    addField("RG", alunoData.rg);
    addField("CPF", functionUtils.formatCPF(alunoData.cpf));
    addField("DATA NASC.", functionUtils.formatDate(alunoData.data_nascimento));
    addField("TEL.", functionUtils.formatTelefone(alunoData.telefone));
    addField("TIPO SANGUÍNEO", alunoData.tipo_sanguineo);

    y += 3;

    // Dados acadêmicos
    doc.fill('#003366')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text("INSTITUIÇÃO: " + (cursoData.faculdade_nome || 'N/A'), INFO_X, y, { width: CARD_WIDTH - PHOTO_SIZE_W - 22 });
    y = doc.y;
    doc.text("CURSO: " + (cursoData.nome || 'N/A'), INFO_X, y + 2, { width: CARD_WIDTH - PHOTO_SIZE_W - 22 });
    y = doc.y + 8;

    // Validade
    doc.fill('#DC2626')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text("VALIDADE: " + functionUtils.formatDate(carteirinhaData.data_validade), INFO_X, y);

    doc.restore();

    // --- VERSO DO CARTÃO ---

    const VERSO_Y = MARGIN_Y + CARD_HEIGHT + 10;

    doc.save()
        .roundedRect(MARGIN_X, VERSO_Y, CARD_WIDTH, CARD_HEIGHT, 6)
        .fill('#003366')
        .roundedRect(MARGIN_X + 2, VERSO_Y + 2, CARD_WIDTH - 4, CARD_HEIGHT - 4, 5)
        .fill('white');

    // Código de autenticação
    doc.fill('#003366')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text("CÓDIGO DE AUTENTICAÇÃO", MARGIN_X, VERSO_Y + 5, { width: CARD_WIDTH, align: 'center' });

    // QR Code
    const QR_VERSO_X = MARGIN_X + CARD_WIDTH / 2 - QR_SIZE / 2;
    doc.image(qrBuffer, QR_VERSO_X, VERSO_Y + 15, { width: QR_SIZE, height: QR_SIZE });

    // ID de autenticação
    doc.fill('#6B7280')
        .font('Helvetica')
        .fontSize(6)
        .text("ID: " + carteirinhaData.qrcode_token, MARGIN_X, VERSO_Y + QR_SIZE + 20, { width: CARD_WIDTH, align: 'center' });

    // Regulamento
    let regY = VERSO_Y + QR_SIZE + 38;
    doc.fill('#003366')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text("REGULAMENTO DE USO DO TRANSPORTE", MARGIN_X, regY, { width: CARD_WIDTH, align: 'center' });

    regY += 14;
    doc.fill('#1A1A1A')
        .font('Helvetica')
        .fontSize(6.5)
        .list([
            'Uso pessoal e intransferível. Mau uso resulta em suspensão do benefício.',
            'Apresentar a mesma ao embarcar.',
            'Manter o cadastro atualizado junto à Secretaria de Educação.',
            'Comunicar perda, furto ou roubo à secretaria para emissão de 2ª via (sujeita a taxa).',
        ], MARGIN_X + 10, regY, { lineHeight: 1.2, width: CARD_WIDTH - 20 });

    // Rodapé
    doc.fill('#1A1A1A')
        .fontSize(5.5)
        .text("Emitido digitalmente em: " + functionUtils.formatDate(new Date()) + " por " + adminData.nome,
              MARGIN_X + 5, VERSO_Y + CARD_HEIGHT - 12, { width: CARD_WIDTH - 10, align: 'right' });

    doc.restore();

    doc.end();

    return endPromise;
}
