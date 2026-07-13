-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 13, 2026 at 08:32 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quan_cafe`
--

-- --------------------------------------------------------

--
-- Table structure for table `ban`
--

DROP TABLE IF EXISTS `ban`;
CREATE TABLE IF NOT EXISTS `ban` (
  `ma_ban` int NOT NULL AUTO_INCREMENT,
  `ten_ban` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ma_ban`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ban`
--

INSERT INTO `ban` (`ma_ban`, `ten_ban`, `trang_thai`) VALUES
(1, 'Bàn 1', 'Co khach'),
(2, 'Bàn 2', 'Trong'),
(3, 'Bàn 3', 'Trong'),
(4, 'Bàn 4', 'Trong'),
(5, 'Bàn 5', 'Trong'),
(6, 'Bàn 6', 'Trong'),
(7, 'Bàn 7', 'Trong'),
(8, 'Bàn 8', 'Trong'),
(9, 'Bàn 9', 'Trong'),
(10, 'Bàn 10', 'Trong'),
(11, 'Bàn 11', 'Trong'),
(12, 'Bàn 12', 'Trong'),
(13, 'Bàn 13', 'Trong'),
(14, 'Bàn 14', 'Trong'),
(15, 'Bàn 15', 'Trong'),
(16, 'Bàn 16', 'Trong'),
(17, 'Bàn 17', 'Trong'),
(18, 'Bàn 18', 'Trong'),
(19, 'Bàn 19', 'Trong'),
(20, 'Bàn 20', 'Trong'),
(21, 'Bàn 21', 'Trong'),
(22, 'Bàn 22', 'Trong'),
(23, 'Bàn 23', 'Trong'),
(24, 'Bàn 24', 'Trong'),
(25, 'Bàn 25', 'Trong'),
(26, 'Bàn 26', 'Trong'),
(27, 'Bàn 27', 'Trong'),
(28, 'Bàn 28', 'Trong'),
(29, 'Bàn 29', 'Trong'),
(30, 'Bàn 30', 'Trong'),
(31, 'Bàn 31', 'Trong'),
(32, 'Bàn 32', 'Trong'),
(33, 'Bàn 33', 'Trong'),
(34, 'Bàn 34', 'Trong'),
(35, 'Bàn 35', 'Trong'),
(36, 'Bàn 36', 'Trong');

-- --------------------------------------------------------

--
-- Table structure for table `bang_cong_chi_tiet`
--

DROP TABLE IF EXISTS `bang_cong_chi_tiet`;
CREATE TABLE IF NOT EXISTS `bang_cong_chi_tiet` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ky_luong_id` int NOT NULL,
  `ma_nhan_vien` int NOT NULL,
  `ngay` date NOT NULL,
  `ma_ca` int DEFAULT NULL,
  `loai_ca` enum('mac_dinh','linh_hoat') NOT NULL DEFAULT 'mac_dinh',
  `ten_ca` varchar(50) NOT NULL,
  `thoi_gian_ca` varchar(20) NOT NULL,
  `so_gio` decimal(4,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bcc` (`ky_luong_id`,`ma_nhan_vien`,`ngay`,`ma_ca`),
  KEY `idx_bcc_nv` (`ma_nhan_vien`,`ky_luong_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4676 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bang_cong_chi_tiet`
--

INSERT INTO `bang_cong_chi_tiet` (`id`, `ky_luong_id`, `ma_nhan_vien`, `ngay`, `ma_ca`, `loai_ca`, `ten_ca`, `thoi_gian_ca`, `so_gio`, `created_at`) VALUES
(813, 146, 3, '2026-05-12', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(814, 146, 3, '2026-05-13', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(815, 146, 3, '2026-05-14', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(816, 146, 3, '2026-05-15', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(817, 146, 3, '2026-05-15', 2, 'mac_dinh', 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-04 21:44:57'),
(818, 146, 3, '2026-05-15', 3, 'mac_dinh', 'Ca Tối', '18:00-23:00', 5.00, '2026-06-04 21:44:57'),
(819, 146, 4, '2026-05-16', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(820, 146, 5, '2026-05-13', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(821, 146, 5, '2026-05-16', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(822, 146, 7, '2026-05-16', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(823, 146, 12, '2026-05-17', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(824, 146, 12, '2026-05-17', 3, 'mac_dinh', 'Ca Tối', '18:00-23:00', 5.00, '2026-06-04 21:44:57'),
(825, 146, 14, '2026-05-18', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(4238, 1, 3, '2026-06-01', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-29 23:58:56'),
(4239, 1, 3, '2026-06-03', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-29 23:58:56'),
(4240, 1, 6, '2026-06-01', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-29 23:58:56'),
(4241, 1, 7, '2026-06-03', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-29 23:58:56'),
(4242, 1, 16, '2026-06-02', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-29 23:58:56'),
(4243, 1, 16, '2026-06-04', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-29 23:58:56'),
(4244, 1, 16, '2026-06-05', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-29 23:58:56'),
(4245, 1, 3, '2026-06-05', 2, 'mac_dinh', 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-29 23:58:56'),
(4246, 1, 4, '2026-06-01', 2, 'mac_dinh', 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-29 23:58:56'),
(4247, 1, 5, '2026-06-03', 2, 'mac_dinh', 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-29 23:58:56'),
(4248, 1, 7, '2026-06-01', 2, 'mac_dinh', 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-29 23:58:56'),
(4249, 1, 12, '2026-06-05', 2, 'mac_dinh', 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-29 23:58:56'),
(4250, 1, 16, '2026-06-02', 2, 'mac_dinh', 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-29 23:58:56'),
(4251, 1, 16, '2026-06-04', 2, 'mac_dinh', 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-29 23:58:56'),
(4252, 1, 5, '2026-06-01', 3, 'mac_dinh', 'Ca Tối', '18:00-23:00', 5.00, '2026-06-29 23:58:56'),
(4253, 1, 6, '2026-06-03', 3, 'mac_dinh', 'Ca Tối', '18:00-23:00', 5.00, '2026-06-29 23:58:56'),
(4254, 1, 7, '2026-06-05', 3, 'mac_dinh', 'Ca Tối', '18:00-23:00', 5.00, '2026-06-29 23:58:56'),
(4255, 1, 11, '2026-06-03', 3, 'mac_dinh', 'Ca Tối', '18:00-23:00', 5.00, '2026-06-29 23:58:56'),
(4256, 1, 16, '2026-06-04', 3, 'mac_dinh', 'Ca Tối', '18:00-23:00', 5.00, '2026-06-29 23:58:56'),
(4668, 405, 17, '2026-07-05', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-07-13 08:13:19'),
(4669, 405, 18, '2026-07-06', 1, 'mac_dinh', 'Ca Sáng', '06:00-12:00', 6.00, '2026-07-13 08:13:19'),
(4670, 405, 17, '2026-07-05', 2, 'mac_dinh', 'Ca Chiều', '12:00-18:00', 6.00, '2026-07-13 08:13:19'),
(4671, 405, 18, '2026-07-06', 2, 'mac_dinh', 'Ca Chiều', '12:00-18:00', 6.00, '2026-07-13 08:13:19'),
(4672, 405, 17, '2026-07-05', 3, 'mac_dinh', 'Ca Tối', '18:00-23:00', 5.00, '2026-07-13 08:13:19'),
(4673, 405, 18, '2026-07-06', 3, 'mac_dinh', 'Ca Tối', '18:00-23:00', 5.00, '2026-07-13 08:13:19'),
(4675, 405, 16, '2026-07-12', NULL, 'linh_hoat', 'Ca Linh Hoạt', '17:00-21:00', 4.00, '2026-07-13 08:13:19');

-- --------------------------------------------------------

--
-- Table structure for table `bang_cong_thang`
--

DROP TABLE IF EXISTS `bang_cong_thang`;
CREATE TABLE IF NOT EXISTS `bang_cong_thang` (
  `ky_luong_id` int NOT NULL,
  `ma_nhan_vien` int NOT NULL,
  `so_ca_sang` int NOT NULL DEFAULT '0',
  `so_ca_chieu` int NOT NULL DEFAULT '0',
  `so_ca_toi` int NOT NULL DEFAULT '0',
  `so_ca_linh_hoat` int NOT NULL DEFAULT '0',
  `so_ngay_lam` int NOT NULL DEFAULT '0',
  `tong_ca` int NOT NULL DEFAULT '0',
  `tong_gio` decimal(6,2) NOT NULL DEFAULT '0.00',
  `last_recalc_at` datetime DEFAULT NULL,
  PRIMARY KEY (`ky_luong_id`,`ma_nhan_vien`),
  KEY `idx_bc_ky` (`ky_luong_id`),
  KEY `fk_bc_nv` (`ma_nhan_vien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bang_cong_thang`
--

INSERT INTO `bang_cong_thang` (`ky_luong_id`, `ma_nhan_vien`, `so_ca_sang`, `so_ca_chieu`, `so_ca_toi`, `so_ca_linh_hoat`, `so_ngay_lam`, `tong_ca`, `tong_gio`, `last_recalc_at`) VALUES
(1, 3, 2, 1, 0, 0, 3, 3, 18.00, '2026-06-29 23:58:56'),
(1, 4, 0, 1, 0, 0, 1, 1, 6.00, '2026-06-29 23:58:56'),
(1, 5, 0, 1, 1, 0, 2, 2, 11.00, '2026-06-29 23:58:56'),
(1, 6, 1, 0, 1, 0, 2, 2, 11.00, '2026-06-29 23:58:56'),
(1, 7, 1, 1, 1, 0, 3, 3, 17.00, '2026-06-29 23:58:56'),
(1, 11, 0, 0, 1, 0, 1, 1, 5.00, '2026-06-29 23:58:56'),
(1, 12, 0, 1, 0, 0, 1, 1, 6.00, '2026-06-29 23:58:56'),
(1, 16, 3, 2, 1, 0, 3, 6, 35.00, '2026-06-29 23:58:56'),
(146, 3, 4, 1, 1, 0, 4, 6, 35.00, '2026-06-04 21:44:57'),
(146, 4, 1, 0, 0, 0, 1, 1, 6.00, '2026-06-04 21:44:57'),
(146, 5, 2, 0, 0, 0, 2, 2, 12.00, '2026-06-04 21:44:57'),
(146, 7, 1, 0, 0, 0, 1, 1, 6.00, '2026-06-04 21:44:57'),
(146, 12, 1, 0, 1, 0, 1, 2, 11.00, '2026-06-04 21:44:57'),
(146, 14, 1, 0, 0, 0, 1, 1, 6.00, '2026-06-04 21:44:57'),
(405, 16, 0, 0, 0, 1, 1, 1, 4.00, '2026-07-13 08:13:19'),
(405, 17, 1, 1, 1, 0, 1, 3, 17.00, '2026-07-13 08:13:19'),
(405, 18, 1, 1, 1, 0, 1, 3, 17.00, '2026-07-13 08:13:19');

-- --------------------------------------------------------

--
-- Table structure for table `bang_luong_thang`
--

DROP TABLE IF EXISTS `bang_luong_thang`;
CREATE TABLE IF NOT EXISTS `bang_luong_thang` (
  `ky_luong_id` int NOT NULL,
  `ma_nhan_vien` int NOT NULL,
  `tong_ca` int NOT NULL DEFAULT '0',
  `tong_gio` decimal(6,2) NOT NULL DEFAULT '0.00',
  `luong_gio` decimal(12,2) NOT NULL DEFAULT '0.00',
  `luong_co_ban` decimal(12,2) NOT NULL DEFAULT '0.00',
  `phu_cap` decimal(12,2) NOT NULL DEFAULT '0.00',
  `thuong` decimal(12,2) NOT NULL DEFAULT '0.00',
  `khau_tru` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tam_ung` decimal(12,2) NOT NULL DEFAULT '0.00',
  `luong_thuc_nhan` decimal(12,2) NOT NULL DEFAULT '0.00',
  `last_recalc_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ky_luong_id`,`ma_nhan_vien`),
  KEY `idx_bl_ky` (`ky_luong_id`),
  KEY `fk_bl_nv` (`ma_nhan_vien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bang_luong_thang`
--

INSERT INTO `bang_luong_thang` (`ky_luong_id`, `ma_nhan_vien`, `tong_ca`, `tong_gio`, `luong_gio`, `luong_co_ban`, `phu_cap`, `thuong`, `khau_tru`, `tam_ung`, `luong_thuc_nhan`, `last_recalc_at`, `created_at`, `updated_at`) VALUES
(1, 3, 3, 18.00, 29000.00, 522000.00, 150000.00, 0.00, 0.00, 0.00, 672000.00, '2026-07-07 08:38:35', '2026-06-02 16:11:51', '2026-07-07 08:38:35'),
(1, 4, 1, 6.00, 30000.00, 180000.00, 200000.00, 0.00, 0.00, 0.00, 380000.00, '2026-07-07 08:38:35', '2026-06-02 16:11:51', '2026-07-07 08:38:35'),
(1, 5, 2, 11.00, 32000.00, 352000.00, 250000.00, 100000.00, 200000.00, 0.00, 502000.00, '2026-07-07 08:38:35', '2026-06-02 16:11:51', '2026-07-07 08:38:35'),
(1, 6, 2, 11.00, 35000.00, 385000.00, 250000.00, 0.00, 0.00, 0.00, 635000.00, '2026-07-07 08:38:35', '2026-06-02 16:11:51', '2026-07-07 08:38:35'),
(1, 7, 3, 17.00, 36000.00, 612000.00, 350000.00, 0.00, 0.00, 0.00, 962000.00, '2026-07-07 08:38:35', '2026-06-02 16:11:51', '2026-07-07 08:38:35'),
(1, 11, 1, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-07-07 08:38:35', '2026-06-05 12:38:27', '2026-07-07 08:38:35'),
(1, 12, 1, 6.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-07-07 08:38:35', '2026-06-18 11:45:00', '2026-07-07 08:38:35'),
(1, 16, 6, 35.00, 36000.00, 1260000.00, 320000.00, 0.00, 0.00, 0.00, 1580000.00, '2026-07-07 08:38:35', '2026-06-04 22:03:51', '2026-07-07 08:38:35'),
(146, 3, 6, 35.00, 29000.00, 1015000.00, 150000.00, 0.00, 0.00, 0.00, 1165000.00, '2026-07-07 08:38:35', '2026-06-04 21:44:57', '2026-07-07 08:38:35'),
(146, 4, 1, 6.00, 30000.00, 180000.00, 200000.00, 0.00, 0.00, 0.00, 380000.00, '2026-07-07 08:38:35', '2026-06-04 21:44:57', '2026-07-07 08:38:35'),
(146, 5, 2, 12.00, 32000.00, 384000.00, 250000.00, 0.00, 0.00, 0.00, 634000.00, '2026-07-07 08:38:35', '2026-06-04 21:44:57', '2026-07-07 08:38:35'),
(146, 7, 1, 6.00, 36000.00, 216000.00, 350000.00, 0.00, 0.00, 0.00, 566000.00, '2026-07-07 08:38:35', '2026-06-04 21:44:57', '2026-07-07 08:38:35'),
(146, 12, 2, 11.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-07-07 08:38:35', '2026-06-04 21:44:57', '2026-07-07 08:38:35'),
(146, 14, 1, 6.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-07-07 08:38:35', '2026-06-04 21:44:57', '2026-07-07 08:38:35'),
(405, 16, 1, 4.00, 36000.00, 144000.00, 320000.00, 0.00, 0.00, 0.00, 464000.00, '2026-07-13 08:13:19', '2026-07-13 07:58:57', '2026-07-13 08:13:19'),
(405, 17, 3, 17.00, 40000.00, 680000.00, 500000.00, 0.00, 0.00, 0.00, 1180000.00, '2026-07-13 08:13:19', '2026-07-06 14:09:15', '2026-07-13 08:13:19'),
(405, 18, 3, 17.00, 26000.00, 442000.00, 200000.00, 0.00, 0.00, 0.00, 642000.00, '2026-07-13 08:13:19', '2026-07-07 08:37:37', '2026-07-13 08:13:19');

-- --------------------------------------------------------

--
-- Table structure for table `calam`
--

DROP TABLE IF EXISTS `calam`;
CREATE TABLE IF NOT EXISTS `calam` (
  `ma_ca` int NOT NULL AUTO_INCREMENT,
  `buoi` varchar(50) DEFAULT NULL,
  `ngay` date DEFAULT NULL,
  PRIMARY KEY (`ma_ca`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `calam`
--

INSERT INTO `calam` (`ma_ca`, `buoi`, `ngay`) VALUES
(1, 'Ca Sáng', NULL),
(2, 'Ca Chiều', NULL),
(3, 'Ca Tối', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chitiethoadon`
--

DROP TABLE IF EXISTS `chitiethoadon`;
CREATE TABLE IF NOT EXISTS `chitiethoadon` (
  `ma_don_hang` int NOT NULL,
  `ma_mon` int NOT NULL,
  `so_luong` int NOT NULL,
  `so_luong_da_gui_bar` int NOT NULL DEFAULT '0',
  `ghi_chu_mon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `trang_thai_mon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Dang cho',
  `don_gia` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ma_don_hang`,`ma_mon`),
  KEY `ma_mon` (`ma_mon`),
  KEY `idx_cthd_trang_thai` (`trang_thai_mon`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chitiethoadon`
--

INSERT INTO `chitiethoadon` (`ma_don_hang`, `ma_mon`, `so_luong`, `so_luong_da_gui_bar`, `ghi_chu_mon`, `trang_thai_mon`, `don_gia`) VALUES
(1, 25, 1, 1, NULL, 'Dang lam', 20000.00),
(1, 26, 1, 1, NULL, 'Dang lam', 20000.00),
(1, 30, 2, 2, NULL, 'Dang lam', 40000.00),
(2, 25, 1, 1, NULL, 'Dang lam', 20000.00),
(2, 26, 1, 1, NULL, 'Dang lam', 20000.00),
(2, 30, 1, 1, NULL, 'Dang lam', 40000.00),
(3, 25, 2, 2, NULL, 'Dang lam', 20000.00),
(3, 26, 2, 2, NULL, 'Dang lam', 20000.00),
(3, 30, 1, 1, NULL, 'Dang lam', 40000.00),
(4, 25, 2, 0, NULL, 'Dang cho', 20000.00),
(4, 26, 2, 0, NULL, 'Dang cho', 20000.00),
(4, 30, 1, 0, NULL, 'Dang cho', 40000.00),
(5, 25, 1, 1, NULL, 'Dang lam', 20000.00),
(5, 30, 2, 2, NULL, 'Dang lam', 40000.00),
(6, 25, 1, 0, NULL, 'Dang cho', 20000.00),
(6, 30, 2, 0, NULL, 'Dang cho', 40000.00),
(7, 25, 1, 1, NULL, 'Dang lam', 20000.00),
(7, 26, 1, 1, NULL, 'Dang lam', 20000.00),
(8, 25, 1, 1, NULL, 'Dang lam', 20000.00),
(8, 26, 1, 1, NULL, 'Dang lam', 20000.00),
(9, 25, 1, 1, NULL, 'Dang lam', 20000.00),
(10, 25, 1, 1, NULL, 'Dang lam', 20000.00),
(10, 30, 1, 1, NULL, 'Dang lam', 40000.00),
(11, 25, 1, 1, NULL, 'Dang lam', 20000.00),
(11, 30, 1, 1, NULL, 'Dang lam', 40000.00),
(12, 25, 2, 2, NULL, 'Dang lam', 20000.00),
(12, 30, 1, 1, NULL, 'Dang lam', 40000.00),
(13, 34, 5, 5, NULL, 'Dang lam', 35000.00),
(14, 25, 1, 1, NULL, 'Dang lam', 20000.00),
(15, 25, 1, 0, NULL, 'Dang cho', 20000.00),
(15, 30, 1, 0, NULL, 'Dang cho', 40000.00);

-- --------------------------------------------------------

--
-- Table structure for table `chitiet_phieunhap`
--

DROP TABLE IF EXISTS `chitiet_phieunhap`;
CREATE TABLE IF NOT EXISTS `chitiet_phieunhap` (
  `ma_chi_tiet` int NOT NULL AUTO_INCREMENT,
  `ma_phieu` int NOT NULL,
  `ma_nguyen_lieu` int NOT NULL,
  `so_luong_nhap` decimal(10,2) NOT NULL,
  `gia_nhap` decimal(12,2) NOT NULL,
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `fk_ctpn_phieu` (`ma_phieu`),
  KEY `fk_ctpn_nguyenlieu` (`ma_nguyen_lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chitiet_phieunhap`
--

INSERT INTO `chitiet_phieunhap` (`ma_chi_tiet`, `ma_phieu`, `ma_nguyen_lieu`, `so_luong_nhap`, `gia_nhap`) VALUES
(1, 1, 1, 20.00, 20000.00),
(2, 2, 7, 20.00, 1000.00),
(3, 3, 9, 2.00, 300000.00),
(4, 4, 10, 30.00, 15000.00),
(5, 5, 11, 2.00, 20000.00),
(6, 6, 8, 10.00, 10000.00),
(7, 7, 18, 2.00, 40000.00),
(8, 8, 19, 1.00, 100000.00),
(9, 9, 20, 1.00, 50000.00);

-- --------------------------------------------------------

--
-- Table structure for table `chuquan`
--

DROP TABLE IF EXISTS `chuquan`;
CREATE TABLE IF NOT EXISTS `chuquan` (
  `ma_admin` int NOT NULL AUTO_INCREMENT,
  `ten_dang_nhap` varchar(50) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'admin',
  PRIMARY KEY (`ma_admin`),
  UNIQUE KEY `ten_dang_nhap` (`ten_dang_nhap`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `chuquan`
--

INSERT INTO `chuquan` (`ma_admin`, `ten_dang_nhap`, `mat_khau`, `role`) VALUES
(1, 'admin', '$2b$10$vvjwPWr2huOTsXmVY9kC1u9XVBpw.FoMMvjeCwOB5sZyuHgIG4W4S', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `congthuc`
--

DROP TABLE IF EXISTS `congthuc`;
CREATE TABLE IF NOT EXISTS `congthuc` (
  `ma_mon` int NOT NULL,
  `ma_nguyen_lieu` int NOT NULL,
  `dinh_luong` decimal(10,2) NOT NULL COMMENT 'Định lượng dạng ml hoặc g',
  `don_vi_tinh_chi_tiet` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ml',
  PRIMARY KEY (`ma_mon`,`ma_nguyen_lieu`),
  KEY `fk_congthuc_nguyenlieu` (`ma_nguyen_lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `congthuc`
--

INSERT INTO `congthuc` (`ma_mon`, `ma_nguyen_lieu`, `dinh_luong`, `don_vi_tinh_chi_tiet`) VALUES
(21, 3, 50.00, 'g'),
(22, 5, 50.00, 'g'),
(22, 6, 20.00, 'ml'),
(23, 4, 1.00, 'chai'),
(25, 1, 1.00, 'lon'),
(26, 7, 1.00, 'chai'),
(29, 8, 1.00, 'chai'),
(30, 9, 30.00, 'g'),
(30, 10, 1.00, 'lon'),
(30, 11, 15.00, 'g'),
(31, 14, 1.00, 'lon'),
(31, 15, 5.00, 'g'),
(32, 14, 1.00, 'lon'),
(33, 6, 30.00, 'ml'),
(33, 12, 40.00, 'ml'),
(33, 16, 30.00, 'ml'),
(33, 17, 100.00, 'ml'),
(34, 11, 5.00, 'g'),
(34, 18, 2.00, 'g'),
(34, 20, 10.00, 'g'),
(35, 11, 8.00, 'g'),
(35, 21, 8.00, 'g'),
(35, 22, 5.00, 'g');

-- --------------------------------------------------------

--
-- Table structure for table `danhmucmon`
--

DROP TABLE IF EXISTS `danhmucmon`;
CREATE TABLE IF NOT EXISTS `danhmucmon` (
  `ma_danh_muc` int NOT NULL AUTO_INCREMENT,
  `ten_danh_muc` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ma_danh_muc`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `danhmucmon`
--

INSERT INTO `danhmucmon` (`ma_danh_muc`, `ten_danh_muc`) VALUES
(1, 'Café'),
(2, 'Soda'),
(3, 'Trà Trái Cây'),
(4, 'Sữa Chua'),
(5, 'Latte'),
(6, 'Nước Ngọt');

-- --------------------------------------------------------

--
-- Table structure for table `donhang`
--

DROP TABLE IF EXISTS `donhang`;
CREATE TABLE IF NOT EXISTS `donhang` (
  `ma_don_hang` int NOT NULL AUTO_INCREMENT,
  `ma_ban` int DEFAULT NULL,
  `loai_don` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tai_cho',
  `ten_khach` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phi_giao_hang` decimal(12,2) NOT NULL DEFAULT '0.00',
  `hinh_thuc_thanh_toan` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `so_dien_thoai_giao` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dia_chi_giao` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `trang_thai_don` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai_thanh_toan` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ma_don_hang`),
  KEY `ma_ban` (`ma_ban`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `donhang`
--

INSERT INTO `donhang` (`ma_don_hang`, `ma_ban`, `loai_don`, `ten_khach`, `phi_giao_hang`, `hinh_thuc_thanh_toan`, `so_dien_thoai_giao`, `dia_chi_giao`, `ngay_tao`, `trang_thai_don`, `trang_thai_thanh_toan`) VALUES
(1, 1, 'tai_cho', NULL, 0.00, 'tien_mat', NULL, NULL, '2026-07-07 18:41:57', 'Hoan thanh', 'Da thanh toan'),
(2, 23, 'tai_cho', NULL, 0.00, 'chuyen_khoan', NULL, NULL, '2026-07-07 18:43:09', 'Hoan thanh', 'Da thanh toan'),
(3, NULL, 'mang_ve', NULL, 0.00, NULL, NULL, NULL, '2026-07-07 18:44:09', 'Dang phuc vu', 'Chua thanh toan'),
(4, NULL, 'mang_ve', NULL, 0.00, 'tien_mat', NULL, NULL, '2026-07-07 18:44:10', 'Hoan thanh', 'Da thanh toan'),
(5, NULL, 'giao_hang', 'A', 10000.00, NULL, '12334', '16 cao lo', '2026-07-07 18:44:59', 'Dang phuc vu', 'Chua thanh toan'),
(6, NULL, 'giao_hang', 'A', 10000.00, 'tien_mat', '12334', '16 cao lo', '2026-07-07 18:44:59', 'Hoan thanh', 'Da thanh toan'),
(7, 1, 'tai_cho', NULL, 0.00, 'tien_mat', NULL, NULL, '2026-07-07 19:13:09', 'Hoan thanh', 'Da thanh toan'),
(8, 1, 'tai_cho', NULL, 0.00, 'tien_mat', NULL, NULL, '2026-07-07 19:19:46', 'Hoan thanh', 'Da thanh toan'),
(9, 1, 'tai_cho', NULL, 0.00, 'tien_mat', NULL, NULL, '2026-07-08 16:19:42', 'Hoan thanh', 'Da thanh toan'),
(10, 2, 'tai_cho', NULL, 0.00, 'tien_mat', NULL, NULL, '2026-07-08 16:20:10', 'Hoan thanh', 'Da thanh toan'),
(11, 3, 'tai_cho', NULL, 0.00, 'tien_mat', NULL, NULL, '2026-07-08 16:27:53', 'Hoan thanh', 'Da thanh toan'),
(12, 1, 'tai_cho', NULL, 0.00, 'chuyen_khoan', NULL, NULL, '2026-07-08 16:32:33', 'Hoan thanh', 'Da thanh toan'),
(13, 1, 'tai_cho', NULL, 0.00, 'chuyen_khoan', NULL, NULL, '2026-07-08 17:12:49', 'Hoan thanh', 'Da thanh toan'),
(14, 2, 'tai_cho', NULL, 0.00, 'tien_mat', NULL, NULL, '2026-07-13 07:41:31', 'Hoan thanh', 'Da thanh toan'),
(15, 1, 'tai_cho', NULL, 0.00, NULL, NULL, NULL, '2026-07-13 07:41:37', 'Dang phuc vu', 'Chua thanh toan');

-- --------------------------------------------------------

--
-- Table structure for table `huy_mon_log`
--

DROP TABLE IF EXISTS `huy_mon_log`;
CREATE TABLE IF NOT EXISTS `huy_mon_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_don_hang` int NOT NULL,
  `ma_mon` int NOT NULL,
  `ten_mon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_luong_huy` int NOT NULL,
  `ngay_huy` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_huy_don` (`ma_don_hang`),
  KEY `idx_huy_ngay` (`ngay_huy`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `huy_mon_log`
--

INSERT INTO `huy_mon_log` (`id`, `ma_don_hang`, `ma_mon`, `ten_mon`, `so_luong_huy`, `ngay_huy`) VALUES
(1, 1, 25, 'Coca', 5, '2026-07-07 18:42:32'),
(2, 8, 25, 'Coca', 1, '2026-07-07 19:20:23'),
(3, 12, 30, 'MatCha Latte', 1, '2026-07-08 16:32:59'),
(4, 13, 34, 'Trà Đào', 5, '2026-07-08 17:13:17');

-- --------------------------------------------------------

--
-- Table structure for table `ky_luong`
--

DROP TABLE IF EXISTS `ky_luong`;
CREATE TABLE IF NOT EXISTS `ky_luong` (
  `id` int NOT NULL AUTO_INCREMENT,
  `thang` tinyint NOT NULL,
  `nam` smallint NOT NULL,
  `trang_thai` enum('chua_chot','da_chot','da_thanh_toan') NOT NULL DEFAULT 'chua_chot',
  `chot_luc` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_thang_nam` (`thang`,`nam`),
  KEY `idx_ky_luong_trang_thai` (`trang_thai`)
) ENGINE=InnoDB AUTO_INCREMENT=528 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ky_luong`
--

INSERT INTO `ky_luong` (`id`, `thang`, `nam`, `trang_thai`, `chot_luc`, `created_at`, `updated_at`) VALUES
(1, 6, 2026, 'chua_chot', NULL, '2026-06-02 14:23:43', '2026-06-05 00:39:25'),
(146, 5, 2026, 'chua_chot', NULL, '2026-06-04 21:44:57', '2026-06-04 21:44:57'),
(405, 7, 2026, 'da_thanh_toan', '2026-07-13 08:13:26', '2026-07-01 21:35:22', '2026-07-13 08:15:45');

-- --------------------------------------------------------

--
-- Table structure for table `lich_su_huy_hang`
--

DROP TABLE IF EXISTS `lich_su_huy_hang`;
CREATE TABLE IF NOT EXISTS `lich_su_huy_hang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_nguyen_lieu` int NOT NULL,
  `ten_nguyen_lieu` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `han_su_dung` date DEFAULT NULL,
  `ton_kho_con_lai` decimal(10,2) DEFAULT '0.00',
  `don_vi` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_xu_ly` date DEFAULT NULL,
  `ghi_chu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ls_nguyenlieu` (`ma_nguyen_lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lich_su_huy_hang`
--

INSERT INTO `lich_su_huy_hang` (`id`, `ma_nguyen_lieu`, `ten_nguyen_lieu`, `han_su_dung`, `ton_kho_con_lai`, `don_vi`, `ngay_xu_ly`, `ghi_chu`, `created_at`) VALUES
(1, 19, 'Siro Đào', '2026-07-10', 500.00, 'ml', '2026-07-12', 'hết hạn (Huỷ 500 ml, còn 0 ml)', '2026-07-12 18:02:34'),
(2, 18, 'Trà Cozy Đào', '2026-07-10', 290.00, 'g', '2026-07-12', 'hết hạn (Huỷ 290 g, còn 0 g)', '2026-07-12 18:21:35');

-- --------------------------------------------------------

--
-- Table structure for table `lich_su_thanh_toan`
--

DROP TABLE IF EXISTS `lich_su_thanh_toan`;
CREATE TABLE IF NOT EXISTS `lich_su_thanh_toan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_phieu` int NOT NULL,
  `nha_cung_cap` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `so_tien` decimal(12,2) NOT NULL DEFAULT '0.00',
  `con_no_sau_khi_tra` decimal(12,2) NOT NULL DEFAULT '0.00',
  `ngay_thanh_toan` datetime NOT NULL,
  `ghi_chu` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_lstt_phieunhap` (`ma_phieu`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lich_su_thanh_toan`
--

INSERT INTO `lich_su_thanh_toan` (`id`, `ma_phieu`, `nha_cung_cap`, `so_tien`, `con_no_sau_khi_tra`, `ngay_thanh_toan`, `ghi_chu`, `created_at`) VALUES
(1, 1, 'A', 200000.00, 200000.00, '2026-07-07 18:59:45', 'Thanh toán một phần', '2026-07-07 18:59:45'),
(2, 9, 'Q', 50000.00, 0.00, '2026-07-08 17:10:03', 'Thanh toán hết', '2026-07-08 17:10:02'),
(3, 7, 'ABC', 50000.00, 30000.00, '2026-07-08 17:10:15', 'Thanh toán một phần', '2026-07-08 17:10:14');

-- --------------------------------------------------------

--
-- Table structure for table `mon`
--

DROP TABLE IF EXISTS `mon`;
CREATE TABLE IF NOT EXISTS `mon` (
  `ma_mon` int NOT NULL AUTO_INCREMENT,
  `ma_danh_muc` int DEFAULT NULL,
  `ten_mon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gia_ban` decimal(10,2) NOT NULL DEFAULT '0.00',
  `hinh_anh` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `mo_ta` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `trang_thai_ban` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: Đang bán, 0: Tạm ngưng',
  PRIMARY KEY (`ma_mon`),
  KEY `fk_mon_danhmucmon` (`ma_danh_muc`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mon`
--

INSERT INTO `mon` (`ma_mon`, `ma_danh_muc`, `ten_mon`, `gia_ban`, `hinh_anh`, `mo_ta`, `trang_thai_ban`) VALUES
(21, 1, 'Cafe den', 25000.00, '/uploads/anh-mon/mon-cafe-den.svg', 'Cà phê đen nguyên chất', 1),
(22, 1, 'Cafe Sữa', 28000.00, '/uploads/anh-mon/mon-cafe-sua.svg', 'Cà phê sữa thơm béo', 1),
(23, 6, 'Nước Suối', 10000.00, '/uploads/anh-mon/mon-1782461597956.png', 'Nước suối tinh khiết', 1),
(25, 6, 'Coca', 20000.00, '/uploads/anh-mon/mon-1782461610401.png', 'Nước ngọt Coca Cola', 1),
(26, 6, 'Pepsi', 20000.00, '/uploads/anh-mon/mon-1781260998886.png', 'Nước ngọt Pepsi Cola', 1),
(29, 6, 'Revive', 20000.00, '/uploads/anh-mon/mon-1781255078983.png', 'Nước tăng lực', 1),
(30, 5, 'MatCha Latte', 40000.00, '/uploads/anh-mon/mon-1781430661731.png', NULL, 1),
(31, 2, 'Soda chanh ', 25000.00, '/uploads/anh-mon/mon-1783072023661.png', NULL, 1),
(32, 2, 'Soda', 20000.00, '/uploads/anh-mon/mon-1783072082762.png', NULL, 1),
(33, 4, 'Sữa chua dâu', 30000.00, '/uploads/anh-mon/mon-1783091944696.png', NULL, 1),
(34, 3, 'Trà Đào', 35000.00, '/uploads/anh-mon/mon-1783347335276.png', NULL, 1),
(35, 3, 'Trà tắc', 30000.00, '/uploads/anh-mon/mon-1783412873649.png', NULL, 1);

--
-- Triggers `mon`
--
DROP TRIGGER IF EXISTS `trg_auto_create_formula_for_packaged_drinks`;
DELIMITER $$
CREATE TRIGGER `trg_auto_create_formula_for_packaged_drinks` AFTER INSERT ON `mon` FOR EACH ROW BEGIN
    DECLARE v_ma_nguyen_lieu INT DEFAULT NULL;
    DECLARE v_ten_danh_muc VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

    SELECT ten_danh_muc
    INTO v_ten_danh_muc
    FROM danhmucmon
    WHERE ma_danh_muc = NEW.ma_danh_muc;

    IF v_ten_danh_muc LIKE '%Nước Ngọt%'
       OR v_ten_danh_muc LIKE '%Soda%' THEN

        SELECT ma_nguyen_lieu
        INTO v_ma_nguyen_lieu
        FROM nguyenlieu
        WHERE LOWER(ten_nguyen_lieu) COLLATE utf8mb4_unicode_ci
              LIKE CONCAT('%', LOWER(NEW.ten_mon), '%') COLLATE utf8mb4_unicode_ci
        LIMIT 1;

        IF v_ma_nguyen_lieu IS NOT NULL THEN
            INSERT INTO congthuc
            (ma_mon, ma_nguyen_lieu, dinh_luong, don_vi_tinh_chi_tiet)
            VALUES
            (NEW.ma_mon, v_ma_nguyen_lieu, 1.00, 'ml');
        END IF;

    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `nguyenlieu`
--

DROP TABLE IF EXISTS `nguyenlieu`;
CREATE TABLE IF NOT EXISTS `nguyenlieu` (
  `ma_nguyen_lieu` int NOT NULL AUTO_INCREMENT,
  `ten_nguyen_lieu` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `danh_muc` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Khác',
  `don_vi_tinh` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'g',
  `don_vi_nhap` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dung_tich_san_pham` decimal(10,2) NOT NULL DEFAULT '1.00',
  `ton_kho` decimal(10,2) NOT NULL DEFAULT '0.00',
  `nguong_canh_bao` decimal(10,2) NOT NULL DEFAULT '1000.00',
  `ghi_chu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `trang_thai` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=đang dùng, 0=ngưng',
  `han_su_dung` date DEFAULT NULL,
  PRIMARY KEY (`ma_nguyen_lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nguyenlieu`
--

INSERT INTO `nguyenlieu` (`ma_nguyen_lieu`, `ten_nguyen_lieu`, `danh_muc`, `don_vi_tinh`, `don_vi_nhap`, `dung_tich_san_pham`, `ton_kho`, `nguong_canh_bao`, `ghi_chu`, `trang_thai`, `han_su_dung`) VALUES
(1, 'CoCa', 'Nước uống đóng chai', 'lon', 'lon', 1.00, 4.00, 10.00, NULL, 1, '2026-07-11'),
(2, 'Sting', 'Nước uống đóng chai', 'lon', 'lon', 1.00, 0.00, 10.00, NULL, 1, NULL),
(3, 'Bột Cafe Đen', 'Nguyên liệu pha chế', 'g', 'gói', 1000.00, 0.00, 100.00, NULL, 1, NULL),
(4, 'Nước Suối', 'Nước uống đóng chai', 'chai', 'chai', 1.00, 0.00, 1.00, NULL, 1, NULL),
(5, 'Bột Cafe Sữa', 'Nguyên liệu pha chế', 'g', 'gói', 1000.00, 0.00, 1000.00, NULL, 1, NULL),
(6, 'Sữa Đặc', 'Nguyên liệu pha chế', 'ml', 'lon', 300.00, 0.00, 100.00, NULL, 1, NULL),
(7, 'Pepsi', 'Nước uống đóng chai', 'lon', 'lon', 1.00, 12.00, 10.00, NULL, 1, '2026-07-14'),
(8, 'Revive', 'Nước uống đóng chai', 'chai', 'chai', 1.00, 10.00, 10.00, NULL, 1, '2026-07-09'),
(9, 'Bột Matcha', 'Nguyên liệu pha chế', 'g', 'gói', 1000.00, 1640.00, 200.00, NULL, 1, '2026-07-17'),
(10, 'Sữa Gấu', 'Nước uống đóng chai', 'lon', 'lon', 1.00, 18.00, 10.00, NULL, 1, '2026-07-18'),
(11, 'Đường', 'Nguyên liệu pha chế', 'g', 'gói', 500.00, 795.00, 200.00, NULL, 1, NULL),
(12, 'Sữa tươi', 'Nguyên liệu pha chế', 'ml', 'hộp', 500.00, 0.00, 100.00, NULL, 1, NULL),
(13, 'Bột cafe sữa tươi', 'Nguyên liệu pha chế', 'g', 'gói', 1000.00, 0.00, 200.00, NULL, 1, NULL),
(14, 'Soda', 'Nước uống đóng chai', 'lon', 'lon', 1.00, 0.00, 10.00, NULL, 1, NULL),
(15, 'Chanh', 'Nguyên liệu pha chế', 'g', 'kg', 1000.00, 0.00, 500.00, NULL, 1, NULL),
(16, 'Mứt Dâu', 'Nguyên liệu pha chế', 'ml', 'chai', 500.00, 0.00, 100.00, NULL, 1, NULL),
(17, 'Sữa chua không đường', 'Nguyên liệu pha chế', 'g', 'hộp', 100.00, 0.00, 10.00, NULL, 1, NULL),
(18, 'Trà Cozy Đào', 'Nguyên liệu pha chế', 'g', 'hộp', 150.00, 0.00, 50.00, NULL, 1, NULL),
(19, 'Siro Đào', 'Nguyên liệu pha chế', 'ml', 'chai', 500.00, 0.00, 100.00, NULL, 1, NULL),
(20, 'Đào Ngâm', 'Nguyên liệu pha chế', 'g', 'kg', 1000.00, 950.00, 50.00, NULL, 1, '2026-07-10'),
(21, 'Trà Thái Xanh', 'Nguyên liệu pha chế', 'g', 'hộp', 500.00, 0.00, 51.00, NULL, 1, NULL),
(22, 'Tắc', 'Nguyên liệu pha chế', 'g', 'kg', 1000.00, 0.00, 100.00, NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `nhanvien`
--

DROP TABLE IF EXISTS `nhanvien`;
CREATE TABLE IF NOT EXISTS `nhanvien` (
  `ma_nhan_vien` int NOT NULL AUTO_INCREMENT,
  `ten` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `so_dien_thoai` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dia_chi` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai` enum('dang_lam','tam_nghi','da_nghi') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dang_lam' COMMENT 'Trạng thái làm việc',
  PRIMARY KEY (`ma_nhan_vien`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nhanvien`
--

INSERT INTO `nhanvien` (`ma_nhan_vien`, `ten`, `ngay_sinh`, `so_dien_thoai`, `dia_chi`, `trang_thai`) VALUES
(3, 'Đào Văn Nguyên', '2026-03-28', '123456', '12a', 'dang_lam'),
(4, 'Trần Văn Hải', '2026-03-28', '020023210', '21a', 'dang_lam'),
(5, 'Đặng Ngọc Lam', '2026-03-22', '12121212', '224a', 'dang_lam'),
(6, 'Nguyễn Chí Thanh', '2026-04-01', '232442234', '444f', 'dang_lam'),
(7, 'Lê Hoàng Long', '2026-03-29', '12121212', '23d', 'dang_lam'),
(11, 'Nguyên Thị Duyên', '2000-02-01', '44343422', '12ww', 'dang_lam'),
(12, 'Lê Trọng Khiêm', '2003-02-02', '23232232', '121e', 'dang_lam'),
(14, 'Lê Văn Cam', '1999-11-12', '121212121', '12ww', 'dang_lam'),
(15, 'Lê Văn H', '1999-02-02', '1212121', '12g', 'dang_lam'),
(16, 'Trần Trọng Phúc', '2004-06-29', '0929459371', 'Cao Lỗ', 'dang_lam'),
(17, 'Lê Đặng Hải Phục', '2008-11-05', '012131241', '12a', 'dang_lam'),
(18, 'lê van a', '2017-02-07', '1234556', '12A cao lo', 'dang_lam');

-- --------------------------------------------------------

--
-- Table structure for table `nhanvien_luong`
--

DROP TABLE IF EXISTS `nhanvien_luong`;
CREATE TABLE IF NOT EXISTS `nhanvien_luong` (
  `ma_nhan_vien` int NOT NULL,
  `luong_gio` decimal(12,2) NOT NULL DEFAULT '0.00',
  `phu_cap_mac_dinh` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tinh_trang` enum('dang_lam','tam_nghi','da_nghi') NOT NULL DEFAULT 'dang_lam',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_nhan_vien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `nhanvien_luong`
--

INSERT INTO `nhanvien_luong` (`ma_nhan_vien`, `luong_gio`, `phu_cap_mac_dinh`, `tinh_trang`, `created_at`, `updated_at`) VALUES
(3, 29000.00, 150000.00, 'dang_lam', '2026-06-02 15:22:23', '2026-06-05 00:52:07'),
(4, 30000.00, 200000.00, 'dang_lam', '2026-06-02 15:22:23', '2026-06-02 15:22:23'),
(5, 32000.00, 250000.00, 'dang_lam', '2026-06-02 15:22:23', '2026-06-02 15:22:23'),
(6, 35000.00, 250000.00, 'dang_lam', '2026-06-02 15:22:23', '2026-06-04 21:26:18'),
(7, 36000.00, 350000.00, 'dang_lam', '2026-06-02 15:22:24', '2026-06-02 15:22:24'),
(11, 0.00, 0.00, 'dang_lam', '2026-06-05 00:44:16', '2026-06-05 13:48:02'),
(12, 0.00, 0.00, 'dang_lam', '2026-06-04 21:17:53', '2026-06-04 21:17:53'),
(14, 0.00, 0.00, 'dang_lam', '2026-06-04 21:17:53', '2026-06-04 21:17:53'),
(15, 0.00, 0.00, 'dang_lam', '2026-06-04 21:17:53', '2026-06-04 21:17:53'),
(16, 36000.00, 320000.00, 'dang_lam', '2026-06-04 21:17:53', '2026-06-05 00:45:10'),
(17, 40000.00, 500000.00, 'dang_lam', '2026-07-06 14:08:02', '2026-07-06 14:08:02'),
(18, 26000.00, 200000.00, 'dang_lam', '2026-07-07 08:38:35', '2026-07-07 08:38:35');

-- --------------------------------------------------------

--
-- Table structure for table `phancong`
--

DROP TABLE IF EXISTS `phancong`;
CREATE TABLE IF NOT EXISTS `phancong` (
  `ma_nhan_vien` int NOT NULL,
  `ma_ca` int NOT NULL,
  `ngay` date NOT NULL,
  PRIMARY KEY (`ma_nhan_vien`,`ma_ca`,`ngay`),
  KEY `ma_ca` (`ma_ca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `phancong`
--

INSERT INTO `phancong` (`ma_nhan_vien`, `ma_ca`, `ngay`) VALUES
(1, 1, '2026-04-06'),
(1, 1, '2026-04-07'),
(1, 1, '2026-04-09'),
(1, 1, '2026-04-13'),
(3, 1, '2026-04-07'),
(3, 1, '2026-04-11'),
(3, 1, '2026-04-13'),
(3, 1, '2026-04-15'),
(3, 1, '2026-05-12'),
(3, 1, '2026-05-13'),
(3, 1, '2026-05-14'),
(3, 1, '2026-05-15'),
(3, 1, '2026-06-01'),
(3, 1, '2026-06-03'),
(3, 1, '2026-07-13'),
(4, 1, '2026-04-09'),
(4, 1, '2026-04-10'),
(4, 1, '2026-04-22'),
(4, 1, '2026-05-16'),
(5, 1, '2026-04-15'),
(5, 1, '2026-05-13'),
(5, 1, '2026-05-16'),
(6, 1, '2026-04-10'),
(6, 1, '2026-06-01'),
(7, 1, '2026-04-08'),
(7, 1, '2026-04-12'),
(7, 1, '2026-05-16'),
(7, 1, '2026-06-03'),
(8, 1, '2026-04-11'),
(8, 1, '2026-04-14'),
(9, 1, '2026-04-10'),
(9, 1, '2026-04-12'),
(11, 1, '2026-04-06'),
(11, 1, '2026-04-08'),
(11, 1, '2026-04-12'),
(12, 1, '2026-04-15'),
(12, 1, '2026-05-17'),
(13, 1, '2026-04-12'),
(13, 1, '2026-05-12'),
(14, 1, '2026-04-14'),
(14, 1, '2026-05-18'),
(16, 1, '2026-06-02'),
(16, 1, '2026-06-04'),
(16, 1, '2026-06-05'),
(17, 1, '2026-07-05'),
(18, 1, '2026-07-06'),
(1, 2, '2026-04-13'),
(1, 2, '2026-05-14'),
(3, 2, '2026-04-06'),
(3, 2, '2026-04-11'),
(3, 2, '2026-04-22'),
(3, 2, '2026-05-15'),
(3, 2, '2026-06-05'),
(4, 2, '2026-04-07'),
(4, 2, '2026-04-10'),
(4, 2, '2026-06-01'),
(5, 2, '2026-04-07'),
(5, 2, '2026-04-08'),
(5, 2, '2026-04-09'),
(5, 2, '2026-04-10'),
(5, 2, '2026-04-12'),
(5, 2, '2026-06-03'),
(6, 2, '2026-04-11'),
(7, 2, '2026-04-09'),
(7, 2, '2026-04-12'),
(7, 2, '2026-06-01'),
(8, 2, '2026-04-06'),
(8, 2, '2026-04-08'),
(8, 2, '2026-04-13'),
(9, 2, '2026-04-06'),
(11, 2, '2026-05-17'),
(12, 2, '2026-06-05'),
(16, 2, '2026-06-02'),
(16, 2, '2026-06-04'),
(16, 2, '2026-07-09'),
(17, 2, '2026-07-05'),
(18, 2, '2026-07-06'),
(1, 3, '2026-04-10'),
(3, 3, '2026-04-09'),
(3, 3, '2026-04-11'),
(3, 3, '2026-05-15'),
(4, 3, '2026-04-08'),
(4, 3, '2026-04-13'),
(5, 3, '2026-04-11'),
(5, 3, '2026-04-12'),
(5, 3, '2026-06-01'),
(6, 3, '2026-04-06'),
(6, 3, '2026-04-07'),
(6, 3, '2026-04-08'),
(6, 3, '2026-04-13'),
(6, 3, '2026-04-22'),
(6, 3, '2026-06-03'),
(7, 3, '2026-04-06'),
(7, 3, '2026-04-07'),
(7, 3, '2026-06-05'),
(9, 3, '2026-04-09'),
(11, 3, '2026-04-09'),
(11, 3, '2026-04-10'),
(11, 3, '2026-04-12'),
(11, 3, '2026-06-03'),
(12, 3, '2026-05-17'),
(16, 3, '2026-06-04'),
(17, 3, '2026-07-05'),
(18, 3, '2026-07-06');

-- --------------------------------------------------------

--
-- Table structure for table `phancong_linh_hoat`
--

DROP TABLE IF EXISTS `phancong_linh_hoat`;
CREATE TABLE IF NOT EXISTS `phancong_linh_hoat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_nhan_vien` int NOT NULL,
  `ngay` date NOT NULL,
  `gio_bat_dau` time NOT NULL,
  `gio_ket_thuc` time NOT NULL,
  `ghi_chu` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pclh_nv_ngay` (`ma_nhan_vien`,`ngay`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `phancong_linh_hoat`
--

INSERT INTO `phancong_linh_hoat` (`id`, `ma_nhan_vien`, `ngay`, `gio_bat_dau`, `gio_ket_thuc`, `ghi_chu`, `created_at`) VALUES
(3, 16, '2026-07-12', '17:00:00', '21:00:00', 'zxc', '2026-07-13 07:58:21'),
(5, 16, '2026-07-13', '16:00:00', '20:00:00', 'abc', '2026-07-13 08:03:14');

-- --------------------------------------------------------

--
-- Table structure for table `phieunhap`
--

DROP TABLE IF EXISTS `phieunhap`;
CREATE TABLE IF NOT EXISTS `phieunhap` (
  `ma_phieu` int NOT NULL AUTO_INCREMENT,
  `ngay_nhap` datetime DEFAULT CURRENT_TIMESTAMP,
  `nha_cung_cap` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Đại lý tự do',
  `tong_tien` decimal(12,2) NOT NULL DEFAULT '0.00',
  `ghi_chu` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `da_thanh_toan` tinyint(1) NOT NULL DEFAULT '0',
  `ngay_thanh_toan` datetime DEFAULT NULL,
  `so_tien_da_tra` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`ma_phieu`),
  KEY `idx_pn_ngay_nhap` (`ngay_nhap`),
  KEY `idx_pn_da_thanh_toan` (`da_thanh_toan`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `phieunhap`
--

INSERT INTO `phieunhap` (`ma_phieu`, `ngay_nhap`, `nha_cung_cap`, `tong_tien`, `ghi_chu`, `da_thanh_toan`, `ngay_thanh_toan`, `so_tien_da_tra`) VALUES
(1, '2026-07-06 17:00:00', 'A', 400000.00, 'Nhập kho hệ thống', 0, '2026-07-07 18:59:45', 200000.00),
(2, '2026-07-06 17:00:00', 'B', 20000.00, 'Nhập kho hệ thống', 0, NULL, 0.00),
(3, '2026-07-06 17:00:00', 'C', 600000.00, 'Nhập kho hệ thống', 0, NULL, 0.00),
(4, '2026-07-06 17:00:00', 'G', 450000.00, 'ABCD', 0, NULL, 0.00),
(5, '2026-07-06 17:00:00', 'H', 40000.00, 'A', 0, NULL, 0.00),
(6, '2026-07-07 17:00:00', 'Đại lý tự do', 100000.00, 'Nhập kho hệ thống', 0, NULL, 0.00),
(7, '2026-07-08 17:00:00', 'ABC', 80000.00, 'Nhập kho hệ thống', 0, '2026-07-08 17:10:15', 50000.00),
(8, '2026-07-08 17:00:00', 'A', 100000.00, 'Nhập kho hệ thống', 0, NULL, 0.00),
(9, '2026-07-08 17:00:00', 'Q', 50000.00, 'Nhập kho hệ thống', 1, '2026-07-08 17:10:03', 50000.00);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `mon`
--
ALTER TABLE `mon`
  ADD CONSTRAINT `fk_mon_danhmucmon` FOREIGN KEY (`ma_danh_muc`) REFERENCES `danhmucmon` (`ma_danh_muc`) ON DELETE SET NULL;

--
-- Constraints for table `nhanvien_luong`
--
ALTER TABLE `nhanvien_luong`
  ADD CONSTRAINT `fk_nv_luong_nv` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhanvien` (`ma_nhan_vien`) ON DELETE CASCADE;

--
-- Constraints for table `phancong`
--
ALTER TABLE `phancong`
  ADD CONSTRAINT `fk_pc_calam` FOREIGN KEY (`ma_ca`) REFERENCES `calam` (`ma_ca`) ON DELETE CASCADE;

--
-- Constraints for table `phancong_linh_hoat`
--
ALTER TABLE `phancong_linh_hoat`
  ADD CONSTRAINT `fk_pclh_nv` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhanvien` (`ma_nhan_vien`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
