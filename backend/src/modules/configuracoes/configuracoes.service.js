import { prisma } from '../../config/prisma.js'
import { randomUUID } from 'crypto'
import { uploadFile } from '../../config/storage.js'

const STORED_PREFIX = 'stored:'

export async function getConfiguracao() {
    const configuracoes = await prisma.configuracao.findUnique({
        where: { id: 1 }
    })

    if (!configuracoes) return null

    return resolveStoredUrl(configuracoes)
}

async function resolveStoredUrl(config) {
    if (!config.logoUrl?.startsWith(STORED_PREFIX)) return config

    const filePath = config.logoUrl.slice(STORED_PREFIX.length)
    const { getSignedUrl } = await import('../../config/storage.js')
    const signedUrl = await getSignedUrl(filePath)
    return { ...config, logoUrl: signedUrl }
}

export async function updateHoraLimite(hora) {
    const [hours, minutes] = hora.split(':').map(Number);
    const data = new Date();
    data.setHours(hours, minutes, 0, 0);
    const configuracoes = await prisma.configuracao.update({
        where: { id: 1 },
        data: { horaLimitePresenca: data }
    })

    return configuracoes
}

export async function gethoraLimitePresenca() {
    const config = await getConfiguracao()
    return config.horaLimitePresenca
}

export async function updateLogoUrl(logoUrl) {
    const updated = await prisma.configuracao.update({
        where: { id: 1 },
        data: { logoUrl }
    })
    return updated
}

const MAGIC_BYTES_IMG = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
};

function checkImageMagicBytes(buffer, mimeType) {
  const signatures = MAGIC_BYTES_IMG[mimeType];
  if (!signatures) return mimeType === 'image/svg+xml';
  return signatures.some(sig => sig.every((byte, i) => buffer[i] === byte));
}

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
};

export async function uploadLogo(file) {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowed.includes(file.mimetype)) throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG, SVG ou WebP.');

    const normalizedMime = file.mimetype === 'image/jpg' ? 'image/jpeg' : file.mimetype;
    if (!checkImageMagicBytes(file.buffer, normalizedMime)) {
      throw new Error('Arquivo inválido ou corrompido.');
    }

    const ext = MIME_EXT[normalizedMime] || 'png';
    const filename = `logo/logo-${Date.now()}-${randomUUID()}.${ext}`;

    await uploadFile(filename, file.buffer, file.mimetype);

    await updateLogoUrl(`${STORED_PREFIX}${filename}`);

    return getConfiguracao()
}

export async function updateNomeOrganizacao(nome) {
    const updated = await prisma.configuracao.update({
        where: { id: 1 },
        data: { nomeOrganizacao: nome }
    })
    return updated
}

function parseTimeToDate(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
}

export async function getHorariosViagem() {
    const config = await getConfiguracao()
    return {
        horaInicioIda: config.horaInicioIda,
        horaFimIda: config.horaFimIda,
        horaInicioVolta: config.horaInicioVolta,
        horaFimVolta: config.horaFimVolta,
    }
}

export async function updateHorariosViagem({ horaInicioIda, horaFimIda, horaInicioVolta, horaFimVolta }) {
    const data = {};
    if (horaInicioIda) data.horaInicioIda = parseTimeToDate(horaInicioIda);
    if (horaFimIda) data.horaFimIda = parseTimeToDate(horaFimIda);
    if (horaInicioVolta) data.horaInicioVolta = parseTimeToDate(horaInicioVolta);
    if (horaFimVolta) data.horaFimVolta = parseTimeToDate(horaFimVolta);

    const updated = await prisma.configuracao.update({
        where: { id: 1 },
        data,
    })
    return updated
}