-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS `transaction_technicians`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `emergency_technicians`;
DROP TABLE IF EXISTS `drivers`;
DROP TABLE IF EXISTS `ambulances`;
DROP TABLE IF EXISTS `users`;


--
-- Table structure for table `users`
--
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') NOT NULL DEFAULT 'staff',
  `avatarUrl` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `ambulances`
--
CREATE TABLE `ambulances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_type` enum('bus','ambulance') NOT NULL DEFAULT 'ambulance',
  `reg_no` varchar(255) NOT NULL,
  `fuel_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `operation_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `target` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reg_no` (`reg_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `drivers`
--
CREATE TABLE `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `avatarUrl` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `emergency_technicians`
--
CREATE TABLE `emergency_technicians` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `avatarUrl` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `transactions`
--
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `ambulance_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `total_till` decimal(10,2) NOT NULL,
  `target` decimal(10,2) NOT NULL,
  `fuel` decimal(10,2) NOT NULL,
  `operation` decimal(10,2) NOT NULL,
  `cash_deposited_by_staff` decimal(10,2) NOT NULL,
  `amount_paid_to_the_till` decimal(10,2) NOT NULL,
  `offload` decimal(10,2) NOT NULL,
  `salary` decimal(10,2) NOT NULL,
  `operations_cost` decimal(10,2) NOT NULL,
  `net_banked` decimal(10,2) NOT NULL,
  `deficit` decimal(10,2) NOT NULL,
  `performance` decimal(5,4) NOT NULL,
  `fuel_revenue_ratio` decimal(5,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ambulance_id` (`ambulance_id`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`ambulance_id`) REFERENCES `ambulances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `transaction_technicians`
--
CREATE TABLE `transaction_technicians` (
  `transaction_id` int NOT NULL,
  `technician_id` int NOT NULL,
  PRIMARY KEY (`transaction_id`,`technician_id`),
  KEY `technician_id` (`technician_id`),
  CONSTRAINT `transaction_technicians_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transaction_technicians_ibfk_2` FOREIGN KEY (`technician_id`) REFERENCES `emergency_technicians` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `users`
--
LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1,'Admin User','admin@superadmin.com','$2a$10$f.4.B5/1F2b.b5f5E5g5Cu0y5G5E5g5Cu0y5G5E5g5Cu0y5G5E5g','admin',NULL,'2024-05-12 19:07:34','2024-05-12 19:07:34'),(2,'Staff User','staff@radiant.com','$2a$10$f.4.B5/1F2b.b5f5E5g5Cu0y5G5E5g5Cu0y5G5E5g5Cu0y5G5E5g','staff',NULL,'2024-05-12 19:07:34','2024-05-12 19:07:34');
UNLOCK TABLES;

--
-- Dumping data for table `drivers`
--
LOCK TABLES `drivers` WRITE;
INSERT INTO `drivers` VALUES (1,'John Doe',NULL,'2024-05-12 19:07:34','2024-05-12 19:07:34'),(2,'Peter Jones',NULL,'2024-05-12 19:07:34','2024-05-12 19:07:34'),(3,'Mary Jane',NULL,'2024-05-12 19:07:34','2024-05-12 19:07:34'),(4,'Alex Ray',NULL,'2024-05-12 19:07:34','2024-05-12 19:07:34');
UNLOCK TABLES;

--
-- Dumping data for table `emergency_technicians`
--
LOCK TABLES `emergency_technicians` WRITE;
INSERT INTO `emergency_technicians` VALUES (1,'Susan Smith',NULL,'2024-05-12 19:07:34','2024-05-12 19:07:34'),(2,'David Williams',NULL,'2024-05-12 19:07:34','2024-05-12 19:07:34'),(3,'Emily Brown',NULL,'2024-05-12 19:07:34','2024-05-12 19:07:34'),(4,'Michael Miller',NULL,'2024-05-12 19:07:34','2024-05-12 19:07:34');
UNLOCK TABLES;

--
-- Dumping data for table `ambulances`
--
LOCK TABLES `ambulances` WRITE;
INSERT INTO `ambulances` VALUES (1,'ambulance','KCD 123A',5000.00,2000.00,15000.00,'active','2024-05-12 19:07:34','2024-05-12 19:07:34'),(2,'bus','KDE 456B',5500.00,2200.00,18000.00,'active','2024-05-12 19:07:34','2024-05-12 19:07:34'),(3,'ambulance','KCF 789C',4800.00,1900.00,14000.00,'inactive','2024-05-12 19:07:34','2024-05-12 19:07:34');
UNLOCK TABLES;

--
-- Dumping data for table `transactions`
--
LOCK TABLES `transactions` WRITE;
INSERT INTO `transactions` VALUES (1,'2024-05-10',1,1,25000.00,15000.00,5000.00,2000.00,10000.00,15000.00,18000.00,3000.00,5000.00,15000.00,0.00,1.0000,0.2000,'2024-05-12 19:07:34','2024-05-12 19:07:34'),(2,'2024-05-10',2,2,20000.00,18000.00,5500.00,2200.00,5000.00,15000.00,12300.00,0.00,2200.00,12300.00,5700.00,0.6833,0.2750,'2024-05-12 19:07:34','2024-05-12 19:07:34'),(3,'2024-05-11',1,3,22000.00,15000.00,5200.00,2100.00,8000.00,14000.00,14700.00,0.00,2100.00,14700.00,300.00,0.9800,0.2364,'2024-05-12 19:07:34','2024-05-12 19:07:34');
UNLOCK TABLES;

--
-- Dumping data for table `transaction_technicians`
--
LOCK TABLES `transaction_technicians` WRITE;
INSERT INTO `transaction_technicians` VALUES (1,1),(3,1),(1,2),(2,3),(3,4);
UNLOCK TABLES;
