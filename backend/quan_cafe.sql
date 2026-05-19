-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 19, 2026 at 03:37 AM
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
-- Table structure for table `calam`
--

DROP TABLE IF EXISTS `calam`;
CREATE TABLE IF NOT EXISTS `calam` (
  `ma_ca` int(11) NOT NULL AUTO_INCREMENT,
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
  `ma_don_hang` int(11) NOT NULL,
  `ma_mon` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL,
  `ghi_chu_mon` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
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
  `ma_chi_tiet` int(11) NOT NULL AUTO_INCREMENT,
  `ma_phieu` int(11) NOT NULL,
  `ma_nguyen_lieu` int(11) NOT NULL,
  `so_luong_nhap` decimal(10,2) NOT NULL,
  `gia_nhap` decimal(12,2) NOT NULL,
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `fk_ctpn_phieu` (`ma_phieu`),
  KEY `fk_ctpn_nguyenlieu` (`ma_nguyen_lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chitiet_phieunhap`
--

INSERT INTO `chitiet_phieunhap` (`ma_chi_tiet`, `ma_phieu`, `ma_nguyen_lieu`, `so_luong_nhap`, `gia_nhap`) VALUES
(4, 4, 90, '1.00', '200000.00'),
(5, 5, 59, '2.00', '200000.00'),
(6, 6, 59, '2.00', '200000.00'),
(7, 7, 59, '2.00', '200000.00'),
(8, 8, 77, '2.00', '200000.00');

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
(1, 'admin', '$2b$10$vQYMu8R3gvu5jNkxrSftVe5Yl.RjfsLNVT91YKR4DfqTBO5aXbzr6', 'admin');

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
(1, 1, '100.00', 'ml'),
(1, 2, '20.00', 'ml'),
(1, 3, '15.00', 'ml'),
(1, 4, '1.00', 'Ly'),
(2, 4, '1.00', 'Ly'),
(2, 5, '100.00', 'ml'),
(2, 6, '30.00', 'ml'),
(2, 7, '2.00', 'Lát'),
(3, 4, '1.00', 'Ly'),
(3, 8, '100.00', 'ml'),
(3, 9, '25.00', 'ml'),
(3, 10, '3.00', 'Quả'),
(4, 4, '1.00', 'Ly'),
(4, 11, '80.00', 'ml'),
(4, 12, '40.00', 'ml'),
(4, 13, '1.00', 'g'),
(5, 4, '1.00', 'Ly'),
(5, 14, '70.00', 'ml'),
(5, 15, '50.00', 'g'),
(5, 16, '10.00', 'ml'),
(6, 4, '1.00', 'Ly'),
(6, 17, '100.00', 'ml'),
(6, 18, '20.00', 'g'),
(6, 19, '2.00', 'Quả'),
(7, 20, '100.00', 'ml'),
(7, 21, '25.00', 'ml'),
(7, 22, '4.00', 'Quả'),
(8, 23, '80.00', 'ml'),
(8, 24, '35.00', 'ml'),
(8, 25, '20.00', 'g'),
(9, 26, '90.00', 'ml'),
(9, 27, '30.00', 'ml'),
(9, 28, '15.00', 'g'),
(10, 4, '1.00', 'Ly'),
(10, 29, '1.00', 'Hũ'),
(10, 30, '30.00', 'ml'),
(10, 31, '15.00', 'ml'),
(11, 32, '30.00', 'ml'),
(11, 33, '80.00', 'g'),
(11, 34, '20.00', 'ml'),
(12, 35, '1.00', 'Hũ'),
(12, 36, '25.00', 'ml'),
(12, 37, '30.00', 'g'),
(13, 38, '80.00', 'g'),
(13, 39, '35.00', 'ml'),
(13, 40, '5.00', 'g'),
(14, 41, '1.00', 'Hũ'),
(14, 42, '20.00', 'g'),
(14, 43, '30.00', 'g'),
(15, 44, '25.00', 'g'),
(15, 45, '80.00', 'ml'),
(16, 46, '25.00', 'g'),
(16, 47, '25.00', 'ml'),
(17, 48, '30.00', 'g'),
(17, 49, '90.00', 'ml'),
(18, 50, '30.00', 'g'),
(18, 51, '30.00', 'ml'),
(19, 52, '40.00', 'ml'),
(19, 53, '30.00', 'ml'),
(20, 54, '120.00', 'ml'),
(20, 55, '40.00', 'ml'),
(20, 56, '15.00', 'ml'),
(21, 57, '20.00', 'g'),
(21, 58, '120.00', 'ml'),
(22, 59, '20.00', 'g'),
(22, 60, '30.00', 'ml'),
(23, 61, '1.00', 'Túi'),
(23, 62, '15.00', 'g'),
(24, 63, '150.00', 'ml'),
(24, 64, '20.00', 'ml'),
(25, 65, '150.00', 'ml'),
(25, 66, '25.00', 'ml'),
(26, 67, '150.00', 'ml'),
(26, 68, '20.00', 'ml'),
(27, 69, '150.00', 'ml'),
(27, 70, '15.00', 'ml'),
(28, 71, '120.00', 'ml'),
(28, 72, '35.00', 'ml'),
(29, 73, '120.00', 'ml'),
(29, 74, '25.00', 'g'),
(30, 75, '3.00', 'g'),
(30, 76, '150.00', 'ml'),
(31, 77, '25.00', 'g'),
(31, 78, '120.00', 'ml'),
(32, 82, '20.00', 'ml'),
(33, 82, '20.00', 'ml'),
(33, 83, '30.00', 'g'),
(33, 84, '120.00', 'ml'),
(34, 85, '40.00', 'g'),
(34, 86, '20.00', 'ml'),
(34, 87, '120.00', 'ml'),
(35, 88, '1.00', 'Lon'),
(36, 89, '1.00', 'Lon'),
(37, 90, '1.00', 'Chai'),
(38, 91, '1.00', 'Lon'),
(39, 92, '1.00', 'Lon'),
(40, 93, '1.00', 'Lon'),
(41, 94, '1.00', 'Chai');

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
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `trang_thai_don` varchar(50) DEFAULT NULL,
  `trang_thai_thanh_toan` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ma_don_hang`),
  KEY `ma_ban` (`ma_ban`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `lichsunhap`
--

DROP TABLE IF EXISTS `lichsunhap`;
CREATE TABLE IF NOT EXISTS `lichsunhap` (
  `ma_phieu_nhap` int(11) NOT NULL,
  `ma_nguyen_lieu` int(11) NOT NULL,
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
  `ma_mon` int(11) NOT NULL AUTO_INCREMENT,
  `ma_danh_muc` int(11) DEFAULT NULL,
  `ten_mon` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gia_ban` decimal(10,2) NOT NULL DEFAULT '0.00',
  `hinh_anh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai_ban` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: Đang bán, 0: Tạm ngưng',
  PRIMARY KEY (`ma_mon`),
  KEY `fk_mon_danhmucmon` (`ma_danh_muc`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mon`
--

INSERT INTO `mon` (`ma_mon`, `ma_danh_muc`, `ten_mon`, `gia_ban`, `hinh_anh`, `trang_thai_ban`) VALUES
(1, 3, 'Trà Chanh', '25000.00', NULL, 1),
(2, 3, 'Trà Đào', '28000.00', NULL, 1),
(3, 3, 'Trà Vải', '28000.00', NULL, 1),
(4, 3, 'Trà Ổi', '28000.00', NULL, 1),
(5, 3, 'Trà Mãng Cầu', '30000.00', NULL, 1),
(6, 3, 'Trà Dâu Tây', '30000.00', NULL, 1),
(7, 3, 'Trà Nhãn', '30000.00', NULL, 1),
(8, 3, 'Trà Xoài', '30000.00', NULL, 1),
(9, 3, 'Trà Dâu Tằm', '30000.00', NULL, 1),
(10, 4, 'Sữa chua Đá', '25000.00', NULL, 1),
(11, 4, 'Sữa chua Cafe', '28000.00', NULL, 1),
(12, 4, 'Sữa chua Dâu', '28000.00', NULL, 1),
(13, 4, 'Sữa chua Dưa lưới', '30000.00', NULL, 1),
(14, 4, 'Sữa chua Đác Thơm', '32000.00', NULL, 1),
(15, 1, 'Cafe Đen', '18000.00', NULL, 1),
(16, 1, 'Cafe Sữa', '22000.00', NULL, 1),
(17, 1, 'Cafe Đen nguyên chất', '20000.00', NULL, 1),
(18, 1, 'Cafe Sữa nguyên chất', '25000.00', NULL, 1),
(19, 1, 'Cafe Muối Nắng', '28000.00', NULL, 1),
(20, 1, 'Bạc Xỉu Nắng', '26000.00', NULL, 1),
(21, 1, 'Cacao (Nóng/Đá)', '25000.00', NULL, 1),
(22, 1, 'Cacao Muối', '28000.00', NULL, 1),
(23, 1, 'Trà Lipton', '20000.00', NULL, 1),
(24, 2, 'Soda Biển Xanh', '25000.00', NULL, 1),
(25, 2, 'Soda Dâu', '25000.00', NULL, 1),
(26, 2, 'Soda Việt Quất', '25000.00', NULL, 1),
(27, 2, 'Soda Bạc Hà', '25000.00', NULL, 1),
(28, 5, 'Latte Dâu', '32000.00', NULL, 1),
(29, 5, 'Latte Việt Quất', '32000.00', NULL, 1),
(30, 5, 'Latte Matcha', '32000.00', NULL, 1),
(31, 5, 'Latte Khoai môn', '32000.00', NULL, 1),
(32, 5, 'Cacao Matcha Latte', '35000.00', NULL, 1),
(33, 5, 'Sữa tươi socola đường đen', '30000.00', NULL, 1),
(34, 5, 'Sữa tươi trân châu đường đen', '30000.00', NULL, 1),
(35, 6, 'Yến', '15000.00', NULL, 1),
(36, 6, 'Bò húc', '18000.00', NULL, 1),
(37, 6, 'Trà xanh', '15000.00', NULL, 1),
(38, 6, 'Coca Cola', '15000.00', NULL, 1),
(39, 6, 'Sting', '15000.00', NULL, 1),
(40, 6, 'Revive', '15000.00', NULL, 1),
(41, 6, 'Bí đao', '15000.00', NULL, 1);

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
  `ma_nguyen_lieu` int(11) NOT NULL AUTO_INCREMENT,
  `ten_nguyen_lieu` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `don_vi_nhap` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dung_tich_san_pham` decimal(10,2) NOT NULL DEFAULT '1.00',
  `ml_thuc_te_ton` decimal(10,2) NOT NULL DEFAULT '0.00',
  `nguong_canh_bao` decimal(10,2) NOT NULL DEFAULT '1000.00',
  PRIMARY KEY (`ma_nguyen_lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nguyenlieu`
--

INSERT INTO `nguyenlieu` (`ma_nguyen_lieu`, `ten_nguyen_lieu`, `don_vi_nhap`, `dung_tich_san_pham`, `ml_thuc_te_ton`, `nguong_canh_bao`) VALUES
(1, 'Trà đen', 'kg', '1.00', '10000.00', '1000.00'),
(2, 'Chanh tươi', 'kg', '1.00', '5000.00', '1000.00'),
(3, 'Syrup đường', 'chai', '1.00', '5000.00', '1000.00'),
(4, 'Đá viên', 'kg', '1.00', '50000.00', '1000.00'),
(5, 'Trà lài', 'kg', '1.00', '10000.00', '1000.00'),
(6, 'Syrup đào', 'chai', '1.00', '3000.00', '1000.00'),
(7, 'Đào ngâm', 'hộp', '1.00', '2000.00', '1000.00'),
(8, 'Trà nhài', 'kg', '1.00', '10000.00', '1000.00'),
(9, 'Syrup vải', 'chai', '1.00', '3000.00', '1000.00'),
(10, 'Trái vải ngâm', 'hộp', '1.00', '2000.00', '1000.00'),
(11, 'Trà xanh', 'kg', '1.00', '10000.00', '1000.00'),
(12, 'Nước ép ổi', 'chai', '1.00', '5000.00', '1000.00'),
(13, 'Muối hồng', 'kg', '1.00', '1000.00', '1000.00'),
(14, 'Trà ô long', 'kg', '1.00', '10000.00', '1000.00'),
(15, 'Mãng cầu xay', 'kg', '1.00', '5000.00', '1000.00'),
(16, 'Sữa đặc', 'lon', '1.00', '10000.00', '1000.00'),
(17, 'Trà hibiscus', 'kg', '1.00', '5000.00', '1000.00'),
(18, 'Mứt dâu', 'chai', '1.00', '3000.00', '1000.00'),
(19, 'Dâu tươi', 'kg', '1.00', '2000.00', '1000.00'),
(20, 'Trà bá tước', 'kg', '1.00', '5000.00', '1000.00'),
(21, 'Syrup nhãn', 'chai', '1.00', '3000.00', '1000.00'),
(22, 'Nhãn ngâm', 'hộp', '1.00', '2000.00', '1000.00'),
(23, 'Trà sen', 'kg', '1.00', '5000.00', '1000.00'),
(24, 'Puree xoài', 'chai', '1.00', '3000.00', '1000.00'),
(25, 'Xoài cắt hạt', 'kg', '1.00', '2000.00', '1000.00'),
(26, 'Trà đen lạnh', 'kg', '1.00', '5000.00', '1000.00'),
(27, 'Syrup dâu tằm', 'chai', '1.00', '3000.00', '1000.00'),
(28, 'Dâu tằm ngâm', 'hộp', '1.00', '2000.00', '1000.00'),
(29, 'Sữa chua cái', 'hũ', '1.00', '50.00', '1000.00'),
(30, 'Sữa tươi', 'hộp', '1.00', '20000.00', '1000.00'),
(31, 'Đường nước', 'chai', '1.00', '5000.00', '1000.00'),
(32, 'Cafe espresso', 'kg', '1.00', '5000.00', '1000.00'),
(33, 'Sữa chua Hy Lạp', 'hũ', '1.00', '5000.00', '1000.00'),
(34, 'Sữa béo', 'hộp', '1.00', '5000.00', '1000.00'),
(35, 'Sữa chua không đường', 'hũ', '1.00', '50.00', '1000.00'),
(36, 'Syrup dâu đỏ', 'chai', '1.00', '3000.00', '1000.00'),
(37, 'Dâu đông lạnh', 'kg', '1.00', '3000.00', '1000.00'),
(38, 'Sữa chua lên men', 'hũ', '1.00', '5000.00', '1000.00'),
(39, 'Puree dưa lưới', 'chai', '1.00', '3000.00', '1000.00'),
(40, 'Hạt chia', 'kg', '1.00', '1000.00', '1000.00'),
(41, 'Sữa chua vinamilk', 'hũ', '1.00', '50.00', '1000.00'),
(42, 'Hạt đác', 'kg', '1.00', '2000.00', '1000.00'),
(43, 'Thơm vàng', 'kg', '1.00', '2000.00', '1000.00'),
(44, 'Bột cafe robusta', 'kg', '1.00', '5000.00', '1000.00'),
(45, 'Nước nóng', 'ml', '1.00', '100000.00', '1000.00'),
(46, 'Cafe arabica', 'kg', '1.00', '5000.00', '1000.00'),
(47, 'Sữa đặc ông thọ', 'lon', '1.00', '5000.00', '1000.00'),
(48, 'Cafe mộc nguyên chất', 'kg', '1.00', '5000.00', '1000.00'),
(49, 'Nước tinh khiết', 'ml', '1.00', '100000.00', '1000.00'),
(50, 'Cafe rang medium', 'kg', '1.00', '5000.00', '1000.00'),
(51, 'Kem sữa', 'chai', '1.00', '5000.00', '1000.00'),
(52, 'Cafe pha phin', 'kg', '1.00', '5000.00', '1000.00'),
(53, 'Kem muối', 'chai', '1.00', '3000.00', '1000.00'),
(54, 'Sữa tươi không đường', 'hộp', '1.00', '10000.00', '1000.00'),
(55, 'Foam sữa', 'chai', '1.00', '3000.00', '1000.00'),
(56, 'Cafe shot', 'ml', '1.00', '5000.00', '1000.00'),
(57, 'Bột cacao nguyên chất', 'kg', '1.00', '3000.00', '1000.00'),
(58, 'Sữa nóng', 'ml', '1.00', '10000.00', '1000.00'),
(59, 'Bột cacao dark', 'kg', '1.00', '3006.00', '1000.00'),
(60, 'Kem cheese mặn', 'chai', '1.00', '3000.00', '1000.00'),
(61, 'Trà Lipton túi lọc', 'túi', '1.00', '200.00', '1000.00'),
(62, 'Đường vàng', 'kg', '1.00', '3000.00', '1000.00'),
(63, 'Soda Schweppes', 'lon', '1.00', '20000.00', '1000.00'),
(64, 'Syrup blue curacao', 'chai', '1.00', '3000.00', '1000.00'),
(65, 'Soda lạnh', 'lon', '1.00', '20000.00', '1000.00'),
(66, 'Syrup strawberry', 'chai', '1.00', '3000.00', '1000.00'),
(67, 'Soda tonic', 'lon', '1.00', '20000.00', '1000.00'),
(68, 'Syrup blueberry', 'chai', '1.00', '3000.00', '1000.00'),
(69, 'Sparkling water', 'lon', '1.00', '20000.00', '1000.00'),
(70, 'Syrup mint', 'chai', '1.00', '3000.00', '1000.00'),
(71, 'Sữa tươi Anchor', 'hộp', '1.00', '10000.00', '1000.00'),
(72, 'Puree dâu handmade', 'chai', '1.00', '3000.00', '1000.00'),
(73, 'Sữa hạnh nhân', 'hộp', '1.00', '10000.00', '1000.00'),
(74, 'Mứt việt quất', 'chai', '1.00', '3000.00', '1000.00'),
(75, 'Bột matcha Nhật', 'kg', '1.00', '2000.00', '1000.00'),
(76, 'Sữa kem béo', 'hộp', '1.00', '5000.00', '1000.00'),
(77, 'Bột khoai môn', 'kg', '1.00', '2002.00', '1000.00'),
(78, 'Sữa béo thực vật', 'hộp', '1.00', '5000.00', '1000.00'),
(79, 'Matcha ceremonial', 'kg', '1.00', '2000.00', '1000.00'),
(80, 'Cacao trắng', 'kg', '1.00', '2000.00', '1000.00'),
(81, 'Sữa yến mạch', 'hộp', '1.00', '10000.00', '1000.00'),
(82, 'Socola syrup', 'chai', '1.00', '3000.00', '1000.00'),
(83, 'Trân châu đường đen', 'kg', '1.00', '5000.00', '1000.00'),
(84, 'Sữa thanh trùng', 'hộp', '1.00', '10000.00', '1000.00'),
(85, 'Trân châu hoàng kim', 'kg', '1.00', '5000.00', '1000.00'),
(86, 'Đường đen Hàn Quốc', 'chai', '1.00', '3000.00', '1000.00'),
(87, 'Sữa fresh milk', 'hộp', '1.00', '10000.00', '1000.00'),
(88, 'Nước yến đóng lon', 'lon', '1.00', '100.00', '1000.00'),
(89, 'Lon Red Bull', 'lon', '1.00', '100.00', '1000.00'),
(90, 'Chai trà xanh đóng chai', 'chai', '1.00', '101.00', '100.00'),
(91, 'Lon Coca Cola', 'lon', '1.00', '100.00', '1000.00'),
(92, 'Sting dâu', 'lon', '1.00', '100.00', '1000.00'),
(93, 'Revive muối khoáng', 'lon', '1.00', '100.00', '1000.00'),
(94, 'Nước bí đao đóng chai', 'chai', '1.00', '100.00', '1000.00');

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
  `trang_thai` tinyint(1) DEFAULT '1' COMMENT '1: active, 0: hidden',
  PRIMARY KEY (`ma_nhan_vien`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nhanvien`
--

INSERT INTO `nhanvien` (`ma_nhan_vien`, `ten`, `ngay_sinh`, `so_dien_thoai`, `dia_chi`, `trang_thai`) VALUES
(3, 'Đào Văn Nguyên', '2026-03-28', '123456', '12a', 1),
(4, 'Trần Văn Hải', '2026-03-28', '020023210', '21a', 1),
(5, 'Đặng Ngọc Lam', '2026-03-22', '12121212', '224a', 1),
(6, 'Nguyễn Chí Thanh', '2026-04-01', '232442234', '444f', 1),
(7, 'Lê Hoàng Long', '2026-03-29', '12121212', '23d', 1),
(11, 'Nguyên Thị Duyên', '2000-02-01', '44343422', '12ww', 1),
(12, 'Lê Trọng Khiêm', '2003-02-02', '23232232', '121e', 1),
(14, 'Lê Văn Cam', '1999-11-12', '121212121', '12ww', 1),
(15, 'Lê Văn H', '1999-02-02', '1212121', '12g', 0);

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
(4, 1, '2026-04-09'),
(4, 1, '2026-04-10'),
(4, 1, '2026-04-22'),
(4, 1, '2026-05-16'),
(5, 1, '2026-04-15'),
(5, 1, '2026-05-13'),
(5, 1, '2026-05-16'),
(6, 1, '2026-04-10'),
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
(1, 2, '2026-04-13'),
(1, 2, '2026-05-14'),
(3, 2, '2026-04-06'),
(3, 2, '2026-04-11'),
(3, 2, '2026-04-22'),
(3, 2, '2026-05-15'),
(4, 2, '2026-04-07'),
(4, 2, '2026-04-10'),
(5, 2, '2026-04-07'),
(5, 2, '2026-04-08'),
(5, 2, '2026-04-09'),
(5, 2, '2026-04-10'),
(5, 2, '2026-04-12'),
(6, 2, '2026-04-11'),
(7, 2, '2026-04-09'),
(7, 2, '2026-04-12'),
(8, 2, '2026-04-06'),
(8, 2, '2026-04-08'),
(8, 2, '2026-04-13'),
(9, 2, '2026-04-06'),
(11, 2, '2026-05-17'),
(1, 3, '2026-04-10'),
(3, 3, '2026-04-09'),
(3, 3, '2026-04-11'),
(3, 3, '2026-05-15'),
(4, 3, '2026-04-08'),
(4, 3, '2026-04-13'),
(5, 3, '2026-04-11'),
(5, 3, '2026-04-12'),
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
(12, 3, '2026-05-17');

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
  PRIMARY KEY (`ma_phieu`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `phieunhap`
--

INSERT INTO `phieunhap` (`ma_phieu`, `ngay_nhap`, `nha_cung_cap`, `tong_tien`, `ghi_chu`) VALUES
(1, '2026-05-16 21:10:33', 'ACH', '500000.00', 'Nhập kho hệ thống'),
(2, '2026-05-16 21:15:10', 'a', '120000.00', 'Nhập kho hệ thống'),
(3, '2026-05-16 21:25:38', 'CH', '100000.00', 'Nhập kho hệ thống'),
(4, '2026-05-17 15:07:51', 'A', '200000.00', 'Nhập kho hệ thống'),
(5, '2026-05-17 15:26:50', 'ACX', '400000.00', 'Nhập kho hệ thống'),
(6, '2026-05-17 15:27:46', 'a', '400000.00', 'Nhập kho hệ thống'),
(7, '2026-05-17 15:29:03', 'a', '400000.00', 'Nhập kho hệ thống'),
(8, '2026-05-17 15:30:50', 'q', '400000.00', 'Nhập kho hệ thống');

--
-- Constraints for dumped tables
--

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
