-- -----------------------------------------------------------------------------
-- Modulo Product (codeigniter54900_db, conexao default).
-- Padrao: doc/json/produto.json (2 tabelas, grupo -> campo).
-- Aplicar pelo cliente mysql. Reaplicavel.
-- -----------------------------------------------------------------------------
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS `view_product_attributes`;
DROP VIEW IF EXISTS `view_product_manager`;
DROP TABLE IF EXISTS `product_attributes`;
DROP TABLE IF EXISTS `product_manager`;

CREATE TABLE `product_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `location_id` bigint DEFAULT NULL,
  `code` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('draft','active','inactive','discontinued') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `stock_min` decimal(14,3) DEFAULT NULL,
  `stock_max` decimal(14,3) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `roles` json NOT NULL DEFAULT (JSON_ARRAY('guest','user','admin')),
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_manager_company_code` (`company_id`,`code`),
  KEY `idx_product_manager_company` (`company_id`),
  KEY `idx_product_manager_parent` (`parent_id`),
  KEY `idx_product_manager_location` (`location_id`),
  KEY `idx_product_manager_type` (`type`),
  KEY `sort_order` (`sort_order`),
  KEY `status` (`status`),
  CONSTRAINT `fk_product_manager_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `fk_product_manager_parent` FOREIGN KEY (`parent_id`) REFERENCES `product_manager` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_product_manager_location` FOREIGN KEY (`location_id`) REFERENCES `location_manager` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `product_attributes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
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
  KEY `idx_product_attributes_company` (`company_id`),
  KEY `idx_product_attributes_product` (`product_id`),
  KEY `idx_product_attributes_group_field` (`group_code`,`field_code`),
  KEY `sort_order` (`sort_order`),
  CONSTRAINT `fk_product_attributes_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `fk_product_attributes_product` FOREIGN KEY (`product_id`) REFERENCES `product_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- Views
-- -----------------------------------------------------------------------------
CREATE VIEW `view_product_manager` AS
SELECT `p`.`id` AS `id`,
       `p`.`company_id` AS `company_id`,
       `p`.`parent_id` AS `parent_id`,
       `pp`.`name` AS `parent_name`,
       `p`.`location_id` AS `location_id`,
       `lm`.`name` AS `location_name`,
       `lm`.`code` AS `location_code`,
       `lm`.`type_name` AS `location_type_name`,
       `lm`.`path_names` AS `location_path_names`,
       `p`.`code` AS `code`,
       `p`.`name` AS `name`,
       `p`.`description` AS `description`,
       `p`.`type` AS `type`,
       `p`.`status` AS `status`,
       `p`.`stock_min` AS `stock_min`,
       `p`.`stock_max` AS `stock_max`,
       `p`.`sort_order` AS `sort_order`,
       `p`.`roles` AS `roles`,
       (select count(0) from `product_manager` `ch` where ((`ch`.`parent_id` = `p`.`id`) and (`ch`.`deleted_at` is null))) AS `children_count`,
       (select count(0) from `product_attributes` `pa` where ((`pa`.`product_id` = `p`.`id`) and (`pa`.`deleted_at` is null))) AS `attributes_count`,
       `p`.`created_at` AS `created_at`,
       `p`.`updated_at` AS `updated_at`,
       `p`.`deleted_at` AS `deleted_at`
FROM `product_manager` `p`
LEFT JOIN `product_manager` `pp` ON (`pp`.`id` = `p`.`parent_id`)
LEFT JOIN `view_location_manager` `lm` ON ((`lm`.`id` = `p`.`location_id`) and (`lm`.`deleted_at` is null));

CREATE VIEW `view_product_attributes` AS
SELECT `pa`.`id` AS `id`,
       `pa`.`company_id` AS `company_id`,
       `pa`.`product_id` AS `product_id`,
       `p`.`code` AS `product_code`,
       `p`.`name` AS `product_name`,
       `p`.`type` AS `product_type`,
       `pa`.`group_code` AS `group_code`,
       `pa`.`field_code` AS `field_code`,
       `pa`.`label` AS `label`,
       `pa`.`value` AS `value`,
       `pa`.`unit` AS `unit`,
       `pa`.`sort_order` AS `sort_order`,
       `pa`.`created_at` AS `created_at`,
       `pa`.`updated_at` AS `updated_at`,
       `pa`.`deleted_at` AS `deleted_at`
FROM `product_attributes` `pa`
LEFT JOIN `product_manager` `p` ON ((`p`.`id` = `pa`.`product_id`) and (`p`.`deleted_at` is null));
