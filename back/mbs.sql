-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- ホスト: 127.0.0.1
-- 生成日時: 2025-07-01 19:59:14
-- サーバのバージョン： 10.4.32-MariaDB
-- PHP のバージョン: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- データベース: `mbs`
--

-- --------------------------------------------------------

--
-- テーブルの構造 `customers`
--
USE mbs;

CREATE TABLE `customers` (
  `customerId` int(5) NOT NULL,
  `shopName` varchar(100) NOT NULL,
  `customerName` varchar(100),
  `staffName` varchar(100),
  `address` varchar(255),
  `phone` varchar(20),
  `deliveryCondition` text,
  `note` text,
  `registeredAt` varchar(20),
  `isDeleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`customerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- テーブルの構造 `orders`
--

CREATE TABLE `orders` (
  `orderId` int(11) NOT NULL AUTO_INCREMENT,
  `customerId` int(5) NOT NULL,
  `orderDate` date DEFAULT NULL,
  `totalAmount` int(11) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  PRIMARY KEY (`orderId`),
  KEY `customerId` (`customerId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customers` (`customerId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- テーブルの構造 `order_details`
--

CREATE TABLE `order_details` (
  `orderDetailId` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) NOT NULL,
  `bookTitle` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unitPrice` int(11) DEFAULT NULL,
  `undeliveredQuantity` int(11) DEFAULT NULL,
  PRIMARY KEY (`orderDetailId`),
  KEY `orderId` (`orderId`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`orderId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- テーブルの構造 `deliveries`
--

CREATE TABLE `deliveries` (
  `deliveryId` int(11) NOT NULL AUTO_INCREMENT,
  `customerId` int(5) NOT NULL,
  `deliveryDate` date DEFAULT NULL,
  `totalAmount` int(11) DEFAULT NULL,
  PRIMARY KEY (`deliveryId`),
  KEY `customerId` (`customerId`),
  CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customers` (`customerId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- テーブルの構造 `delivery_details`
--

CREATE TABLE `delivery_details` (
  `deliveryDetailId` int(11) NOT NULL AUTO_INCREMENT,
  `deliveryId` int(11) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unitPrice` int(11) DEFAULT NULL,
  `orderDetailId` int(11) DEFAULT NULL,
  `orderId` int(11) DEFAULT NULL,
  PRIMARY KEY (`deliveryDetailId`),
  KEY `deliveryId` (`deliveryId`),
  KEY `orderDetailId` (`orderDetailId`),
  KEY `orderId` (`orderId`),
  CONSTRAINT `delivery_details_ibfk_1` FOREIGN KEY (`deliveryId`) REFERENCES `deliveries` (`deliveryId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `delivery_details_ibfk_2` FOREIGN KEY (`orderDetailId`) REFERENCES `order_details` (`orderDetailId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `delivery_details_ibfk_3` FOREIGN KEY (`orderId`) REFERENCES `orders` (`orderId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- ダンプしたテーブルのインデックス
--

--
-- テーブルのインデックス `customers`
--

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;