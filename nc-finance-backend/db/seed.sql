-- N.C Finance — Seed data minimal
-- Tidak ada dummy peserta, pendaftaran, transaksi, atau kursus.
-- Kursus/program pelatihan wajib ditambahkan dari Pengaturan.
-- Password 'admin123' → SHA-256: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9

USE ncfinance;

INSERT INTO users (id, email, hashed_password, nama, role, no_hp) VALUES
('u1', 'siti.rahayu@nidacourse.id',  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Siti Rahayu',   'manajer', '081234567890'),
('u2', 'bagus.pratomo@nidacourse.id','240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Bagus Pratomo', 'staf',    '081298765432');
