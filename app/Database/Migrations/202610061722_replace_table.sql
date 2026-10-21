/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE TABLE IF NOT EXISTS `service_attributes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `service_id` bigint NOT NULL,
  `group_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `field_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `value` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `unit` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_service_attributes_company` (`company_id`),
  KEY `idx_service_attributes_service` (`service_id`),
  KEY `idx_service_attributes_group_field` (`group_code`,`field_code`),
  KEY `sort_order` (`sort_order`),
  CONSTRAINT `fk_service_attributes_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `fk_service_attributes_service` FOREIGN KEY (`service_id`) REFERENCES `service_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=555 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `service_attributes`;
INSERT INTO `service_attributes` (`id`, `company_id`, `service_id`, `group_code`, `field_code`, `label`, `value`, `unit`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(540, 1, 24, 'tecnico', 'metodo', 'Método', 'Autoclave a vapor saturado', NULL, 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(541, 1, 25, 'tecnico', 'periodicidade', 'Periodicidade', '6', 'meses', 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(542, 1, 26, 'tecnico', 'norma', 'Norma de referência', 'ABNT NBR IEC 60601-1', NULL, 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(543, 1, 27, 'tecnico', 'produto', 'Saneante utilizado', 'Quaternário de amônio', NULL, 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(544, 1, 28, 'legal', 'licenca', 'Licença ambiental', 'LO-2026-0451', NULL, 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(545, 1, 29, 'legal', 'certificado', 'Validade do certificado', '90', 'dias', 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(546, 1, 30, 'tecnico', 'temperatura', 'Temperatura de transporte', '4', '°C', 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(547, 1, 31, 'tecnico', 'ciclo', 'Ciclo de lavagem', 'Térmico 70°C por 25 min', NULL, 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(548, 1, 32, 'tecnico', 'filtro', 'Classe do filtro', 'HEPA H13', NULL, 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(549, 1, 33, 'legal', 'laudo', 'Emite laudo', 'sim', NULL, 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(550, 1, 34, 'comercial', 'carga_horaria', 'Carga horária', '4', 'h', 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(551, 1, 35, 'comercial', 'modalidade', 'Modalidade', 'Presencial', NULL, 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(552, 1, 36, 'tecnico', 'pressao', 'Pressão de teste', '10', 'bar', 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(553, 1, 37, 'comercial', 'garantia', 'Garantia do reparo', '90', 'dias', 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(554, 1, 38, 'legal', 'classe', 'Classe do resíduo', 'Grupo B', NULL, 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL);

CREATE TABLE IF NOT EXISTS `service_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `roles` json DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  `code` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `provider_type` enum('biscate','mei','company') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `provider_document` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `billing_unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '1',
  `price` decimal(14,2) DEFAULT NULL,
  `currency` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'BRL',
  `duration` decimal(10,2) DEFAULT NULL,
  `duration_unit` enum('min','h','d','wk','mo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lead_time` decimal(10,2) DEFAULT NULL,
  `lead_time_unit` enum('min','h','d','wk','mo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('draft','active','inactive','discontinued') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_service_manager_company_code` (`company_id`,`code`),
  KEY `idx_service_manager_company` (`company_id`),
  KEY `idx_service_manager_parent` (`parent_id`),
  KEY `idx_service_manager_type` (`type`),
  KEY `idx_service_manager_provider_type` (`provider_type`),
  KEY `sort_order` (`sort_order`),
  KEY `status` (`status`),
  CONSTRAINT `fk_service_manager_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `fk_service_manager_parent` FOREIGN KEY (`parent_id`) REFERENCES `service_manager` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `service_manager`;
INSERT INTO `service_manager` (`id`, `company_id`, `roles`, `parent_id`, `code`, `name`, `description`, `type`, `provider_type`, `provider_document`, `billing_unit`, `price`, `currency`, `duration`, `duration_unit`, `lead_time`, `lead_time_unit`, `status`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(24, 1, '["user", "admin"]', NULL, 'SRV-001', 'Esterilização de instrumental cirúrgico', 'Esterilização em autoclave com registro de lote e validação biológica.', 'esterilizacao', 'company', '12345678000190', 'kit', 85.00, 'BRL', 2.00, 'h', 1.00, 'd', 'active', 10, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(25, 1, '["user", "admin"]', NULL, 'SRV-002', 'Manutenção preventiva de autoclave', 'Revisão de vedação, válvulas, sensores e calibração de temperatura e pressão.', 'manutencao', 'company', '12345678000190', 'equipamento', 450.00, 'BRL', 3.00, 'h', 3.00, 'd', 'active', 20, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(26, 1, '["user", "admin"]', NULL, 'SRV-003', 'Calibração de monitor multiparâmetro', 'Calibração e emissão de laudo conforme norma vigente.', 'calibracao', 'company', '98765432000110', 'equipamento', 620.00, 'BRL', 4.00, 'h', 5.00, 'd', 'active', 30, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(27, 1, '["user", "admin"]', NULL, 'SRV-004', 'Limpeza terminal de centro cirúrgico', 'Limpeza e desinfecção terminal de sala cirúrgica e áreas de apoio.', 'limpeza', 'company', '11222333000144', 'sala', 380.00, 'BRL', 4.00, 'h', 1.00, 'd', 'active', 40, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(28, 1, '["user", "admin"]', NULL, 'SRV-005', 'Coleta de resíduos de saúde (grupo A)', 'Coleta, transporte e destinação final de resíduos biológicos.', 'residuos', 'company', '11222333000144', 'kg', 7.50, 'BRL', 1.00, 'h', 2.00, 'd', 'active', 50, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(29, 1, '["user", "admin"]', NULL, 'SRV-006', 'Dedetização e controle de pragas', 'Controle integrado de pragas em áreas hospitalares, com certificado.', 'controle_pragas', 'mei', '44555666000177', 'm2', 3.20, 'BRL', 2.00, 'h', 7.00, 'd', 'active', 60, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(30, 1, '["user", "admin"]', NULL, 'SRV-007', 'Transporte de amostras laboratoriais', 'Transporte refrigerado de amostras com rastreio e cadeia de custódia.', 'transporte', 'biscate', '12345678901', 'viagem', 65.00, 'BRL', 1.50, 'h', 4.00, 'h', 'active', 70, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(31, 1, '["user", "admin"]', NULL, 'SRV-008', 'Lavanderia hospitalar', 'Higienização de enxoval com processo de barreira sanitária.', 'lavanderia', 'company', '55666777000188', 'kg', 9.80, 'BRL', 1.00, 'd', 1.00, 'd', 'active', 80, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(32, 1, '["user", "admin"]', NULL, 'SRV-009', 'Manutenção de ar-condicionado central', 'Limpeza de filtros HEPA, troca de correias e teste de vazão.', 'manutencao', 'company', '98765432000110', 'equipamento', 540.00, 'BRL', 5.00, 'h', 5.00, 'd', 'active', 90, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(33, 1, '["user", "admin"]', NULL, 'SRV-010', 'Teste de segurança elétrica de equipamentos', 'Medição de corrente de fuga e aterramento com laudo técnico.', 'inspecao', 'mei', '44555666000177', 'equipamento', 140.00, 'BRL', 1.00, 'h', 3.00, 'd', 'active', 100, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(34, 1, '["user", "admin"]', NULL, 'SRV-011', 'Treinamento de biossegurança', 'Treinamento para equipes assistenciais sobre EPIs e precauções padrão.', 'treinamento', 'biscate', '98765432100', 'turma', 1200.00, 'BRL', 4.00, 'h', 14.00, 'd', 'active', 110, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(35, 1, '["user", "admin"]', NULL, 'SRV-012', 'Consultoria em acreditação hospitalar', 'Diagnóstico e plano de adequação aos requisitos de acreditação.', 'consultoria', 'company', '66777888000199', 'hora', 280.00, 'BRL', 8.00, 'h', 10.00, 'd', 'active', 120, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(36, 1, '["user", "admin"]', NULL, 'SRV-013', 'Instalação de gases medicinais', 'Instalação e teste de estanqueidade de rede de oxigênio e ar comprimido.', 'instalacao', 'company', '66777888000199', 'ponto', 950.00, 'BRL', 6.00, 'h', 15.00, 'd', 'draft', 130, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(37, 1, '["user", "admin"]', NULL, 'SRV-014', 'Reparo de macas e camas hospitalares', 'Troca de rodízios, motores de elevação e controles.', 'manutencao', 'biscate', '11122233344', 'equipamento', 210.00, 'BRL', 2.50, 'h', 2.00, 'd', 'inactive', 140, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(38, 1, '["user", "admin"]', NULL, 'SRV-015', 'Descarte de resíduos químicos', 'Coleta e destinação licenciada de reagentes e resíduos químicos.', 'residuos', 'company', '11222333000144', 'kg', 18.00, 'BRL', 1.00, 'h', 3.00, 'd', 'discontinued', 150, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL);

CREATE TABLE IF NOT EXISTS `service_order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `roles` json DEFAULT NULL,
  `service_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `code` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('requested','quoted','accepted','scheduled','in_progress','done','cancelled','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'requested',
  `customer_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_contact` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_document` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_user_id` bigint DEFAULT NULL,
  `executor_user_id` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `place` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quantity` decimal(14,3) NOT NULL DEFAULT '1.000',
  `billing_unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '1',
  `currency` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'BRL',
  `quoted_price` decimal(14,2) DEFAULT NULL,
  `final_price` decimal(14,2) DEFAULT NULL,
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `scheduled_at` datetime DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `finished_at` datetime DEFAULT NULL,
  `deadline_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `rating` tinyint DEFAULT NULL,
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `cancel_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_service_order_company_code` (`company_id`,`code`),
  KEY `idx_service_order_company` (`company_id`),
  KEY `idx_service_order_service` (`service_id`),
  KEY `idx_service_order_parent` (`parent_id`),
  KEY `idx_service_order_status` (`status`),
  KEY `idx_service_order_customer_user` (`customer_user_id`),
  KEY `idx_service_order_executor_user` (`executor_user_id`),
  KEY `idx_service_order_created_by` (`created_by`),
  KEY `idx_service_order_scheduled` (`scheduled_at`),
  KEY `idx_service_order_deadline` (`deadline_at`),
  CONSTRAINT `fk_service_order_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `fk_service_order_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_service_order_customer_user` FOREIGN KEY (`customer_user_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_service_order_executor_user` FOREIGN KEY (`executor_user_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_service_order_parent` FOREIGN KEY (`parent_id`) REFERENCES `service_order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_service_order_service` FOREIGN KEY (`service_id`) REFERENCES `service_manager` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_service_order_quantity` CHECK ((`quantity` > 0)),
  CONSTRAINT `chk_service_order_rating` CHECK (((`rating` is null) or (`rating` between 1 and 5)))
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `service_order`;
INSERT INTO `service_order` (`id`, `company_id`, `roles`, `service_id`, `parent_id`, `code`, `status`, `customer_name`, `customer_contact`, `customer_document`, `customer_user_id`, `executor_user_id`, `created_by`, `place`, `quantity`, `billing_unit`, `currency`, `quoted_price`, `final_price`, `requested_at`, `scheduled_at`, `started_at`, `finished_at`, `deadline_at`, `paid_at`, `rating`, `feedback`, `cancel_reason`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(21, 1, '["user", "admin"]', 24, NULL, 'OS-0001', 'done', 'Hospital Santa Clara', 'compras@santaclara.example', '12345678000100', 1, 2, 1, 'Centro de Material e Esterilização', 3.000, 'kit', 'BRL', 255.00, 255.00, '2026-10-02 08:00:00', '2026-10-03 07:30:00', '2026-10-03 07:40:00', '2026-10-03 13:10:00', '2026-10-04 18:00:00', '2026-10-08 10:00:00', 5, 'Atendimento pontual e laudo completo.', NULL, NULL, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(22, 1, '["user", "admin"]', 25, NULL, 'OS-0002', 'done', 'Clínica Vida Plena', '(21) 3000-1002', '23456789000111', 1, 3, 1, 'Sala de esterilização', 1.000, 'equipamento', 'BRL', 450.00, 450.00, '2026-10-03 09:15:00', '2026-10-06 08:00:00', '2026-10-06 08:05:00', '2026-10-06 11:20:00', '2026-10-09 18:00:00', '2026-10-12 09:00:00', 4, 'Sem observações.', NULL, NULL, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(23, 1, '["user", "admin"]', 26, NULL, 'OS-0003', 'in_progress', 'Hospital Municipal Centro', '(21) 3000-1003', '34567890000122', 1, 4, 1, 'UTI adulto', 6.000, 'equipamento', 'BRL', 3720.00, NULL, '2026-10-05 10:00:00', '2026-10-15 08:00:00', '2026-10-15 08:10:00', NULL, '2026-10-20 18:00:00', NULL, NULL, NULL, NULL, 'Calibração em andamento: 4 de 6 monitores concluídos.', '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(24, 1, '["user", "admin"]', 27, NULL, 'OS-0004', 'scheduled', 'Maternidade Aurora', 'limpeza@aurora.example', '45678901000133', 1, 2, 1, 'Centro cirúrgico, blocos 1 a 3', 3.000, 'sala', 'BRL', 1140.00, NULL, '2026-10-08 14:00:00', '2026-10-24 06:00:00', NULL, NULL, '2026-10-24 18:00:00', NULL, NULL, NULL, NULL, 'Acesso liberado pela portaria lateral.', '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(25, 1, '["user", "admin"]', 28, NULL, 'OS-0005', 'accepted', 'Pronto Atendimento Zona Sul', '(21) 3000-1005', '56789012000144', 1, 3, 1, 'Abrigo externo de resíduos', 120.000, 'kg', 'BRL', 900.00, NULL, '2026-10-09 11:30:00', NULL, NULL, NULL, '2026-10-26 18:00:00', NULL, NULL, NULL, NULL, 'Coleta semanal; peso estimado.', '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(26, 1, '["user", "admin"]', 29, NULL, 'OS-0006', 'quoted', 'Hospital Santa Clara', 'compras@santaclara.example', '12345678000100', 1, NULL, 1, 'Ala B, 2º e 3º andares', 850.000, 'm2', 'BRL', 2720.00, NULL, '2026-10-10 15:00:00', NULL, NULL, NULL, '2026-10-30 18:00:00', NULL, NULL, NULL, NULL, 'Aguardando aprovação do orçamento.', '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(27, 1, '["user", "admin"]', 30, NULL, 'OS-0007', 'done', 'Laboratório Análise Rápida', '(21) 3000-1007', '67890123000155', 1, 4, 1, 'Rota Centro - Laboratório de referência', 4.000, 'viagem', 'BRL', 260.00, 260.00, '2026-10-11 07:00:00', '2026-10-12 06:30:00', '2026-10-12 06:30:00', '2026-10-12 10:00:00', '2026-10-12 12:00:00', '2026-10-15 09:00:00', 5, 'Amostras entregues na temperatura correta.', NULL, NULL, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(28, 1, '["user", "admin"]', 31, NULL, 'OS-0008', 'requested', 'Clínica Vida Plena', '(21) 3000-1002', '23456789000111', 1, NULL, 1, 'Rouparia', 200.000, 'kg', 'BRL', 1960.00, NULL, '2026-10-12 16:20:00', NULL, NULL, NULL, '2026-10-28 18:00:00', NULL, NULL, NULL, NULL, NULL, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(29, 1, '["user", "admin"]', 32, NULL, 'OS-0009', 'done', 'Hospital Municipal Centro', '(21) 3000-1003', '34567890000122', 1, 2, 1, 'Casa de máquinas', 2.000, 'equipamento', 'BRL', 1080.00, 1080.00, '2026-10-13 09:00:00', '2026-10-14 08:00:00', '2026-10-14 08:00:00', '2026-10-14 15:30:00', '2026-10-16 18:00:00', NULL, 4, 'Dois filtros substituídos.', NULL, NULL, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(30, 1, '["user", "admin"]', 33, NULL, 'OS-0010', 'cancelled', 'Maternidade Aurora', 'limpeza@aurora.example', '45678901000133', 1, NULL, 1, 'Setor de imagem', 8.000, 'equipamento', 'BRL', 1120.00, NULL, '2026-10-13 13:00:00', NULL, NULL, NULL, '2026-10-22 18:00:00', NULL, NULL, NULL, 'Cliente adiou para o próximo trimestre.', NULL, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(31, 1, '["user", "admin"]', 34, NULL, 'OS-0011', 'scheduled', 'Pronto Atendimento Zona Sul', '(21) 3000-1005', '56789012000144', 1, 3, 1, 'Auditório', 1.000, 'turma', 'BRL', 1200.00, NULL, '2026-10-14 10:00:00', '2026-11-05 13:00:00', NULL, NULL, '2026-11-05 18:00:00', NULL, NULL, NULL, NULL, 'Turma de 30 profissionais.', '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(32, 1, '["user", "admin"]', 35, NULL, 'OS-0012', 'in_progress', 'Hospital Santa Clara', 'qualidade@santaclara.example', '12345678000100', 1, 4, 1, 'Diretoria de qualidade', 16.000, 'hora', 'BRL', 4480.00, NULL, '2026-10-14 17:00:00', '2026-10-16 09:00:00', '2026-10-16 09:00:00', NULL, '2026-11-10 18:00:00', NULL, NULL, NULL, NULL, 'Diagnóstico concluído; plano de ação em elaboração.', '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(33, 1, '["user", "admin"]', 36, NULL, 'OS-0013', 'rejected', 'Clínica Vida Plena', '(21) 3000-1002', '23456789000111', 1, NULL, 1, 'Ala de internação', 12.000, 'ponto', 'BRL', 11400.00, NULL, '2026-10-15 08:30:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Orçamento acima do previsto pelo cliente.', NULL, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(34, 1, '["user", "admin"]', 37, NULL, 'OS-0014', 'done', 'Hospital Municipal Centro', '(21) 3000-1003', '34567890000122', 1, 3, 1, 'Almoxarifado de equipamentos', 5.000, 'equipamento', 'BRL', 1050.00, 1050.00, '2026-10-15 11:00:00', '2026-10-16 08:00:00', '2026-10-16 08:00:00', '2026-10-16 16:45:00', '2026-10-18 18:00:00', '2026-10-19 09:00:00', 3, 'Demorou mais que o previsto.', NULL, NULL, '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL),
	(35, 1, '["user", "admin"]', 38, NULL, 'OS-0015', 'requested', 'Laboratório Análise Rápida', '(21) 3000-1007', '67890123000155', 1, NULL, 1, 'Depósito de reagentes', 40.000, 'kg', 'BRL', 720.00, NULL, '2026-10-16 09:45:00', NULL, NULL, NULL, '2026-11-02 18:00:00', NULL, NULL, NULL, NULL, 'Reagentes vencidos aguardando destinação.', '2026-10-21 19:48:22', '2026-10-21 19:48:22', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
