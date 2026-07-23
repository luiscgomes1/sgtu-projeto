import { prisma } from '../../config/prisma.js'

export async function getConfiguracao() {
    const configuracoes = await prisma.configuracao.findUnique({
        where: { id: 1 }
    })

    return configuracoes
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

export async function updateNomeOrganizacao(nome) {
    const updated = await prisma.configuracao.update({
        where: { id: 1 },
        data: { nomeOrganizacao: nome }
    })
    return updated
}