CREATE DATABASE IF NOT EXISTS `kochchef`;

USE `kochchef`;

CREATE TABLE IF NOT EXISTS `benutzer` (
  `benutzer_id` int PRIMARY KEY AUTO_INCREMENT,
  `vorname` varchar(128),
  `nachname` varchar(128),
  `username` varchar(128) UNIQUE,
  `email` varchar(128) UNIQUE,
  `passwort` char(60) COMMENT '60 byte bcrypt hash'
);

CREATE TABLE IF NOT EXISTS `bewertung` (
  `benutzer_id` int NOT NULL,
  `inhalt` varchar(1024),
  `sterne` int,
  `rezept_id` int NOT NULL,
  PRIMARY KEY (`benutzer_id`, `rezept_id`)
  CHECK (`bewertung` >= 0 AND `bewertung` <= 5)
);

CREATE TABLE IF NOT EXISTS `gericht` (
  `gericht_id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(128) UNIQUE NOT NULL,
  `beschreibung` varchar(512)
);

CREATE TABLE IF NOT EXISTS `gericht_alias` (
  `name` varchar(128) NOT NULL,
  `gericht_id` int NOT NULL,
  PRIMARY KEY (`gericht_id`, `name`)
);

CREATE TABLE IF NOT EXISTS `rezept` (
  `rezept_id` int PRIMARY KEY AUTO_INCREMENT,
  `gericht_id` int NOT NULL,
  `autor_id` int NOT NULL,
  `name` varchar(128) NOT NULL,
  `anweisung` text NOT NULL COMMENT 'Vllt. Markdown?'
);

CREATE TABLE IF NOT EXISTS `zutat` (
  `zutat_id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(64),
  `preis` decimal(6,2)
);

CREATE TABLE IF NOT EXISTS `benoetigt` (
  `rezept_id` int NOT NULL,
  `zutat_id` int NOT NULL,
  `menge` decimal(6,2),
  `einheit` varchar(16),
  PRIMARY KEY (`rezept_id`, `zutat_id`)
);

CREATE UNIQUE INDEX `rezept_index_0` ON `rezept` (`gericht_id`, `name`);

CREATE INDEX `rezept_index_1` ON `rezept` (`rezept_id`);

ALTER TABLE `bewertung` COMMENT = 'CHECK (sterne BETWEEN 0 AND 5)';

ALTER TABLE `benutzer` ADD FOREIGN KEY (`benutzer_id`) REFERENCES `bewertung` (`benutzer_id`);

ALTER TABLE `rezept` ADD FOREIGN KEY (`rezept_id`) REFERENCES `bewertung` (`rezept_id`);

ALTER TABLE `gericht` ADD FOREIGN KEY (`gericht_id`) REFERENCES `gericht_alias` (`gericht_id`);

ALTER TABLE `gericht` ADD FOREIGN KEY (`gericht_id`) REFERENCES `rezept` (`gericht_id`);

ALTER TABLE `benutzer` ADD FOREIGN KEY (`benutzer_id`) REFERENCES `rezept` (`autor_id`);

ALTER TABLE `rezept` ADD FOREIGN KEY (`rezept_id`) REFERENCES `benoetigt` (`rezept_id`);

ALTER TABLE `zutat` ADD FOREIGN KEY (`zutat_id`) REFERENCES `benoetigt` (`zutat_id`);
