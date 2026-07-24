import { botRequest } from './apiClient.js';
import { getSession } from './session.js';
import { logger } from '../config/logger.js';

export function setupAdminBot(bot) {

    async function resumoHandler(ctx) {
        const session = await getSession(ctx.from.id ?? ctx.update?.callback_query?.from?.id);
        if (!session || session.tipo !== "admin") {
            return ctx.reply("❌ Apenas administradores podem usar este comando.");
        }

        try {
            const { data } = await botRequest("/viagens/hoje/resumo");

            if (!data || Object.keys(data).length === 0) {
                return ctx.reply("⚠️ Nenhum aluno confirmou presença hoje.");
            }

            let msg = "📊 *Relatório de Presenças - Hoje*\n\n";
            let total = 0;

            for (const rota in data) {
                const qtd = Number(data[rota] || 0);
                total += qtd;
                msg += `🚌 *${rota}*: ${qtd} alunos\n`;
            }

            msg += `\n*Total:* ${total} alunos`;
            ctx.replyWithMarkdown(msg);
        } catch (error) {
            logger.error({ err: error }, "Erro ao buscar relatório de presenças");
            ctx.reply("❌ Ocorreu um erro ao buscar o relatório de presenças.");
        }
    }

    async function relatorioHandler(ctx) {
        const session = await getSession(ctx.from.id ?? ctx.update?.callback_query?.from?.id);
        if (!session || session.tipo !== "admin") {
            return ctx.reply("❌ Apenas administradores podem usar este comando.");
        }

        try {
            const { data } = await botRequest("/viagens/hoje/alunos");

            if (!data || Object.keys(data).length === 0) {
                return ctx.reply("⚠️ Nenhum aluno confirmou presença hoje.");
            }
            let msg = "📋 *Relatório Detalhado de Presenças - Hoje*\n\n";

            for (const rota in data) {
                msg += `🚌 *${rota}*\n`;
                let idx = 0;
                for (const faculdade in data[rota]) {
                    const alunos = data[rota][faculdade] || [];
                    alunos.forEach((aluno) => {
                        idx++;
                        msg += `  ${idx}. ${aluno.nome} 🎓 ${aluno.faculdade || faculdade}\n`;
                    });
                }
                msg += "\n";
            }
            ctx.replyWithMarkdown(msg);
        } catch (error) {
            logger.error({ err: error }, "Erro ao buscar relatório detalhado de presenças");
            ctx.reply("❌ Ocorreu um erro ao buscar o relatório detalhado de presenças.");
        }
    }

    bot.command("admin", async (ctx) => {
        const session = await getSession(ctx.from.id);
        if (!session || session.tipo !== "admin") {
            return ctx.reply("❌ Apenas administradores podem usar este comando.");
        }
        ctx.reply("📊 Painel Admin", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📈 Resumo de Presenças', callback_data: 'admin_resumo' }],
                    [{ text: '📋 Relatório Detalhado', callback_data: 'admin_relatorio' }],
                ],
            },
        });
    });

    bot.action("admin_resumo", async (ctx) => {
        await ctx.answerCbQuery();
        await resumoHandler(ctx);
    });

    bot.action("admin_relatorio", async (ctx) => {
        await ctx.answerCbQuery();
        await relatorioHandler(ctx);
    });

    bot.command("resumo", resumoHandler);
    bot.command("relatorio", relatorioHandler);
}