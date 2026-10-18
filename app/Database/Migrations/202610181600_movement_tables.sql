-- -----------------------------------------------------------------------------
-- Modulo Movement (codeigniter54900_db, conexao default).
-- Movimento depende do Produto (product_id obrigatorio); o Produto nao conhece o
-- Movimento. location_id, origin_id e user_manager_id sao opcionais (NULL = sem ligacao).
-- Sem triggers: as regras ficam no Processor da API.
-- Aplicar depois de 202610181400_product_tables.sql. Reaplicavel.
-- -----------------------------------------------------------------------------
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS `view_movement_stock`;
DROP VIEW IF EXISTS `view_movement_manager`;
DROP TABLE IF EXISTS `movement_manager`;

CREATE TABLE `movement_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `type` enum('entry','exit','reservation','waste','order') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` decimal(14,3) NOT NULL,
  `status` enum('open','done','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'done',
  `occurred_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expected_at` date DEFAULT NULL,
  `user_manager_id` bigint DEFAULT NULL,
  `location_id` bigint DEFAULT NULL,
  `origin_id` bigint DEFAULT NULL,
  `lot` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `expires_at` date DEFAULT NULL,
  `unit_cost` decimal(14,4) DEFAULT NULL,
  `reason` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `roles` json NOT NULL DEFAULT (JSON_ARRAY('guest','user','admin')),
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_movement_manager_company` (`company_id`),
  KEY `idx_movement_manager_product` (`product_id`),
  KEY `idx_movement_manager_type_status` (`type`,`status`),
  KEY `idx_movement_manager_user` (`user_manager_id`),
  KEY `idx_movement_manager_location` (`location_id`),
  KEY `idx_movement_manager_origin` (`origin_id`),
  KEY `idx_movement_manager_occurred` (`occurred_at`),
  KEY `idx_movement_manager_expected` (`expected_at`),
  CONSTRAINT `chk_movement_manager_quantity` CHECK (`quantity` > 0),
  CONSTRAINT `fk_movement_manager_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `fk_movement_manager_product` FOREIGN KEY (`product_id`) REFERENCES `product_manager` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_movement_manager_user` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_movement_manager_location` FOREIGN KEY (`location_id`) REFERENCES `location_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_movement_manager_origin` FOREIGN KEY (`origin_id`) REFERENCES `movement_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- view_movement_manager: movimento com produto, local e usuario.
-- -----------------------------------------------------------------------------
CREATE VIEW `view_movement_manager` AS
SELECT `m`.`id` AS `id`,
       `m`.`company_id` AS `company_id`,
       `m`.`product_id` AS `product_id`,
       `p`.`code` AS `product_code`,
       `p`.`name` AS `product_name`,
       `m`.`type` AS `type`,
       `m`.`quantity` AS `quantity`,
       `m`.`status` AS `status`,
       `m`.`occurred_at` AS `occurred_at`,
       `m`.`expected_at` AS `expected_at`,
       `m`.`user_manager_id` AS `user_manager_id`,
       `um`.`username` AS `user_username`,
       `uc`.`name` AS `user_name`,
       `m`.`location_id` AS `location_id`,
       `lm`.`name` AS `location_name`,
       `lm`.`path_names` AS `location_path_names`,
       `m`.`origin_id` AS `origin_id`,
       `m`.`lot` AS `lot`,
       `m`.`expires_at` AS `expires_at`,
       `m`.`unit_cost` AS `unit_cost`,
       `m`.`reason` AS `reason`,
       `m`.`reference` AS `reference`,
       `m`.`notes` AS `notes`,
       `m`.`roles` AS `roles`,
       `m`.`created_at` AS `created_at`,
       `m`.`updated_at` AS `updated_at`,
       `m`.`deleted_at` AS `deleted_at`
FROM `movement_manager` `m`
LEFT JOIN `product_manager` `p` ON (`p`.`id` = `m`.`product_id`)
LEFT JOIN `user_manager` `um` ON ((`um`.`id` = `m`.`user_manager_id`) and (`um`.`deleted_at` is null))
LEFT JOIN `user_profiles` `uc` ON ((`uc`.`user_manager_id` = `um`.`id`) and (`uc`.`deleted_at` is null))
LEFT JOIN `view_location_manager` `lm` ON ((`lm`.`id` = `m`.`location_id`) and (`lm`.`deleted_at` is null));

-- -----------------------------------------------------------------------------
-- view_movement_stock: saldo por produto.
--   saldo (on_hand)   = entradas - saidas - desperdicios (status done)
--   reservado         = separacoes open
--   encomendado       = encomendas open
--   disponivel        = saldo - reservado
--   below_min         = 1 quando stock_min existe e disponivel < stock_min
-- Produtos sem movimento aparecem com zeros.
-- -----------------------------------------------------------------------------
CREATE VIEW `view_movement_stock` AS
SELECT `p`.`id` AS `id`,
       `p`.`company_id` AS `company_id`,
       `p`.`id` AS `product_id`,
       `p`.`code` AS `product_code`,
       `p`.`name` AS `product_name`,
       `p`.`stock_min` AS `stock_min`,
       `p`.`stock_max` AS `stock_max`,
       `p`.`roles` AS `roles`,
       `p`.`status` AS `product_status`,
       COALESCE(SUM(CASE WHEN `m`.`type` = 'entry' AND `m`.`status` = 'done' THEN `m`.`quantity` END), 0) AS `entries`,
       COALESCE(SUM(CASE WHEN `m`.`type` = 'exit' AND `m`.`status` = 'done' THEN `m`.`quantity` END), 0) AS `exits`,
       COALESCE(SUM(CASE WHEN `m`.`type` = 'waste' AND `m`.`status` = 'done' THEN `m`.`quantity` END), 0) AS `wastes`,
       COALESCE(SUM(CASE WHEN `m`.`type` = 'entry' AND `m`.`status` = 'done' THEN `m`.`quantity`
                         WHEN `m`.`type` IN ('exit','waste') AND `m`.`status` = 'done' THEN -`m`.`quantity` END), 0) AS `on_hand`,
       COALESCE(SUM(CASE WHEN `m`.`type` = 'reservation' AND `m`.`status` = 'open' THEN `m`.`quantity` END), 0) AS `reserved`,
       COALESCE(SUM(CASE WHEN `m`.`type` = 'order' AND `m`.`status` = 'open' THEN `m`.`quantity` END), 0) AS `ordered`,
       COALESCE(SUM(CASE WHEN `m`.`type` = 'entry' AND `m`.`status` = 'done' THEN `m`.`quantity`
                         WHEN `m`.`type` IN ('exit','waste') AND `m`.`status` = 'done' THEN -`m`.`quantity` END), 0)
         - COALESCE(SUM(CASE WHEN `m`.`type` = 'reservation' AND `m`.`status` = 'open' THEN `m`.`quantity` END), 0) AS `available`,
       MIN(CASE WHEN `m`.`type` = 'order' AND `m`.`status` = 'open' THEN `m`.`expected_at` END) AS `next_expected_at`,
       MAX(CASE WHEN `m`.`status` = 'done' THEN `m`.`occurred_at` END) AS `last_movement_at`,
       CASE WHEN `p`.`stock_min` IS NOT NULL AND
            (COALESCE(SUM(CASE WHEN `m`.`type` = 'entry' AND `m`.`status` = 'done' THEN `m`.`quantity`
                               WHEN `m`.`type` IN ('exit','waste') AND `m`.`status` = 'done' THEN -`m`.`quantity` END), 0)
             - COALESCE(SUM(CASE WHEN `m`.`type` = 'reservation' AND `m`.`status` = 'open' THEN `m`.`quantity` END), 0)) < `p`.`stock_min`
            THEN 1 ELSE 0 END AS `below_min`,
       `p`.`created_at` AS `created_at`,
       `p`.`updated_at` AS `updated_at`,
       `p`.`deleted_at` AS `deleted_at`
FROM `product_manager` `p`
LEFT JOIN `movement_manager` `m` ON ((`m`.`product_id` = `p`.`id`) and (`m`.`deleted_at` is null))
GROUP BY `p`.`id`;
