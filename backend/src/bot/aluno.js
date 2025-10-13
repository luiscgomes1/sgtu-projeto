import { formatDate } from '../utils/functions.js';
import api, { userRequest } from './apiClient.js';
import { getSession, setSession } from './session.js';

export function setupAlunoBot(bot) {
    bot.command("login", async (ctx) => {
        const parts = ctx.message.text.split(" ");
        if (parts.length < 3) return ctx.reply("⚠️ Use: /login email senha");

        const email = parts[1];
        const senha = parts.slice(2).join(" ");

        console.log(`Tentando login para ${email}`);
        console.log(`Senha recebida: ${senha}`);
        try {
            const response = await api.post('/auth/login', {
                email,
                senha,
            }, {
                headers: { 'X-Bot-Client': 'true' }
            }
        );

            const data = response.data;
            console.log(data);

            setSession(ctx.from.id, { 
                token: data.token, 
                userId: data.user.id,
                tipo: data.user.tipo,
                nome: data.user.nome
             });
            ctx.reply("✅ Login realizado com sucesso!");
        } catch (error) {
            console.error(error.response?.status, error.response?.data, error.message);
            ctx.reply("❌ Falha no login. Verifique suas credenciais.");
        }
    });

    bot.command("validade", async (ctx) => {
        const session = await getSession(ctx.from.id);
        if (!session || session.tipo !== "aluno") return ctx.reply("❌ Você precisa estar logado como aluno.");

        try {
            const resp = await userRequest(`/carteirinhas/${session.userId}`, session.token, { method: "GET" });
            const data = resp?.data;
            if (!data) throw new Error("Erro ao consultar carteirinha");

            if (!data.length) return ctx.reply("❌ Você não possui uma carteirinha ativa.");

            
            const carteirinha = data[0];
            console.log(carteirinha);

            ctx.reply(`🎫 Sua carteirinha é válida até: ${formatDate(carteirinha.data_validade)}`);
        } catch (err) {
            console.error('Erro validade bot:', err.response?.status, err.response?.data || err.message);
            ctx.reply("❌ Falha ao obter carteirinha.");
        }
    });

    bot.command("presenca", async (ctx) => {
        const session = await getSession(ctx.from.id);
        if(!session || session.tipo !== "aluno") {
            return ctx.reply("❌ Você precisa estar logado como aluno para marcar presença. Use /login primeiro.");
        }

        try {
            const resp = await userRequest('/presencas/marcar-presenca/', session.token, {
                method: "POST",
            });
            const data = resp?.data;
            ctx.reply(`✅ Presença marcada com sucesso para hoje: ${data?.message || 'OK'}`);
        } catch (error) {
            console.error('Erro ao marcar presenca via bot:', error.response?.status, error.response?.data || error.message);
            // Extrai mensagem amigável retornada pelo servidor (se disponível)
            const serverMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Erro interno.';
            ctx.reply(`⚠️ Erro ao registrar presença: ${serverMsg}`);
        }
    });
}