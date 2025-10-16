import { botRequest } from './apiClient.js';
import { getSession } from './session.js';

export function setupAdminBot(bot) {

    bot.command("resumo", async (ctx) => {
        const session = await getSession(ctx.from.id);
        if (!session || session.tipo !== "admin") {
            return await ctx.reply("❌ Apenas administradores podem usar este comando.");
        }

        try {
            const { data } = await botRequest("/viagens/hoje/resumo");

            if (!data || Object.keys(data).length === 0) {
                return await ctx.reply("⚠️ Nenhum aluno confirmou presença hoje.");
            }

            let msg = `📊 *Relatório de Presenças - Hoje*\n\n`;
            let total = 0;

            for (const rota in data) {
                const qtd = Number(data[rota] || 0);
                total += qtd;
                msg += `🚌 *${rota}*: ${qtd} alunos\n`;
            }

            msg += `\n*Total:* ${total} alunos`;
            await ctx.replyWithMarkdown(msg);
        } catch (error) {
            console.error("Erro ao buscar relatório de presenças:", error);
            await ctx.reply("❌ Ocorreu um erro ao buscar o relatório de presenças.");
        }
    });

    bot.command("relatorio", async (ctx) => {
        const session = await getSession(ctx.from.id);
        if (!session || session.tipo !== "admin") {
            return await ctx.reply("❌ Apenas administradores podem usar este comando.");
        }

        try {
            const { data } = await botRequest("/viagens/hoje/alunos");

            if (!data || Object.keys(data).length === 0) {
                return await ctx.reply("⚠️ Nenhum aluno confirmou presença hoje.");
            }
            let msg = `📋 *Relatório Detalhado de Presenças - Hoje*\n\n`;

            for (const rota in data) {
                msg += `🚌 *${rota}*\n`;
                const lista = data[rota] || [];
                lista.forEach((aluno, i) => {
                    msg += `  ${i + 1}. ${aluno.nome}`;
                    if (aluno.faculdade) msg += ` 🎓 (${aluno.faculdade})`;
                    msg += `\n`;
                });
                msg += `\n`;
            }
            await ctx.replyWithMarkdown(msg);
        } catch (error) {
            console.error("Erro ao buscar relatório detalhado de presenças:", error);
            await ctx.reply("❌ Ocorreu um erro ao buscar o relatório detalhado de presenças.");
        }
    });
}