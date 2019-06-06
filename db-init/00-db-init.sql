-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: localhost    Database: businesses
-- ------------------------------------------------------
-- Server version	5.7.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT 'student',
  PRIMARY KEY (`id`),
  UNIQUE KEY (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
  (0,'Danh Nguyen','greatness@gmail.com','$2y$08$p8Fyw0NRXqZtGqLi1zDsyuXqkU4tnbE/E4tp9ooCHjKCaQbMnWlKe','admin'),
  (1,'Rob Hess','professor@gmail.com','$2y$08$p0qrYN5fbBiGZq0nVwPBoO/AQvl2PKTiN7f8f/y3gyAp.iKL2nRdW','instructor'),
  (2,'Joshual Bell','modernnerd@gmail.com','$2y$08$YsvHwuhyDgh31Tn1PFkUmuA7Npkrktn10rKJDthkmWCH6VKER1C0q','student'),
  (3,'Arlen Moore','sendit@gmail.com','$2y$08$zlwX/xRvUkhfpUNQUusBl.wNgKjiyfZWkhc3YAGoaJ5ZfxW9BKdpO','student'),
  (4,'Marshellus Kelly','ronaldosenior@gmail.com','$2y$08$mj1OGTOLdLInYM4wwW6VHO7rgNod3tG.uk50LghN2VNQb3R78yY82','student'),
  (5,'Arash Temehchy','termehca@eecs.oregonstate.edu','$2y$08$/p0TAjtQCpx/1t7spxdbr.CmCqoJsYbR2eda1.381n4lTNB2DB3dG','instructor');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `number` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `term` char(10) NOT NULL,
  `instructorId` mediumint(9) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`subject`,`number`,`term`),
  KEY `idx_instructorId` (`instructorId`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructorId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES
  (0,'CS','493','Cloud Application Development','sp19',1),
  (1,'CS','480','Translators','sp19',1),
  (2,'CS','492','Mobile Software Development','w19',1),
  (3,'CS','440','Database Management Systems','w19',5);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table 'enrollments'
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enrollments` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `studentId` mediumint(9) NOT NULL,
  `courseId` mediumint(9) NOT NULL,
  `grades` char(4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`studentId`,`courseId`),
  KEY `idx_studentId` (`studentId`),
  KEY `idx_courseId` (`courseId`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES
  (0,2,0,'A-'),
  (1,2,2,'A'),
  (2,3,0,'A'),
  (3,3,2,'F'),
  (4,4,0,'A'),
  (5,4,2,'D-'),
  (6,2,3,'C-');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignments` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `courseId` mediumint(9) NOT NULL,
  `title` varchar(255) NOT NULL,
  `points` mediumint(9) NOT NULL,
  `due` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_courseId` (`courseId`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
INSERT INTO `assignments` VALUES
  (0,0,'assignment1',100,'2019-04-23T23:59:00.000Z'),
  (1,0,'assignment2',100,'2019-05-06T23:59:00.000Z'),
  (2,0,'assignment3',100,'2019-05-20T23:59:00.000Z'),
  (3,1,'assignment1',100,'2019-04-22T23:59:00.000Z'),
  (4,1,'assignment2',100,'2019-05-13T23:59:00.000Z'),
  (5,1,'assignment3',100,'2019-05-27T23:59:00.000Z');
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `submissions` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `assignmentId` mediumint(9) NOT NULL,
  `studentId` mediumint(9) NOT NULL,
  `timestamp` varchar(255) NOT NULL,
  `file` longblob NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_assignmentId` (`assignmentId`),
  KEY `idx_studentId` (`studentId`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignmentId`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-05-16  6:47:05
