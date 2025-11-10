CREATE DATABASE IF NOT EXISTS `kochchef`;
USE `kochchef`;

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int PRIMARY KEY AUTO_INCREMENT,
  `firstname` varchar(128),
  `surname` varchar(128),
  `username` varchar(128) UNIQUE,
  `avatar` varchar(512),
  `email` varchar(128) UNIQUE,
  `password` char(60) COMMENT '60 byte bcrypt hash',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `token` char(64) NOT NULL UNIQUE COMMENT '64 byte hex reprs. of SHA-256 of a uuid_v7',
  `token_created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `meal` (
  `meal_id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(128) UNIQUE NOT NULL,
  `description` varchar(512),
  `image` varchar(512)
);

CREATE TABLE IF NOT EXISTS `meal_alias` (
  `name` varchar(128) NOT NULL,
  `meal_id` int NOT NULL,
  PRIMARY KEY (`meal_id`, `name`),
  CONSTRAINT fk_alias_meal FOREIGN KEY (`meal_id`) REFERENCES meal(`meal_id`)
);

CREATE TABLE IF NOT EXISTS `recipe` (
  `recipe_id` int PRIMARY KEY AUTO_INCREMENT,
  `meal_id` int NOT NULL,
  `author_id` int NOT NULL,
  `name` varchar(128) NOT NULL,
  `instructions` text NOT NULL COMMENT 'Vllt. Markdown?',
  `image` varchar(512),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `recipe_meal_name` (`meal_id`, `name`),
  CONSTRAINT fk_recipe_meal FOREIGN KEY (`meal_id`) REFERENCES meal(`meal_id`),
  CONSTRAINT fk_recipe_author FOREIGN KEY (`author_id`) REFERENCES user(`user_id`)
);

CREATE TABLE IF NOT EXISTS `ingredient` (
  `ingredient_id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(64),
  `price` decimal(6,2)
);

CREATE TABLE IF NOT EXISTS `needed` (
  `recipe_id` int NOT NULL,
  `ingredient_id` int NOT NULL,
  `amount` decimal(6,2),
  `unit` varchar(16),
  PRIMARY KEY (`recipe_id`, `ingredient_id`),
  CONSTRAINT fk_needed_recipe FOREIGN KEY (`recipe_id`) REFERENCES recipe(`recipe_id`),
  CONSTRAINT fk_needed_ingredient FOREIGN KEY (`ingredient_id`) REFERENCES ingredient(`ingredient_id`)
);

CREATE TABLE IF NOT EXISTS `rating` (
  `user_id` int NOT NULL,
  `recipe_id` int NOT NULL,
  `content` varchar(1024),
  `stars` int,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `recipe_id`),
  CONSTRAINT fk_rating_user FOREIGN KEY (`user_id`) REFERENCES user(`user_id`),
  CONSTRAINT fk_rating_recipe FOREIGN KEY (`recipe_id`) REFERENCES recipe(`recipe_id`),
  CHECK (`stars` BETWEEN 0 AND 5)
);

-- update token timestamp when token changes
DROP TRIGGER IF EXISTS update_token_timestamp;
CREATE TRIGGER update_token_timestamp
BEFORE UPDATE ON user
FOR EACH ROW
BEGIN
    IF NEW.token <> OLD.token THEN
    SET NEW.token_created_at = CURRENT_TIMESTAMP;
    END IF;
END;