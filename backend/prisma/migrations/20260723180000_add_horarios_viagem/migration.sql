ALTER TABLE "configuracoes"
  ADD COLUMN "hora_inicio_ida"    time(6) NOT NULL DEFAULT '16:50:00',
  ADD COLUMN "hora_fim_ida"       time(6) NOT NULL DEFAULT '18:00:00',
  ADD COLUMN "hora_inicio_volta"  time(6) NOT NULL DEFAULT '21:00:00',
  ADD COLUMN "hora_fim_volta"     time(6) NOT NULL DEFAULT '23:00:00';
