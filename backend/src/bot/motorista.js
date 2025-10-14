import cron from "node-cron";
import { botRequest } from "./apiClient.js";

export function setupMotoristaBot(bot) {
  const MOTORISTAS_GROUP_ID = process.env.MOTORISTAS_GROUP_ID;
  if (!MOTORISTAS_GROUP_ID) {
    console.warn(
      "⚠️ MOTORISTAS_GROUP_ID não está definido. Bot de motorista não será configurado."
    );
    return;
  }

  cron.schedule("0 15 * * *", async () => {
    try {
      const { data } = await botRequest("/viagens/hoje/alunos");
      const agrupado = data;

      let msg = `📋 *Lista de Presenças - ${new Date().toLocaleDateString(
        "pt-BR"
      )}*\n\n`;

      const rotas = Object.keys(agrupado);
      if (!rotas.length) {
        msg += "Nenhum aluno confirmou presença hoje.";
      } else {
        for (let rota of rotas) {
          msg += `🚌 *${rota}*\n\n`;

          const faculdadesNaRota = agrupado[rota];
          let totalPorRota = 0;

          for (let faculdade in faculdadesNaRota) {
            msg += `🎓 *${faculdade}*\n`;
            let alunos = faculdadesNaRota[faculdade];

            if (!alunos?.length) {
              msg += "  Nenhum aluno confirmou presença hoje.\n\n";
            } else {
              alunos.forEach((a) => {
                msg += `  - ${a.nome}\n`;
              });
              totalPorRota += alunos.length;
              msg += `\n`;
            }
          }

          msg += `*Total nesta rota:* ${totalPorRota}\n\n`;
        }
      }

      await bot.telegram.sendMessage(MOTORISTAS_GROUP_ID, msg, {
        parse_mode: "Markdown",
      });
    } catch (err) {
      console.error("Erro ao enviar lista automática:", err);
      if (MOTORISTAS_GROUP_ID) {
        bot.telegram.sendMessage(
          MOTORISTAS_GROUP_ID,
          "⚠️ Erro Crítico: Falha ao gerar e enviar lista automática de presenças.",
          { parse_mode: "Markdown" }
        );
      }
    }
  });

  cron.schedule("0 21 * * *", async () => {

    const WEB_VIEW_TOKEN = process.env.WEB_VIEW_TOKEN;
    const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

    const WEB_VIEW_URL = `${FRONTEND_URL}/motorista/volta?token=${WEB_VIEW_TOKEN}`;

    console.log('DEBUG: WEB_VIEW_URL =', WEB_VIEW_URL);

    const msg = `🚌 *EMBARQUE DE VOLTA INICIADO* 🚌\n\n` +
      `Acompanhe o status do embarque em tempo real:\n\n` +
      `Acesse o painel através do botão abaixo.`;

    if (WEB_VIEW_URL.startsWith('https://')) {
      const options = {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{ text: 'Abrir Painel em Tempo Real', url: WEB_VIEW_URL }]]
        }
      };
      await bot.telegram.sendMessage(MOTORISTAS_GROUP_ID, msg, options);
    } else {
      const markdownMsg = msg + '\n\n' + `[Abrir Painel em Tempo Real](${WEB_VIEW_URL})\n\n${WEB_VIEW_URL}`;
      await bot.telegram.sendMessage(MOTORISTAS_GROUP_ID, markdownMsg, { parse_mode: 'Markdown' });
    }
  });

}
