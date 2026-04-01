-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS `transaction_assistants`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `assistants`;
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
-- Table structure for table `assistants`
--
CREATE TABLE `assistants` (
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
-- Table structure for table `transaction_assistants`
--
CREATE TABLE `transaction_assistants` (
  `transaction_id` int NOT NULL,
  `assistant_id` int NOT NULL,
  PRIMARY KEY (`transaction_id`,`assistant_id`),
  KEY `assistant_id` (`assistant_id`),
  CONSTRAINT `transaction_assistants_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transaction_assistants_ibfk_2` FOREIGN KEY (`assistant_id`) REFERENCES `assistants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `users`
--
LOCK TABLES `users` WRITE;
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatarUrl`, `created_at`, `updated_at`) VALUES
  (1, 'Hydrangea Admin', 'admin@hydrangea.com', '$2a$10$e6pJNyHiv.gcauyriJhKiulfHWapUy8bYzef5jlXDvlXqsMgyrqi6', 'admin', NULL, '2026-04-01 08:00:00', '2026-04-01 08:00:00'),
  (2, 'Fleet Officer', 'staff@hydrangea.com', '$2a$10$e6pJNyHiv.gcauyriJhKiulfHWapUy8bYzef5jlXDvlXqsMgyrqi6', 'staff', NULL, '2026-04-01 08:05:00', '2026-04-01 08:05:00');
UNLOCK TABLES;

--
-- Dumping data for table `drivers`
--
LOCK TABLES `drivers` WRITE;
INSERT INTO `drivers` (`id`, `name`, `avatarUrl`, `created_at`, `updated_at`) VALUES
  (1, 'John Mwangi', NULL, '2026-04-01 08:10:00', '2026-04-01 08:10:00'),
  (2, 'Peter Kamau', NULL, '2026-04-01 08:11:00', '2026-04-01 08:11:00'),
  (3, 'Mary Achieng', NULL, '2026-04-01 08:12:00', '2026-04-01 08:12:00'),
  (4, 'Alex Otieno', NULL, '2026-04-01 08:13:00', '2026-04-01 08:13:00');
UNLOCK TABLES;

--
-- Dumping data for table `assistants`
--
LOCK TABLES `assistants` WRITE;
INSERT INTO `assistants` (`id`, `name`, `avatarUrl`, `created_at`, `updated_at`) VALUES
  (1, 'Susan Njeri', NULL, '2026-04-01 08:20:00', '2026-04-01 08:20:00'),
  (2, 'David Kiptoo', NULL, '2026-04-01 08:21:00', '2026-04-01 08:21:00'),
  (3, 'Emily Wanjiku', NULL, '2026-04-01 08:22:00', '2026-04-01 08:22:00'),
  (4, 'Michael Barasa', NULL, '2026-04-01 08:23:00', '2026-04-01 08:23:00');
UNLOCK TABLES;

--
-- Dumping data for table `ambulances`
--
LOCK TABLES `ambulances` WRITE;
INSERT INTO `ambulances` (`id`, `vehicle_type`, `reg_no`, `fuel_cost`, `operation_cost`, `target`, `status`, `created_at`, `updated_at`) VALUES
  (1, 'ambulance', 'KCD 123A', 5000.00, 2000.00, 15000.00, 'active', '2026-04-01 08:30:00', '2026-04-01 08:30:00'),
  (2, 'bus', 'KDE 456B', 5500.00, 2200.00, 18000.00, 'active', '2026-04-01 08:31:00', '2026-04-01 08:31:00'),
  (3, 'ambulance', 'KCF 789C', 4800.00, 1900.00, 14000.00, 'inactive', '2026-04-01 08:32:00', '2026-04-01 08:32:00'),
  (4, 'bus', 'KDG 321D', 6200.00, 2500.00, 22000.00, 'active', '2026-04-01 08:33:00', '2026-04-01 08:33:00');
UNLOCK TABLES;

--
-- Dumping data for table `transactions`
--
LOCK TABLES `transactions` WRITE;
INSERT INTO `transactions` (
  `id`,
  `date`,
  `ambulance_id`,
  `driver_id`,
  `total_till`,
  `target`,
  `fuel`,
  `operation`,
  `cash_deposited_by_staff`,
  `amount_paid_to_the_till`,
  `offload`,
  `salary`,
  `operations_cost`,
  `net_banked`,
  `deficit`,
  `performance`,
  `fuel_revenue_ratio`,
  `created_at`,
  `updated_at`
) VALUES
  (1, '2026-04-01', 1, 1, 25000.00, 15000.00, 5000.00, 2000.00, 10000.00, 15000.00, 18000.00, 3000.00, 5000.00, 15000.00, 0.00, 1.0000, 0.2000, '2026-04-01 09:00:00', '2026-04-01 09:00:00'),
  (2, '2026-04-01', 2, 2, 20000.00, 18000.00, 5500.00, 2200.00, 5000.00, 15000.00, 12300.00, 0.00, 2200.00, 12300.00, 5700.00, 0.6833, 0.2750, '2026-04-01 09:10:00', '2026-04-01 09:10:00'),
  (3, '2026-04-01', 4, 4, 28000.00, 22000.00, 6200.00, 2500.00, 9000.00, 19000.00, 19300.00, 0.00, 2500.00, 19300.00, 2700.00, 0.8773, 0.2214, '2026-04-01 09:20:00', '2026-04-01 09:20:00'),
  (4, '2026-03-31', 3, 3, 16000.00, 14000.00, 4800.00, 1900.00, 6000.00, 10000.00, 9300.00, 0.00, 1900.00, 9300.00, 4700.00, 0.6643, 0.3000, '2026-03-31 17:15:00', '2026-03-31 17:15:00');
UNLOCK TABLES;

--
-- Dumping data for table `transaction_assistants`
--
LOCK TABLES `transaction_assistants` WRITE;
INSERT INTO `transaction_assistants` (`transaction_id`, `assistant_id`) VALUES
  (1, 1),
  (1, 2),
  (2, 3),
  (3, 1),
  (3, 4),
  (4, 2);
UNLOCK TABLES;
