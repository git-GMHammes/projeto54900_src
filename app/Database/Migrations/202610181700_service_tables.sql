-- -----------------------------------------------------------------------------
-- Modulo Service (codeigniter54900_db, conexao default).
-- Padrao: doc/json/servico.json (3 tabelas, atributos grupo -> campo).
-- Independente: sem ligacao com Produto, Location ou Movement (so sob pedido).
-- Toda tabela com company_id; roles por registro nas tabelas principais.
-- Sem triggers: as regras (status, preco, prazo) ficam no Processor da API.
-- Aplicar pelo cliente mysql. Reaplicavel.
-- -----------------------------------------------------------------------------
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS `view_service_summary`;
DROP VIEW IF EXISTS `view_service_order`;
DROP VIEW IF EXISTS `view_service_attributes`;
DROP VIEW IF EXISTS `view_service_manager`;
DROP TABLE IF EXISTS `service_order`;
DROP TABLE IF EXISTS `service_attributes`;
DROP TABLE IF EXISTS `service_manager`;

CREATE TABLE `service_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `roles` json NOT NULL DEFAULT (JSON_ARRAY('guest','user','admin')),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `service_attributes` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `service_order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `roles` json NOT NULL DEFAULT (JSON_ARRAY('guest','user','admin')),
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
  CONSTRAINT `chk_service_order_quantity` CHECK (`quantity` > 0),
  CONSTRAINT `chk_service_order_rating` CHECK (`rating` IS NULL OR (`rating` BETWEEN 1 AND 5)),
  CONSTRAINT `fk_service_order_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `fk_service_order_service` FOREIGN KEY (`service_id`) REFERENCES `service_manager` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_service_order_parent` FOREIGN KEY (`parent_id`) REFERENCES `service_order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_service_order_customer_user` FOREIGN KEY (`customer_user_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_service_order_executor_user` FOREIGN KEY (`executor_user_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_service_order_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- Views
-- -----------------------------------------------------------------------------
CREATE VIEW `view_service_manager` AS
SELECT `s`.`id` AS `id`,
       `s`.`company_id` AS `company_id`,
       `s`.`roles` AS `roles`,
       `s`.`parent_id` AS `parent_id`,
       `sp`.`name` AS `parent_name`,
       `s`.`code` AS `code`,
       `s`.`name` AS `name`,
       `s`.`description` AS `description`,
       `s`.`type` AS `type`,
       `s`.`provider_type` AS `provider_type`,
       `s`.`provider_document` AS `provider_document`,
       `s`.`billing_unit` AS `billing_unit`,
       `s`.`price` AS `price`,
       `s`.`currency` AS `currency`,
       `s`.`duration` AS `duration`,
       `s`.`duration_unit` AS `duration_unit`,
       `s`.`lead_time` AS `lead_time`,
       `s`.`lead_time_unit` AS `lead_time_unit`,
       `s`.`status` AS `status`,
       `s`.`sort_order` AS `sort_order`,
       (select count(0) from `service_manager` `ch` where ((`ch`.`parent_id` = `s`.`id`) and (`ch`.`deleted_at` is null))) AS `children_count`,
       (select count(0) from `service_attributes` `sa` where ((`sa`.`service_id` = `s`.`id`) and (`sa`.`deleted_at` is null))) AS `attributes_count`,
       (select count(0) from `service_order` `so` where ((`so`.`service_id` = `s`.`id`) and (`so`.`deleted_at` is null)
          and (`so`.`status` in ('requested','quoted','accepted','scheduled','in_progress')))) AS `open_orders_count`,
       `s`.`created_at` AS `created_at`,
       `s`.`updated_at` AS `updated_at`,
       `s`.`deleted_at` AS `deleted_at`
FROM `service_manager` `s`
LEFT JOIN `service_manager` `sp` ON (`sp`.`id` = `s`.`parent_id`);

CREATE VIEW `view_service_attributes` AS
SELECT `sa`.`id` AS `id`,
       `sa`.`company_id` AS `company_id`,
       `sa`.`service_id` AS `service_id`,
       `s`.`code` AS `service_code`,
       `s`.`name` AS `service_name`,
       `s`.`type` AS `service_type`,
       `sa`.`group_code` AS `group_code`,
       `sa`.`field_code` AS `field_code`,
       `sa`.`label` AS `label`,
       `sa`.`value` AS `value`,
       `sa`.`unit` AS `unit`,
       `sa`.`sort_order` AS `sort_order`,
       `sa`.`created_at` AS `created_at`,
       `sa`.`updated_at` AS `updated_at`,
       `sa`.`deleted_at` AS `deleted_at`
FROM `service_attributes` `sa`
LEFT JOIN `service_manager` `s` ON ((`s`.`id` = `sa`.`service_id`) and (`s`.`deleted_at` is null));

CREATE VIEW `view_service_order` AS
SELECT `o`.`id` AS `id`,
       `o`.`company_id` AS `company_id`,
       `o`.`roles` AS `roles`,
       `o`.`service_id` AS `service_id`,
       `s`.`code` AS `service_code`,
       `s`.`name` AS `service_name`,
       `s`.`type` AS `service_type`,
       `s`.`provider_type` AS `provider_type`,
       `o`.`parent_id` AS `parent_id`,
       `o`.`code` AS `code`,
       `o`.`status` AS `status`,
       `o`.`customer_name` AS `customer_name`,
       `o`.`customer_contact` AS `customer_contact`,
       `o`.`customer_document` AS `customer_document`,
       `o`.`customer_user_id` AS `customer_user_id`,
       `cum`.`username` AS `customer_user_username`,
       `cuc`.`name` AS `customer_user_name`,
       `o`.`executor_user_id` AS `executor_user_id`,
       `eum`.`username` AS `executor_username`,
       `euc`.`name` AS `executor_name`,
       `o`.`created_by` AS `created_by`,
       `o`.`place` AS `place`,
       `o`.`quantity` AS `quantity`,
       `o`.`billing_unit` AS `billing_unit`,
       `o`.`currency` AS `currency`,
       `o`.`quoted_price` AS `quoted_price`,
       `o`.`final_price` AS `final_price`,
       `o`.`requested_at` AS `requested_at`,
       `o`.`scheduled_at` AS `scheduled_at`,
       `o`.`started_at` AS `started_at`,
       `o`.`finished_at` AS `finished_at`,
       `o`.`deadline_at` AS `deadline_at`,
       `o`.`paid_at` AS `paid_at`,
       `o`.`rating` AS `rating`,
       `o`.`feedback` AS `feedback`,
       `o`.`cancel_reason` AS `cancel_reason`,
       `o`.`notes` AS `notes`,
       (case when `o`.`deadline_at` is not null and `o`.`status` in ('requested','quoted','accepted','scheduled','in_progress')
             then timestampdiff(DAY, now(), `o`.`deadline_at`) end) AS `days_to_deadline`,
       (case when `o`.`deadline_at` is not null and `o`.`status` in ('requested','quoted','accepted','scheduled','in_progress')
              and `o`.`deadline_at` < now() then 1 else 0 end) AS `is_late`,
       (case when `o`.`started_at` is not null and `o`.`finished_at` is not null
             then timestampdiff(MINUTE, `o`.`started_at`, `o`.`finished_at`) end) AS `duration_minutes`,
       `o`.`created_at` AS `created_at`,
       `o`.`updated_at` AS `updated_at`,
       `o`.`deleted_at` AS `deleted_at`
FROM `service_order` `o`
LEFT JOIN `service_manager` `s` ON (`s`.`id` = `o`.`service_id`)
LEFT JOIN `user_manager` `eum` ON ((`eum`.`id` = `o`.`executor_user_id`) and (`eum`.`deleted_at` is null))
LEFT JOIN `user_profiles` `euc` ON ((`euc`.`user_manager_id` = `eum`.`id`) and (`euc`.`deleted_at` is null))
LEFT JOIN `user_manager` `cum` ON ((`cum`.`id` = `o`.`customer_user_id`) and (`cum`.`deleted_at` is null))
LEFT JOIN `user_profiles` `cuc` ON ((`cuc`.`user_manager_id` = `cum`.`id`) and (`cuc`.`deleted_at` is null));

CREATE VIEW `view_service_summary` AS
SELECT `s`.`id` AS `id`,
       `s`.`company_id` AS `company_id`,
       `s`.`id` AS `service_id`,
       `s`.`roles` AS `roles`,
       `s`.`code` AS `service_code`,
       `s`.`name` AS `service_name`,
       `s`.`type` AS `service_type`,
       `s`.`provider_type` AS `provider_type`,
       `s`.`status` AS `service_status`,
       COUNT(`o`.`id`) AS `orders_total`,
       COALESCE(SUM(`o`.`status` IN ('requested','quoted','accepted','scheduled','in_progress')), 0) AS `orders_open`,
       COALESCE(SUM(`o`.`status` = 'done'), 0) AS `orders_done`,
       COALESCE(SUM(`o`.`status` IN ('cancelled','rejected')), 0) AS `orders_cancelled`,
       COALESCE(SUM(CASE WHEN `o`.`status` = 'done' THEN COALESCE(`o`.`final_price`, `o`.`quoted_price`, 0) END), 0) AS `revenue`,
       COALESCE(SUM(CASE WHEN `o`.`status` = 'done' AND `o`.`paid_at` IS NOT NULL THEN COALESCE(`o`.`final_price`, `o`.`quoted_price`, 0) END), 0) AS `revenue_paid`,
       AVG(`o`.`rating`) AS `avg_rating`,
       AVG(CASE WHEN `o`.`status` = 'done' AND `o`.`started_at` IS NOT NULL AND `o`.`finished_at` IS NOT NULL
                THEN timestampdiff(MINUTE, `o`.`started_at`, `o`.`finished_at`) END) AS `avg_duration_minutes`,
       COALESCE(SUM(`o`.`deadline_at` IS NOT NULL AND `o`.`deadline_at` < now()
                    AND `o`.`status` IN ('requested','quoted','accepted','scheduled','in_progress')), 0) AS `orders_late`,
       MAX(`o`.`requested_at`) AS `last_order_at`,
       `s`.`created_at` AS `created_at`,
       `s`.`updated_at` AS `updated_at`,
       `s`.`deleted_at` AS `deleted_at`
FROM `service_manager` `s`
LEFT JOIN `service_order` `o` ON ((`o`.`service_id` = `s`.`id`) and (`o`.`deleted_at` is null))
GROUP BY `s`.`id`;
