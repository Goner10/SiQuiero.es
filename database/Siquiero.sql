-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: mydb
-- ------------------------------------------------------
-- Server version	8.0.39

CREATE DATABASE IF NOT EXISTS siquiero;
USE siquiero;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `boda`
--

DROP TABLE IF EXISTS `boda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boda` (
  `id_boda` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `fecha_evento` date NOT NULL,
  `ubicacion` varchar(245) DEFAULT NULL,
  `num_invitados` int DEFAULT NULL,
  `nombre_evento` varchar(145) NOT NULL,
  `presupuesto_total` decimal(10,2) DEFAULT NULL,
  `estado` enum('Planificacion','Confirmada','Celebrada','Cancelada') DEFAULT 'Planificacion',
  PRIMARY KEY (`id_boda`),
  KEY `id_usuario_idx` (`id_usuario`),
  CONSTRAINT `fk_Boda_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(45) NOT NULL,
  `descripcion` varchar(245) NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invitado`
--

DROP TABLE IF EXISTS `invitado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitado` (
  `id_invitado` int NOT NULL AUTO_INCREMENT,
  `id_boda` int NOT NULL,
  `nombre` varchar(105) NOT NULL,
  `email` varchar(105) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `confirmacion_asistencia` tinyint DEFAULT '0',
  PRIMARY KEY (`id_invitado`),
  KEY `fk_invitado_boda_idx` (`id_boda`),
  CONSTRAINT `fk_invitado_boda` FOREIGN KEY (`id_boda`) REFERENCES `boda` (`id_boda`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `presupuesto`
--

DROP TABLE IF EXISTS `presupuesto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `presupuesto` (
  `id_presupuesto` int NOT NULL AUTO_INCREMENT,
  `id_boda` int NOT NULL,
  `concepto` varchar(105) NOT NULL,
  `cantidad_estimada` decimal(10,2) DEFAULT NULL,
  `cantidad_real` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_presupuesto`),
  KEY `fk_presupuesto_boda_idx` (`id_boda`),
  CONSTRAINT `fk_presupuesto_boda` FOREIGN KEY (`id_boda`) REFERENCES `boda` (`id_boda`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `id_categoria` int NOT NULL,
  `nombre_comercial` varchar(105) NOT NULL,
  `descripcion` longtext,
  `telefono` varchar(15) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `tarifa_minima` decimal(10,2) DEFAULT NULL,
  `tarifa_maxima` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`),
  KEY `fk_proveedor_categoria_idx` (`id_categoria`),
  CONSTRAINT `fk_proveedor_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reserva`
--

DROP TABLE IF EXISTS `reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `id_boda` int NOT NULL,
  `id_servicio` int NOT NULL,
  `fecha_reserva` date NOT NULL,
  `estado` enum('Pendiente','Confirmada','Cancelada') DEFAULT 'Pendiente',
  PRIMARY KEY (`id_reserva`),
  KEY `fk_reserva_boda_idx` (`id_boda`),
  KEY `fk_servicio_boda_idx` (`id_servicio`),
  CONSTRAINT `fk_reserva_boda` FOREIGN KEY (`id_boda`) REFERENCES `boda` (`id_boda`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_servicio_boda` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id_servicio`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `servicio`
--

DROP TABLE IF EXISTS `servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicio` (
  `id_servicio` int NOT NULL AUTO_INCREMENT,
  `id_proveedor` int NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `descripcion` varchar(105) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_servicio`),
  KEY `fk_servicio_proveedor_idx` (`id_proveedor`),
  CONSTRAINT `fk_servicio_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `apellidos` varchar(45) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contraseña` varchar(250) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-18  0:14:24
