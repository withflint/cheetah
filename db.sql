CREATE DATABASE IF NOT EXISTS `cheetah` CHARACTER SET utf8mb4 collate utf8mb4_general_ci
/*!40100 DEFAULT CHARACTER SET utf8mb4 */
;
use cheetah;
/****/
CREATE TABLE IF NOT EXISTS `aim` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `experiment` char(100) NOT NULL,
  `allocation` tinyint NOT NULL,
  `variants` char(200) NOT NULL,
  `anonymous_id` char(100) NOT NULL,
  `headers` varchar(2000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
/****/
CREATE TABLE IF NOT EXISTS `launch` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `experiment` char(100) NOT NULL,
  `variant` char(10) NOT NULL,
  `anonymous_id` char(100) NOT NULL,
  `headers` varchar(2000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
/****/
CREATE TABLE IF NOT EXISTS `hit` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `experiment` char(100) NOT NULL,
  `variant` char(10) NOT NULL,
  `anonymous_id` char(100) NOT NULL,
  `headers` varchar(2000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;


use cheetah;
alter table `aim` add column `headersj` json default null;
alter table `aim` add column `traits` json default null;
alter table `launch` add column `headersj` json default null;
alter table `launch` add column `traits` json default null;
alter table `hit` add column `headersj` json default null;
alter table `hit` add column `traits` json default null;
