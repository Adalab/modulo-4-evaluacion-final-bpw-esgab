CREATE TABLE `recetas_db`.`recetas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `ingredientes` VARCHAR(2500) NOT NULL,
  `instrucciones` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`));