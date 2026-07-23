import cron from "node-cron";
import jwt from 'jsonwebtoken';
import { botRequest } from "./apiClient.js";
import { safeSend } from './safeSend.js';
import { logger } from '../config/logger.js';

export function setupMotoristaBot(bot) {
  const MOTORISTAS_GROUP_ID = process.env.MOTORISTAS_GROUP_ID;
  if (!MOTORISTAS_GROUP_ID) {
    logger.warn("⚠️ MOTORISTAS_GROUP_ID não está definido. Bot de motorista não será configurado.");
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

      await safeSend(bot.telegram, 'sendMessage', MOTORISTAS_GROUP_ID, msg, {
        parse_mode: "Markdown",
      });
    } catch (err) {
      logger.error({ err }, "Erro ao enviar lista automática");
      if (MOTORISTAS_GROUP_ID) {
        await safeSend(bot.telegram, 'sendMessage', MOTORISTAS_GROUP_ID, "⚠️ Erro Crítico: Falha ao gerar e enviar lista automática de presenças.", { parse_mode: "Markdown" });
      }
    }
  });

  cron.schedule("21 23 * * *", async () => {
    try {
      const { data } = await botRequest("/viagens/hoje/alunos");
      const agrupado = data || {};

      let totalAlunos = 0;
      for (const rota of Object.keys(agrupado)) {
        const faculdades = agrupado[rota] || {};
        for (const faculdade of Object.keys(faculdades)) {
          const lista = faculdades[faculdade] || [];
          totalAlunos += Array.isArray(lista) ? lista.length : 0;
        }
      }

      if (!totalAlunos) {
        logger.info('Nenhum aluno confirmado para hoje — não será enviado o link do motorista.');
        return;
      }

      const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
      const webviewToken = jwt.sign(
        { scope: 'motorista:volta', iat: Math.floor(Date.now() / 1000) },
        process.env.JWT_SECRET,
        { expiresIn: '2h' },
      );

      const WEB_VIEW_URL = `${FRONTEND_URL}/motorista/volta?token=${webviewToken}`;

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
        await safeSend(bot.telegram, 'sendMessage', MOTORISTAS_GROUP_ID, msg, options);
      } else {
        const markdownMsg = msg + '\n\n' + `[Abrir Painel em Tempo Real](${WEB_VIEW_URL})\n\n${WEB_VIEW_URL}`;
        await safeSend(bot.telegram, 'sendMessage', MOTORISTAS_GROUP_ID, markdownMsg, { parse_mode: 'Markdown' });
      }
    } catch (err) {
      logger.error({ err }, 'Erro ao enviar painel de motorista (23:21)');
      if (MOTORISTAS_GROUP_ID) {
        await safeSend(bot.telegram, 'sendMessage', MOTORISTAS_GROUP_ID, "⚠️ Erro ao tentar enviar painel de motorista.", { parse_mode: "Markdown" });
      }
    }
  });
}
