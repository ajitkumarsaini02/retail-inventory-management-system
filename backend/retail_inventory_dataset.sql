-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: retail_inventory
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `retail_inventory`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `retail_inventory` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `retail_inventory`;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `country` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `pincode` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKdwk6cx0afu8bs9o4t536v1j5v` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Flat 402, Sunshine Heights','Noida','India','2026-09-29 15:06:59.862963','rahul.sharma@example.com','Rahul Sharma','+91-9876543210','201301','Uttar Pradesh','2026-09-29 15:06:59.862963'),(3,'Flat 402, Green Valley Apts, Sector 45','Noida','India','2026-09-29 16:10:59.095744','rahul@gmail.com','Rahul Sharma','+91-9876543210','201301','Uttar Pradesh','2026-09-29 16:10:59.095744'),(4,'15B Southern Avenue, Lake Road','Kolkata','India','2026-09-29 16:10:59.106928','ananya.sen@gmail.com','Ananya Sen','+91-9830112244','700029','West Bengal','2026-09-29 16:10:59.106928'),(5,'B-304, Palm Beach Heights, Vashi','Navi Mumbai','India','2026-09-29 16:10:59.117546','rajesh.patel@gmail.com','Rajesh Patel','+91-9820556677','400703','Maharashtra','2026-09-29 16:10:59.117546'),(6,'Plot 88, Jubilee Hills Road 36','Hyderabad','India','2026-09-29 16:10:59.127509','sneha.reddy@gmail.com','Sneha Reddy','+91-9849001122','500033','Telangana','2026-09-29 16:10:59.127509'),(7,'12, Golf Links Road','New Delhi','India','2026-09-29 16:10:59.136854','arjun.kapoor@gmail.com','Arjun Kapoor','+91-9811443322','110003','Delhi','2026-09-29 16:10:59.136854');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `quantity` int NOT NULL,
  `reorder_level` int NOT NULL,
  `reserved_quantity` int NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `warehouse_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKp7gj4l80fx8v0uap3b2crjwp5` (`product_id`),
  KEY `FKix9yxgetau1y25hhnv42gsiok` (`warehouse_id`),
  CONSTRAINT `FKix9yxgetau1y25hhnv42gsiok` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`id`),
  CONSTRAINT `FKp7gj4l80fx8v0uap3b2crjwp5` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `inventory_chk_1` CHECK ((`quantity` >= 0)),
  CONSTRAINT `inventory_chk_2` CHECK ((`reorder_level` >= 0)),
  CONSTRAINT `inventory_chk_3` CHECK ((`reserved_quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (2,'2026-09-29 16:10:59.160101',45,10,5,'2026-09-29 16:10:59.160101',5,2),(3,'2026-09-29 16:10:59.174519',120,20,10,'2026-09-29 16:10:59.174519',6,2),(4,'2026-09-29 16:10:59.184600',8,10,2,'2026-09-29 16:10:59.184600',7,2),(5,'2026-09-29 16:10:59.193970',3,5,3,'2026-09-29 16:10:59.193970',10,2),(6,'2026-09-29 16:10:59.203416',30,10,2,'2026-09-29 16:10:59.203416',5,3),(7,'2026-09-29 16:10:59.213897',25,8,5,'2026-09-29 16:10:59.213897',8,3),(8,'2026-09-29 16:10:59.223870',6,10,1,'2026-09-29 16:10:59.223870',12,3),(9,'2026-09-29 16:10:59.235425',85,15,5,'2026-09-29 16:10:59.235425',13,3),(10,'2026-09-29 16:10:59.246919',40,10,4,'2026-09-29 16:10:59.246919',9,4),(11,'2026-09-29 16:10:59.258188',50,12,5,'2026-09-29 16:10:59.258188',11,4),(12,'2026-09-29 16:10:59.271155',7,10,2,'2026-09-29 16:10:59.271155',14,4);
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `subtotal` double NOT NULL,
  `unit_price` double NOT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKt4dc2r9nbvbujrljv3e23iibt` (`order_id`),
  KEY `FK551losx9j75ss5d6bfsqvijna` (`product_id`),
  CONSTRAINT `FK551losx9j75ss5d6bfsqvijna` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `FKt4dc2r9nbvbujrljv3e23iibt` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_item_chk_1` CHECK ((`quantity` >= 1)),
  CONSTRAINT `order_item_chk_2` CHECK ((`subtotal` >= 0)),
  CONSTRAINT `order_item_chk_3` CHECK ((`unit_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
INSERT INTO `order_item` VALUES (2,1,749.99,749.99,2,5),(3,1,99.99,99.99,2,6),(4,1,399.99,399.99,3,7),(5,2,599.98,299.99,4,8),(6,1,189.5,189.5,4,9),(7,1,79.99,79.99,5,11),(8,1,119.99,119.99,5,12),(9,1,449,449,6,10);
/*!40000 ALTER TABLE `order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `order_date` datetime(6) DEFAULT NULL,
  `order_number` varchar(255) NOT NULL,
  `shipping_address` varchar(255) DEFAULT NULL,
  `shipping_city` varchar(255) DEFAULT NULL,
  `shipping_pincode` varchar(255) DEFAULT NULL,
  `shipping_state` varchar(255) DEFAULT NULL,
  `status` enum('CANCELLED','CONFIRMED','DELIVERED','PENDING','PROCESSING','SHIPPED') NOT NULL,
  `total_amount` double NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `customer_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKnthkiu7pgmnqnu86i2jyoe2v7` (`order_number`),
  KEY `FK624gtjin3po807j3vix093tlf` (`customer_id`),
  CONSTRAINT `FK624gtjin3po807j3vix093tlf` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (2,'2026-09-29 16:10:59.412718','2026-09-29 16:10:59.412718','ORD-2026-101','Flat 402, Green Valley Apts, Sector 45','Noida','201301','Uttar Pradesh','DELIVERED',849.98,'2026-09-29 16:10:59.412718',3),(3,'2026-09-29 16:10:59.434745','2026-09-29 16:10:59.434745','ORD-2026-102','15B Southern Avenue, Lake Road','Kolkata','700029','West Bengal','SHIPPED',399.99,'2026-09-29 16:10:59.434745',4),(4,'2026-09-29 16:10:59.450350','2026-09-29 16:10:59.450350','ORD-2026-103','B-304, Palm Beach Heights, Vashi','Navi Mumbai','400703','Maharashtra','PROCESSING',789.48,'2026-09-29 16:10:59.450350',5),(5,'2026-09-29 16:10:59.465613','2026-09-29 16:10:59.465613','ORD-2026-104','Plot 88, Jubilee Hills Road 36','Hyderabad','500033','Telangana','CONFIRMED',199.98,'2026-09-29 16:10:59.465613',6),(6,'2026-09-29 16:10:59.480099','2026-09-29 16:10:59.480099','ORD-2026-105','12, Golf Links Road','New Delhi','110003','Delhi','PENDING',449,'2026-09-29 16:10:59.480099',7);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `brand` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `cost_price` double NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `price` double NOT NULL,
  `sku` varchar(255) NOT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKq1mafxn973ldq80m1irp3mpvq` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'Sony','Electronics',60,'2026-09-29 11:32:58.604591','Updated Description','Updated Product Name',99.99,'PROD-001','ACTIVE','piece','2026-09-29 14:55:35.088987'),(3,'Samsung','Mobile',70000,'2026-09-29 11:33:41.799608','256GB smartphone','Samsung Galaxy S24',79999,'SAM-S25-255','ACTIVE','piece','2026-09-29 11:33:41.799608'),(5,'Dell','Electronics',620,'2026-09-29 16:10:58.983251','Core i5 12th Gen, 16GB RAM, 512GB NVMe SSD, 15.6 FHD Anti-Glare','Dell Inspiron 15 Laptop',749.99,'PROD-ELEC-001','ACTIVE','Piece','2026-09-29 16:10:58.983251'),(6,'Logitech','Accessories',72,'2026-09-29 16:10:58.996241','Ergonomic wireless performance mouse with quiet clicks & 8K DPI track','Logitech MX Master 3S Mouse',99.99,'PROD-ELEC-002','ACTIVE','Piece','2026-09-29 16:10:58.996241'),(7,'Sony','Audio',310,'2026-09-29 16:10:59.005303','Industry leading wireless noise cancelling headphones with 30hr battery','Sony WH-1000XM5 Headphones',399.99,'PROD-ELEC-003','ACTIVE','Piece','2026-09-29 16:10:59.005303'),(8,'Samsung','Displays',235,'2026-09-29 16:10:59.015739','Ultra HD IPS Display with HDR10, USB-C connectivity and tilt stand','Samsung 27-inch 4K Monitor',299.99,'PROD-ELEC-004','ACTIVE','Piece','2026-09-29 16:10:59.015739'),(9,'Featherlite','Furniture',130,'2026-09-29 16:10:59.025246','Adjustable lumbar support with breathable mesh backrest and 3D armrests','Ergonomic Mesh Office Chair',189.5,'PROD-OFF-005','ACTIVE','Piece','2026-09-29 16:10:59.025246'),(10,'ErgoPro','Furniture',340,'2026-09-29 16:10:59.035923','Electric height adjustable dual motor workstation 140x70cm table','Motorized Standing Desk',449,'PROD-OFF-006','ACTIVE','Piece','2026-09-29 16:10:59.035923'),(11,'TP-Link','Networking',55,'2026-09-29 16:10:59.046213','AX3000 Dual Band Gigabit wireless gaming router with OFDMA & Beamforming','TP-Link WiFi 6 Gigabit Router',79.99,'PROD-NET-007','ACTIVE','Piece','2026-09-29 16:10:59.046213'),(12,'SanDisk','Storage',85,'2026-09-29 16:10:59.056067','Fast NVMe solid state performance with USB 3.2 Gen 2, drop resistant','SanDisk 1TB Portable SSD',119.99,'PROD-STO-008','ACTIVE','Piece','2026-09-29 16:10:59.056067'),(13,'Anker','Accessories',32,'2026-09-29 16:10:59.065516','3-Port compact high speed wall charger for laptops, tablets, and phones','Anker 65W GaN Fast Charger',49.99,'PROD-MOB-009','ACTIVE','Piece','2026-09-29 16:10:59.065516'),(14,'Eufy','Smart Home',95,'2026-09-29 16:10:59.074924','Weatherproof smart surveillance camera with 2K resolution & color night vision','Eufy 2K Wireless Security Cam',129.99,'PROD-SEC-010','ACTIVE','Piece','2026-09-29 16:10:59.074924');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order`
--

DROP TABLE IF EXISTS `purchase_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `expected_delivery_date` datetime(6) DEFAULT NULL,
  `order_date` datetime(6) DEFAULT NULL,
  `purchase_order_number` varchar(255) NOT NULL,
  `status` enum('APPROVED','CANCELLED','ORDERED','PENDING','RECEIVED') NOT NULL,
  `total_amount` double NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `supplier_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8lkida0gnaf9e9nleq7laeb6` (`purchase_order_number`),
  KEY `FK4traogu3jriq9u7e8rvm86k7i` (`supplier_id`),
  CONSTRAINT `FK4traogu3jriq9u7e8rvm86k7i` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order`
--

LOCK TABLES `purchase_order` WRITE;
/*!40000 ALTER TABLE `purchase_order` DISABLE KEYS */;
INSERT INTO `purchase_order` VALUES (2,'2026-09-29 16:10:59.301562','2026-10-15 18:00:00.000000','2026-09-29 16:10:59.301562','PO-2026-001','RECEIVED',8360,'2026-09-29 16:10:59.301562',2),(3,'2026-09-29 16:10:59.355672','2026-10-15 18:00:00.000000','2026-09-29 16:10:59.355140','PO-2026-002','ORDERED',4650,'2026-09-29 16:10:59.355672',3),(4,'2026-09-29 16:10:59.372590','2026-10-15 18:00:00.000000','2026-09-29 16:10:59.372590','PO-2026-003','APPROVED',2350,'2026-09-29 16:10:59.372590',4),(5,'2026-09-29 16:10:59.387218','2026-10-15 18:00:00.000000','2026-09-29 16:10:59.387218','PO-2026-004','PENDING',1560,'2026-09-29 16:10:59.387754',5);
/*!40000 ALTER TABLE `purchase_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_item`
--

DROP TABLE IF EXISTS `purchase_order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `subtotal` double NOT NULL,
  `unit_cost` double NOT NULL,
  `product_id` bigint NOT NULL,
  `purchase_order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK593lt017d995ds7nuqxgo3mmm` (`product_id`),
  KEY `FKmj122necubadvuquvjoq967y7` (`purchase_order_id`),
  CONSTRAINT `FK593lt017d995ds7nuqxgo3mmm` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `FKmj122necubadvuquvjoq967y7` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_order` (`id`),
  CONSTRAINT `purchase_order_item_chk_1` CHECK ((`quantity` >= 1)),
  CONSTRAINT `purchase_order_item_chk_2` CHECK ((`subtotal` >= 0)),
  CONSTRAINT `purchase_order_item_chk_3` CHECK ((`unit_cost` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_item`
--

LOCK TABLES `purchase_order_item` WRITE;
/*!40000 ALTER TABLE `purchase_order_item` DISABLE KEYS */;
INSERT INTO `purchase_order_item` VALUES (2,10,6200,620,5,2),(3,30,2160,72,6,2),(4,15,4650,310,7,3),(5,10,2350,235,8,4),(6,12,1560,130,9,5);
/*!40000 ALTER TABLE `purchase_order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `pincode` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKg7qiwwu4vpciysmeeyme9gg1d` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES (2,'Sector 62, Electronic City','Gurgaon','Amit Verma','India','2026-09-29 16:10:58.910560','sales@apextech.com','Apex Electronics Components Ltd','+91-9811223344','122001','Haryana','ACTIVE','2026-09-29 16:10:58.910560'),(3,'Andheri MIDC, Cross Road 5','Mumbai','Sunita Deshmukh','India','2026-09-29 16:10:58.923724','orders@nexusglobal.com','Nexus Global Hardware Supplies','+91-9820112233','400093','Maharashtra','ACTIVE','2026-09-29 16:10:58.923724'),(4,'Whitefield Main Road','Bengaluru','Karan Johar','India','2026-09-29 16:10:58.936762','contact@zenithgoods.in','Zenith Consumer Goods Corp','+91-9844001122','560066','Karnataka','ACTIVE','2026-09-29 16:10:58.936762'),(5,'Guindy Industrial Estate','Chennai','Suresh Iyer','India','2026-09-29 16:10:58.946712','b2b@titaniumpack.com','Titanium Logistics & Packaging','+91-9840055667','600032','Tamil Nadu','ACTIVE','2026-09-29 16:10:58.946712'),(6,'Okhla Industrial Area Phase 3','New Delhi','Deepak Choudhary','India','2026-09-29 16:10:58.956308','supply@bharatretail.com','Bharat Retail Distributors','+91-9810077889','110020','Delhi','ACTIVE','2026-09-29 16:10:58.956308');
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `enabled` bit(1) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','USER') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-09-29 15:25:10.471339','admin@retail.com',_binary '','System Administrator','$2a$10$wSxtfbE.KGggrsNVZp6XduN8nDKjzB4p9DvljY77ymLXKiy5vrPWG','ADMIN','2026-09-29 15:25:10.471339'),(2,'2026-09-29 15:25:36.247030','rahul@gmail.com',_binary '','Rahul Sharma','$2a$10$dpU451nLW24uqB3d6fjcce67eKrb7n/0s/Z9Avlh17jWI4KBoqMG.','USER','2026-09-29 15:25:36.247030');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse`
--

DROP TABLE IF EXISTS `warehouse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) NOT NULL,
  `capacity` int DEFAULT NULL,
  `city` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `country` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `pincode` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK9wk4ocyt0wv0hpffpr41aoweu` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse`
--

LOCK TABLES `warehouse` WRITE;
/*!40000 ALTER TABLE `warehouse` DISABLE KEYS */;
INSERT INTO `warehouse` VALUES (2,'Khasra 45, NH-8, Kapashera',50000,'New Delhi','WH-DEL-01','+91-9811001122','Vikram Malhotra','India','2026-09-29 16:10:58.848384','Primary regional sorting & fulfillment hub for North India','delhi.hub@retail.com','Delhi Northern Distribution Hub','110037','Delhi','ACTIVE','2026-09-29 16:10:58.848384'),(3,'Plot 12B, Electronic City Phase 1',75000,'Bengaluru','WH-BLR-02','+91-9845012345','Priya Nair','India','2026-09-29 16:10:58.866011','Automated warehouse & fulfillment depot for South India','bangalore.hub@retail.com','Bangalore Southern Tech Logistics','560100','Karnataka','ACTIVE','2026-09-29 16:10:58.866011'),(4,'Bhiwandi Logistics Park, Sector 4',60000,'Mumbai','WH-MUM-03','+91-9820055443','Rohan Patil','India','2026-09-29 16:10:58.877313','High-throughput logistics facility near Nhava Sheva port','mumbai.hub@retail.com','Mumbai Western Fulfillment Center','421302','Maharashtra','ACTIVE','2026-09-29 16:10:58.877313'),(5,'Dankuni Industrial Zone, NH-2',35000,'Kolkata','WH-KOL-04','+91-9830099887','Debashis Roy','India','2026-09-29 16:10:58.888278','Regional transit & cold-storage distribution center','kolkata.depot@retail.com','Kolkata Eastern Regional Depot','712311','West Bengal','ACTIVE','2026-09-29 16:10:58.888278');
/*!40000 ALTER TABLE `warehouse` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-29 16:14:24
