-- VN8: Faculdade -> Curso: troca Cascade por Restrict (impede deleção acidental em cadeia)
ALTER TABLE "cursos" DROP CONSTRAINT IF EXISTS "cursos_faculdade_id_fkey";
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_faculdade_id_fkey" FOREIGN KEY ("faculdade_id") REFERENCES "faculdades"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- VN10: Unique constraints em CPF, RG, CNH
CREATE UNIQUE INDEX IF NOT EXISTS "alunos_cpf_key" ON "alunos"("cpf");
CREATE UNIQUE INDEX IF NOT EXISTS "alunos_rg_key" ON "alunos"("rg");
CREATE UNIQUE INDEX IF NOT EXISTS "motoristas_cpf_key" ON "motoristas"("cpf");
CREATE UNIQUE INDEX IF NOT EXISTS "motoristas_cnh_key" ON "motoristas"("cnh");
