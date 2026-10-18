/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `aux_cor`;
CREATE TABLE IF NOT EXISTS `aux_cor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hexadecimal` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rgb` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `bootstrap_icons`;
CREATE TABLE IF NOT EXISTS `bootstrap_icons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `codepoint` int NOT NULL,
  `is_favorite` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `is_favorite` (`is_favorite`)
) ENGINE=InnoDB AUTO_INCREMENT=4052 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `calendar_events`;
CREATE TABLE IF NOT EXISTS `calendar_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `calendar_id` bigint NOT NULL,
  `user_manager_id` bigint DEFAULT NULL,
  `google_event_id` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ical_uid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('confirmed','tentative','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'confirmed',
  `summary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `start_datetime` datetime DEFAULT NULL,
  `start_time_zone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `end_time_zone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `recurrence` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `recurring_event_id` bigint DEFAULT NULL,
  `sequence` int NOT NULL DEFAULT '0',
  `transparency` enum('opaque','transparent') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'opaque',
  `visibility` enum('default','public','private','confidential') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'default',
  `color_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `event_type` enum('default','outOfOffice','focusTime','workingLocation','birthday') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'default',
  `guests_can_modify` tinyint(1) NOT NULL DEFAULT '0',
  `guests_can_invite_others` tinyint(1) NOT NULL DEFAULT '1',
  `guests_can_see_other_guests` tinyint(1) NOT NULL DEFAULT '1',
  `anyone_can_add_self` tinyint(1) NOT NULL DEFAULT '0',
  `html_link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `google_created_at` datetime DEFAULT NULL,
  `google_updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `google_event_id` (`google_event_id`),
  KEY `calendar_id` (`calendar_id`),
  KEY `recurring_event_id` (`recurring_event_id`),
  KEY `calendar_events_user_manager_id_index` (`user_manager_id`),
  KEY `idx_calendar_events_company` (`company_id`),
  CONSTRAINT `calendar_events_calendar_id_foreign` FOREIGN KEY (`calendar_id`) REFERENCES `calendar_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `calendar_events_recurring_event_id_foreign` FOREIGN KEY (`recurring_event_id`) REFERENCES `calendar_events` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `calendar_events_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_calendar_events_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `calendar_event_attachments`;
CREATE TABLE IF NOT EXISTS `calendar_event_attachments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `calendar_event_id` bigint NOT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `icon_link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `calendar_event_id` (`calendar_event_id`),
  KEY `idx_calendar_event_attachments_company` (`company_id`),
  CONSTRAINT `calendar_event_attachments_calendar_event_id_foreign` FOREIGN KEY (`calendar_event_id`) REFERENCES `calendar_events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_calendar_event_attachments_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `calendar_event_attendees`;
CREATE TABLE IF NOT EXISTS `calendar_event_attendees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `calendar_event_id` bigint NOT NULL,
  `user_manager_id` bigint DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `display_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_organizer` tinyint(1) NOT NULL DEFAULT '0',
  `is_self` tinyint(1) NOT NULL DEFAULT '0',
  `is_resource` tinyint(1) NOT NULL DEFAULT '0',
  `is_optional` tinyint(1) NOT NULL DEFAULT '0',
  `response_status` enum('needsAction','declined','tentative','accepted') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'needsAction',
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `calendar_event_id` (`calendar_event_id`),
  KEY `calendar_event_attendees_user_manager_id_index` (`user_manager_id`),
  KEY `idx_calendar_event_attendees_company` (`company_id`),
  CONSTRAINT `calendar_event_attendees_calendar_event_id_foreign` FOREIGN KEY (`calendar_event_id`) REFERENCES `calendar_events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `calendar_event_attendees_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_calendar_event_attendees_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `calendar_event_extended_properties`;
CREATE TABLE IF NOT EXISTS `calendar_event_extended_properties` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `calendar_event_id` bigint NOT NULL,
  `scope` enum('private','shared') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'private',
  `property_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `property_value` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `calendar_event_id` (`calendar_event_id`),
  KEY `idx_calendar_event_extended_properties_company` (`company_id`),
  CONSTRAINT `calendar_event_extended_properties_calendar_event_id_foreign` FOREIGN KEY (`calendar_event_id`) REFERENCES `calendar_events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_calendar_event_extended_properties_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `calendar_event_invites`;
CREATE TABLE IF NOT EXISTS `calendar_event_invites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `calendar_event_id` bigint NOT NULL,
  `user_manager_id` bigint DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `token_hash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `calendar_event_invites_token_hash_unique` (`token_hash`),
  KEY `calendar_event_invites_calendar_event_id_index` (`calendar_event_id`),
  KEY `calendar_event_invites_user_manager_id_index` (`user_manager_id`),
  KEY `calendar_event_invites_created_by_index` (`created_by`),
  KEY `idx_calendar_event_invites_company` (`company_id`),
  CONSTRAINT `calendar_event_invites_calendar_event_id_foreign` FOREIGN KEY (`calendar_event_id`) REFERENCES `calendar_events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `calendar_event_invites_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `calendar_event_invites_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_calendar_event_invites_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `calendar_event_reminders`;
CREATE TABLE IF NOT EXISTS `calendar_event_reminders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `calendar_event_id` bigint NOT NULL,
  `method` enum('email','popup') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'popup',
  `minutes` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `calendar_event_id` (`calendar_event_id`),
  KEY `idx_calendar_event_reminders_company` (`company_id`),
  CONSTRAINT `calendar_event_reminders_calendar_event_id_foreign` FOREIGN KEY (`calendar_event_id`) REFERENCES `calendar_events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_calendar_event_reminders_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `calendar_manager`;
CREATE TABLE IF NOT EXISTS `calendar_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `google_calendar_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_manager_id` bigint DEFAULT NULL,
  `document_manager_id` bigint DEFAULT NULL,
  `summary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `time_zone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `background_color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `foreground_color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `access_role` enum('freeBusyReader','reader','writer','owner') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'owner',
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `sort_order` int NOT NULL DEFAULT '0',
  `map_manager_id` bigint DEFAULT NULL,
  `networking_manager_id` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `google_calendar_id` (`google_calendar_id`),
  KEY `calendar_manager_user_manager_id_index` (`user_manager_id`),
  KEY `idx_calendar_manager_company` (`company_id`),
  CONSTRAINT `calendar_manager_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_calendar_manager_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `chat_rooms_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('sent','blocked','removed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'sent',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `chat_rooms_manager_id` (`chat_rooms_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `status` (`status`),
  KEY `idx_chat_messages_company` (`company_id`),
  CONSTRAINT `chat_messages_chat_rooms_manager_id_foreign` FOREIGN KEY (`chat_rooms_manager_id`) REFERENCES `chat_rooms_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_messages_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_messages_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `chat_message_edits`;
CREATE TABLE IF NOT EXISTS `chat_message_edits` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `chat_message_id` bigint NOT NULL,
  `content_before` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `edited_by_user_manager_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `chat_message_id` (`chat_message_id`),
  KEY `edited_by_user_manager_id` (`edited_by_user_manager_id`),
  KEY `idx_chat_message_edits_company` (`company_id`),
  CONSTRAINT `chat_message_edits_chat_message_id_foreign` FOREIGN KEY (`chat_message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_message_edits_edited_by_foreign` FOREIGN KEY (`edited_by_user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_message_edits_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `chat_message_mentions`;
CREATE TABLE IF NOT EXISTS `chat_message_mentions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `chat_message_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chat_message_user` (`chat_message_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `idx_chat_message_mentions_company` (`company_id`),
  CONSTRAINT `chat_message_mentions_chat_message_id_foreign` FOREIGN KEY (`chat_message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_message_mentions_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_message_mentions_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `chat_rooms_manager`;
CREATE TABLE IF NOT EXISTS `chat_rooms_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `owner_user_manager_id` bigint NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `moderation_accepted` tinyint(1) NOT NULL DEFAULT '0',
  `moderation_accepted_at` datetime DEFAULT NULL,
  `status` enum('open','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'open',
  `closed_at` datetime DEFAULT NULL,
  `closed_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_user_manager_id` (`owner_user_manager_id`),
  KEY `status` (`status`),
  KEY `idx_chat_rooms_manager_company` (`company_id`),
  CONSTRAINT `chat_rooms_manager_owner_user_manager_id_foreign` FOREIGN KEY (`owner_user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_rooms_manager_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `chat_room_attachments`;
CREATE TABLE IF NOT EXISTS `chat_room_attachments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `chat_message_id` bigint NOT NULL,
  `file_key` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `stored_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `storage_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mime_type` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `extension` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `checksum_sha256` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category` enum('image','video','audio','document','spreadsheet','presentation','pdf','archive','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'other',
  `status` enum('active','blocked','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_key` (`file_key`),
  KEY `chat_message_id` (`chat_message_id`),
  KEY `category` (`category`),
  KEY `status` (`status`),
  KEY `idx_chat_room_attachments_company` (`company_id`),
  CONSTRAINT `chat_room_attachments_chat_message_id_foreign` FOREIGN KEY (`chat_message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_room_attachments_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `chat_room_attachment_reports`;
CREATE TABLE IF NOT EXISTS `chat_room_attachment_reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `chat_room_attachment_id` bigint NOT NULL,
  `reporter_user_manager_id` bigint NOT NULL,
  `reason` enum('nudity','violence','hate','harassment','spam','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('pending','reviewing','resolved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'resolved',
  `reviewed_by` bigint DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attachment_reporter` (`chat_room_attachment_id`,`reporter_user_manager_id`),
  KEY `reporter_user_manager_id` (`reporter_user_manager_id`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `status` (`status`),
  KEY `reason` (`reason`),
  KEY `idx_chat_room_attachment_reports_company` (`company_id`),
  CONSTRAINT `chat_room_attachment_reports_chat_room_attachment_id_foreign` FOREIGN KEY (`chat_room_attachment_id`) REFERENCES `chat_room_attachments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_attachment_reports_reporter_user_manager_id_foreign` FOREIGN KEY (`reporter_user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_attachment_reports_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_room_attachment_reports_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `chat_room_favorites`;
CREATE TABLE IF NOT EXISTS `chat_room_favorites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `chat_rooms_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chat_room_user` (`chat_rooms_manager_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `idx_chat_room_favorites_company` (`company_id`),
  CONSTRAINT `chat_room_favorites_chat_rooms_manager_id_foreign` FOREIGN KEY (`chat_rooms_manager_id`) REFERENCES `chat_rooms_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_favorites_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_room_favorites_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `chat_room_members`;
CREATE TABLE IF NOT EXISTS `chat_room_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `chat_rooms_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `role` enum('owner','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'member',
  `status` enum('active','blocked','left') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `blocked_reason` enum('profanity_3x','attachment_report','manual') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `blocked_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chat_room_user` (`chat_rooms_manager_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `status` (`status`),
  KEY `idx_chat_room_members_company` (`company_id`),
  CONSTRAINT `chat_room_members_chat_rooms_manager_id_foreign` FOREIGN KEY (`chat_rooms_manager_id`) REFERENCES `chat_rooms_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_members_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_room_members_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `chat_room_warnings`;
CREATE TABLE IF NOT EXISTS `chat_room_warnings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `chat_rooms_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `chat_message_id` bigint NOT NULL,
  `flagged_word` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `chat_rooms_manager_id` (`chat_rooms_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `chat_message_id` (`chat_message_id`),
  KEY `idx_chat_room_warnings_company` (`company_id`),
  CONSTRAINT `chat_room_warnings_chat_message_id_foreign` FOREIGN KEY (`chat_message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_warnings_chat_rooms_manager_id_foreign` FOREIGN KEY (`chat_rooms_manager_id`) REFERENCES `chat_rooms_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_warnings_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_room_warnings_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `company_manager`;
CREATE TABLE IF NOT EXISTS `company_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `document` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `company_members`;
CREATE TABLE IF NOT EXISTS `company_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `role` enum('admin','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'member',
  `status` enum('pending','active','blocked','left','removed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_user` (`company_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `status` (`status`),
  CONSTRAINT `company_members_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `company_members_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `eleicao_votacao_local_2024`;
CREATE TABLE IF NOT EXISTS `eleicao_votacao_local_2024` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `aa_eleicao` smallint NOT NULL,
  `cd_tipo_eleicao` smallint NOT NULL,
  `nm_tipo_eleicao` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cd_eleicao` int NOT NULL,
  `ds_eleicao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `dt_eleicao` datetime NOT NULL,
  `sg_uf` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cd_municipio` int NOT NULL,
  `nm_municipio` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nr_zona` smallint NOT NULL,
  `nm_local_votacao` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ds_local_votacao_endereco` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nr_turno` tinyint NOT NULL,
  `ds_cargo` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nr_votavel` int NOT NULL,
  `nm_votavel` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sq_candidato` bigint NOT NULL,
  `qt_aptos` int NOT NULL DEFAULT '0',
  `qt_comparecimento` int NOT NULL DEFAULT '0',
  `qt_abstencoes` int NOT NULL DEFAULT '0',
  `qt_votos_nominais` int NOT NULL DEFAULT '0',
  `qt_votos` int NOT NULL DEFAULT '0',
  `dt_carga` datetime DEFAULT NULL,
  `qt_registros` int NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_evl_municipio` (`cd_municipio`),
  KEY `idx_evl_municipio_zona` (`cd_municipio`,`nr_zona`),
  KEY `idx_evl_votavel` (`nr_votavel`)
) ENGINE=InnoDB AUTO_INCREMENT=3326 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `form_fields`;
CREATE TABLE IF NOT EXISTS `form_fields` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `form_row_id` bigint NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `field_type` enum('text','password','email','textarea','senha','select','radio','checkbox','cpf','cnpj','phone','cep','data','hora','moeda','pis','placa','titulo','cnh','processo','renavam','sei','datahora','arquivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'text',
  `col` tinyint NOT NULL DEFAULT '12',
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `placeholder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `default_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `help_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `disabled` tinyint(1) NOT NULL DEFAULT '0',
  `read_only` tinyint(1) NOT NULL DEFAULT '0',
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `max_length` int DEFAULT NULL,
  `min_length` int DEFAULT NULL,
  `pattern` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `input_mode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `autocomplete` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `no_numbers` tinyint(1) NOT NULL DEFAULT '0',
  `no_letters` tinyint(1) NOT NULL DEFAULT '0',
  `no_special_chars` tinyint(1) NOT NULL DEFAULT '0',
  `strong_password` tinyint(1) NOT NULL DEFAULT '0',
  `double_field` tinyint(1) NOT NULL DEFAULT '0',
  `equal_fields` tinyint(1) NOT NULL DEFAULT '0',
  `with_seconds` tinyint(1) NOT NULL DEFAULT '0',
  `show_counter` tinyint(1) DEFAULT NULL,
  `inline` tinyint(1) NOT NULL DEFAULT '0',
  `rows_qty` int DEFAULT NULL,
  `min_date` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `max_date` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `options_json` json DEFAULT NULL,
  `datalist_json` json DEFAULT NULL,
  `allowed_domains_json` json DEFAULT NULL,
  `select_config_json` json DEFAULT NULL,
  `style_json` json DEFAULT NULL,
  `attributes_json` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `form_row_id` (`form_row_id`),
  KEY `field_type` (`field_type`),
  KEY `sort_order` (`sort_order`),
  CONSTRAINT `form_campos_form_row_id_foreign` FOREIGN KEY (`form_row_id`) REFERENCES `form_rows` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=506 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `form_groups`;
CREATE TABLE IF NOT EXISTS `form_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `form_manager_id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `icon` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `collapsed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `form_manager_id_slug` (`form_manager_id`,`slug`),
  KEY `sort_order` (`sort_order`),
  CONSTRAINT `form_groups_form_manager_id_foreign` FOREIGN KEY (`form_manager_id`) REFERENCES `form_manager` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `form_manager`;
CREATE TABLE IF NOT EXISTS `form_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `table_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `roles` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `react_route` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `submit_endpoint` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `http_method` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'POST',
  `status` enum('draft','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'draft',
  `version` int NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `status` (`status`),
  KEY `roles` (`roles`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `form_rows`;
CREATE TABLE IF NOT EXISTS `form_rows` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `form_group_id` bigint NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `gutter` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'g-3',
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `form_group_id` (`form_group_id`),
  KEY `sort_order` (`sort_order`),
  CONSTRAINT `form_rows_form_group_id_foreign` FOREIGN KEY (`form_group_id`) REFERENCES `form_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=276 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `list_actions`;
CREATE TABLE IF NOT EXISTS `list_actions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `list_manager_id` bigint NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `icon` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `action_type` enum('link','api_call','modal') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'link',
  `href_template` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `api_endpoint` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `http_method` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'GET',
  `data_action` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `target` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `confirm` tinyint(1) NOT NULL DEFAULT '0',
  `confirm_message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `extra_data_json` json DEFAULT NULL,
  `roles` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `business_rule_json` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `list_manager_id` (`list_manager_id`),
  KEY `sort_order` (`sort_order`),
  CONSTRAINT `list_actions_list_manager_id_foreign` FOREIGN KEY (`list_manager_id`) REFERENCES `list_manager` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `list_columns`;
CREATE TABLE IF NOT EXISTS `list_columns` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `list_manager_id` bigint NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `field_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `concat_json` json DEFAULT NULL,
  `format` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'text',
  `cell_class` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fallback` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '—',
  `sortable` tinyint(1) NOT NULL DEFAULT '0',
  `sort_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort_concat_json` json DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `list_manager_id` (`list_manager_id`),
  KEY `sort_order` (`sort_order`),
  CONSTRAINT `list_columns_list_manager_id_foreign` FOREIGN KEY (`list_manager_id`) REFERENCES `list_manager` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=347 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `list_manager`;
CREATE TABLE IF NOT EXISTS `list_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `table_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `api_get_endpoint` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `api_search_endpoint` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `roles` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `default_sort` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'id',
  `default_order` enum('asc','desc') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'desc',
  `default_limit` int NOT NULL DEFAULT '20',
  `limit_options_json` json DEFAULT NULL,
  `status` enum('draft','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'draft',
  `version` int NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `location_manager`;
CREATE TABLE IF NOT EXISTS `location_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `location_type_id` bigint NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `code` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_location_manager_parent_code` (`parent_id`,`code`),
  KEY `idx_location_manager_company` (`company_id`),
  KEY `idx_location_manager_parent` (`parent_id`),
  KEY `idx_location_manager_type` (`location_type_id`),
  KEY `sort_order` (`sort_order`),
  KEY `status` (`status`),
  CONSTRAINT `fk_location_manager_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `fk_location_manager_parent` FOREIGN KEY (`parent_id`) REFERENCES `location_manager` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_location_manager_type` FOREIGN KEY (`location_type_id`) REFERENCES `location_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `location_types`;
CREATE TABLE IF NOT EXISTS `location_types` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_location_types_code` (`code`),
  KEY `sort_order` (`sort_order`),
  KEY `status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `map_addresses`;
CREATE TABLE IF NOT EXISTS `map_addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `map_postal_code_id` bigint DEFAULT NULL,
  `cep` char(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `street` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `complement` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `neighborhood` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `country` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'BR',
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `geocode_source` enum('nominatim','viacep','manual') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'manual',
  `geocode_precision` enum('rooftop','street','postal_code','city','approximate') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `osm_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `osm_id` bigint DEFAULT NULL,
  `display_name` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `map_postal_code_id` (`map_postal_code_id`),
  KEY `cep` (`cep`),
  KEY `city_state` (`city`,`state`),
  KEY `lat_lng` (`lat`,`lng`),
  KEY `osm` (`osm_type`,`osm_id`),
  KEY `idx_map_addresses_company` (`company_id`),
  CONSTRAINT `fk_map_addresses_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `map_addresses_map_postal_code_id_foreign` FOREIGN KEY (`map_postal_code_id`) REFERENCES `map_postal_codes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `map_categories`;
CREATE TABLE IF NOT EXISTS `map_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `map_manager_id` bigint NOT NULL,
  `map_icon_id` bigint DEFAULT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `map_manager_slug` (`map_manager_id`,`slug`),
  KEY `map_icon_id` (`map_icon_id`),
  KEY `sort_order` (`sort_order`),
  KEY `status` (`status`),
  KEY `idx_map_categories_company` (`company_id`),
  CONSTRAINT `fk_map_categories_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `map_categories_map_icon_id_foreign` FOREIGN KEY (`map_icon_id`) REFERENCES `map_icons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `map_categories_map_manager_id_foreign` FOREIGN KEY (`map_manager_id`) REFERENCES `map_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `map_geocode_cache`;
CREATE TABLE IF NOT EXISTS `map_geocode_cache` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `query_hash` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `query_text` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `provider` enum('nominatim','viacep','ors') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'nominatim',
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `result_json` json DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `query_hash` (`query_hash`),
  KEY `provider` (`provider`),
  KEY `expires_at` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `map_icons`;
CREATE TABLE IF NOT EXISTS `map_icons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `icon_type` enum('bootstrap-icon','image','svg') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'bootstrap-icon',
  `icon_class` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `upload_id` bigint DEFAULT NULL,
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `size_w` smallint NOT NULL DEFAULT '32',
  `size_h` smallint NOT NULL DEFAULT '32',
  `anchor_x` smallint NOT NULL DEFAULT '16',
  `anchor_y` smallint NOT NULL DEFAULT '32',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `icon_type` (`icon_type`),
  KEY `upload_id` (`upload_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `map_links`;
CREATE TABLE IF NOT EXISTS `map_links` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `module` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `reference_id` bigint NOT NULL,
  `collection` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'default',
  `link_type` enum('postal_code','address','point','route') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `map_postal_code_id` bigint DEFAULT NULL,
  `map_address_id` bigint DEFAULT NULL,
  `map_point_id` bigint DEFAULT NULL,
  `map_route_id` bigint DEFAULT NULL,
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `user_manager_id` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `module_reference` (`module`,`reference_id`,`collection`),
  KEY `link_type` (`link_type`),
  KEY `map_postal_code_id` (`map_postal_code_id`),
  KEY `map_address_id` (`map_address_id`),
  KEY `map_point_id` (`map_point_id`),
  KEY `map_route_id` (`map_route_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `status` (`status`),
  KEY `idx_map_links_company` (`company_id`),
  CONSTRAINT `fk_map_links_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `map_links_map_address_id_foreign` FOREIGN KEY (`map_address_id`) REFERENCES `map_addresses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `map_links_map_point_id_foreign` FOREIGN KEY (`map_point_id`) REFERENCES `map_points` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `map_links_map_postal_code_id_foreign` FOREIGN KEY (`map_postal_code_id`) REFERENCES `map_postal_codes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `map_links_map_route_id_foreign` FOREIGN KEY (`map_route_id`) REFERENCES `map_routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `map_links_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `map_manager`;
CREATE TABLE IF NOT EXISTS `map_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `user_manager_id` bigint DEFAULT NULL,
  `slug` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `center_lat` decimal(10,7) NOT NULL,
  `center_lng` decimal(10,7) NOT NULL,
  `zoom` tinyint NOT NULL DEFAULT '13',
  `min_zoom` tinyint NOT NULL DEFAULT '1',
  `max_zoom` tinyint NOT NULL DEFAULT '19',
  `tile_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  `attribution` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '&copy; OpenStreetMap contributors',
  `roles` json DEFAULT NULL,
  `status` enum('draft','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `version` int NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `status` (`status`),
  KEY `idx_map_manager_company` (`company_id`),
  CONSTRAINT `fk_map_manager_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `map_manager_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `map_points`;
CREATE TABLE IF NOT EXISTS `map_points` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `map_manager_id` bigint NOT NULL,
  `map_category_id` bigint DEFAULT NULL,
  `map_icon_id` bigint DEFAULT NULL,
  `map_address_id` bigint DEFAULT NULL,
  `user_manager_id` bigint DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `lat` decimal(10,7) NOT NULL,
  `lng` decimal(10,7) NOT NULL,
  `extra_json` json DEFAULT NULL,
  `status` enum('draft','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `map_manager_id` (`map_manager_id`),
  KEY `map_category_id` (`map_category_id`),
  KEY `map_icon_id` (`map_icon_id`),
  KEY `map_address_id` (`map_address_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `lat_lng` (`lat`,`lng`),
  KEY `status` (`status`),
  KEY `idx_map_points_company` (`company_id`),
  CONSTRAINT `fk_map_points_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `map_points_map_address_id_foreign` FOREIGN KEY (`map_address_id`) REFERENCES `map_addresses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `map_points_map_category_id_foreign` FOREIGN KEY (`map_category_id`) REFERENCES `map_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `map_points_map_icon_id_foreign` FOREIGN KEY (`map_icon_id`) REFERENCES `map_icons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `map_points_map_manager_id_foreign` FOREIGN KEY (`map_manager_id`) REFERENCES `map_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `map_points_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `map_postal_codes`;
CREATE TABLE IF NOT EXISTS `map_postal_codes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cep` char(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `street` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `neighborhood` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ibge_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `source` enum('viacep','nominatim','manual') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'viacep',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cep` (`cep`),
  KEY `city_state` (`city`,`state`),
  KEY `lat_lng` (`lat`,`lng`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `map_routes`;
CREATE TABLE IF NOT EXISTS `map_routes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `map_manager_id` bigint NOT NULL,
  `user_manager_id` bigint DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `profile` enum('driving-car','driving-hgv','cycling-regular','foot-walking') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'driving-car',
  `distance_m` int DEFAULT NULL,
  `duration_s` int DEFAULT NULL,
  `geometry` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `bbox` json DEFAULT NULL,
  `provider` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'ors',
  `options_json` json DEFAULT NULL,
  `calculated_at` datetime DEFAULT NULL,
  `status` enum('draft','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `map_manager_id` (`map_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `profile` (`profile`),
  KEY `status` (`status`),
  KEY `idx_map_routes_company` (`company_id`),
  CONSTRAINT `fk_map_routes_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `map_routes_map_manager_id_foreign` FOREIGN KEY (`map_manager_id`) REFERENCES `map_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `map_routes_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `map_route_stops`;
CREATE TABLE IF NOT EXISTS `map_route_stops` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `map_route_id` bigint NOT NULL,
  `map_point_id` bigint DEFAULT NULL,
  `map_address_id` bigint DEFAULT NULL,
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lat` decimal(10,7) NOT NULL,
  `lng` decimal(10,7) NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `leg_distance_m` int DEFAULT NULL,
  `leg_duration_s` int DEFAULT NULL,
  `service_time_s` int NOT NULL DEFAULT '0',
  `eta` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `map_route_id_sort_order` (`map_route_id`,`sort_order`),
  KEY `map_point_id` (`map_point_id`),
  KEY `map_address_id` (`map_address_id`),
  KEY `idx_map_route_stops_company` (`company_id`),
  CONSTRAINT `fk_map_route_stops_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `map_route_stops_map_address_id_foreign` FOREIGN KEY (`map_address_id`) REFERENCES `map_addresses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `map_route_stops_map_point_id_foreign` FOREIGN KEY (`map_point_id`) REFERENCES `map_points` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `map_route_stops_map_route_id_foreign` FOREIGN KEY (`map_route_id`) REFERENCES `map_routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `menu_manager`;
CREATE TABLE IF NOT EXISTS `menu_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nav_manager_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `react_route` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `icon` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `placement` enum('navbar','offcanvas') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'navbar',
  `is_bookmark` tinyint(1) NOT NULL DEFAULT '0',
  `roles` json DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('active','draft','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'draft',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_items_parent_id_foreign` (`parent_id`),
  KEY `sort_order` (`sort_order`),
  KEY `status` (`status`),
  KEY `nav_manager_id_parent_id` (`nav_manager_id`,`parent_id`),
  KEY `placement` (`placement`),
  CONSTRAINT `menu_items_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `menu_manager` (`id`) ON DELETE CASCADE,
  CONSTRAINT `menu_manager_nav_manager_id_foreign` FOREIGN KEY (`nav_manager_id`) REFERENCES `nav_manager` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `messages_manager`;
CREATE TABLE IF NOT EXISTS `messages_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `sender_user_manager_id` bigint NOT NULL,
  `recipient_user_manager_id` bigint DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('scheduled','sent','blocked','removed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'sent',
  `scheduled_at` datetime DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_user_manager_id` (`sender_user_manager_id`),
  KEY `recipient_user_manager_id` (`recipient_user_manager_id`),
  KEY `status` (`status`),
  KEY `status_scheduled_at` (`status`,`scheduled_at`),
  KEY `recipient_read_at` (`recipient_user_manager_id`,`read_at`),
  KEY `idx_messages_manager_company` (`company_id`),
  CONSTRAINT `fk_messages_manager_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `messages_manager_recipient_user_manager_id_foreign` FOREIGN KEY (`recipient_user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_manager_sender_user_manager_id_foreign` FOREIGN KEY (`sender_user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `message_attachments`;
CREATE TABLE IF NOT EXISTS `message_attachments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `messages_manager_id` bigint NOT NULL,
  `file_key` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `stored_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `storage_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mime_type` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `extension` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `checksum_sha256` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category` enum('image','video','audio','document','spreadsheet','presentation','pdf','archive','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'other',
  `status` enum('active','blocked','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_key` (`file_key`),
  KEY `messages_manager_id` (`messages_manager_id`),
  KEY `category` (`category`),
  KEY `status` (`status`),
  KEY `idx_message_attachments_company` (`company_id`),
  CONSTRAINT `fk_message_attachments_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `message_attachments_messages_manager_id_foreign` FOREIGN KEY (`messages_manager_id`) REFERENCES `messages_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `message_groups_manager`;
CREATE TABLE IF NOT EXISTS `message_groups_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `owner_user_manager_id` bigint NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_user_manager_id` (`owner_user_manager_id`),
  KEY `status` (`status`),
  KEY `idx_message_groups_manager_company` (`company_id`),
  CONSTRAINT `fk_message_groups_manager_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `message_groups_manager_owner_user_manager_id_foreign` FOREIGN KEY (`owner_user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `message_group_members`;
CREATE TABLE IF NOT EXISTS `message_group_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `message_groups_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `role` enum('owner','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'member',
  `status` enum('active','left','removed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_group_user` (`message_groups_manager_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `status` (`status`),
  KEY `idx_message_group_members_company` (`company_id`),
  CONSTRAINT `fk_message_group_members_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `message_group_members_message_groups_manager_id_foreign` FOREIGN KEY (`message_groups_manager_id`) REFERENCES `message_groups_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_group_members_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `message_group_messages`;
CREATE TABLE IF NOT EXISTS `message_group_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `messages_manager_id` bigint NOT NULL,
  `message_groups_manager_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `messages_manager_id` (`messages_manager_id`),
  KEY `message_groups_manager_id` (`message_groups_manager_id`),
  KEY `idx_message_group_messages_company` (`company_id`),
  CONSTRAINT `fk_message_group_messages_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `message_group_messages_message_groups_manager_id_foreign` FOREIGN KEY (`message_groups_manager_id`) REFERENCES `message_groups_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_group_messages_messages_manager_id_foreign` FOREIGN KEY (`messages_manager_id`) REFERENCES `messages_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `message_group_reads`;
CREATE TABLE IF NOT EXISTS `message_group_reads` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `messages_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `read_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_user` (`messages_manager_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `idx_message_group_reads_company` (`company_id`),
  CONSTRAINT `fk_message_group_reads_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `message_group_reads_messages_manager_id_foreign` FOREIGN KEY (`messages_manager_id`) REFERENCES `messages_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_group_reads_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `message_mentions`;
CREATE TABLE IF NOT EXISTS `message_mentions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `messages_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_user` (`messages_manager_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `idx_message_mentions_company` (`company_id`),
  CONSTRAINT `fk_message_mentions_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `message_mentions_messages_manager_id_foreign` FOREIGN KEY (`messages_manager_id`) REFERENCES `messages_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_mentions_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `message_warnings`;
CREATE TABLE IF NOT EXISTS `message_warnings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `messages_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `message_groups_manager_id` bigint DEFAULT NULL,
  `flagged_word` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_manager_id` (`messages_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `message_groups_manager_id` (`message_groups_manager_id`),
  KEY `idx_message_warnings_company` (`company_id`),
  CONSTRAINT `fk_message_warnings_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `message_warnings_message_groups_manager_id_foreign` FOREIGN KEY (`message_groups_manager_id`) REFERENCES `message_groups_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_warnings_messages_manager_id_foreign` FOREIGN KEY (`messages_manager_id`) REFERENCES `messages_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_warnings_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `version` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `class` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `group` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `namespace` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `time` int NOT NULL,
  `batch` int unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `nav_manager`;
CREATE TABLE IF NOT EXISTS `nav_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message_icon` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `system_version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '1.0.0',
  `status` enum('draft','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'draft',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `route_manager`;
CREATE TABLE IF NOT EXISTS `route_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `layer` enum('backend','frontend') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `object` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `method` enum('GET','POST','PUT','PATCH','DELETE') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `endpoint` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `controller_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_route_manager_method_endpoint` (`method`,`endpoint`),
  KEY `layer` (`layer`),
  KEY `object` (`object`)
) ENGINE=InnoDB AUTO_INCREMENT=1915 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `timeline_manager`;
CREATE TABLE IF NOT EXISTS `timeline_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `slug` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `cover_image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('draft','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `version` int NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_manager_id` (`user_manager_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `status` (`status`),
  KEY `idx_timeline_manager_company` (`company_id`),
  CONSTRAINT `fk_timeline_manager_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `timeline_manager_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `timeline_posts`;
CREATE TABLE IF NOT EXISTS `timeline_posts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `timeline_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `repost_of_id` bigint DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('draft','published','hidden','removed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'published',
  `published_at` datetime DEFAULT NULL,
  `edited_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `timeline_manager_id` (`timeline_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `repost_of_id` (`repost_of_id`),
  KEY `status_published_at` (`status`,`published_at`),
  KEY `idx_timeline_posts_company` (`company_id`),
  CONSTRAINT `fk_timeline_posts_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `timeline_posts_repost_of_id_foreign` FOREIGN KEY (`repost_of_id`) REFERENCES `timeline_posts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `timeline_posts_timeline_manager_id_foreign` FOREIGN KEY (`timeline_manager_id`) REFERENCES `timeline_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `timeline_posts_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `timeline_post_attachments`;
CREATE TABLE IF NOT EXISTS `timeline_post_attachments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `timeline_post_id` bigint NOT NULL,
  `file_key` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `stored_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `storage_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mime_type` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `extension` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `checksum_sha256` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category` enum('image','video','audio','document','spreadsheet','presentation','pdf','archive','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'other',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_key` (`file_key`),
  KEY `timeline_post_id` (`timeline_post_id`),
  KEY `category` (`category`),
  KEY `sort_order` (`sort_order`),
  KEY `status` (`status`),
  KEY `idx_timeline_post_attachments_company` (`company_id`),
  CONSTRAINT `fk_timeline_post_attachments_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `timeline_post_attachments_timeline_post_id_foreign` FOREIGN KEY (`timeline_post_id`) REFERENCES `timeline_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `timeline_post_comments`;
CREATE TABLE IF NOT EXISTS `timeline_post_comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `timeline_post_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('published','hidden','removed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'published',
  `edited_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `timeline_post_id` (`timeline_post_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `parent_id` (`parent_id`),
  KEY `status` (`status`),
  KEY `idx_timeline_post_comments_company` (`company_id`),
  CONSTRAINT `fk_timeline_post_comments_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `timeline_post_comments_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `timeline_post_comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `timeline_post_comments_timeline_post_id_foreign` FOREIGN KEY (`timeline_post_id`) REFERENCES `timeline_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `timeline_post_comments_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `timeline_post_ratings`;
CREATE TABLE IF NOT EXISTS `timeline_post_ratings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `timeline_post_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `rating` tinyint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `timeline_post_user` (`timeline_post_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `rating` (`rating`),
  KEY `idx_timeline_post_ratings_company` (`company_id`),
  CONSTRAINT `fk_timeline_post_ratings_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `timeline_post_ratings_timeline_post_id_foreign` FOREIGN KEY (`timeline_post_id`) REFERENCES `timeline_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `timeline_post_ratings_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `timeline_post_reactions`;
CREATE TABLE IF NOT EXISTS `timeline_post_reactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `timeline_post_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `reaction_type` enum('like','dislike') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `timeline_post_user` (`timeline_post_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `reaction_type` (`reaction_type`),
  KEY `idx_timeline_post_reactions_company` (`company_id`),
  CONSTRAINT `fk_timeline_post_reactions_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `timeline_post_reactions_timeline_post_id_foreign` FOREIGN KEY (`timeline_post_id`) REFERENCES `timeline_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `timeline_post_reactions_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `timeline_post_reports`;
CREATE TABLE IF NOT EXISTS `timeline_post_reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `timeline_post_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `reason` enum('spam','abuse','violence','nudity','hate','copyright','misinformation','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('pending','reviewing','resolved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `reviewed_by` bigint DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `timeline_post_reporter` (`timeline_post_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `status` (`status`),
  KEY `reason` (`reason`),
  KEY `idx_timeline_post_reports_company` (`company_id`),
  CONSTRAINT `fk_timeline_post_reports_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`),
  CONSTRAINT `timeline_post_reports_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `timeline_post_reports_timeline_post_id_foreign` FOREIGN KEY (`timeline_post_id`) REFERENCES `timeline_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `timeline_post_reports_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `uploads`;
CREATE TABLE IF NOT EXISTS `uploads` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `module` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `reference_id` bigint NOT NULL,
  `collection` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_key` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `stored_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `storage_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mime_type` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `extension` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `checksum_sha256` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category` enum('image','video','audio','document','spreadsheet','presentation','pdf','archive','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'other',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_key` (`file_key`),
  KEY `module_reference_id` (`module`,`reference_id`),
  KEY `collection` (`collection`),
  KEY `category` (`category`),
  KEY `status` (`status`),
  KEY `idx_uploads_company` (`company_id`),
  CONSTRAINT `fk_uploads_company` FOREIGN KEY (`company_id`) REFERENCES `company_manager` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `user_manager`;
CREATE TABLE IF NOT EXISTS `user_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('active','inactive','blocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `user_role_id` bigint DEFAULT '2',
  `company_ids` json DEFAULT NULL COMMENT 'Ids (company_manager.id) das empresas que o usuario pode acessar',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `user_role_id` (`user_role_id`),
  CONSTRAINT `fk_user_manager_user_role` FOREIGN KEY (`user_role_id`) REFERENCES `user_roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_manager_id` bigint NOT NULL,
  `uuid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `whatsapp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cpf` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cep` varchar(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `user_profiles_user_manager_id_foreign` (`user_manager_id`),
  CONSTRAINT `user_profiles_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `user_resource_access`;
CREATE TABLE IF NOT EXISTS `user_resource_access` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_manager_id` bigint NOT NULL,
  `resource_type` enum('form','list') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `resource_id` bigint NOT NULL,
  `allowed` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_resource` (`user_manager_id`,`resource_type`,`resource_id`),
  KEY `resource` (`resource_type`,`resource_id`),
  CONSTRAINT `fk_ura_user_manager` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TRIGGER IF EXISTS `trg_location_manager_bi`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE DEFINER=`root`@`localhost` TRIGGER `trg_location_manager_bi` BEFORE INSERT ON `location_manager` FOR EACH ROW BEGIN
  DECLARE v_parent_company BIGINT;
  IF NEW.parent_id IS NOT NULL THEN
    SELECT `company_id` INTO v_parent_company FROM `location_manager` WHERE `id` = NEW.parent_id;
    IF v_parent_company IS NULL OR v_parent_company <> NEW.company_id THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'location_manager: parent_id inexistente ou de outra empresa';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

DROP TRIGGER IF EXISTS `trg_location_manager_bu`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE DEFINER=`root`@`localhost` TRIGGER `trg_location_manager_bu` BEFORE UPDATE ON `location_manager` FOR EACH ROW BEGIN
  DECLARE v_parent_company BIGINT;
  DECLARE v_cycle INT DEFAULT 0;
  IF NEW.parent_id IS NOT NULL
     AND (NOT (NEW.parent_id <=> OLD.parent_id) OR NEW.company_id <> OLD.company_id) THEN
    IF NEW.parent_id = NEW.id THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'location_manager: um local nao pode ser pai de si mesmo';
    END IF;
    SELECT `company_id` INTO v_parent_company FROM `location_manager` WHERE `id` = NEW.parent_id;
    IF v_parent_company IS NULL OR v_parent_company <> NEW.company_id THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'location_manager: parent_id inexistente ou de outra empresa';
    END IF;
    WITH RECURSIVE anc (`id`, `parent_id`) AS (
      SELECT `id`, `parent_id` FROM `location_manager` WHERE `id` = NEW.parent_id
      UNION ALL
      SELECT l.`id`, l.`parent_id` FROM `location_manager` l JOIN anc a ON l.`id` = a.`parent_id`
    )
    SELECT COUNT(*) INTO v_cycle FROM anc WHERE `id` = NEW.id;
    IF v_cycle > 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'location_manager: ciclo na hierarquia de locais';
    END IF;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
