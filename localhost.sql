-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Apr 01, 2026 at 08:55 AM
-- Server version: 8.0.45
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `radiant_health_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `ambulances`
--

CREATE TABLE `ambulances` (
  `id` int NOT NULL,
  `vehicle_type` enum('bus','ambulance') NOT NULL DEFAULT 'ambulance',
  `reg_no` varchar(255) NOT NULL,
  `fuel_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `operation_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `target` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ambulances`
--

INSERT INTO `ambulances` (`id`, `vehicle_type`, `reg_no`, `fuel_cost`, `operation_cost`, `target`, `status`, `created_at`, `updated_at`) VALUES
(1, 'ambulance', 'KCD 123A', 5000.00, 2000.00, 15000.00, 'active', '2024-05-12 19:07:34', '2024-05-12 19:07:34'),
(2, 'ambulance', 'KDE 456B', 5500.00, 2200.00, 18000.00, 'active', '2024-05-12 19:07:34', '2024-05-12 19:07:34'),
(3, 'ambulance', 'KCF 789C', 4800.00, 1900.00, 14000.00, 'inactive', '2024-05-12 19:07:34', '2024-05-12 19:07:34');

-- --------------------------------------------------------

--
-- Table structure for table `assistants`
--

CREATE TABLE `assistants` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatarUrl` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assistants`
--

INSERT INTO `assistants` (`id`, `name`, `avatarUrl`, `created_at`, `updated_at`) VALUES
(1, 'Susan Smith', NULL, '2024-05-12 19:07:34', '2024-05-12 19:07:34'),
(2, 'David Williams', NULL, '2024-05-12 19:07:34', '2024-05-12 19:07:34'),
(3, 'Emily Brown', NULL, '2024-05-12 19:07:34', '2024-05-12 19:07:34'),
(4, 'Michael Miller', NULL, '2024-05-12 19:07:34', '2024-05-12 19:07:34');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatarUrl` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`id`, `name`, `avatarUrl`, `created_at`, `updated_at`) VALUES
(1, 'John Doe', NULL, '2024-05-12 19:07:34', '2024-05-12 19:07:34'),
(2, 'Peter Jones', NULL, '2024-05-12 19:07:34', '2024-05-12 19:07:34'),
(3, 'Mary Jane', NULL, '2024-05-12 19:07:34', '2024-05-12 19:07:34'),
(4, 'Alex Ray', NULL, '2024-05-12 19:07:34', '2024-05-12 19:07:34');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int NOT NULL,
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
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `date`, `ambulance_id`, `driver_id`, `total_till`, `target`, `fuel`, `operation`, `cash_deposited_by_staff`, `amount_paid_to_the_till`, `offload`, `salary`, `operations_cost`, `net_banked`, `deficit`, `performance`, `fuel_revenue_ratio`, `created_at`, `updated_at`) VALUES
(1, '2024-05-10', 1, 1, 25000.00, 15000.00, 5000.00, 2000.00, 10000.00, 15000.00, 18000.00, 3000.00, 5000.00, 15000.00, 0.00, 1.0000, 0.2000, '2024-05-12 19:07:34', '2024-05-12 19:07:34'),
(2, '2024-05-10', 2, 2, 20000.00, 18000.00, 5500.00, 2200.00, 5000.00, 15000.00, 12300.00, 0.00, 2200.00, 12300.00, 5700.00, 0.6833, 0.2750, '2024-05-12 19:07:34', '2024-05-12 19:07:34'),
(3, '2024-05-11', 1, 3, 22000.00, 15000.00, 5200.00, 2100.00, 8000.00, 14000.00, 14700.00, 0.00, 2100.00, 14700.00, 300.00, 0.9800, 0.2364, '2024-05-12 19:07:34', '2024-05-12 19:07:34'),
(4, '2026-04-01', 1, 1, 70000.00, 15000.00, 5000.00, 2000.00, 6000.00, 64000.00, 63000.00, 48000.00, 50000.00, 15000.00, 0.00, 1.0000, 0.0714, '2026-04-01 07:52:35', '2026-04-01 07:52:35'),
(5, '2026-04-01', 3, 3, 6000.00, 14000.00, 480.00, 190.00, 6700.00, -700.00, 5330.00, 0.00, 190.00, 5330.00, 8670.00, 0.3807, 0.0800, '2026-04-01 07:57:24', '2026-04-01 07:57:24'),
(6, '2026-04-02', 1, 1, 3400.00, 15000.00, 5000.00, 2000.00, 1200.00, 2200.00, -3600.00, 0.00, 2000.00, -3600.00, 18600.00, -0.2400, 1.4706, '2026-04-01 08:22:05', '2026-04-01 08:22:05');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_assistants`
--

CREATE TABLE `transaction_assistants` (
  `transaction_id` int NOT NULL,
  `assistant_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaction_assistants`
--

INSERT INTO `transaction_assistants` (`transaction_id`, `assistant_id`) VALUES
(1, 1),
(3, 1),
(5, 1),
(1, 2),
(6, 2),
(2, 3),
(4, 3),
(5, 3),
(6, 3),
(3, 4),
(4, 4),
(5, 4);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') NOT NULL DEFAULT 'staff',
  `avatarUrl` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatarUrl`, `created_at`, `updated_at`) VALUES
(1, 'Hydrangea Admin', 'admin@hydrangea.com', '$2y$10$tjmaIhezbEdhXXjoXdJLpuj5gAPwk2ozcYk6jKwBTetRtnqREmeIa', 'admin', NULL, '2024-05-12 19:07:34', '2026-04-01 07:13:34'),
(2, 'Hydrangea Staff', 'staff@hydrangea.com', '$2a$10$f.4.B5/1F2b.b5f5E5g5Cu0y5G5E5g5Cu0y5G5E5g5Cu0y5G5E5g', 'staff', NULL, '2024-05-12 19:07:34', '2024-05-12 19:07:34');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ambulances`
--
ALTER TABLE `ambulances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reg_no` (`reg_no`);

--
-- Indexes for table `assistants`
--
ALTER TABLE `assistants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ambulance_id` (`ambulance_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `transaction_assistants`
--
ALTER TABLE `transaction_assistants`
  ADD PRIMARY KEY (`transaction_id`,`assistant_id`),
  ADD KEY `assistant_id` (`assistant_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ambulances`
--
ALTER TABLE `ambulances`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `assistants`
--
ALTER TABLE `assistants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`ambulance_id`) REFERENCES `ambulances` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `transaction_assistants`
--
ALTER TABLE `transaction_assistants`
  ADD CONSTRAINT `transaction_assistants_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_assistants_ibfk_2` FOREIGN KEY (`assistant_id`) REFERENCES `assistants` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;