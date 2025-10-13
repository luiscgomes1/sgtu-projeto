import { botRequest } from './apiClient.js';

export function setupAdminBot(bot) {

    bot.command("resumo", async (ctx) => {
        const session = getSession(ctx.from.id);
        if (!session || session.tipo !== "admin") {
            return ctx.reply("❌ Apenas administradores podem usar este comando.");
        }

        try {
            const data = await botRequest("/viagens/hoje/resumo");

            if (!Object.keys(data).length) {
                ctx.reply("⚠️ Nenhum aluno confirmou presença hoje.");
            }

            let msg = `📊 *Relatório de Presenças - Hoje*\n\n`;
            let total = 0;

            for (const rota in data) {
                const qtd = data[rota].length;
                total += qtd;
                msg += `🚌 *${rota}*: ${qtd} alunos\n`;
            }

            msg += `\n*Total:* ${total} alunos`;
            await ctx.replyWithMarkdown(msg);
        } catch (error) {
            console.error("Erro ao buscar relatório de presenças:", error);
            ctx.reply("❌ Ocorreu um erro ao buscar o relatório de presenças.");
        }
    });

    bot.command("relatorio", async (ctx) => {
        const session = getSession(ctx.from.id);
        if (!session || session.tipo !== "admin") {
            return ctx.reply("❌ Apenas administradores podem usar este comando.");
        }

        try {
            const data = await botRequest("/viagens/hoje/alunos");

            if (!Object.keys(data).length) {
                return ctx.reply("⚠️ Nenhum aluno confirmou presença hoje.");
            }
            let msg = `📋 *Relatório Detalhado de Presenças - Hoje*\n\n`;

            for (const rota in data) {
                msg += `🚌 *${rota}*\n`;
                data[rota].forEach((aluno, i) => {
                    msg += `  ${i + 1}. ${aluno.nome}`;
                    if (aluno.faculdade) msg += ` 🎓 (${aluno.faculdade})\n`;
                    msg += `\n`;
                });
                msg += `\n`;
            }
            await ctx.replyWithMarkdown(msg);
        } catch (error) {
            console.error("Erro ao buscar relatório detalhado de presenças:", error);
            ctx.reply("❌ Ocorreu um erro ao buscar o relatório detalhado de presenças.");
        }
    });
}