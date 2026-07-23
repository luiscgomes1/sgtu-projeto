import { formatDate } from '../utils/functions.js';
import api, { userRequestWithRefresh } from './apiClient.js';
import { getSession, setSession, setUserCommands } from './session.js';
import { logger } from '../config/logger.js';

export function setupAlunoBot(bot) {
    bot.command("login", async (ctx) => {
        const parts = ctx.message.text.split(" ");
        if (parts.length < 3) return ctx.reply("⚠️ Use: /login email senha");

        const email = parts[1];
        const senha = parts.slice(2).join(" ");

        try {
            const botClientHeader = process.env.BOT_CLIENT_HEADER || 'X-Bot-Client';
            const response = await api.post('/auth/login', {
                email,
                senha,
            }, {
                headers: { [botClientHeader]: 'true' }
            }
        );

            const data = response.data;

            setSession(ctx.from.id, { 
                token: data.accessToken, 
                refreshToken: data.refreshToken,
                userId: data.user.id,
                tipo: data.user.tipo,
                nome: data.user.nome,
                status: data.user.status,
             });
            setUserCommands(ctx.telegram, ctx.from.id, data.user.tipo);
            ctx.reply("✅ Login realizado com sucesso!");
        } catch (error) {
            logger.error({ status: error.response?.status, data: error.response?.data, message: error.message });
            ctx.reply("❌ Falha no login. Verifique suas credenciais.");
        }
    });

    bot.command("validade", async (ctx) => {
        const session = await getSession(ctx.from.id);
        if (!session || session.tipo !== "aluno") return ctx.reply("❌ Você precisa estar logado e precisa ser um aluno.");

        try {
            const resp = await userRequestWithRefresh(`/carteirinhas/${session.userId}`, session);
            const data = resp?.data;
            if (!data) throw new Error("Erro ao consultar carteirinha");

            if (!data.length) return ctx.reply("❌ Você não possui uma carteirinha ativa.");

            
            const carteirinha = data[0];

            ctx.reply(`🎫 Sua carteirinha é válida até: ${formatDate(carteirinha.data_validade)}`);
        } catch (err) {
            logger.error({ status: err.response?.status, data: err.response?.data, message: err.message }, 'Erro validade bot');
            ctx.reply("❌ Falha ao obter carteirinha.");
        }
    });

    bot.command("carteirinha", async (ctx) => {
        const session = await getSession(ctx.from.id);
        if (!session || session.tipo !== "aluno") return ctx.reply("❌ Você precisa estar logado e ser um aluno.");

        try {
            const resp = await userRequestWithRefresh(`/carteirinhas/${session.userId}`, session);
            const data = resp?.data;
            if (!data?.length) return ctx.reply("❌ Você não possui carteirinha ativa.");

            const carteirinha = data[0];
            const pdfResp = await userRequestWithRefresh(`/carteirinhas/${carteirinha.id}/pdf`, session, {
                responseType: 'arraybuffer',
            });

            await ctx.replyWithDocument({
                source: Buffer.from(pdfResp.data),
                filename: `carteirinha_${carteirinha.id}.pdf`,
            });
        } catch (err) {
            logger.error({ status: err.response?.status, message: err.message }, 'Erro ao obter carteirinha PDF via bot');
            ctx.reply("❌ Falha ao obter o PDF da carteirinha.");
        }
    });

    bot.command("presenca", async (ctx) => {
        const session = await getSession(ctx.from.id);
        if(!session || session.tipo !== "aluno") {
            return ctx.reply("❌ Você precisa estar logado e ser um aluno para marcar presença. Use /login primeiro.");
        }

        try {
            const resp = await userRequestWithRefresh('/presencas/marcar-presenca/', session, {
                method: "POST",
            });
            const data = resp?.data;
            ctx.reply(`✅ Presença marcada com sucesso para hoje: ${data?.message || 'OK'}`);
        } catch (error) {
            logger.error({ status: error.response?.status, data: error.response?.data, message: error.message }, 'Erro ao marcar presenca via bot');
            const serverMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Erro interno.';
            ctx.reply(`⚠️ Erro ao registrar presença: ${serverMsg}`);
        }
    });
}