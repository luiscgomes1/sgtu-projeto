-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT DEFAULT 'ativo',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculdades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "status" TEXT DEFAULT 'ativo',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faculdades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "faculdade_id" UUID,
    "nome" TEXT NOT NULL,
    "status" TEXT DEFAULT 'ativo',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alunos" (
    "usuario_id" UUID NOT NULL,
    "curso_id" UUID,
    "rg" TEXT,
    "cpf" TEXT,
    "telefone" TEXT,
    "data_nascimento" DATE,
    "endereco" TEXT,
    "tipo_sanguineo" TEXT,
    "comprovante_residencia_url" TEXT,
    "comprovante_matricula_url" TEXT,
    "foto_url" TEXT,
    "telegram_id" TEXT,
    "status_cadastro" TEXT DEFAULT 'pendente',

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "cadastro_historico" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aluno_id" UUID NOT NULL,
    "status_anterior" TEXT,
    "status_novo" TEXT NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'admin',
    "alterado_por" UUID,
    "motivo" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cadastro_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carteirinhas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aluno_id" UUID NOT NULL,
    "data_emissao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_validade" DATE NOT NULL,
    "arquivo_url" TEXT,
    "qrcode_token" TEXT,
    "criado_por" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carteirinhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" SERIAL NOT NULL,
    "hora_limite_presenca" TIME(6) NOT NULL DEFAULT '15:00:00'::time without time zone,
    "logo_url" TEXT,
    "nome_organizacao" TEXT,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motoristas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "cnh" TEXT,
    "telefone" TEXT,
    "status" TEXT DEFAULT 'ativo',
    "data_nascimento" DATE,
    "cpf" TEXT,
    "validade_cnh" DATE,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "motoristas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pontos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "status" TEXT DEFAULT 'ativo',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pontos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alunos_pontos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aluno_id" UUID NOT NULL,
    "ponto_id" UUID NOT NULL,
    "status" TEXT DEFAULT 'ativo',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alunos_pontos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "status" TEXT DEFAULT 'ativo',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rota_pontos" (
    "rota_id" UUID NOT NULL,
    "ponto_id" UUID NOT NULL,
    "ordem" INTEGER,
    "status" TEXT DEFAULT 'ativo',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rota_pontos_pkey" PRIMARY KEY ("rota_id","ponto_id")
);

-- CreateTable
CREATE TABLE "rota_faculdades" (
    "rota_id" UUID NOT NULL,
    "faculdade_id" UUID NOT NULL,
    "status" TEXT DEFAULT 'ativo',

    CONSTRAINT "rota_faculdades_pkey" PRIMARY KEY ("rota_id","faculdade_id")
);

-- CreateTable
CREATE TABLE "rota_motoristas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rota_id" UUID NOT NULL,
    "motorista_id" UUID NOT NULL,
    "inicio" DATE NOT NULL DEFAULT CURRENT_DATE,
    "fim" DATE,
    "status" TEXT DEFAULT 'ativo',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rota_motoristas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escala_atribuicoes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rota_id" UUID NOT NULL,
    "motorista_id" UUID NOT NULL,
    "ano" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "posicao" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT DEFAULT 'ativo',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escala_atribuicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viagens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rota_id" UUID NOT NULL,
    "data" DATE NOT NULL,
    "status" TEXT DEFAULT 'fechada',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "viagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presencas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aluno_id" UUID NOT NULL,
    "rota_id" UUID NOT NULL,
    "viagem_id" UUID NOT NULL,
    "data" DATE NOT NULL,
    "confirmado" BOOLEAN DEFAULT false,
    "confirmado_qrcode" BOOLEAN DEFAULT false,
    "confirmado_volta" BOOLEAN DEFAULT false,
    "status" TEXT DEFAULT 'ativo',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presencas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "cadastro_historico_aluno_id_created_at_idx" ON "cadastro_historico"("aluno_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "carteirinhas_qrcode_token_key" ON "carteirinhas"("qrcode_token");

-- CreateIndex
CREATE INDEX "carteirinhas_aluno_id_data_validade_idx" ON "carteirinhas"("aluno_id", "data_validade" DESC);

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_pontos_aluno_id_ponto_id_key" ON "alunos_pontos"("aluno_id", "ponto_id");

-- CreateIndex
CREATE UNIQUE INDEX "escala_atribuicoes_rota_id_ano_mes_posicao_key" ON "escala_atribuicoes"("rota_id", "ano", "mes", "posicao");

-- CreateIndex
CREATE UNIQUE INDEX "viagens_rota_id_data_key" ON "viagens"("rota_id", "data");

-- CreateIndex
CREATE INDEX "presencas_rota_id_data_idx" ON "presencas"("rota_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "presencas_aluno_id_data_key" ON "presencas"("aluno_id", "data");

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_faculdade_id_fkey" FOREIGN KEY ("faculdade_id") REFERENCES "faculdades"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cadastro_historico" ADD CONSTRAINT "cadastro_historico_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "alunos"("usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cadastro_historico" ADD CONSTRAINT "cadastro_historico_alterado_por_fkey" FOREIGN KEY ("alterado_por") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "carteirinhas" ADD CONSTRAINT "carteirinhas_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "alunos"("usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "carteirinhas" ADD CONSTRAINT "carteirinhas_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alunos_pontos" ADD CONSTRAINT "alunos_pontos_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "alunos"("usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alunos_pontos" ADD CONSTRAINT "alunos_pontos_ponto_id_fkey" FOREIGN KEY ("ponto_id") REFERENCES "pontos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rota_pontos" ADD CONSTRAINT "rota_pontos_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "rotas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rota_pontos" ADD CONSTRAINT "rota_pontos_ponto_id_fkey" FOREIGN KEY ("ponto_id") REFERENCES "pontos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rota_faculdades" ADD CONSTRAINT "rota_faculdades_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "rotas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rota_faculdades" ADD CONSTRAINT "rota_faculdades_faculdade_id_fkey" FOREIGN KEY ("faculdade_id") REFERENCES "faculdades"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rota_motoristas" ADD CONSTRAINT "rota_motoristas_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "rotas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rota_motoristas" ADD CONSTRAINT "rota_motoristas_motorista_id_fkey" FOREIGN KEY ("motorista_id") REFERENCES "motoristas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "escala_atribuicoes" ADD CONSTRAINT "escala_atribuicoes_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "rotas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "escala_atribuicoes" ADD CONSTRAINT "escala_atribuicoes_motorista_id_fkey" FOREIGN KEY ("motorista_id") REFERENCES "motoristas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "rotas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "alunos"("usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "rotas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_viagem_id_fkey" FOREIGN KEY ("viagem_id") REFERENCES "viagens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
