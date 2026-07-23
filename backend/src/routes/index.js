import express from 'express';
import alunosRoutes from '../modules/alunos/alunos.routes.js';
import alunoPontosRoutes from '../modules/alunoPontos/alunoPontos.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import carteirinhasRoutes from '../modules/carteirinhas/carteirinhas.routes.js';
import configuracoesRoutes from '../modules/configuracoes/configuracoes.routes.js';
import cursosRoutes from '../modules/cursos/cursos.routes.js';
import escalasRoutes from '../modules/escalas/escalas.routes.js';
import faculdadeRoutes from '../modules/faculdades/faculdades.routes.js';
import motoristasRoutes from '../modules/motoristas/motoristas.routes.js';
import pontosRoutes from '../modules/pontos/pontos.routes.js';
import presencasRoutes from '../modules/presencas/presencas.routes.js';
import relatoriosRoutes from '../modules/relatorios/relatorios.routes.js';
import rotaFaculdadesRoutes from '../modules/rotaFaculdades/rotaFaculdades.routes.js';
import rotaMotoristasRoutes from '../modules/rotaMotoristas/rotaMotoristas.routes.js';
import rotaPontosRoutes from '../modules/rotaPontos/rotaPontos.routes.js';
import rotasRoutes from '../modules/rotas/rotas.routes.js';
import signupRoutes from '../modules/signup/signup.routes.js';
import uploadRoutes from '../upload/upload.routes.js';
import usuarioRoutes from '../modules/usuarios/usuario.routes.js';
import viagensRoutes from '../modules/viagens/viagens.routes.js';
import { authLimiter, uploadLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.use('/alunos', alunosRoutes);
router.use('/aluno-pontos', alunoPontosRoutes);
router.use('/auth', authLimiter, authRoutes);
router.use('/carteirinhas', carteirinhasRoutes);
router.use('/configuracoes', configuracoesRoutes);
router.use('/cursos', cursosRoutes);
router.use('/escalas', escalasRoutes);
router.use('/faculdades', faculdadeRoutes);
router.use('/motoristas', motoristasRoutes);
router.use('/pontos', pontosRoutes);
router.use('/presencas', presencasRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/rota-faculdades', rotaFaculdadesRoutes);
router.use('/rota-motoristas', rotaMotoristasRoutes);
router.use('/rota-pontos', rotaPontosRoutes);
router.use('/rotas', rotasRoutes);
router.use('/signup', authLimiter, signupRoutes);
router.use('/upload', uploadLimiter, uploadRoutes);
router.use('/usuario', usuarioRoutes);
router.use('/viagens', viagensRoutes);


export default router;