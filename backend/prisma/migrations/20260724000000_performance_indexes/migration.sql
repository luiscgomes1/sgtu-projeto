-- Performance indexes
CREATE INDEX IF NOT EXISTS alunos_status_cadastro_idx ON alunos (status_cadastro);
CREATE INDEX IF NOT EXISTS alunos_curso_id_idx ON alunos (curso_id);
CREATE INDEX IF NOT EXISTS presencas_status_idx ON presencas (status);
CREATE INDEX IF NOT EXISTS motoristas_status_idx ON motoristas (status);
CREATE INDEX IF NOT EXISTS rota_motoristas_rota_id_idx ON rota_motoristas (rota_id);
CREATE INDEX IF NOT EXISTS rota_motoristas_motorista_id_idx ON rota_motoristas (motorista_id);
CREATE INDEX IF NOT EXISTS rota_motoristas_status_idx ON rota_motoristas (status);
