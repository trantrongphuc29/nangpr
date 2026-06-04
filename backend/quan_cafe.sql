-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 04, 2026 at 04:27 PM
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
  `ten_ban` varchar(50) DEFAULT NULL,
  `trang_thai` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ma_ban`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `ban`
--

INSERT INTO `ban` (`ma_ban`, `ten_ban`, `trang_thai`) VALUES
(1, 'Bàn 1', NULL),
(2, 'Bàn 2', NULL),
(3, 'Bàn 3', NULL),
(8, 'bàn 5', NULL),
(9, 'bàn 4', NULL);

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
  `ma_ca` int NOT NULL,
  `ten_ca` varchar(50) NOT NULL,
  `thoi_gian_ca` varchar(20) NOT NULL,
  `so_gio` decimal(4,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bcc` (`ky_luong_id`,`ma_nhan_vien`,`ngay`,`ma_ca`),
  KEY `idx_bcc_nv` (`ma_nhan_vien`,`ky_luong_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1416 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bang_cong_chi_tiet`
--

INSERT INTO `bang_cong_chi_tiet` (`id`, `ky_luong_id`, `ma_nhan_vien`, `ngay`, `ma_ca`, `ten_ca`, `thoi_gian_ca`, `so_gio`, `created_at`) VALUES
(813, 146, 3, '2026-05-12', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(814, 146, 3, '2026-05-13', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(815, 146, 3, '2026-05-14', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(816, 146, 3, '2026-05-15', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(817, 146, 3, '2026-05-15', 2, 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-04 21:44:57'),
(818, 146, 3, '2026-05-15', 3, 'Ca Tối', '18:00-23:00', 5.00, '2026-06-04 21:44:57'),
(819, 146, 4, '2026-05-16', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(820, 146, 5, '2026-05-13', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(821, 146, 5, '2026-05-16', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(822, 146, 7, '2026-05-16', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(823, 146, 12, '2026-05-17', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(824, 146, 12, '2026-05-17', 3, 'Ca Tối', '18:00-23:00', 5.00, '2026-06-04 21:44:57'),
(825, 146, 14, '2026-05-18', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 21:44:57'),
(1409, 1, 3, '2026-06-01', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 23:27:12'),
(1410, 1, 6, '2026-06-01', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 23:27:12'),
(1411, 1, 16, '2026-06-02', 1, 'Ca Sáng', '06:00-12:00', 6.00, '2026-06-04 23:27:12'),
(1412, 1, 4, '2026-06-01', 2, 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-04 23:27:12'),
(1413, 1, 7, '2026-06-01', 2, 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-04 23:27:12'),
(1414, 1, 16, '2026-06-02', 2, 'Ca Chiều', '12:00-18:00', 6.00, '2026-06-04 23:27:12'),
(1415, 1, 5, '2026-06-01', 3, 'Ca Tối', '18:00-23:00', 5.00, '2026-06-04 23:27:12');

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

INSERT INTO `bang_cong_thang` (`ky_luong_id`, `ma_nhan_vien`, `so_ca_sang`, `so_ca_chieu`, `so_ca_toi`, `tong_ca`, `tong_gio`, `last_recalc_at`) VALUES
(1, 3, 1, 0, 0, 1, 6.00, '2026-06-04 23:27:12'),
(1, 4, 0, 1, 0, 1, 6.00, '2026-06-04 23:27:12'),
(1, 5, 0, 0, 1, 1, 5.00, '2026-06-04 23:27:12'),
(1, 6, 1, 0, 0, 1, 6.00, '2026-06-04 23:27:12'),
(1, 7, 0, 1, 0, 1, 6.00, '2026-06-04 23:27:12'),
(1, 16, 1, 1, 0, 2, 12.00, '2026-06-04 23:27:12'),
(146, 3, 4, 1, 1, 6, 35.00, '2026-06-04 21:44:57'),
(146, 4, 1, 0, 0, 1, 6.00, '2026-06-04 21:44:57'),
(146, 5, 2, 0, 0, 2, 12.00, '2026-06-04 21:44:57'),
(146, 7, 1, 0, 0, 1, 6.00, '2026-06-04 21:44:57'),
(146, 12, 1, 0, 1, 2, 11.00, '2026-06-04 21:44:57'),
(146, 14, 1, 0, 0, 1, 6.00, '2026-06-04 21:44:57');

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
(1, 3, 1, 6.00, 28000.00, 168000.00, 150000.00, 0.00, 0.00, 0.00, 318000.00, '2026-06-04 22:11:54', '2026-06-02 16:11:51', '2026-06-04 22:11:54'),
(1, 4, 1, 6.00, 30000.00, 180000.00, 200000.00, 0.00, 0.00, 0.00, 380000.00, '2026-06-04 22:11:54', '2026-06-02 16:11:51', '2026-06-04 22:11:54'),
(1, 5, 1, 5.00, 32000.00, 160000.00, 250000.00, 100000.00, 0.00, 0.00, 510000.00, '2026-06-04 22:11:54', '2026-06-02 16:11:51', '2026-06-04 22:11:54'),
(1, 6, 1, 6.00, 35000.00, 210000.00, 250000.00, 0.00, 0.00, 0.00, 460000.00, '2026-06-04 22:11:54', '2026-06-02 16:11:51', '2026-06-04 22:11:54'),
(1, 7, 1, 6.00, 36000.00, 216000.00, 350000.00, 0.00, 0.00, 0.00, 566000.00, '2026-06-04 22:11:54', '2026-06-02 16:11:51', '2026-06-04 22:11:54'),
(1, 16, 2, 12.00, 35000.00, 420000.00, 300000.00, 0.00, 0.00, 0.00, 720000.00, '2026-06-04 22:11:54', '2026-06-04 22:03:51', '2026-06-04 22:11:54'),
(146, 3, 6, 35.00, 28000.00, 980000.00, 150000.00, 0.00, 0.00, 0.00, 1130000.00, '2026-06-04 21:44:57', '2026-06-04 21:44:57', '2026-06-04 21:44:57'),
(146, 4, 1, 6.00, 30000.00, 180000.00, 200000.00, 0.00, 0.00, 0.00, 380000.00, '2026-06-04 21:44:57', '2026-06-04 21:44:57', '2026-06-04 21:44:57'),
(146, 5, 2, 12.00, 32000.00, 384000.00, 250000.00, 0.00, 0.00, 0.00, 634000.00, '2026-06-04 21:44:57', '2026-06-04 21:44:57', '2026-06-04 21:44:57'),
(146, 7, 1, 6.00, 36000.00, 216000.00, 350000.00, 0.00, 0.00, 0.00, 566000.00, '2026-06-04 21:44:57', '2026-06-04 21:44:57', '2026-06-04 21:44:57'),
(146, 12, 2, 11.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-06-04 21:44:57', '2026-06-04 21:44:57', '2026-06-04 21:44:57'),
(146, 14, 1, 6.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-06-04 21:44:57', '2026-06-04 21:44:57', '2026-06-04 21:44:57');

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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `chitiethoadon`
--

DROP TABLE IF EXISTS `chitiethoadon`;
CREATE TABLE IF NOT EXISTS `chitiethoadon` (
  `ma_don_hang` int NOT NULL,
  `ma_mon` int NOT NULL,
  `so_luong` int NOT NULL,
  `ghi_chu_mon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `trang_thai_mon` varchar(50) DEFAULT 'Dang cho',
  `don_gia` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ma_don_hang`,`ma_mon`),
  KEY `ma_mon` (`ma_mon`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chitiet_phieunhap`
--

INSERT INTO `chitiet_phieunhap` (`ma_chi_tiet`, `ma_phieu`, `ma_nguyen_lieu`, `so_luong_nhap`, `gia_nhap`) VALUES
(4, 4, 90, 1.00, 200000.00),
(5, 5, 59, 2.00, 200000.00),
(6, 6, 59, 2.00, 200000.00),
(7, 7, 59, 2.00, 200000.00),
(8, 8, 77, 2.00, 200000.00),
(9, 9, 95, 20.00, 40000.00),
(10, 10, 59, 1.00, 100000.00),
(11, 11, 59, 1000.00, 100000.00),
(12, 12, 59, 1.00, 100000.00),
(13, 13, 57, 1.00, 200000.00),
(14, 14, 57, 1000.00, 200000.00),
(15, 15, 44, 2.00, 10000.00),
(16, 16, 77, 1.00, 10000.00);

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
(1, 'admin', '$2b$10$vQYMu8R3gvu5jNkxrSftVe5Yl.RjfsLNVT91YKR4DfqTBO5aXbzr6', 'admin');

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
(1, 1, 100.00, 'ml'),
(1, 2, 20.00, 'ml'),
(1, 3, 15.00, 'ml'),
(1, 4, 1.00, 'Ly'),
(2, 4, 1.00, 'Ly'),
(2, 5, 100.00, 'ml'),
(2, 6, 30.00, 'ml'),
(2, 7, 2.00, 'Lát'),
(3, 4, 1.00, 'Ly'),
(3, 8, 100.00, 'ml'),
(3, 9, 25.00, 'ml'),
(3, 10, 3.00, 'Quả'),
(4, 4, 1.00, 'Ly'),
(4, 11, 80.00, 'ml'),
(4, 12, 40.00, 'ml'),
(4, 13, 1.00, 'g'),
(5, 4, 1.00, 'Ly'),
(5, 14, 70.00, 'ml'),
(5, 15, 50.00, 'g'),
(5, 16, 10.00, 'ml'),
(6, 4, 1.00, 'Ly'),
(6, 17, 100.00, 'ml'),
(6, 18, 20.00, 'g'),
(6, 19, 2.00, 'Quả'),
(7, 20, 100.00, 'ml'),
(7, 21, 25.00, 'ml'),
(7, 22, 4.00, 'Quả'),
(8, 23, 80.00, 'ml'),
(8, 24, 35.00, 'ml'),
(8, 25, 20.00, 'g'),
(9, 26, 90.00, 'ml'),
(9, 27, 30.00, 'ml'),
(9, 28, 15.00, 'g'),
(10, 4, 1.00, 'Ly'),
(10, 29, 1.00, 'Hũ'),
(10, 30, 30.00, 'ml'),
(10, 31, 15.00, 'ml'),
(11, 32, 30.00, 'ml'),
(11, 33, 80.00, 'g'),
(11, 34, 20.00, 'ml'),
(12, 35, 1.00, 'Hũ'),
(12, 36, 25.00, 'ml'),
(12, 37, 30.00, 'g'),
(13, 38, 80.00, 'g'),
(13, 39, 35.00, 'ml'),
(13, 40, 5.00, 'g'),
(14, 41, 1.00, 'Hũ'),
(14, 42, 20.00, 'g'),
(14, 43, 30.00, 'g'),
(15, 44, 25.00, 'g'),
(15, 45, 80.00, 'ml'),
(16, 46, 25.00, 'g'),
(16, 47, 25.00, 'ml'),
(17, 48, 30.00, 'g'),
(17, 49, 90.00, 'ml'),
(18, 50, 30.00, 'g'),
(18, 51, 30.00, 'ml'),
(19, 52, 40.00, 'ml'),
(19, 53, 30.00, 'ml'),
(20, 54, 120.00, 'ml'),
(20, 55, 40.00, 'ml'),
(20, 56, 15.00, 'ml'),
(21, 57, 20.00, 'g'),
(21, 58, 120.00, 'ml'),
(22, 46, 30.00, 'g'),
(22, 59, 20.00, 'g'),
(22, 60, 30.00, 'ml'),
(23, 61, 1.00, 'Túi'),
(23, 62, 15.00, 'g'),
(24, 63, 150.00, 'ml'),
(24, 64, 20.00, 'ml'),
(25, 65, 150.00, 'ml'),
(25, 66, 25.00, 'ml'),
(26, 67, 150.00, 'ml'),
(26, 68, 20.00, 'ml'),
(27, 69, 150.00, 'ml'),
(27, 70, 15.00, 'ml'),
(28, 71, 120.00, 'ml'),
(28, 72, 35.00, 'ml'),
(29, 73, 120.00, 'ml'),
(29, 74, 25.00, 'g'),
(30, 75, 3.00, 'g'),
(30, 76, 150.00, 'ml'),
(31, 77, 25.00, 'g'),
(31, 78, 120.00, 'ml'),
(32, 82, 20.00, 'ml'),
(33, 82, 20.00, 'ml'),
(33, 83, 30.00, 'g'),
(33, 84, 120.00, 'ml'),
(34, 85, 40.00, 'g'),
(34, 86, 20.00, 'ml'),
(34, 87, 120.00, 'ml'),
(35, 88, 1.00, 'Lon'),
(36, 89, 1.00, 'Lon'),
(37, 90, 1.00, 'Chai'),
(38, 91, 1.00, 'Lon'),
(39, 92, 1.00, 'Lon'),
(40, 93, 1.00, 'Lon'),
(41, 94, 1.00, 'Chai');

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
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `trang_thai_don` varchar(50) DEFAULT NULL,
  `trang_thai_thanh_toan` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ma_don_hang`),
  KEY `ma_ban` (`ma_ban`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
) ENGINE=InnoDB AUTO_INCREMENT=240 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ky_luong`
--

INSERT INTO `ky_luong` (`id`, `thang`, `nam`, `trang_thai`, `chot_luc`, `created_at`, `updated_at`) VALUES
(1, 6, 2026, 'chua_chot', '2026-06-04 21:44:37', '2026-06-02 14:23:43', '2026-06-04 21:46:33'),
(146, 5, 2026, 'chua_chot', NULL, '2026-06-04 21:44:57', '2026-06-04 21:44:57');

-- --------------------------------------------------------

--
-- Table structure for table `lichsunhap`
--

DROP TABLE IF EXISTS `lichsunhap`;
CREATE TABLE IF NOT EXISTS `lichsunhap` (
  `ma_phieu_nhap` int NOT NULL,
  `ma_nguyen_lieu` int NOT NULL,
  `so_luong_nhap` decimal(10,2) NOT NULL,
  `don_gia_nhap` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ma_phieu_nhap`,`ma_nguyen_lieu`),
  KEY `ma_nguyen_lieu` (`ma_nguyen_lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Triggers `lichsunhap`
--
DROP TRIGGER IF EXISTS `trg_update_stock_after_insert`;
DELIMITER $$
CREATE TRIGGER `trg_update_stock_after_insert` AFTER INSERT ON `lichsunhap` FOR EACH ROW BEGIN
    UPDATE NguyenLieu
    SET so_luong_ton = so_luong_ton + NEW.so_luong_nhap
    WHERE ma_nguyen_lieu = NEW.ma_nguyen_lieu;
END
$$
DELIMITER ;

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
  `hinh_anh` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai_ban` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: Đang bán, 0: Tạm ngưng',
  PRIMARY KEY (`ma_mon`),
  KEY `fk_mon_danhmucmon` (`ma_danh_muc`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mon`
--

INSERT INTO `mon` (`ma_mon`, `ma_danh_muc`, `ten_mon`, `gia_ban`, `hinh_anh`, `trang_thai_ban`) VALUES
(1, 3, 'Trà Chanh', 25000.00, NULL, 1),
(2, 3, 'Trà Đào', 28000.00, NULL, 1),
(3, 3, 'Trà Vải', 28000.00, NULL, 1),
(4, 3, 'Trà Ổi', 28000.00, NULL, 1),
(5, 3, 'Trà Mãng Cầu', 30000.00, NULL, 1),
(6, 3, 'Trà Dâu Tây', 30000.00, NULL, 1),
(7, 3, 'Trà Nhãn', 30000.00, NULL, 1),
(8, 3, 'Trà Xoài', 30000.00, NULL, 1),
(9, 3, 'Trà Dâu Tằm', 30000.00, NULL, 1),
(10, 4, 'Sữa chua Đá', 25000.00, NULL, 1),
(11, 4, 'Sữa chua Cafe', 28000.00, NULL, 1),
(12, 4, 'Sữa chua Dâu', 28000.00, NULL, 1),
(13, 4, 'Sữa chua Dưa lưới', 30000.00, NULL, 1),
(14, 4, 'Sữa chua Đác Thơm', 32000.00, NULL, 1),
(15, 1, 'Cafe Đen', 18000.00, NULL, 1),
(16, 1, 'Cafe Sữa', 22000.00, NULL, 1),
(17, 1, 'Cafe Đen nguyên chất', 20000.00, NULL, 1),
(18, 1, 'Cafe Sữa nguyên chất', 25000.00, NULL, 1),
(19, 1, 'Cafe Muối Nắng', 28000.00, NULL, 1),
(20, 1, 'Bạc Xỉu Nắng', 26000.00, NULL, 1),
(21, 1, 'Cacao (Nóng/Đá)', 25000.00, NULL, 1),
(22, 1, 'Cacao Muối', 28000.00, NULL, 1),
(23, 1, 'Trà Lipton', 20000.00, NULL, 1),
(24, 2, 'Soda Biển Xanh', 25000.00, NULL, 1),
(25, 2, 'Soda Dâu', 25000.00, NULL, 1),
(26, 2, 'Soda Việt Quất', 25000.00, NULL, 1),
(27, 2, 'Soda Bạc Hà', 25000.00, NULL, 1),
(28, 5, 'Latte Dâu', 32000.00, NULL, 1),
(29, 5, 'Latte Việt Quất', 32000.00, NULL, 1),
(30, 5, 'Latte Matcha', 32000.00, NULL, 1),
(31, 5, 'Latte Khoai môn', 32000.00, NULL, 1),
(32, 5, 'Cacao Matcha Latte', 35000.00, NULL, 1),
(33, 5, 'Sữa tươi socola đường đen', 30000.00, NULL, 1),
(34, 5, 'Sữa tươi trân châu đường đen', 30000.00, NULL, 1),
(35, 6, 'Yến', 15000.00, NULL, 1),
(36, 6, 'Bò húc', 18000.00, NULL, 1),
(37, 6, 'Trà xanh', 15000.00, NULL, 1),
(38, 6, 'Coca Cola', 15000.00, NULL, 1),
(39, 6, 'Sting', 15000.00, NULL, 1),
(40, 6, 'Revive', 15000.00, NULL, 1),
(41, 6, 'Bí đao', 15000.00, NULL, 1);

--
-- Triggers `mon`
--
DROP TRIGGER IF EXISTS `trg_auto_create_formula_for_packaged_drinks`;
DELIMITER $$
CREATE TRIGGER `trg_auto_create_formula_for_packaged_drinks` AFTER INSERT ON `mon` FOR EACH ROW BEGIN
    DECLARE v_ma_nguyen_lieu INT;
    DECLARE v_ten_danh_muc VARCHAR(100);

    -- 1. Lấy tên danh mục của món mới chèn vào để nhận diện
    SELECT ten_danh_muc INTO v_ten_danh_muc 
    FROM danhmucmon 
    WHERE ma_danh_muc = NEW.ma_danh_muc;

    -- 2. Nếu món này thuộc danh mục 'Nước Ngọt' hoặc 'Soda' (Đồ đóng lon)
    IF v_ten_danh_muc LIKE '%Nước Ngọt%' OR v_ten_danh_muc LIKE '%Soda%' THEN
        
        -- Tìm kiếm nguyên liệu trong kho có tên giống hoặc gần giống với tên món
        SELECT ma_nguyen_lieu INTO v_ma_nguyen_lieu
        FROM nguyenlieu
        WHERE LOWER(ten_nguyen_lieu) LIKE CONCAT('%', LOWER(NEW.ten_mon), '%')
        LIMIT 1;

        -- 3. Nếu tìm thấy nguyên liệu khớp tên (Ví dụ: Món 'Coca Cola' khớp với Nguyên liệu 'Coca Cola')
        IF v_ma_nguyen_lieu IS NOT NULL THEN
            -- Tự động chèn công thức tiêu hao: Định lượng = 1 (tức là 1 lon/1 chai)
            INSERT INTO congthuc (ma_mon, ma_nguyen_lieu, dinh_luong, don_vi_tinh_chi_tiet)
            VALUES (NEW.ma_mon, v_ma_nguyen_lieu, 1.00, 'ml');
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
  `don_vi_dong_goi` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dung_tich_san_pham` decimal(10,2) NOT NULL DEFAULT '1.00',
  `ml_thuc_te_ton` decimal(10,2) NOT NULL DEFAULT '0.00',
  `nguong_canh_bao` decimal(10,2) NOT NULL DEFAULT '1000.00',
  `ghi_chu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `trang_thai` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=đang dùng, 0=ngưng',
  PRIMARY KEY (`ma_nguyen_lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nguyenlieu`
--

INSERT INTO `nguyenlieu` (`ma_nguyen_lieu`, `ten_nguyen_lieu`, `danh_muc`, `don_vi_tinh`, `don_vi_nhap`, `don_vi_dong_goi`, `dung_tich_san_pham`, `ml_thuc_te_ton`, `nguong_canh_bao`, `ghi_chu`, `trang_thai`) VALUES
(1, 'Trà đen', 'Khác', 'g', 'kg', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(2, 'Chanh tươi', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(3, 'Syrup đường', 'Khác', 'g', 'chai', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(4, 'Đá viên', 'Khác', 'g', 'kg', NULL, 1.00, 50000.00, 1000.00, NULL, 1),
(5, 'Trà lài', 'Khác', 'g', 'kg', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(6, 'Syrup đào', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(7, 'Đào ngâm', 'Khác', 'g', 'hộp', NULL, 1.00, 2000.00, 1000.00, NULL, 1),
(8, 'Trà nhài', 'Khác', 'g', 'kg', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(9, 'Syrup vải', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(10, 'Trái vải ngâm', 'Khác', 'g', 'hộp', NULL, 1.00, 2000.00, 1000.00, NULL, 1),
(11, 'Trà xanh', 'Khác', 'g', 'kg', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(12, 'Nước ép ổi', 'Khác', 'g', 'chai', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(13, 'Muối hồng', 'Khác', 'g', 'kg', NULL, 1.00, 1000.00, 1000.00, NULL, 1),
(14, 'Trà ô long', 'Khác', 'g', 'kg', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(15, 'Mãng cầu xay', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(16, 'Sữa đặc', 'Khác', 'g', 'lon', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(17, 'Trà hibiscus', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(18, 'Mứt dâu', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(19, 'Dâu tươi', 'Khác', 'g', 'kg', NULL, 1.00, 2000.00, 1000.00, NULL, 1),
(20, 'Trà bá tước', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(21, 'Syrup nhãn', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(22, 'Nhãn ngâm', 'Khác', 'g', 'hộp', NULL, 1.00, 2000.00, 1000.00, NULL, 1),
(23, 'Trà sen', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(24, 'Puree xoài', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(25, 'Xoài cắt hạt', 'Khác', 'g', 'kg', NULL, 1.00, 2000.00, 1000.00, NULL, 1),
(26, 'Trà đen lạnh', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(27, 'Syrup dâu tằm', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(28, 'Dâu tằm ngâm', 'Khác', 'g', 'hộp', NULL, 1.00, 2000.00, 1000.00, NULL, 1),
(29, 'Sữa chua cái', 'Khác', 'g', 'hũ', NULL, 1.00, 50.00, 1000.00, NULL, 1),
(30, 'Sữa tươi', 'Khác', 'g', 'hộp', NULL, 1.00, 20000.00, 1000.00, NULL, 1),
(31, 'Đường nước', 'Khác', 'g', 'chai', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(32, 'Cafe espresso', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(33, 'Sữa chua Hy Lạp', 'Khác', 'g', 'hũ', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(34, 'Sữa béo', 'Khác', 'g', 'hộp', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(35, 'Sữa chua không đường', 'Khác', 'g', 'hũ', NULL, 1.00, 50.00, 1000.00, NULL, 1),
(36, 'Syrup dâu đỏ', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(37, 'Dâu đông lạnh', 'Khác', 'g', 'kg', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(38, 'Sữa chua lên men', 'Khác', 'g', 'hũ', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(39, 'Puree dưa lưới', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(40, 'Hạt chia', 'Khác', 'g', 'kg', NULL, 1.00, 1000.00, 1000.00, NULL, 1),
(41, 'Sữa chua vinamilk', 'Khác', 'g', 'hũ', NULL, 1.00, 50.00, 1000.00, NULL, 1),
(42, 'Hạt đác', 'Khác', 'g', 'kg', NULL, 1.00, 2000.00, 1000.00, NULL, 1),
(43, 'Thơm vàng', 'Khác', 'g', 'kg', NULL, 1.00, 2000.00, 1000.00, NULL, 1),
(44, 'Bột cafe robusta', 'Khác', 'g', 'kg', NULL, 1.00, 5002.00, 1000.00, NULL, 1),
(45, 'Nước nóng', 'Khác', 'g', 'ml', NULL, 1.00, 100000.00, 1000.00, NULL, 1),
(46, 'Cafe arabica', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(47, 'Sữa đặc ông thọ', 'Khác', 'g', 'lon', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(48, 'Cafe mộc nguyên chất', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(49, 'Nước tinh khiết', 'Khác', 'g', 'ml', NULL, 1.00, 100000.00, 1000.00, NULL, 1),
(50, 'Cafe rang medium', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(51, 'Kem sữa', 'Khác', 'g', 'chai', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(52, 'Cafe pha phin', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(53, 'Kem muối', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(54, 'Sữa tươi không đường', 'Khác', 'g', 'hộp', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(55, 'Foam sữa', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(56, 'Cafe shot', 'Khác', 'g', 'ml', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(57, 'Bột cacao nguyên chất', 'Khác', 'g', 'kg', NULL, 1.00, 4001.00, 1000.00, NULL, 1),
(58, 'Sữa nóng', 'Khác', 'g', 'ml', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(59, 'Bột cacao dark', 'Khác', 'g', 'gói', 'gói 1000g', 1000.00, 1004007.00, 1000.00, NULL, 1),
(60, 'Kem cheese mặn', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(61, 'Trà Lipton túi lọc', 'Khác', 'g', 'túi', NULL, 1.00, 200.00, 1000.00, NULL, 1),
(62, 'Đường vàng', 'Khác', 'g', 'kg', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(63, 'Soda Schweppes', 'Khác', 'g', 'lon', NULL, 1.00, 20000.00, 1000.00, NULL, 1),
(64, 'Syrup blue curacao', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(65, 'Soda lạnh', 'Khác', 'g', 'lon', NULL, 1.00, 20000.00, 1000.00, NULL, 1),
(66, 'Syrup strawberry', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(67, 'Soda tonic', 'Khác', 'g', 'lon', NULL, 1.00, 20000.00, 1000.00, NULL, 1),
(68, 'Syrup blueberry', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(69, 'Sparkling water', 'Khác', 'g', 'lon', NULL, 1.00, 20000.00, 1000.00, NULL, 1),
(70, 'Syrup mint', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(71, 'Sữa tươi Anchor', 'Khác', 'g', 'hộp', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(72, 'Puree dâu handmade', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(73, 'Sữa hạnh nhân', 'Khác', 'g', 'hộp', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(74, 'Mứt việt quất', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(75, 'Bột matcha Nhật', 'Khác', 'g', 'kg', NULL, 1.00, 2000.00, 1000.00, NULL, 1),
(76, 'Sữa kem béo', 'Khác', 'g', 'hộp', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(77, 'Bột khoai môn', 'Khác', 'g', 'kg', NULL, 1.00, 2003.00, 1000.00, NULL, 1),
(78, 'Sữa béo thực vật', 'Khác', 'g', 'hộp', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(79, 'Matcha ceremonial', 'Khác', 'g', 'kg', NULL, 1.00, 2000.00, 1000.00, NULL, 1),
(80, 'Cacao trắng', 'Khác', 'g', 'kg', NULL, 1.00, 2000.00, 1000.00, NULL, 1),
(81, 'Sữa yến mạch', 'Khác', 'g', 'hộp', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(82, 'Socola syrup', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(83, 'Trân châu đường đen', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(84, 'Sữa thanh trùng', 'Khác', 'g', 'hộp', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(85, 'Trân châu hoàng kim', 'Khác', 'g', 'kg', NULL, 1.00, 5000.00, 1000.00, NULL, 1),
(86, 'Đường đen Hàn Quốc', 'Khác', 'g', 'chai', NULL, 1.00, 3000.00, 1000.00, NULL, 1),
(87, 'Sữa fresh milk', 'Khác', 'g', 'hộp', NULL, 1.00, 10000.00, 1000.00, NULL, 1),
(88, 'Nước yến đóng lon', 'Khác', 'g', 'lon', NULL, 1.00, 100.00, 1000.00, NULL, 1),
(89, 'Lon Red Bull', 'Khác', 'g', 'lon', NULL, 1.00, 100.00, 1000.00, NULL, 1),
(90, 'Chai trà xanh đóng chai', 'Khác', 'g', 'chai', NULL, 1.00, 101.00, 100.00, NULL, 1),
(91, 'Lon Coca Cola', 'Khác', 'g', 'lon', NULL, 1.00, 100.00, 1000.00, NULL, 1),
(92, 'Sting dâu', 'Khác', 'g', 'lon', NULL, 1.00, 100.00, 1000.00, NULL, 1),
(93, 'Revive muối khoáng', 'Khác', 'g', 'lon', NULL, 1.00, 100.00, 1000.00, NULL, 1),
(94, 'Nước bí đao đóng chai', 'Khác', 'g', 'chai', NULL, 1.00, 100.00, 1000.00, NULL, 1),
(95, 'trà atiso', 'Khác', 'kg', 'gói', NULL, 1000.00, 20000.00, 500.00, NULL, 1),
(96, 'Test NL', 'Khác', 'g', 'chai', NULL, 750.00, 0.00, 500.00, NULL, 1),
(97, 'Test DM 2', 'Khác', 'g', 'chai', NULL, 750.00, 0.00, 500.00, NULL, 1),
(98, 'Direct Repo Test', 'Sữa & Kem', 'ml', 'chai', 'chai 750ml', 750.00, 0.00, 500.00, 'note', 1),
(99, 'Service Test', 'Cà phê & Trà', 'ml', 'lon', 'lon 330ml', 330.00, 0.00, 1000.00, NULL, 1),
(102, 'Trà đỏ', 'Khác', 'g', 'kg', NULL, 1000.00, 0.00, 500.00, NULL, 1);

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
  `trang_thai` enum('dang_lam','tam_nghi','da_nghi') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dang_lam' COMMENT 'Trạng thái làm việc',
  PRIMARY KEY (`ma_nhan_vien`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nhanvien`
--

INSERT INTO `nhanvien` (`ma_nhan_vien`, `ten`, `ngay_sinh`, `so_dien_thoai`, `dia_chi`, `trang_thai`) VALUES
(3, 'Đào Văn Nguyên', '2026-03-28', '123456', '12a', 'dang_lam'),
(4, 'Trần Văn Hải', '2026-03-28', '020023210', '21a', 'dang_lam'),
(5, 'Đặng Ngọc Lam', '2026-03-22', '12121212', '224a', 'dang_lam'),
(6, 'Nguyễn Chí Thanh', '2026-04-01', '232442234', '444f', 'dang_lam'),
(7, 'Lê Hoàng Long', '2026-03-29', '12121212', '23d', 'dang_lam'),
(11, 'Nguyên Thị Duyên', '2000-02-01', '44343422', '12ww', 'tam_nghi'),
(12, 'Lê Trọng Khiêm', '2003-02-02', '23232232', '121e', 'dang_lam'),
(14, 'Lê Văn Cam', '1999-11-12', '121212121', '12ww', 'dang_lam'),
(15, 'Lê Văn H', '1999-02-02', '1212121', '12g', 'dang_lam'),
(16, 'Trần Trọng Phúc', '2004-06-29', '0929459371', 'Cao Lỗ', 'dang_lam');

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
(3, 28000.00, 150000.00, 'dang_lam', '2026-06-02 15:22:23', '2026-06-02 15:22:23'),
(4, 30000.00, 200000.00, 'dang_lam', '2026-06-02 15:22:23', '2026-06-02 15:22:23'),
(5, 32000.00, 250000.00, 'dang_lam', '2026-06-02 15:22:23', '2026-06-02 15:22:23'),
(6, 35000.00, 250000.00, 'dang_lam', '2026-06-02 15:22:23', '2026-06-04 21:26:18'),
(7, 36000.00, 350000.00, 'dang_lam', '2026-06-02 15:22:24', '2026-06-02 15:22:24'),
(12, 0.00, 0.00, 'dang_lam', '2026-06-04 21:17:53', '2026-06-04 21:17:53'),
(14, 0.00, 0.00, 'dang_lam', '2026-06-04 21:17:53', '2026-06-04 21:17:53'),
(15, 0.00, 0.00, 'dang_lam', '2026-06-04 21:17:53', '2026-06-04 21:17:53'),
(16, 35000.00, 300000.00, 'dang_lam', '2026-06-04 21:17:53', '2026-06-04 22:38:50');

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
(1, 2, '2026-04-13'),
(1, 2, '2026-05-14'),
(3, 2, '2026-04-06'),
(3, 2, '2026-04-11'),
(3, 2, '2026-04-22'),
(3, 2, '2026-05-15'),
(4, 2, '2026-04-07'),
(4, 2, '2026-04-10'),
(4, 2, '2026-06-01'),
(5, 2, '2026-04-07'),
(5, 2, '2026-04-08'),
(5, 2, '2026-04-09'),
(5, 2, '2026-04-10'),
(5, 2, '2026-04-12'),
(6, 2, '2026-04-11'),
(7, 2, '2026-04-09'),
(7, 2, '2026-04-12'),
(7, 2, '2026-06-01'),
(8, 2, '2026-04-06'),
(8, 2, '2026-04-08'),
(8, 2, '2026-04-13'),
(9, 2, '2026-04-06'),
(11, 2, '2026-05-17'),
(16, 2, '2026-06-02'),
(16, 2, '2026-06-04'),
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
(7, 3, '2026-04-06'),
(7, 3, '2026-04-07'),
(9, 3, '2026-04-09'),
(11, 3, '2026-04-09'),
(11, 3, '2026-04-10'),
(11, 3, '2026-04-12'),
(12, 3, '2026-05-17'),
(16, 3, '2026-06-04');

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
  PRIMARY KEY (`ma_phieu`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `phieunhap`
--

INSERT INTO `phieunhap` (`ma_phieu`, `ngay_nhap`, `nha_cung_cap`, `tong_tien`, `ghi_chu`) VALUES
(1, '2026-05-16 21:10:33', 'ACH', 500000.00, 'Nhập kho hệ thống'),
(2, '2026-05-16 21:15:10', 'a', 120000.00, 'Nhập kho hệ thống'),
(3, '2026-05-16 21:25:38', 'CH', 100000.00, 'Nhập kho hệ thống'),
(4, '2026-05-17 15:07:51', 'A', 200000.00, 'Nhập kho hệ thống'),
(5, '2026-05-17 15:26:50', 'ACX', 400000.00, 'Nhập kho hệ thống'),
(6, '2026-05-17 15:27:46', 'a', 400000.00, 'Nhập kho hệ thống'),
(7, '2026-05-17 15:29:03', 'a', 400000.00, 'Nhập kho hệ thống'),
(8, '2026-05-17 15:30:50', 'q', 400000.00, 'Nhập kho hệ thống'),
(9, '2026-05-19 00:00:00', 'TEA', 800000.00, 'Nhập kho hệ thống'),
(10, '2026-05-19 00:00:00', 'A', 100000.00, 'Nhập kho hệ thống'),
(11, '2026-05-19 00:00:00', 'A', 100000000.00, 'Nhập kho hệ thống'),
(12, '2026-05-19 00:00:00', 'Đại lý tự do', 100000.00, 'Nhập kho hệ thống'),
(13, '2026-05-19 00:00:00', 'Đại lý tự do', 200000.00, 'Nhập kho hệ thống'),
(14, '2026-05-19 00:00:00', 'Đại lý tự do', 200000000.00, 'Nhập kho hệ thống'),
(15, '2026-05-19 00:00:00', 'Đại lý tự do', 20000.00, 'Nhập kho hệ thống'),
(16, '2026-05-19 00:00:00', 'AD', 10000.00, 'Nhập kho hệ thống');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bang_cong_chi_tiet`
--
ALTER TABLE `bang_cong_chi_tiet`
  ADD CONSTRAINT `fk_bcc_ky` FOREIGN KEY (`ky_luong_id`) REFERENCES `ky_luong` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bcc_nv` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhanvien` (`ma_nhan_vien`) ON DELETE CASCADE;

--
-- Constraints for table `bang_cong_thang`
--
ALTER TABLE `bang_cong_thang`
  ADD CONSTRAINT `fk_bc_ky` FOREIGN KEY (`ky_luong_id`) REFERENCES `ky_luong` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bc_nv` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhanvien` (`ma_nhan_vien`) ON DELETE CASCADE;

--
-- Constraints for table `bang_luong_thang`
--
ALTER TABLE `bang_luong_thang`
  ADD CONSTRAINT `fk_bl_ky` FOREIGN KEY (`ky_luong_id`) REFERENCES `ky_luong` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bl_nv` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhanvien` (`ma_nhan_vien`) ON DELETE CASCADE;

--
-- Constraints for table `chitiet_phieunhap`
--
ALTER TABLE `chitiet_phieunhap`
  ADD CONSTRAINT `fk_ctpn_nguyenlieu` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyenlieu` (`ma_nguyen_lieu`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ctpn_phieu` FOREIGN KEY (`ma_phieu`) REFERENCES `phieunhap` (`ma_phieu`) ON DELETE CASCADE;

--
-- Constraints for table `congthuc`
--
ALTER TABLE `congthuc`
  ADD CONSTRAINT `fk_congthuc_mon` FOREIGN KEY (`ma_mon`) REFERENCES `mon` (`ma_mon`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_congthuc_nguyenlieu` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyenlieu` (`ma_nguyen_lieu`) ON DELETE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
