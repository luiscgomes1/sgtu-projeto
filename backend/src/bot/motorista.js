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

  // Envia lista automaticamente às 15h
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
          msg += `🚌 *${rota}*\n`;

          const faculdadesNaRota = agrupado[rota];
          for (let faculdade in faculdadesNaRota) {
            msg += `\n🎓 *${faculdade}*\n`;
            let alunos = faculdadesNaRota[faculdade];

            if (!alunos?.length) {
              msg += "  Nenhum aluno confirmou presença hoje.\n";
            } else {
              alunos.forEach((a) => {
                msg += `  - ${a.nome}\n`;
              });
              msg += `\n`;
            }
          }
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

    const WEB_VIEW_URL = `https://seu-frontend/motorista/volta?token=${WEB_VIEW_TOKEN}`;

    let msg = `🚌 *EMBARQUE DE VOLTA INICIADO* 🚌\n\n`;
    msg += `Acompanhe o status do embarque em tempo real:\n\n`;
    msg += `[Abrir Painel em Tempo Real](${WEB_VIEW_URL})\n\n`;
    msg += `Acesso disponível apenas entre 21h e 23h.`;

    await bot.telegram.sendMessage(
      MOTORISTAS_GROUP_ID,
      msg,
      { parse_mode: "Markdown", disable_web_page_preview: true }
    );
  });

}
