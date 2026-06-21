-- N.C Finance Database Schema
-- MySQL 8.0+
-- Run with an admin account: mysql -u root < schema.sql

DROP DATABASE IF EXISTS ncfinance;
CREATE DATABASE ncfinance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ncfinance;

CREATE TABLE users (
id VARCHAR(8) PRIMARY KEY,
email VARCHAR(120) NOT NULL UNIQUE,
hashed_password VARCHAR(160) NOT NULL,
nama VARCHAR(120) NOT NULL,
role ENUM('staf','manajer') NOT NULL DEFAULT 'staf',
no_hp VARCHAR(20),
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE kursus (
kode VARCHAR(16) PRIMARY KEY,
nama VARCHAR(120) NOT NULL,
biaya DECIMAL(12,2) NOT NULL,
durasi_minggu INT NOT NULL DEFAULT 0,
deskripsi TEXT,
status_aktif TINYINT NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE siswa (
id VARCHAR(8) PRIMARY KEY,
nim VARCHAR(20) NOT NULL UNIQUE,
nama VARCHAR(120) NOT NULL,
kategori_kursus VARCHAR(16) NOT NULL,
no_hp VARCHAR(20),
alamat TEXT,
total_biaya DECIMAL(12,2) NOT NULL DEFAULT 0,
tanggal_daftar DATE NOT NULL,
tanggal_mulai DATE,
tanggal_selesai DATE,
status ENUM('aktif','selesai') NOT NULL DEFAULT 'aktif',
INDEX idx_nim (nim),
FOREIGN KEY (kategori_kursus) REFERENCES kursus(kode) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE transaksi (
id VARCHAR(16) PRIMARY KEY,
siswa_id VARCHAR(8) NOT NULL,
user_id VARCHAR(8) NOT NULL,
nominal DECIMAL(12,2) NOT NULL,
metode ENUM('qris','transfer','tunai') NOT NULL,
bukti_path LONGTEXT,
catatan TEXT,
status_validasi ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
alasan_tolak TEXT,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
INDEX idx_created (created_at),
INDEX idx_status (status_validasi),
FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE siswa_kursus (
id INT AUTO_INCREMENT PRIMARY KEY,
siswa_id VARCHAR(8) NOT NULL,
kursus_kode VARCHAR(16) NOT NULL,
tanggal_daftar DATE NOT NULL,
UNIQUE KEY uniq_edge (siswa_id, kursus_kode),
FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
FOREIGN KEY (kursus_kode) REFERENCES kursus(kode) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE login_history (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id VARCHAR(8),
ip_address VARCHAR(45),
browser VARCHAR(160),
status ENUM('success','failed') NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE sessions (
token VARCHAR(96) PRIMARY KEY,
user_id VARCHAR(8) NOT NULL,
expires_at DATETIME NOT NULL,
revoked_at DATETIME,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
INDEX idx_sessions_user (user_id),
INDEX idx_sessions_expiry (expires_at),
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE audit_log (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
user_id VARCHAR(8),
action VARCHAR(40) NOT NULL,
entity_type VARCHAR(40),
entity_id VARCHAR(80),
ip_address VARCHAR(45),
user_agent VARCHAR(200),
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
INDEX idx_audit_created (created_at),
INDEX idx_audit_user (user_id),
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE pendaftaran_peserta (
id VARCHAR(12) PRIMARY KEY,
nomor_pendaftaran VARCHAR(24) NOT NULL UNIQUE,
nama_lengkap VARCHAR(120) NOT NULL,
no_ktp VARCHAR(32) NOT NULL,
tempat_lahir VARCHAR(80) NOT NULL,
tanggal_lahir DATE NOT NULL,
jenis_kelamin ENUM('Laki-laki','Perempuan') NOT NULL,
alamat_lengkap TEXT NOT NULL,
no_telp_wa VARCHAR(24) NOT NULL,
agama VARCHAR(40),
asal_instansi VARCHAR(120),
kejuruan_pelatihan VARCHAR(120) NOT NULL,
nama_ayah VARCHAR(120),
nama_ibu VARCHAR(120),
alamat_orang_tua TEXT,
dok_ktp TINYINT NOT NULL DEFAULT 0,
dok_ktp_file LONGTEXT,
dok_ktp_name VARCHAR(120),
dok_kk TINYINT NOT NULL DEFAULT 0,
dok_kk_file LONGTEXT,
dok_kk_name VARCHAR(120),
dok_ijasah TINYINT NOT NULL DEFAULT 0,
dok_ijasah_file LONGTEXT,
dok_ijasah_name VARCHAR(120),
dok_foto TINYINT NOT NULL DEFAULT 0,
dok_foto_file LONGTEXT,
dok_foto_name VARCHAR(120),
tempat_ttd VARCHAR(80) DEFAULT 'Kudus',
tanggal_ttd DATE,
nama_terang VARCHAR(120),
status_pendaftaran ENUM('draft','terdaftar','dibatalkan') NOT NULL DEFAULT 'terdaftar',
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
INDEX idx_no_ktp (no_ktp),
INDEX idx_nomor_pendaftaran (nomor_pendaftaran)
) ENGINE=InnoDB;

CREATE USER IF NOT EXISTS 'ncfinance_app'@'localhost' IDENTIFIED BY 'ncfinance_dev_password_change_me';
GRANT SELECT, INSERT, UPDATE, DELETE ON ncfinance.* TO 'ncfinance_app'@'localhost';
FLUSH PRIVILEGES;
