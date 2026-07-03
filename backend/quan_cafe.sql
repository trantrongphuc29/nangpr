-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 03, 2026 at 03:26 PM
-- Server version: 5.7.31
-- PHP Version: 7.3.21

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
  `ma_ban` int(11) NOT NULL AUTO_INCREMENT,
  `ten_ban` varchar(50) DEFAULT NULL,
  `trang_thai` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ma_ban`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `ban`
--

INSERT INTO `ban` (`ma_ban`, `ten_ban`, `trang_thai`) VALUES
(1, 'Bàn 1', 'Trong'),
(2, 'Bàn 2', 'Trong'),
(3, 'Bàn 3', 'Trong'),
(8, 'bàn 5', 'Trong'),
(9, 'bàn 4', 'Trong'),
(10, 'Bàn 6', 'Trong'),
(11, 'Bàn 7', 'Trong'),
(12, 'Bàn 8', 'Trong'),
(13, 'Bàn 9', 'Trong'),
(14, 'Bàn 10', 'Trong'),
(15, 'Bàn 11', 'Trong'),
(16, 'Bàn 12', 'Trong'),
(17, 'Bàn 13', 'Trong'),
(18, 'Bàn 15', 'Trong'),
(19, 'Bàn 14', 'Trong'),
(20, 'Bàn 16', 'Trong'),
(21, 'Bàn 17', 'Trong'),
(22, 'Bàn 18', 'Trong'),
(23, 'bàn 19', 'Trong'),
(24, 'bàn 20', 'Trong'),
(25, 'bàn 21', 'Trong'),
(26, 'Bàn 22', 'Trong'),
(27, 'bàn 23', 'Trong'),
(28, 'bàn 24', 'Trong'),
(29, 'bàn 25', 'Trong'),
(30, 'bàn 26', 'Trong'),
(31, 'bàn 27', 'Trong'),
(32, 'bàn 28', 'Trong'),
(33, 'bàn 29', 'Trong'),
(34, 'bàn 30', 'Trong'),
(35, 'bàn 32', 'Trong'),
(36, 'bàn 31', 'Trong'),
(37, 'bàn 33', 'Trong'),
(38, 'bàn 34', 'Trong'),
(39, 'bàn 35', 'Trong');

-- --------------------------------------------------------

--
-- Table structure for table `bang_cong_chi_tiet`
--

DROP TABLE IF EXISTS `bang_cong_chi_tiet`;
CREATE TABLE IF NOT EXISTS `bang_cong_chi_tiet` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ky_luong_id` int(11) NOT NULL,
  `ma_nhan_vien` int(11) NOT NULL,
  `ngay` date NOT NULL,
  `ma_ca` int(11) NOT NULL,
  `ten_ca` varchar(50) NOT NULL,
  `thoi_gian_ca` varchar(20) NOT NULL,
  `so_gio` decimal(4,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bcc` (`ky_luong_id`,`ma_nhan_vien`,`ngay`,`ma_ca`),
  KEY `idx_bcc_nv` (`ma_nhan_vien`,`ky_luong_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4269 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `bang_cong_chi_tiet`
--

INSERT INTO `bang_cong_chi_tiet` (`id`, `ky_luong_id`, `ma_nhan_vien`, `ngay`, `ma_ca`, `ten_ca`, `thoi_gian_ca`, `so_gio`, `created_at`) VALUES
(813, 146, 3, '2026-05-12', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-04 21:44:57'),
(814, 146, 3, '2026-05-13', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-04 21:44:57'),
(815, 146, 3, '2026-05-14', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-04 21:44:57'),
(816, 146, 3, '2026-05-15', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-04 21:44:57'),
(817, 146, 3, '2026-05-15', 2, 'Ca Chiều', '12:00-18:00', '6.00', '2026-06-04 21:44:57'),
(818, 146, 3, '2026-05-15', 3, 'Ca Tối', '18:00-23:00', '5.00', '2026-06-04 21:44:57'),
(819, 146, 4, '2026-05-16', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-04 21:44:57'),
(820, 146, 5, '2026-05-13', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-04 21:44:57'),
(821, 146, 5, '2026-05-16', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-04 21:44:57'),
(822, 146, 7, '2026-05-16', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-04 21:44:57'),
(823, 146, 12, '2026-05-17', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-04 21:44:57'),
(824, 146, 12, '2026-05-17', 3, 'Ca Tối', '18:00-23:00', '5.00', '2026-06-04 21:44:57'),
(825, 146, 14, '2026-05-18', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-04 21:44:57'),
(4238, 1, 3, '2026-06-01', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-29 23:58:56'),
(4239, 1, 3, '2026-06-03', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-29 23:58:56'),
(4240, 1, 6, '2026-06-01', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-29 23:58:56'),
(4241, 1, 7, '2026-06-03', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-29 23:58:56'),
(4242, 1, 16, '2026-06-02', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-29 23:58:56'),
(4243, 1, 16, '2026-06-04', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-29 23:58:56'),
(4244, 1, 16, '2026-06-05', 1, 'Ca Sáng', '06:00-12:00', '6.00', '2026-06-29 23:58:56'),
(4245, 1, 3, '2026-06-05', 2, 'Ca Chiều', '12:00-18:00', '6.00', '2026-06-29 23:58:56'),
(4246, 1, 4, '2026-06-01', 2, 'Ca Chiều', '12:00-18:00', '6.00', '2026-06-29 23:58:56'),
(4247, 1, 5, '2026-06-03', 2, 'Ca Chiều', '12:00-18:00', '6.00', '2026-06-29 23:58:56'),
(4248, 1, 7, '2026-06-01', 2, 'Ca Chiều', '12:00-18:00', '6.00', '2026-06-29 23:58:56'),
(4249, 1, 12, '2026-06-05', 2, 'Ca Chiều', '12:00-18:00', '6.00', '2026-06-29 23:58:56'),
(4250, 1, 16, '2026-06-02', 2, 'Ca Chiều', '12:00-18:00', '6.00', '2026-06-29 23:58:56'),
(4251, 1, 16, '2026-06-04', 2, 'Ca Chiều', '12:00-18:00', '6.00', '2026-06-29 23:58:56'),
(4252, 1, 5, '2026-06-01', 3, 'Ca Tối', '18:00-23:00', '5.00', '2026-06-29 23:58:56'),
(4253, 1, 6, '2026-06-03', 3, 'Ca Tối', '18:00-23:00', '5.00', '2026-06-29 23:58:56'),
(4254, 1, 7, '2026-06-05', 3, 'Ca Tối', '18:00-23:00', '5.00', '2026-06-29 23:58:56'),
(4255, 1, 11, '2026-06-03', 3, 'Ca Tối', '18:00-23:00', '5.00', '2026-06-29 23:58:56'),
(4256, 1, 16, '2026-06-04', 3, 'Ca Tối', '18:00-23:00', '5.00', '2026-06-29 23:58:56');

-- --------------------------------------------------------

--
-- Table structure for table `bang_cong_thang`
--

DROP TABLE IF EXISTS `bang_cong_thang`;
CREATE TABLE IF NOT EXISTS `bang_cong_thang` (
  `ky_luong_id` int(11) NOT NULL,
  `ma_nhan_vien` int(11) NOT NULL,
  `so_ca_sang` int(11) NOT NULL DEFAULT '0',
  `so_ca_chieu` int(11) NOT NULL DEFAULT '0',
  `so_ca_toi` int(11) NOT NULL DEFAULT '0',
  `so_ngay_lam` int(11) NOT NULL DEFAULT '0',
  `tong_ca` int(11) NOT NULL DEFAULT '0',
  `tong_gio` decimal(6,2) NOT NULL DEFAULT '0.00',
  `last_recalc_at` datetime DEFAULT NULL,
  PRIMARY KEY (`ky_luong_id`,`ma_nhan_vien`),
  KEY `idx_bc_ky` (`ky_luong_id`),
  KEY `fk_bc_nv` (`ma_nhan_vien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `bang_cong_thang`
--

INSERT INTO `bang_cong_thang` (`ky_luong_id`, `ma_nhan_vien`, `so_ca_sang`, `so_ca_chieu`, `so_ca_toi`, `so_ngay_lam`, `tong_ca`, `tong_gio`, `last_recalc_at`) VALUES
(1, 3, 2, 1, 0, 3, 3, '18.00', '2026-06-29 23:58:56'),
(1, 4, 0, 1, 0, 1, 1, '6.00', '2026-06-29 23:58:56'),
(1, 5, 0, 1, 1, 2, 2, '11.00', '2026-06-29 23:58:56'),
(1, 6, 1, 0, 1, 2, 2, '11.00', '2026-06-29 23:58:56'),
(1, 7, 1, 1, 1, 3, 3, '17.00', '2026-06-29 23:58:56'),
(1, 11, 0, 0, 1, 1, 1, '5.00', '2026-06-29 23:58:56'),
(1, 12, 0, 1, 0, 1, 1, '6.00', '2026-06-29 23:58:56'),
(1, 16, 3, 2, 1, 3, 6, '35.00', '2026-06-29 23:58:56'),
(146, 3, 4, 1, 1, 4, 6, '35.00', '2026-06-04 21:44:57'),
(146, 4, 1, 0, 0, 1, 1, '6.00', '2026-06-04 21:44:57'),
(146, 5, 2, 0, 0, 2, 2, '12.00', '2026-06-04 21:44:57'),
(146, 7, 1, 0, 0, 1, 1, '6.00', '2026-06-04 21:44:57'),
(146, 12, 1, 0, 1, 1, 2, '11.00', '2026-06-04 21:44:57'),
(146, 14, 1, 0, 0, 1, 1, '6.00', '2026-06-04 21:44:57');

-- --------------------------------------------------------

--
-- Table structure for table `bang_luong_thang`
--

DROP TABLE IF EXISTS `bang_luong_thang`;
CREATE TABLE IF NOT EXISTS `bang_luong_thang` (
  `ky_luong_id` int(11) NOT NULL,
  `ma_nhan_vien` int(11) NOT NULL,
  `tong_ca` int(11) NOT NULL DEFAULT '0',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `bang_luong_thang`
--

INSERT INTO `bang_luong_thang` (`ky_luong_id`, `ma_nhan_vien`, `tong_ca`, `tong_gio`, `luong_gio`, `luong_co_ban`, `phu_cap`, `thuong`, `khau_tru`, `tam_ung`, `luong_thuc_nhan`, `last_recalc_at`, `created_at`, `updated_at`) VALUES
(1, 3, 3, '18.00', '29000.00', '522000.00', '150000.00', '0.00', '0.00', '0.00', '672000.00', '2026-06-29 21:38:57', '2026-06-02 16:11:51', '2026-06-29 21:38:57'),
(1, 4, 1, '6.00', '30000.00', '180000.00', '200000.00', '0.00', '0.00', '0.00', '380000.00', '2026-06-29 21:38:57', '2026-06-02 16:11:51', '2026-06-29 21:38:57'),
(1, 5, 2, '11.00', '32000.00', '352000.00', '250000.00', '100000.00', '200000.00', '0.00', '502000.00', '2026-06-29 21:38:57', '2026-06-02 16:11:51', '2026-06-29 21:38:57'),
(1, 6, 2, '11.00', '35000.00', '385000.00', '250000.00', '0.00', '0.00', '0.00', '635000.00', '2026-06-29 21:38:57', '2026-06-02 16:11:51', '2026-06-29 21:38:57'),
(1, 7, 3, '17.00', '36000.00', '612000.00', '350000.00', '0.00', '0.00', '0.00', '962000.00', '2026-06-29 21:38:57', '2026-06-02 16:11:51', '2026-06-29 21:38:57'),
(1, 11, 1, '5.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '2026-06-29 21:38:57', '2026-06-05 12:38:27', '2026-06-29 21:38:57'),
(1, 12, 1, '6.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '2026-06-29 21:38:57', '2026-06-18 11:45:00', '2026-06-29 21:38:57'),
(1, 16, 6, '35.00', '36000.00', '1260000.00', '320000.00', '0.00', '0.00', '0.00', '1580000.00', '2026-06-29 21:38:57', '2026-06-04 22:03:51', '2026-06-29 21:38:57'),
(146, 3, 6, '35.00', '29000.00', '1015000.00', '150000.00', '0.00', '0.00', '0.00', '1165000.00', '2026-06-05 00:52:07', '2026-06-04 21:44:57', '2026-06-05 00:52:07'),
(146, 4, 1, '6.00', '30000.00', '180000.00', '200000.00', '0.00', '0.00', '0.00', '380000.00', '2026-06-05 00:52:07', '2026-06-04 21:44:57', '2026-06-05 00:52:07'),
(146, 5, 2, '12.00', '32000.00', '384000.00', '250000.00', '0.00', '0.00', '0.00', '634000.00', '2026-06-05 00:52:07', '2026-06-04 21:44:57', '2026-06-05 00:52:07'),
(146, 7, 1, '6.00', '36000.00', '216000.00', '350000.00', '0.00', '0.00', '0.00', '566000.00', '2026-06-05 00:52:07', '2026-06-04 21:44:57', '2026-06-05 00:52:07'),
(146, 12, 2, '11.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '2026-06-05 00:52:07', '2026-06-04 21:44:57', '2026-06-05 00:52:07'),
(146, 14, 1, '6.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '2026-06-05 00:52:07', '2026-06-04 21:44:57', '2026-06-05 00:52:07');

-- --------------------------------------------------------

--
-- Table structure for table `calam`
--

DROP TABLE IF EXISTS `calam`;
CREATE TABLE IF NOT EXISTS `calam` (
  `ma_ca` int(11) NOT NULL AUTO_INCREMENT,
  `buoi` varchar(50) DEFAULT NULL,
  `ngay` date DEFAULT NULL,
  PRIMARY KEY (`ma_ca`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

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
  `ma_don_hang` int(11) NOT NULL,
  `ma_mon` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL,
  `so_luong_da_gui_bar` int(11) NOT NULL DEFAULT '0',
  `ghi_chu_mon` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `trang_thai_mon` varchar(50) DEFAULT 'Dang cho',
  `don_gia` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ma_don_hang`,`ma_mon`),
  KEY `ma_mon` (`ma_mon`),
  KEY `idx_cthd_trang_thai` (`trang_thai_mon`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `chitiethoadon`
--

INSERT INTO `chitiethoadon` (`ma_don_hang`, `ma_mon`, `so_luong`, `so_luong_da_gui_bar`, `ghi_chu_mon`, `trang_thai_mon`, `don_gia`) VALUES
(1, 39, 1, 1, NULL, 'Dang lam', '15000.00'),
(1, 40, 2, 2, NULL, 'Dang lam', '15000.00'),
(1, 41, 1, 1, NULL, 'Dang lam', '15000.00'),
(2, 28, 1, 1, NULL, 'Dang lam', '32000.00'),
(2, 29, 1, 1, NULL, 'Dang lam', '32000.00'),
(2, 31, 1, 1, NULL, 'Dang lam', '32000.00'),
(2, 32, 1, 1, NULL, 'Dang lam', '35000.00'),
(2, 33, 1, 1, NULL, 'Dang lam', '30000.00'),
(2, 34, 2, 2, NULL, 'Dang lam', '30000.00'),
(2, 35, 2, 2, NULL, 'Dang lam', '15000.00'),
(2, 36, 2, 2, NULL, 'Dang lam', '18000.00'),
(2, 37, 2, 2, NULL, 'Dang lam', '15000.00'),
(2, 38, 2, 2, NULL, 'Dang lam', '15000.00'),
(2, 39, 4, 4, NULL, 'Dang lam', '15000.00'),
(2, 40, 3, 3, NULL, 'Dang lam', '15000.00'),
(2, 41, 3, 3, NULL, 'Dang lam', '15000.00'),
(3, 39, 1, 0, NULL, 'Dang cho', '15000.00'),
(4, 39, 1, 0, NULL, 'Dang cho', '15000.00'),
(5, 39, 2, 2, NULL, 'Dang lam', '15000.00'),
(5, 40, 3, 3, NULL, 'Dang lam', '15000.00'),
(6, 21, 1, 1, NULL, 'Dang lam', '25000.00'),
(6, 22, 1, 1, NULL, 'Dang lam', '28000.00'),
(6, 23, 1, 1, NULL, 'Dang lam', '20000.00'),
(6, 24, 1, 1, NULL, 'Dang lam', '25000.00'),
(6, 25, 1, 1, NULL, 'Dang lam', '25000.00'),
(6, 26, 1, 1, NULL, 'Dang lam', '25000.00'),
(6, 27, 1, 1, NULL, 'Dang lam', '25000.00'),
(6, 28, 1, 1, NULL, 'Dang lam', '32000.00'),
(6, 29, 1, 1, NULL, 'Dang lam', '32000.00'),
(6, 31, 1, 1, NULL, 'Dang lam', '32000.00'),
(6, 32, 1, 1, NULL, 'Dang lam', '35000.00'),
(6, 33, 1, 1, NULL, 'Dang lam', '30000.00'),
(6, 34, 2, 2, NULL, 'Dang lam', '30000.00'),
(6, 35, 2, 2, NULL, 'Dang lam', '15000.00'),
(6, 37, 2, 2, NULL, 'Dang lam', '15000.00'),
(6, 39, 1, 1, NULL, 'Dang lam', '15000.00'),
(6, 40, 1, 1, NULL, 'Dang lam', '15000.00'),
(7, 37, 1, 1, NULL, 'Dang lam', '15000.00'),
(7, 39, 1, 1, NULL, 'Dang lam', '15000.00'),
(7, 40, 3, 3, NULL, 'Dang lam', '15000.00'),
(8, 40, 1, 0, NULL, 'Dang cho', '15000.00'),
(9, 40, 3, 0, NULL, 'Dang cho', '15000.00'),
(10, 18, 10, 0, NULL, 'Dang cho', '20000.00'),
(11, 18, 1, 1, NULL, 'Dang lam', '20000.00'),
(11, 19, 1, 1, NULL, 'Dang lam', '20000.00'),
(12, 18, 1, 0, NULL, 'Dang cho', '20000.00'),
(12, 19, 1, 0, NULL, 'Dang cho', '20000.00'),
(12, 20, 1, 0, NULL, 'Dang cho', '10000.00'),
(13, 18, 3, 0, NULL, 'Dang cho', '20000.00'),
(13, 19, 5, 0, NULL, 'Dang cho', '20000.00'),
(13, 20, 8, 0, NULL, 'Dang cho', '10000.00'),
(13, 21, 5, 0, NULL, 'Dang cho', '25000.00'),
(14, 21, 12, 0, NULL, 'Dang cho', '25000.00'),
(15, 21, 10, 0, NULL, 'Dang cho', '25000.00'),
(16, 19, 1, 0, NULL, 'Dang cho', '20000.00'),
(17, 18, 1, 0, NULL, 'Dang cho', '20000.00'),
(17, 19, 1, 0, NULL, 'Dang cho', '20000.00'),
(17, 20, 1, 0, NULL, 'Dang cho', '10000.00'),
(17, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(18, 19, 2, 0, NULL, 'Dang cho', '20000.00'),
(18, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(19, 18, 3, 0, NULL, 'Dang cho', '20000.00'),
(19, 19, 2, 0, NULL, 'Dang cho', '20000.00'),
(19, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(20, 18, 1, 0, NULL, 'Dang cho', '20000.00'),
(20, 19, 1, 0, NULL, 'Dang cho', '20000.00'),
(20, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(21, 19, 1, 0, NULL, 'Dang cho', '20000.00'),
(21, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(22, 19, 1, 0, NULL, 'Dang cho', '20000.00'),
(22, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(23, 19, 2, 0, NULL, 'Dang cho', '20000.00'),
(23, 21, 2, 0, NULL, 'Dang cho', '25000.00'),
(24, 19, 2, 0, NULL, 'Dang cho', '20000.00'),
(25, 21, 6, 0, NULL, 'Dang cho', '25000.00'),
(26, 21, 6, 0, NULL, 'Dang cho', '25000.00'),
(27, 21, 9, 0, NULL, 'Dang cho', '25000.00'),
(28, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(29, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(30, 22, 1, 0, NULL, 'Dang cho', '28000.00'),
(31, 22, 1, 0, NULL, 'Dang cho', '28000.00'),
(32, 23, 10, 0, NULL, 'Dang cho', '10000.00'),
(33, 21, 4, 0, NULL, 'Dang cho', '25000.00'),
(33, 22, 4, 0, NULL, 'Dang cho', '28000.00'),
(34, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(34, 22, 4, 0, NULL, 'Dang cho', '28000.00'),
(35, 21, 5, 0, NULL, 'Dang cho', '25000.00'),
(35, 22, 4, 0, NULL, 'Dang cho', '28000.00'),
(36, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(36, 22, 1, 0, NULL, 'Dang cho', '28000.00'),
(37, 21, 1, 1, NULL, 'Dang lam', '25000.00'),
(37, 22, 1, 1, NULL, 'Dang lam', '28000.00'),
(38, 22, 2, 0, NULL, 'Dang cho', '28000.00'),
(39, 26, 3, 0, NULL, 'Dang cho', '20000.00'),
(40, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(40, 22, 1, 0, NULL, 'Dang cho', '28000.00'),
(40, 26, 3, 0, NULL, 'Dang cho', '20000.00'),
(41, 27, 2, 0, NULL, 'Dang cho', '15000.00'),
(42, 27, 1, 0, NULL, 'Dang cho', '15000.00'),
(43, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(44, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(44, 22, 1, 0, NULL, 'Dang cho', '28000.00'),
(45, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(45, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(46, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(46, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(47, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(48, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(49, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(52, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(83, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(83, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(84, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(84, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(85, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(85, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(86, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(86, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(89, 21, 3, 0, NULL, 'Dang cho', '25000.00'),
(90, 21, 9, 0, NULL, 'Dang cho', '25000.00'),
(91, 29, 2, 0, NULL, 'Dang cho', '20000.00'),
(91, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(92, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(92, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(92, 30, 2, 0, NULL, 'Dang cho', '40000.00'),
(94, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(94, 30, 4, 0, NULL, 'Dang cho', '40000.00'),
(97, 29, 4, 0, NULL, 'Dang cho', '20000.00'),
(97, 30, 2, 0, NULL, 'Dang cho', '40000.00'),
(98, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(98, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(98, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(99, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(99, 29, 3, 0, NULL, 'Dang cho', '20000.00'),
(99, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(100, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(100, 29, 2, 0, NULL, 'Dang cho', '20000.00'),
(100, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(103, 26, 1, 0, NULL, 'Dang cho', '20000.00'),
(103, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(103, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(104, 26, 2, 0, NULL, 'Dang cho', '20000.00'),
(104, 30, 2, 0, NULL, 'Dang cho', '40000.00'),
(105, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(106, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(112, 30, 2, 2, NULL, 'Dang lam', '40000.00'),
(113, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(113, 30, 2, 2, NULL, 'Dang lam', '40000.00'),
(117, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(117, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(118, 21, 1, 1, NULL, 'Dang lam', '25000.00'),
(118, 22, 1, 1, NULL, 'Dang lam', '28000.00'),
(118, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(118, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(119, 21, 1, 1, NULL, 'Dang lam', '25000.00'),
(119, 22, 1, 1, NULL, 'Dang lam', '28000.00'),
(119, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(119, 30, 3, 3, NULL, 'Dang lam', '40000.00'),
(121, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(122, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(122, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(123, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(125, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(126, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(127, 22, 1, 0, NULL, 'Dang cho', '28000.00'),
(127, 23, 1, 0, NULL, 'Dang cho', '10000.00'),
(128, 23, 1, 0, NULL, 'Dang cho', '10000.00'),
(128, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(129, 22, 2, 0, NULL, 'Dang cho', '28000.00'),
(129, 23, 1, 0, NULL, 'Dang cho', '10000.00'),
(129, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(130, 22, 1, 1, NULL, 'Dang lam', '28000.00'),
(130, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(130, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(132, 23, 1, 0, NULL, 'Dang cho', '10000.00'),
(132, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(133, 22, 1, 1, NULL, 'Dang lam', '28000.00'),
(133, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(134, 30, 3, 3, NULL, 'Dang lam', '40000.00'),
(135, 21, 1, 1, NULL, 'Dang lam', '25000.00'),
(135, 22, 1, 1, NULL, 'Dang lam', '28000.00'),
(135, 23, 2, 2, NULL, 'Dang lam', '10000.00'),
(135, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(136, 29, 2, 2, NULL, 'Dang lam', '20000.00'),
(137, 21, 1, 0, NULL, 'Dang cho', '25000.00'),
(137, 23, 1, 0, NULL, 'Dang cho', '10000.00'),
(137, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(138, 30, 5, 5, NULL, 'Dang lam', '40000.00'),
(140, 30, 2, 2, NULL, 'Dang lam', '40000.00'),
(141, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(141, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(142, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(143, 23, 1, 0, NULL, 'Dang cho', '10000.00'),
(143, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(144, 22, 1, 1, NULL, 'Dang lam', '28000.00'),
(144, 30, 3, 3, NULL, 'Dang lam', '40000.00'),
(145, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(145, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(146, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(146, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(146, 30, 3, 3, NULL, 'Dang lam', '40000.00'),
(147, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(147, 30, 2, 2, NULL, 'Dang lam', '40000.00'),
(148, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(148, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(149, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(150, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(150, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(151, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(151, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(152, 21, 1, 1, 'nhiều đường', 'Dang lam', '25000.00'),
(152, 22, 1, 1, NULL, 'Dang lam', '28000.00'),
(152, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(153, 30, 3, 3, NULL, 'Dang lam', '40000.00'),
(154, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(155, 30, 3, 3, NULL, 'Dang lam', '40000.00'),
(156, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(156, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(158, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(158, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(159, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(159, 29, 2, 2, NULL, 'Dang lam', '20000.00'),
(160, 29, 5, 1, NULL, 'Dang lam', '20000.00'),
(161, 29, 3, 3, NULL, 'Dang lam', '20000.00'),
(162, 29, 2, 0, NULL, 'Dang cho', '20000.00'),
(163, 23, 1, 0, NULL, 'Dang cho', '10000.00'),
(163, 29, 1, 0, NULL, 'Dang cho', '20000.00'),
(164, 21, 2, 2, NULL, 'Dang lam', '25000.00'),
(164, 23, 2, 2, NULL, 'Dang lam', '10000.00'),
(165, 21, 5, 5, NULL, 'Dang lam', '25000.00'),
(166, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(166, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(167, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(167, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(168, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(169, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(169, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(170, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(171, 29, 2, 2, NULL, 'Dang lam', '20000.00'),
(172, 26, 2, 2, NULL, 'Dang lam', '20000.00'),
(173, 26, 8, 8, NULL, 'Dang lam', '20000.00'),
(174, 26, 5, 5, NULL, 'Dang lam', '20000.00'),
(175, 26, 4, 4, NULL, 'Dang lam', '20000.00'),
(176, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(176, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(178, 26, 4, 4, NULL, 'Dang lam', '20000.00'),
(179, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(186, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(186, 25, 2, 2, NULL, 'Dang lam', '20000.00'),
(187, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(188, 23, 2, 2, NULL, 'Dang lam', '10000.00'),
(188, 25, 1, 1, NULL, 'Dang lam', '20000.00'),
(189, 23, 2, 2, NULL, 'Dang lam', '10000.00'),
(189, 26, 2, 2, NULL, 'Dang lam', '20000.00'),
(189, 29, 2, 2, NULL, 'Dang lam', '20000.00'),
(190, 31, 1, 1, NULL, 'Dang lam', '25000.00'),
(191, 21, 1, 1, NULL, 'Dang lam', '25000.00'),
(191, 25, 1, 1, NULL, 'Dang lam', '20000.00'),
(191, 29, 2, 2, NULL, 'Dang lam', '20000.00'),
(192, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(192, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(193, 29, 3, 3, NULL, 'Dang lam', '20000.00'),
(194, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(194, 25, 1, 1, NULL, 'Dang lam', '20000.00'),
(194, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(194, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(195, 21, 1, 1, NULL, 'Dang lam', '25000.00'),
(195, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(195, 25, 1, 1, NULL, 'Dang lam', '20000.00'),
(195, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(195, 29, 1, 1, NULL, 'Dang lam', '20000.00'),
(195, 31, 1, 1, NULL, 'Dang lam', '25000.00'),
(195, 32, 1, 1, NULL, 'Dang lam', '20000.00'),
(196, 31, 1, 1, NULL, 'Dang lam', '25000.00'),
(196, 32, 2, 2, NULL, 'Dang lam', '20000.00'),
(197, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(197, 31, 1, 1, NULL, 'Dang lam', '25000.00'),
(197, 32, 1, 1, NULL, 'Dang lam', '20000.00'),
(198, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(199, 25, 1, 1, NULL, 'Dang lam', '20000.00'),
(199, 31, 1, 1, NULL, 'Dang lam', '25000.00'),
(199, 32, 1, 1, NULL, 'Dang lam', '20000.00'),
(200, 31, 1, 1, NULL, 'Dang lam', '25000.00'),
(201, 31, 3, 3, NULL, 'Dang lam', '25000.00'),
(201, 32, 2, 2, NULL, 'Dang lam', '20000.00'),
(202, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(202, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(203, 32, 2, 2, NULL, 'Dang lam', '20000.00'),
(204, 23, 3, 3, NULL, 'Dang lam', '10000.00'),
(204, 25, 1, 1, NULL, 'Dang lam', '20000.00'),
(204, 29, 2, 2, NULL, 'Dang lam', '20000.00'),
(204, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(204, 31, 1, 1, NULL, 'Dang lam', '25000.00'),
(204, 32, 1, 1, NULL, 'Dang lam', '20000.00'),
(205, 31, 2, 2, NULL, 'Dang lam', '25000.00'),
(205, 32, 2, 2, NULL, 'Dang lam', '20000.00'),
(206, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(206, 31, 1, 1, NULL, 'Dang lam', '25000.00'),
(206, 32, 1, 1, NULL, 'Dang lam', '20000.00'),
(207, 30, 1, 0, NULL, 'Dang cho', '40000.00'),
(207, 31, 1, 0, NULL, 'Dang cho', '25000.00'),
(207, 32, 1, 0, NULL, 'Dang cho', '20000.00'),
(208, 31, 4, 4, NULL, 'Dang lam', '25000.00'),
(208, 32, 2, 2, NULL, 'Dang lam', '20000.00'),
(209, 32, 4, 4, NULL, 'Dang lam', '20000.00'),
(210, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(210, 31, 1, 1, NULL, 'Dang lam', '25000.00'),
(210, 32, 1, 1, NULL, 'Dang lam', '20000.00'),
(211, 29, 3, 3, NULL, 'Dang lam', '20000.00'),
(211, 30, 2, 2, NULL, 'Dang lam', '40000.00'),
(212, 29, 3, 0, NULL, 'Dang cho', '20000.00'),
(212, 30, 2, 0, NULL, 'Dang cho', '40000.00'),
(213, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(213, 25, 1, 1, NULL, 'Dang lam', '20000.00'),
(213, 26, 1, 1, NULL, 'Dang lam', '20000.00'),
(213, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(213, 31, 1, 1, NULL, 'Dang lam', '25000.00'),
(214, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(214, 31, 1, 1, NULL, 'Dang lam', '25000.00'),
(214, 32, 1, 1, NULL, 'Dang lam', '20000.00'),
(215, 21, 1, 1, NULL, 'Dang lam', '25000.00'),
(215, 25, 1, 1, NULL, 'Dang lam', '20000.00'),
(215, 30, 1, 1, NULL, 'Dang lam', '40000.00'),
(216, 23, 1, 1, NULL, 'Dang lam', '10000.00'),
(216, 26, 5, 5, NULL, 'Dang lam', '20000.00'),
(216, 31, 2, 2, NULL, 'Dang lam', '25000.00'),
(216, 33, 1, 1, NULL, 'Dang lam', '30000.00');

-- --------------------------------------------------------

--
-- Table structure for table `chitiet_phieunhap`
--

DROP TABLE IF EXISTS `chitiet_phieunhap`;
CREATE TABLE IF NOT EXISTS `chitiet_phieunhap` (
  `ma_chi_tiet` int(11) NOT NULL AUTO_INCREMENT,
  `ma_phieu` int(11) NOT NULL,
  `ma_nguyen_lieu` int(11) NOT NULL,
  `so_luong_nhap` decimal(10,2) NOT NULL,
  `gia_nhap` decimal(12,2) NOT NULL,
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `fk_ctpn_phieu` (`ma_phieu`),
  KEY `fk_ctpn_nguyenlieu` (`ma_nguyen_lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chitiet_phieunhap`
--

INSERT INTO `chitiet_phieunhap` (`ma_chi_tiet`, `ma_phieu`, `ma_nguyen_lieu`, `so_luong_nhap`, `gia_nhap`) VALUES
(1, 17, 3, '2.00', '200000.00'),
(2, 18, 1, '20.00', '10000.00'),
(3, 19, 2, '20.00', '10000.00'),
(4, 20, 4, '20.00', '5000.00'),
(5, 21, 3, '2.00', '200000.00'),
(6, 22, 5, '2.00', '200000.00'),
(7, 23, 6, '2.00', '30000.00'),
(8, 24, 4, '10.00', '5000.00'),
(9, 25, 7, '20.00', '10000.00'),
(10, 26, 8, '20.00', '10000.00'),
(11, 27, 4, '20.00', '5000.00'),
(12, 28, 9, '2.00', '400000.00'),
(13, 29, 10, '20.00', '10000.00'),
(14, 30, 11, '5.00', '10000.00'),
(15, 31, 8, '20.00', '10000.00'),
(16, 32, 13, '2.00', '100000.00'),
(17, 33, 3, '2.00', '100000.00'),
(18, 34, 1, '30.00', '10000.00'),
(19, 35, 4, '30.00', '10000.00'),
(20, 36, 2, '30.00', '9999.00'),
(21, 37, 7, '30.00', '10000.00'),
(22, 38, 8, '3.00', '10000.00'),
(23, 39, 8, '3.00', '10000.00'),
(24, 40, 8, '5.00', '10000.00'),
(25, 41, 8, '20.00', '10000.00'),
(26, 42, 7, '10.00', '10000.00'),
(27, 43, 8, '10.00', '10000.00'),
(28, 44, 7, '5.00', '10000.00'),
(29, 45, 8, '2.00', '100000.00'),
(30, 46, 15, '1.00', '20000.00'),
(31, 47, 14, '20.00', '10000.00'),
(32, 48, 15, '1.00', '20000.00'),
(33, 49, 15, '1.00', '20000.00'),
(34, 50, 15, '1.00', '20000.00'),
(35, 51, 9, '1.00', '300000.00'),
(36, 52, 14, '20.00', '10000.00'),
(37, 53, 14, '20.00', '10000.00'),
(38, 54, 6, '5.00', '30000.00'),
(39, 55, 12, '5.00', '50000.00'),
(40, 56, 16, '2.00', '100000.00'),
(41, 57, 17, '20.00', '4999.00'),
(42, 58, 17, '10.00', '5000.00');

-- --------------------------------------------------------

--
-- Table structure for table `chuquan`
--

DROP TABLE IF EXISTS `chuquan`;
CREATE TABLE IF NOT EXISTS `chuquan` (
  `ma_admin` int(11) NOT NULL AUTO_INCREMENT,
  `ten_dang_nhap` varchar(50) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'admin',
  PRIMARY KEY (`ma_admin`),
  UNIQUE KEY `ten_dang_nhap` (`ten_dang_nhap`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `chuquan`
--

INSERT INTO `chuquan` (`ma_admin`, `ten_dang_nhap`, `mat_khau`, `role`) VALUES
(1, 'admin', '$2b$10$LEuvxuGCO12pxcTDkTskWe0N60c/BGN1zPAjqZRkiwwtH2vB4QfAW', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `congthuc`
--

DROP TABLE IF EXISTS `congthuc`;
CREATE TABLE IF NOT EXISTS `congthuc` (
  `ma_mon` int(11) NOT NULL,
  `ma_nguyen_lieu` int(11) NOT NULL,
  `dinh_luong` decimal(10,2) NOT NULL COMMENT 'Định lượng dạng ml hoặc g',
  `don_vi_tinh_chi_tiet` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ml',
  PRIMARY KEY (`ma_mon`,`ma_nguyen_lieu`),
  KEY `fk_congthuc_nguyenlieu` (`ma_nguyen_lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `congthuc`
--

INSERT INTO `congthuc` (`ma_mon`, `ma_nguyen_lieu`, `dinh_luong`, `don_vi_tinh_chi_tiet`) VALUES
(21, 3, '50.00', 'g'),
(22, 5, '50.00', 'g'),
(22, 6, '20.00', 'ml'),
(23, 4, '1.00', 'chai'),
(25, 1, '1.00', 'lon'),
(26, 7, '1.00', 'chai'),
(29, 8, '1.00', 'chai'),
(30, 9, '30.00', 'g'),
(30, 10, '1.00', 'lon'),
(30, 11, '15.00', 'g'),
(31, 14, '1.00', 'lon'),
(31, 15, '5.00', 'g'),
(32, 14, '1.00', 'lon'),
(33, 6, '30.00', 'ml'),
(33, 12, '40.00', 'ml'),
(33, 16, '30.00', 'ml'),
(33, 17, '100.00', 'ml');

-- --------------------------------------------------------

--
-- Table structure for table `danhmucmon`
--

DROP TABLE IF EXISTS `danhmucmon`;
CREATE TABLE IF NOT EXISTS `danhmucmon` (
  `ma_danh_muc` int(11) NOT NULL AUTO_INCREMENT,
  `ten_danh_muc` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `ma_don_hang` int(11) NOT NULL AUTO_INCREMENT,
  `ma_ban` int(11) DEFAULT NULL,
  `loai_don` varchar(20) NOT NULL DEFAULT 'tai_cho',
  `ten_khach` varchar(100) DEFAULT NULL,
  `phi_giao_hang` decimal(12,2) NOT NULL DEFAULT '0.00',
  `hinh_thuc_thanh_toan` varchar(20) DEFAULT NULL,
  `so_dien_thoai_giao` varchar(20) DEFAULT NULL,
  `dia_chi_giao` varchar(500) DEFAULT NULL,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `trang_thai_don` varchar(50) DEFAULT NULL,
  `trang_thai_thanh_toan` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ma_don_hang`),
  KEY `ma_ban` (`ma_ban`)
) ENGINE=InnoDB AUTO_INCREMENT=217 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `donhang`
--

INSERT INTO `donhang` (`ma_don_hang`, `ma_ban`, `loai_don`, `ten_khach`, `phi_giao_hang`, `hinh_thuc_thanh_toan`, `so_dien_thoai_giao`, `dia_chi_giao`, `ngay_tao`, `trang_thai_don`, `trang_thai_thanh_toan`) VALUES
(1, 8, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 13:52:23', 'Hoan thanh', 'Da thanh toan'),
(2, 9, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 13:53:02', 'Hoan thanh', 'Da thanh toan'),
(3, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 13:56:59', 'Hoan thanh', 'Da thanh toan'),
(4, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 14:03:35', 'Hoan thanh', 'Da thanh toan'),
(5, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 14:15:11', 'Hoan thanh', 'Da thanh toan'),
(6, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 15:20:45', 'Hoan thanh', 'Da thanh toan'),
(7, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 15:27:01', 'Hoan thanh', 'Da thanh toan'),
(8, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 15:27:52', 'Hoan thanh', 'Da thanh toan'),
(9, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 15:38:02', 'Hoan thanh', 'Da thanh toan'),
(10, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 15:54:35', 'Hoan thanh', 'Da thanh toan'),
(11, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:00:54', 'Hoan thanh', 'Da thanh toan'),
(12, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:04:50', 'Hoan thanh', 'Da thanh toan'),
(13, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:07:28', 'Hoan thanh', 'Da thanh toan'),
(14, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:17:50', 'Hoan thanh', 'Da thanh toan'),
(15, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:18:26', 'Hoan thanh', 'Da thanh toan'),
(16, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:18:57', 'Hoan thanh', 'Da thanh toan'),
(17, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:30:39', 'Hoan thanh', 'Da thanh toan'),
(18, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:50:25', 'Hoan thanh', 'Da thanh toan'),
(19, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:58:34', 'Hoan thanh', 'Da thanh toan'),
(20, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:58:46', 'Hoan thanh', 'Da thanh toan'),
(21, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:58:50', 'Hoan thanh', 'Da thanh toan'),
(22, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:58:55', 'Hoan thanh', 'Da thanh toan'),
(23, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:58:59', 'Hoan thanh', 'Da thanh toan'),
(24, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:59:04', 'Hoan thanh', 'Da thanh toan'),
(25, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:59:24', 'Hoan thanh', 'Da thanh toan'),
(26, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:59:32', 'Hoan thanh', 'Da thanh toan'),
(27, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:59:37', 'Hoan thanh', 'Da thanh toan'),
(28, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 22:59:43', 'Hoan thanh', 'Da thanh toan'),
(29, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 23:00:10', 'Hoan thanh', 'Da thanh toan'),
(30, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 23:04:15', 'Hoan thanh', 'Da thanh toan'),
(31, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 23:05:23', 'Hoan thanh', 'Da thanh toan'),
(32, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 23:05:32', 'Hoan thanh', 'Da thanh toan'),
(33, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 23:12:33', 'Hoan thanh', 'Da thanh toan'),
(34, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 23:23:36', 'Hoan thanh', 'Da thanh toan'),
(35, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 23:32:43', 'Hoan thanh', 'Da thanh toan'),
(36, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-05 23:47:44', 'Hoan thanh', 'Da thanh toan'),
(37, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-06 17:36:30', 'Hoan thanh', 'Da thanh toan'),
(38, 8, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-07 18:32:28', 'Hoan thanh', 'Da thanh toan'),
(39, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-07 18:32:55', 'Hoan thanh', 'Da thanh toan'),
(40, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-07 18:54:48', 'Hoan thanh', 'Da thanh toan'),
(41, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-11 16:29:16', 'Hoan thanh', 'Da thanh toan'),
(42, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-11 16:53:57', 'Hoan thanh', 'Da thanh toan'),
(43, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-11 16:56:01', 'Hoan thanh', 'Da thanh toan'),
(44, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 15:31:57', 'Hoan thanh', 'Da thanh toan'),
(45, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 15:52:32', 'Hoan thanh', 'Da thanh toan'),
(46, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 15:56:59', 'Hoan thanh', 'Da thanh toan'),
(47, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 16:13:16', 'Hoan thanh', 'Da thanh toan'),
(48, 3, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 16:45:39', 'Hoan thanh', 'Da thanh toan'),
(49, 8, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:15:37', 'Hoan thanh', 'Da thanh toan'),
(50, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:33:42', 'Dang phuc vu', 'Chua thanh toan'),
(51, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:33:55', 'Dang phuc vu', 'Chua thanh toan'),
(52, 10, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:09', 'Hoan thanh', 'Da thanh toan'),
(53, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:25', 'Dang phuc vu', 'Chua thanh toan'),
(54, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:39', 'Dang phuc vu', 'Chua thanh toan'),
(55, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:42', 'Dang phuc vu', 'Chua thanh toan'),
(56, NULL, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:42', 'Dang phuc vu', 'Chua thanh toan'),
(57, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:42', 'Dang phuc vu', 'Chua thanh toan'),
(58, NULL, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:44', 'Dang phuc vu', 'Chua thanh toan'),
(59, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:44', 'Dang phuc vu', 'Chua thanh toan'),
(60, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:44', 'Dang phuc vu', 'Chua thanh toan'),
(61, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:45', 'Dang phuc vu', 'Chua thanh toan'),
(62, NULL, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:45', 'Dang phuc vu', 'Chua thanh toan'),
(63, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:47', 'Dang phuc vu', 'Chua thanh toan'),
(64, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:47', 'Dang phuc vu', 'Chua thanh toan'),
(65, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:47', 'Dang phuc vu', 'Chua thanh toan'),
(66, NULL, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:48', 'Dang phuc vu', 'Chua thanh toan'),
(67, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:48', 'Dang phuc vu', 'Chua thanh toan'),
(68, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:34:48', 'Dang phuc vu', 'Chua thanh toan'),
(69, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:36:01', 'Dang phuc vu', 'Chua thanh toan'),
(70, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:36:06', 'Dang phuc vu', 'Chua thanh toan'),
(71, NULL, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:36:12', 'Dang phuc vu', 'Chua thanh toan'),
(72, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:36:27', 'Dang phuc vu', 'Chua thanh toan'),
(73, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:37:09', 'Dang phuc vu', 'Chua thanh toan'),
(74, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:37:19', 'Dang phuc vu', 'Chua thanh toan'),
(75, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:40:06', 'Dang phuc vu', 'Chua thanh toan'),
(76, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:40:11', 'Dang phuc vu', 'Chua thanh toan'),
(77, NULL, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:40:18', 'Dang phuc vu', 'Chua thanh toan'),
(78, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:40:19', 'Dang phuc vu', 'Chua thanh toan'),
(79, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:40:20', 'Dang phuc vu', 'Chua thanh toan'),
(80, NULL, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:40:20', 'Dang phuc vu', 'Chua thanh toan'),
(81, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:40:21', 'Dang phuc vu', 'Chua thanh toan'),
(82, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:40:21', 'Dang phuc vu', 'Chua thanh toan'),
(83, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:42:04', 'Dang phuc vu', 'Chua thanh toan'),
(84, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:42:21', 'Dang phuc vu', 'Chua thanh toan'),
(85, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:43:23', 'Hoan thanh', 'Da thanh toan'),
(86, NULL, 'giao_hang', NULL, '20000.00', NULL, NULL, '12a t', '2026-06-12 17:44:13', 'Hoan thanh', 'Da thanh toan'),
(87, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:47:21', 'Dang phuc vu', 'Chua thanh toan'),
(88, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:47:28', 'Dang phuc vu', 'Chua thanh toan'),
(89, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:51:32', 'Hoan thanh', 'Da thanh toan'),
(90, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:51:57', 'Hoan thanh', 'Da thanh toan'),
(91, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-12 17:52:05', 'Hoan thanh', 'Da thanh toan'),
(92, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 16:54:29', 'Hoan thanh', 'Da thanh toan'),
(93, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 18:51:22', 'Dang phuc vu', 'Chua thanh toan'),
(94, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:01:10', 'Hoan thanh', 'Da thanh toan'),
(95, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:15:28', 'Dang phuc vu', 'Chua thanh toan'),
(96, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:15:56', 'Dang phuc vu', 'Chua thanh toan'),
(97, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:15:58', 'Dang phuc vu', 'Chua thanh toan'),
(98, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:17:20', 'Hoan thanh', 'Da thanh toan'),
(99, NULL, 'giao_hang', NULL, '20000.00', NULL, '1212131212', '12a', '2026-06-14 19:17:52', 'Hoan thanh', 'Da thanh toan'),
(100, NULL, 'giao_hang', NULL, '30000.00', NULL, '032212122', '12a', '2026-06-14 19:21:50', 'Hoan thanh', 'Da thanh toan'),
(101, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:24:32', 'Dang phuc vu', 'Chua thanh toan'),
(102, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:24:38', 'Dang phuc vu', 'Chua thanh toan'),
(103, NULL, 'giao_hang', NULL, '20000.00', NULL, '1231223', '1a ', '2026-06-14 19:29:27', 'Hoan thanh', 'Da thanh toan'),
(104, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:30:31', 'Hoan thanh', 'Da thanh toan'),
(105, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:35:17', 'Hoan thanh', 'Da thanh toan'),
(106, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:35:27', 'Hoan thanh', 'Da thanh toan'),
(107, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:37:50', 'Dang phuc vu', 'Chua thanh toan'),
(108, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:37:53', 'Dang phuc vu', 'Chua thanh toan'),
(109, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:38:48', 'Dang phuc vu', 'Chua thanh toan'),
(110, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:38:53', 'Dang phuc vu', 'Chua thanh toan'),
(111, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:40:02', 'Dang phuc vu', 'Chua thanh toan'),
(112, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:48:49', 'Hoan thanh', 'Da thanh toan'),
(113, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:49:46', 'Dang phuc vu', 'Chua thanh toan'),
(114, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:50:02', 'Dang phuc vu', 'Chua thanh toan'),
(115, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:53:51', 'Dang phuc vu', 'Chua thanh toan'),
(116, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 19:54:02', 'Dang phuc vu', 'Chua thanh toan'),
(117, NULL, 'giao_hang', 'ph', '20000.00', 'chuyen_khoan', NULL, NULL, '2026-06-14 20:12:57', 'Hoan thanh', 'Da thanh toan'),
(118, NULL, 'giao_hang', 'han', '30000.00', 'tien_mat', '123432432', '12 b', '2026-06-14 20:14:22', 'Hoan thanh', 'Da thanh toan'),
(119, NULL, 'mang_ve', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-14 20:15:18', 'Hoan thanh', 'Da thanh toan'),
(120, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 20:20:39', 'Dang phuc vu', 'Chua thanh toan'),
(121, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 20:21:58', 'Hoan thanh', 'Da thanh toan'),
(122, NULL, 'mang_ve', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-14 20:35:00', 'Hoan thanh', 'Da thanh toan'),
(123, NULL, 'giao_hang', 'giao', '20000.00', 'tien_mat', '1233414132', '1d', '2026-06-14 20:35:25', 'Hoan thanh', 'Da thanh toan'),
(124, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 20:44:46', 'Dang phuc vu', 'Chua thanh toan'),
(125, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-14 20:49:50', 'Hoan thanh', 'Da thanh toan'),
(126, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-15 15:01:52', 'Hoan thanh', 'Da thanh toan'),
(127, 2, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-15 15:01:57', 'Hoan thanh', 'Da thanh toan'),
(128, 3, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-15 15:02:00', 'Hoan thanh', 'Da thanh toan'),
(129, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-15 15:09:52', 'Hoan thanh', 'Da thanh toan'),
(130, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-15 15:10:09', 'Hoan thanh', 'Da thanh toan'),
(131, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-15 15:15:27', 'Dang phuc vu', 'Chua thanh toan'),
(132, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-15 15:40:46', 'Hoan thanh', 'Da thanh toan'),
(133, NULL, 'mang_ve', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-15 15:40:50', 'Hoan thanh', 'Da thanh toan'),
(134, NULL, 'giao_hang', 'giao', '29000.00', 'tien_mat', '11212211', '12w', '2026-06-15 15:41:28', 'Hoan thanh', 'Da thanh toan'),
(135, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-15 15:54:44', 'Hoan thanh', 'Da thanh toan'),
(136, 2, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-15 15:54:57', 'Hoan thanh', 'Da thanh toan'),
(137, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-15 16:04:11', 'Hoan thanh', 'Da thanh toan'),
(138, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-15 16:34:09', 'Hoan thanh', 'Da thanh toan'),
(139, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-18 11:28:53', 'Dang phuc vu', 'Chua thanh toan'),
(140, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-18 11:41:06', 'Hoan thanh', 'Da thanh toan'),
(141, 3, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-18 11:41:30', 'Hoan thanh', 'Da thanh toan'),
(142, NULL, 'giao_hang', 'A', '20000.00', 'tien_mat', '123131', 'a', '2026-06-18 11:42:25', 'Hoan thanh', 'Da thanh toan'),
(143, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-18 11:43:56', 'Dang phuc vu', 'Chua thanh toan'),
(144, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-26 13:44:23', 'Hoan thanh', 'Da thanh toan'),
(145, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-26 14:40:42', 'Hoan thanh', 'Da thanh toan'),
(146, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-26 14:44:06', 'Hoan thanh', 'Da thanh toan'),
(147, 1, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-26 14:46:07', 'Hoan thanh', 'Da thanh toan'),
(148, 12, 'tai_cho', NULL, '0.00', NULL, NULL, NULL, '2026-06-26 14:51:28', 'Hoan thanh', 'Da thanh toan'),
(149, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-26 15:01:25', 'Hoan thanh', 'Da thanh toan'),
(150, NULL, 'mang_ve', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-26 15:06:25', 'Hoan thanh', 'Da thanh toan'),
(151, NULL, 'giao_hang', 'a', '20000.00', 'tien_mat', '1232222', 'bd', '2026-06-26 15:07:17', 'Hoan thanh', 'Da thanh toan'),
(152, 1, 'tai_cho', NULL, '0.00', 'chuyen_khoan', NULL, NULL, '2026-06-26 15:08:34', 'Hoan thanh', 'Da thanh toan'),
(153, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-26 15:16:40', 'Hoan thanh', 'Da thanh toan'),
(154, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-26 15:20:06', 'Hoan thanh', 'Da thanh toan'),
(155, 1, 'tai_cho', NULL, '0.00', 'chuyen_khoan', NULL, NULL, '2026-06-26 16:11:11', 'Hoan thanh', 'Da thanh toan'),
(156, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-26 16:18:56', 'Dang phuc vu', 'Chua thanh toan'),
(157, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-06-26 16:19:10', 'Dang phuc vu', 'Chua thanh toan'),
(158, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-29 20:45:08', 'Hoan thanh', 'Da thanh toan'),
(159, NULL, 'giao_hang', 'A', '20000.00', 'tien_mat', '020202q', 'a', '2026-06-29 20:47:06', 'Hoan thanh', 'Da thanh toan'),
(160, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-29 21:07:14', 'Hoan thanh', 'Da thanh toan'),
(161, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-29 21:13:19', 'Hoan thanh', 'Da thanh toan'),
(162, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-29 21:13:59', 'Hoan thanh', 'Da thanh toan'),
(163, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-29 21:26:41', 'Hoan thanh', 'Da thanh toan'),
(164, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-29 21:26:51', 'Hoan thanh', 'Da thanh toan'),
(165, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-29 21:44:27', 'Hoan thanh', 'Da thanh toan'),
(166, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-29 21:51:24', 'Hoan thanh', 'Da thanh toan'),
(167, 1, 'tai_cho', NULL, '0.00', 'chuyen_khoan', NULL, NULL, '2026-06-29 22:22:11', 'Hoan thanh', 'Da thanh toan'),
(168, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-29 22:32:21', 'Hoan thanh', 'Da thanh toan'),
(169, NULL, 'mang_ve', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-29 22:58:33', 'Hoan thanh', 'Da thanh toan'),
(170, 1, 'tai_cho', NULL, '0.00', 'chuyen_khoan', NULL, NULL, '2026-06-30 00:12:55', 'Hoan thanh', 'Da thanh toan'),
(171, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-30 00:19:12', 'Hoan thanh', 'Da thanh toan'),
(172, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-30 00:43:53', 'Hoan thanh', 'Da thanh toan'),
(173, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-30 00:46:35', 'Hoan thanh', 'Da thanh toan'),
(174, 2, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-30 00:46:49', 'Hoan thanh', 'Da thanh toan'),
(175, 3, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-30 00:47:02', 'Hoan thanh', 'Da thanh toan'),
(176, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-06-30 00:47:48', 'Hoan thanh', 'Da thanh toan'),
(177, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-06-30 01:19:05', 'Dang phuc vu', 'Chua thanh toan'),
(178, 1, 'tai_cho', NULL, '0.00', 'chuyen_khoan', NULL, NULL, '2026-06-30 01:20:59', 'Hoan thanh', 'Da thanh toan'),
(179, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-01 22:22:45', 'Hoan thanh', 'Da thanh toan'),
(180, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-07-01 22:56:35', 'Dang phuc vu', 'Chua thanh toan'),
(181, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-07-01 22:56:43', 'Dang phuc vu', 'Chua thanh toan'),
(182, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-07-01 22:56:46', 'Dang phuc vu', 'Chua thanh toan'),
(183, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-07-01 22:56:47', 'Dang phuc vu', 'Chua thanh toan'),
(184, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-07-01 22:56:50', 'Dang phuc vu', 'Chua thanh toan'),
(185, NULL, 'giao_hang', NULL, '0.00', NULL, NULL, NULL, '2026-07-01 22:56:55', 'Dang phuc vu', 'Chua thanh toan'),
(186, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-02 12:04:35', 'Hoan thanh', 'Da thanh toan'),
(187, NULL, 'mang_ve', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-02 12:04:40', 'Hoan thanh', 'Da thanh toan'),
(188, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-02 12:08:47', 'Hoan thanh', 'Da thanh toan'),
(189, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-02 21:16:40', 'Hoan thanh', 'Da thanh toan'),
(190, 2, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-02 21:17:04', 'Hoan thanh', 'Da thanh toan'),
(191, 15, 'tai_cho', NULL, '0.00', 'chuyen_khoan', NULL, NULL, '2026-07-02 21:35:01', 'Hoan thanh', 'Da thanh toan'),
(192, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 00:37:41', 'Hoan thanh', 'Da thanh toan'),
(193, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 00:53:38', 'Hoan thanh', 'Da thanh toan'),
(194, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 15:30:58', 'Hoan thanh', 'Da thanh toan'),
(195, 1, 'tai_cho', NULL, '0.00', 'chuyen_khoan', NULL, NULL, '2026-07-03 16:42:49', 'Hoan thanh', 'Da thanh toan'),
(196, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 16:55:45', 'Hoan thanh', 'Da thanh toan'),
(197, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 17:07:40', 'Hoan thanh', 'Da thanh toan'),
(198, 27, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 17:12:36', 'Hoan thanh', 'Da thanh toan'),
(199, 12, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 17:14:09', 'Hoan thanh', 'Da thanh toan'),
(200, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 20:47:18', 'Hoan thanh', 'Da thanh toan'),
(201, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 20:51:45', 'Hoan thanh', 'Da thanh toan'),
(202, 14, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 20:51:54', 'Hoan thanh', 'Da thanh toan'),
(203, 13, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 20:51:56', 'Hoan thanh', 'Da thanh toan'),
(204, 8, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 20:53:21', 'Hoan thanh', 'Da thanh toan'),
(205, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 21:08:54', 'Hoan thanh', 'Da thanh toan'),
(206, NULL, 'mang_ve', NULL, '0.00', NULL, NULL, NULL, '2026-07-03 21:10:26', 'Dang phuc vu', 'Chua thanh toan'),
(207, NULL, 'mang_ve', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 21:10:26', 'Hoan thanh', 'Da thanh toan'),
(208, 3, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 14:30:28', 'Hoan thanh', 'Da thanh toan'),
(209, 1, 'tai_cho', NULL, '0.00', 'chuyen_khoan', NULL, NULL, '2026-07-03 14:33:03', 'Hoan thanh', 'Da thanh toan'),
(210, 3, 'tai_cho', NULL, '0.00', 'chuyen_khoan', NULL, NULL, '2026-07-03 14:33:14', 'Hoan thanh', 'Da thanh toan'),
(211, NULL, 'giao_hang', 'phuc', '20000.00', NULL, '0929929202', '21sdsa', '2026-07-03 14:35:42', 'Dang phuc vu', 'Chua thanh toan'),
(212, NULL, 'giao_hang', 'phuc', '20000.00', 'tien_mat', '0929929202', '21sdsa', '2026-07-03 14:35:42', 'Hoan thanh', 'Da thanh toan'),
(213, 1, 'tai_cho', NULL, '0.00', 'chuyen_khoan', NULL, NULL, '2026-07-03 14:38:33', 'Hoan thanh', 'Da thanh toan'),
(214, 3, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 14:53:29', 'Hoan thanh', 'Da thanh toan'),
(215, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 15:09:40', 'Hoan thanh', 'Da thanh toan'),
(216, 1, 'tai_cho', NULL, '0.00', 'tien_mat', NULL, NULL, '2026-07-03 15:23:10', 'Hoan thanh', 'Da thanh toan');

-- --------------------------------------------------------

--
-- Table structure for table `huy_mon_log`
--

DROP TABLE IF EXISTS `huy_mon_log`;
CREATE TABLE IF NOT EXISTS `huy_mon_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ma_don_hang` int(11) NOT NULL,
  `ma_mon` int(11) NOT NULL,
  `ten_mon` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_luong_huy` int(11) NOT NULL,
  `ngay_huy` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_huy_don` (`ma_don_hang`),
  KEY `idx_huy_ngay` (`ngay_huy`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `huy_mon_log`
--

INSERT INTO `huy_mon_log` (`id`, `ma_don_hang`, `ma_mon`, `ten_mon`, `so_luong_huy`, `ngay_huy`) VALUES
(1, 144, 30, 'MatCha Latte', 1, '2026-06-26 14:14:35'),
(2, 145, 29, 'Revive', 1, '2026-06-26 14:41:04'),
(3, 145, 29, 'Revive', 1, '2026-06-26 14:41:10'),
(4, 148, 30, 'MatCha Latte', 2, '2026-06-26 14:52:01'),
(5, 147, 30, 'MatCha Latte', 3, '2026-06-26 14:53:21'),
(6, 149, 29, 'Revive', 1, '2026-06-26 15:01:44'),
(7, 153, 30, 'MatCha Latte', 2, '2026-06-26 15:17:36'),
(8, 155, 30, 'MatCha Latte', 5, '2026-06-26 16:11:29'),
(9, 164, 23, 'Nước Suối', 1, '2026-06-29 21:33:48'),
(10, 165, 21, 'Cafe den', 1, '2026-06-29 21:44:49'),
(11, 168, 29, 'Revive', 2, '2026-06-29 22:32:39'),
(12, 170, 29, 'Revive', 2, '2026-06-30 00:13:17'),
(13, 171, 29, 'Revive', 4, '2026-06-30 00:23:46'),
(14, 171, 29, 'Revive', 4, '2026-06-30 00:24:28'),
(15, 171, 29, 'Revive', 3, '2026-06-30 00:31:31'),
(16, 171, 29, 'Revive', 3, '2026-06-30 00:32:05'),
(17, 171, 29, 'Revive', 3, '2026-06-30 00:37:23'),
(18, 136, 29, 'Revive', 1, '2026-06-30 00:43:33'),
(19, 173, 29, 'Revive', 1, '2026-06-30 00:47:18'),
(20, 178, 26, 'Pepsi', 1, '2026-07-01 22:12:59'),
(21, 191, 29, 'Revive', 2, '2026-07-02 21:36:14'),
(22, 213, 30, 'MatCha Latte', 1, '2026-07-03 14:52:12'),
(23, 213, 31, 'Soda chanh ', 1, '2026-07-03 14:53:06'),
(24, 215, 30, 'MatCha Latte', 1, '2026-07-03 15:10:05'),
(25, 216, 33, 'Sữa chua dâu', 1, '2026-07-03 15:23:24'),
(26, 216, 26, 'Pepsi', 3, '2026-07-03 15:24:07'),
(27, 216, 26, 'Pepsi', 1, '2026-07-03 15:24:32'),
(28, 216, 26, 'Pepsi', 1, '2026-07-03 15:24:32'),
(29, 216, 26, 'Pepsi', 1, '2026-07-03 15:24:33'),
(30, 216, 26, 'Pepsi', 1, '2026-07-03 15:24:33'),
(31, 216, 26, 'Pepsi', 1, '2026-07-03 15:24:33');

-- --------------------------------------------------------

--
-- Table structure for table `ky_luong`
--

DROP TABLE IF EXISTS `ky_luong`;
CREATE TABLE IF NOT EXISTS `ky_luong` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `thang` tinyint(4) NOT NULL,
  `nam` smallint(6) NOT NULL,
  `trang_thai` enum('chua_chot','da_chot','da_thanh_toan') NOT NULL DEFAULT 'chua_chot',
  `chot_luc` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_thang_nam` (`thang`,`nam`),
  KEY `idx_ky_luong_trang_thai` (`trang_thai`)
) ENGINE=InnoDB AUTO_INCREMENT=433 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `ky_luong`
--

INSERT INTO `ky_luong` (`id`, `thang`, `nam`, `trang_thai`, `chot_luc`, `created_at`, `updated_at`) VALUES
(1, 6, 2026, 'chua_chot', '2026-06-05 00:39:22', '2026-06-02 14:23:43', '2026-06-05 00:39:25'),
(146, 5, 2026, 'chua_chot', NULL, '2026-06-04 21:44:57', '2026-06-04 21:44:57'),
(405, 7, 2026, 'chua_chot', NULL, '2026-07-01 21:35:22', '2026-07-01 21:35:22');

-- --------------------------------------------------------

--
-- Table structure for table `mon`
--

DROP TABLE IF EXISTS `mon`;
CREATE TABLE IF NOT EXISTS `mon` (
  `ma_mon` int(11) NOT NULL AUTO_INCREMENT,
  `ma_danh_muc` int(11) DEFAULT NULL,
  `ten_mon` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gia_ban` decimal(10,2) NOT NULL DEFAULT '0.00',
  `hinh_anh` longtext COLLATE utf8mb4_unicode_ci,
  `mo_ta` text COLLATE utf8mb4_unicode_ci,
  `trang_thai_ban` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: Đang bán, 0: Tạm ngưng',
  PRIMARY KEY (`ma_mon`),
  KEY `fk_mon_danhmucmon` (`ma_danh_muc`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mon`
--

INSERT INTO `mon` (`ma_mon`, `ma_danh_muc`, `ten_mon`, `gia_ban`, `hinh_anh`, `mo_ta`, `trang_thai_ban`) VALUES
(21, 1, 'Cafe den', '25000.00', '/uploads/anh-mon/mon-cafe-den.svg', 'Cà phê đen nguyên chất', 1),
(22, 1, 'Cafe Sữa', '28000.00', '/uploads/anh-mon/mon-cafe-sua.svg', 'Cà phê sữa thơm béo', 1),
(23, 6, 'Nước Suối', '10000.00', '/uploads/anh-mon/mon-1782461597956.png', 'Nước suối tinh khiết', 1),
(25, 6, 'Coca', '20000.00', '/uploads/anh-mon/mon-1782461610401.png', 'Nước ngọt Coca Cola', 1),
(26, 6, 'Pepsi', '20000.00', '/uploads/anh-mon/mon-1781260998886.png', 'Nước ngọt Pepsi Cola', 1),
(29, 6, 'Revive', '20000.00', '/uploads/anh-mon/mon-1781255078983.png', 'Nước tăng lực', 1),
(30, 5, 'MatCha Latte', '40000.00', '/uploads/anh-mon/mon-1781430661731.png', NULL, 1),
(31, 2, 'Soda chanh ', '25000.00', '/uploads/anh-mon/mon-1783072023661.png', NULL, 1),
(32, 2, 'Soda', '20000.00', '/uploads/anh-mon/mon-1783072082762.png', NULL, 1),
(33, 4, 'Sữa chua dâu', '30000.00', '/uploads/anh-mon/mon-1783091944696.png', NULL, 1);

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
  `ma_nguyen_lieu` int(11) NOT NULL AUTO_INCREMENT,
  `ten_nguyen_lieu` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `danh_muc` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Khác',
  `don_vi_tinh` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'g',
  `don_vi_nhap` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `don_vi_dong_goi` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dung_tich_san_pham` decimal(10,2) NOT NULL DEFAULT '1.00',
  `ton_kho` decimal(10,2) NOT NULL DEFAULT '0.00',
  `nguong_canh_bao` decimal(10,2) NOT NULL DEFAULT '1000.00',
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `trang_thai` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=đang dùng, 0=ngưng',
  PRIMARY KEY (`ma_nguyen_lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nguyenlieu`
--

INSERT INTO `nguyenlieu` (`ma_nguyen_lieu`, `ten_nguyen_lieu`, `danh_muc`, `don_vi_tinh`, `don_vi_nhap`, `don_vi_dong_goi`, `dung_tich_san_pham`, `ton_kho`, `nguong_canh_bao`, `ghi_chu`, `trang_thai`) VALUES
(1, 'CoCa', 'Nước uống đóng chai', 'lon', 'lon', NULL, '1.00', '20.00', '10.00', NULL, 1),
(2, 'Sting', 'Nước uống đóng chai', 'lon', 'lon', NULL, '1.00', '30.00', '10.00', NULL, 1),
(3, 'Bột Cafe Đen', 'Nguyên liệu pha chế', 'g', 'gói', 'KG', '1000.00', '1850.00', '100.00', NULL, 1),
(4, 'Nước Suối', 'Nước uống đóng chai', 'chai', 'chai', NULL, '1.00', '16.00', '1.00', NULL, 1),
(5, 'Bột Cafe Sữa', 'Nguyên liệu pha chế', 'g', 'gói', 'KG', '1000.00', '500.00', '1000.00', NULL, 1),
(6, 'Sữa Đặc', 'Nguyên liệu pha chế', 'ml', 'lon', 'Lon', '300.00', '1470.00', '100.00', NULL, 1),
(7, 'Pepsi', 'Nước uống đóng chai', 'lon', 'lon', NULL, '1.00', '3.00', '10.00', NULL, 1),
(8, 'Revive', 'Nước uống đóng chai', 'chai', 'chai', NULL, '1.00', '14.00', '10.00', NULL, 1),
(9, 'Bột Matcha', 'Nguyên liệu pha chế', 'g', 'gói', 'KG', '1000.00', '630.00', '200.00', NULL, 1),
(10, 'Sữa Gấu', 'Nguyên liệu pha chế', 'ml', 'lon', 'Lon', '280.00', '2721.00', '280.00', NULL, 1),
(11, 'Đường', 'Nguyên liệu pha chế', 'g', 'gói', 'KG', '500.00', '1315.00', '200.00', NULL, 1),
(12, 'Sữa tươi', 'Nguyên liệu pha chế', 'ml', 'hộp', 'Hộp', '500.00', '2460.00', '100.00', NULL, 1),
(13, 'Bột cafe sữa tươi', 'Nguyên liệu pha chế', 'g', 'gói', 'Gói', '1000.00', '2000.00', '200.00', NULL, 1),
(14, 'Soda', 'Nước uống đóng chai', 'lon', 'lon', NULL, '1.00', '15.00', '10.00', NULL, 1),
(15, 'Chanh', 'Nguyên liệu hết trong ngày', 'g', 'kg', NULL, '1000.00', '888.00', '500.00', NULL, 1),
(16, 'Mứt Dâu', 'Nguyên liệu pha chế', 'ml', 'chai', NULL, '500.00', '970.00', '100.00', NULL, 1),
(17, 'Sữa chua không đường', 'Nguyên liệu pha chế', 'g', 'hộp', NULL, '100.00', '2999.00', '10.00', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `nhanvien`
--

DROP TABLE IF EXISTS `nhanvien`;
CREATE TABLE IF NOT EXISTS `nhanvien` (
  `ma_nhan_vien` int(11) NOT NULL AUTO_INCREMENT,
  `ten` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `so_dien_thoai` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dia_chi` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
(11, 'Nguyên Thị Duyên', '2000-02-01', '44343422', '12ww', 'dang_lam'),
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
  `ma_nhan_vien` int(11) NOT NULL,
  `luong_gio` decimal(12,2) NOT NULL DEFAULT '0.00',
  `phu_cap_mac_dinh` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tinh_trang` enum('dang_lam','tam_nghi','da_nghi') NOT NULL DEFAULT 'dang_lam',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_nhan_vien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `nhanvien_luong`
--

INSERT INTO `nhanvien_luong` (`ma_nhan_vien`, `luong_gio`, `phu_cap_mac_dinh`, `tinh_trang`, `created_at`, `updated_at`) VALUES
(3, '29000.00', '150000.00', 'dang_lam', '2026-06-02 15:22:23', '2026-06-05 00:52:07'),
(4, '30000.00', '200000.00', 'dang_lam', '2026-06-02 15:22:23', '2026-06-02 15:22:23'),
(5, '32000.00', '250000.00', 'dang_lam', '2026-06-02 15:22:23', '2026-06-02 15:22:23'),
(6, '35000.00', '250000.00', 'dang_lam', '2026-06-02 15:22:23', '2026-06-04 21:26:18'),
(7, '36000.00', '350000.00', 'dang_lam', '2026-06-02 15:22:24', '2026-06-02 15:22:24'),
(11, '0.00', '0.00', 'dang_lam', '2026-06-05 00:44:16', '2026-06-05 13:48:02'),
(12, '0.00', '0.00', 'dang_lam', '2026-06-04 21:17:53', '2026-06-04 21:17:53'),
(14, '0.00', '0.00', 'dang_lam', '2026-06-04 21:17:53', '2026-06-04 21:17:53'),
(15, '0.00', '0.00', 'dang_lam', '2026-06-04 21:17:53', '2026-06-04 21:17:53'),
(16, '36000.00', '320000.00', 'dang_lam', '2026-06-04 21:17:53', '2026-06-05 00:45:10');

-- --------------------------------------------------------

--
-- Table structure for table `phancong`
--

DROP TABLE IF EXISTS `phancong`;
CREATE TABLE IF NOT EXISTS `phancong` (
  `ma_nhan_vien` int(11) NOT NULL,
  `ma_ca` int(11) NOT NULL,
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
(16, 3, '2026-06-04');

-- --------------------------------------------------------

--
-- Table structure for table `phieunhap`
--

DROP TABLE IF EXISTS `phieunhap`;
CREATE TABLE IF NOT EXISTS `phieunhap` (
  `ma_phieu` int(11) NOT NULL AUTO_INCREMENT,
  `ngay_nhap` datetime DEFAULT CURRENT_TIMESTAMP,
  `nha_cung_cap` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Đại lý tự do',
  `tong_tien` decimal(12,2) NOT NULL DEFAULT '0.00',
  `ghi_chu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `da_thanh_toan` tinyint(1) NOT NULL DEFAULT '0',
  `ngay_thanh_toan` datetime DEFAULT NULL,
  `so_tien_da_tra` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`ma_phieu`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `phieunhap`
--

INSERT INTO `phieunhap` (`ma_phieu`, `ngay_nhap`, `nha_cung_cap`, `tong_tien`, `ghi_chu`, `da_thanh_toan`, `ngay_thanh_toan`, `so_tien_da_tra`) VALUES
(1, '2026-05-16 21:10:33', 'ACH', '500000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(2, '2026-05-16 21:15:10', 'a', '120000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(3, '2026-05-16 21:25:38', 'CH', '100000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(4, '2026-05-17 15:07:51', 'A', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(5, '2026-05-17 15:26:50', 'ACX', '400000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(6, '2026-05-17 15:27:46', 'a', '400000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(7, '2026-05-17 15:29:03', 'a', '400000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(8, '2026-05-17 15:30:50', 'q', '400000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(9, '2026-05-19 00:00:00', 'TEA', '800000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(10, '2026-05-19 00:00:00', 'A', '100000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(11, '2026-05-19 00:00:00', 'A', '100000000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(12, '2026-05-19 00:00:00', 'Đại lý tự do', '100000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(13, '2026-05-19 00:00:00', 'Đại lý tự do', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(14, '2026-05-19 00:00:00', 'Đại lý tự do', '200000000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(15, '2026-05-19 00:00:00', 'Đại lý tự do', '20000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(16, '2026-05-19 00:00:00', 'AD', '10000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(17, '2026-06-05 22:47:53', 'ABC', '400000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(18, '2026-06-05 22:48:15', 'A', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(19, '2026-06-05 22:48:29', 'A', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(20, '2026-06-05 22:53:09', 'A', '100000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(21, '2026-06-06 06:01:33', 'A', '400000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(22, '2026-06-06 06:03:53', 'ASS', '400000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(23, '2026-06-06 06:04:12', 'Đại lý tự do', '60000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(24, '2026-06-06 06:08:51', 'd', '50000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(25, '2026-06-08 01:40:07', 'AS', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(26, '2026-06-11 23:30:10', 'A', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(27, '2026-06-13 00:52:33', 'ASX', '100000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(28, '2026-06-14 23:52:38', 'AC', '800000.00', 'A', 0, NULL, '0.00'),
(29, '2026-06-14 23:53:25', 'AGGG', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(30, '2026-06-14 23:53:47', 'A', '50000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(31, '2026-06-26 21:40:39', 'Đại lý tự do', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(32, '2026-06-30 04:46:24', 'Đại lý tự do', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(33, '2026-06-30 04:46:37', 'Đại lý tự do', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(34, '2026-06-30 04:47:01', 'Đại lý tự do', '300000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(35, '2026-06-30 04:47:12', 'Đại lý tự do', '300000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(36, '2026-06-30 04:47:32', 'Đại lý tự do', '299970.00', 'Nhập kho hệ thống', 1, '2026-07-02 11:10:41', '299970.00'),
(37, '2026-06-30 04:50:08', 'Đại lý tự do', '300000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(38, '2026-06-30 04:55:13', 'Đại lý tự do', '30000.00', 'Nhập kho hệ thống', 1, '2026-07-02 11:10:19', '30000.00'),
(39, '2026-06-30 07:19:47', 'Đại lý tự do', '30000.00', 'Nhập kho hệ thống', 1, '2026-07-01 21:59:13', '30000.00'),
(40, '2026-06-30 07:38:13', 'Đại lý tự do', '50000.00', 'Nhập kho hệ thống', 1, '2026-07-01 21:58:53', '50000.00'),
(41, '2026-07-03 04:34:19', 'ABC', '200000.00', 'Nhập kho hệ thống', 1, '2026-07-03 14:48:54', '200000.00'),
(42, '2026-07-03 07:01:55', 'Đại lý tự do', '100000.00', 'Nhập kho hệ thống', 1, '2026-07-03 00:04:28', '100000.00'),
(43, '2026-07-03 07:15:03', 'Đại lý tự do', '100000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(44, '2026-07-03 07:21:21', 'Đại lý tự do', '50000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(45, '2026-07-03 07:29:45', 'Đại lý tự do', '200000.00', 'Nhập kho hệ thống', 1, '2026-07-03 10:03:01', '200000.00'),
(46, '2026-07-02 17:00:00', 'Đại lý tự do', '20000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(47, '2026-07-02 17:00:00', 'Đại lý tự do', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(48, '2026-07-02 17:00:00', 'Đại lý tự do', '20000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(49, '2026-07-02 17:00:00', 'Đại lý tự do', '20000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(50, '2026-07-02 17:00:00', 'Đại lý tự do', '20000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(51, '2026-07-02 17:00:00', 'Đại lý tự do', '300000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(52, '2026-07-02 17:00:00', 'Đại lý tự do', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(53, '2026-07-02 17:00:00', 'Đại lý tự do', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(54, '2026-07-02 17:00:00', 'Đại lý tự do', '150000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(55, '2026-07-02 17:00:00', 'Đại lý tự do', '250000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(56, '2026-07-02 17:00:00', 'Đại lý tự do', '200000.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(57, '2026-07-02 17:00:00', 'Đại lý tự do', '99980.00', 'Nhập kho hệ thống', 0, NULL, '0.00'),
(58, '2026-07-02 17:00:00', 'Đại lý tự do', '50000.00', 'Nhập kho hệ thống', 0, NULL, '0.00');

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
-- Constraints for table `chitiethoadon`
--
ALTER TABLE `chitiethoadon`
  ADD CONSTRAINT `fk_cthd_donhang` FOREIGN KEY (`ma_don_hang`) REFERENCES `donhang` (`ma_don_hang`) ON DELETE CASCADE;

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
