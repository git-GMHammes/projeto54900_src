-- -----------------------------------------------------------------------------
-- ROLES por registro em location_manager (product_manager ja nasce com a coluna
-- em 202610181400_product_tables.sql). Convencao do projeto (menu_manager,
-- map_manager): json com slugs de user_roles; lista vazia = todos.
-- Registros existentes recebem ["guest","user","admin"] (mantem a visibilidade atual).
-- Aplicar pelo cliente mysql. Reaplicavel (checa se a coluna existe).
-- -----------------------------------------------------------------------------
SET NAMES utf8mb4;

SET @has := (SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = 'location_manager' AND column_name = 'roles');
SET @sql := IF(@has = 0,
  'ALTER TABLE `location_manager` ADD COLUMN `roles` json NOT NULL DEFAULT (JSON_ARRAY(''guest'',''user'',''admin'')) AFTER `sort_order`',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

DROP VIEW IF EXISTS `view_location_manager`;
CREATE VIEW `view_location_manager` AS
WITH RECURSIVE `tree` AS (
    SELECT `l`.`id` AS `id`,
           `l`.`id` AS `root_id`,
           0 AS `depth`,
           cast(`l`.`id` as char(2000) charset latin1) AS `path_ids`,
           cast(`l`.`name` as char(4000) charset latin1) AS `path_names`
    FROM `location_manager` `l`
    WHERE (`l`.`parent_id` is null)
    UNION ALL
    SELECT `c`.`id` AS `id`,
           `t`.`root_id` AS `root_id`,
           (`t`.`depth` + 1) AS `depth`,
           concat(`t`.`path_ids`,'/',`c`.`id`) AS `path_ids`,
           concat(convert(`t`.`path_names` using utf8mb4),' > ',`c`.`name`) AS `path_names`
    FROM `location_manager` `c`
    JOIN `tree` `t` ON (`c`.`parent_id` = `t`.`id`)
)
SELECT `l`.`id` AS `id`,
       `l`.`company_id` AS `company_id`,
       `l`.`parent_id` AS `parent_id`,
       `p`.`name` AS `parent_name`,
       `l`.`location_type_id` AS `location_type_id`,
       `lt`.`code` AS `type_code`,
       `lt`.`name` AS `type_name`,
       `lt`.`icon` AS `type_icon`,
       `l`.`name` AS `name`,
       `l`.`code` AS `code`,
       `l`.`description` AS `description`,
       `l`.`latitude` AS `latitude`,
       `l`.`longitude` AS `longitude`,
       `l`.`sort_order` AS `sort_order`,
       `l`.`roles` AS `roles`,
       `l`.`status` AS `status`,
       `t`.`root_id` AS `root_id`,
       `t`.`depth` AS `depth`,
       `t`.`path_ids` AS `path_ids`,
       `t`.`path_names` AS `path_names`,
       (select count(0) from `location_manager` `ch` where ((`ch`.`parent_id` = `l`.`id`) and (`ch`.`deleted_at` is null))) AS `children_count`,
       `l`.`created_at` AS `created_at`,
       `l`.`updated_at` AS `updated_at`,
       `l`.`deleted_at` AS `deleted_at`
FROM `location_manager` `l`
JOIN `tree` `t` ON (`t`.`id` = `l`.`id`)
JOIN `location_types` `lt` ON (`lt`.`id` = `l`.`location_type_id`)
LEFT JOIN `location_manager` `p` ON (`p`.`id` = `l`.`parent_id`);
