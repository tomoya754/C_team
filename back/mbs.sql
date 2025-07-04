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
  `isDeleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- ダンプしたテーブルのインデックス
--

--
-- テーブルのインデックス `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customerId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
