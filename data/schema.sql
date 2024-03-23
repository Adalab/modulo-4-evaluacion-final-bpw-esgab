CREATE TABLE `recetas_db`.`recetas` (
`id` INT NOT NULL AUTO_INCREMENT,
`nombre` VARCHAR(45) NOT NULL,
`ingredientes` VARCHAR(2500) NOT NULL,
`instrucciones` LONGTEXT NOT NULL,
PRIMARY KEY (`id`));


CREATE TABLE `usuarios_db`.`usuarios` (
`id` INT NOT NULL AUTO_INCREMENT,
`email` VARCHAR(45) NOT NULL,
`nombre` VARCHAR(45) NOT NULL,
`password` VARCHAR(45) NOT NULL,
PRIMARY KEY (`id`),
UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE);

ALTER TABLE `usuarios_db`.`usuarios` 
CHANGE COLUMN `password` `password` VARCHAR(500) NOT NULL ;