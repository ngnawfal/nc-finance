/*
 * NC Finance Code Note: Konteks global manager yang dipakai handler API.
 * Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
 */
package com.ncfinance.server;

import com.ncfinance.database.DatabaseConnection;
import com.ncfinance.manager.GraphManager;
import com.ncfinance.manager.PencarianManager;
import com.ncfinance.manager.PendaftaranManager;
import com.ncfinance.manager.SiswaManager;
import com.ncfinance.manager.TransaksiManager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/** Shared in-memory managers all HttpServer handlers. */
public class AppContext {
    public static final TransaksiManager transaksiManager = new TransaksiManager();
    public static final SiswaManager siswaManager = new SiswaManager();
    public static final PencarianManager pencarianManager = new PencarianManager();
    public static final GraphManager graphManager = new GraphManager();
    public static final PendaftaranManager pendaftaranManager = new PendaftaranManager();

    /** Additive dev migration so existing local DBs do not break after fixes. */
    public static void ensureSchemaUpgrades() {
        runQuiet("ALTER TABLE transaksi MODIFY bukti_path LONGTEXT");
        runQuiet("ALTER TABLE transaksi ADD COLUMN catatan TEXT AFTER bukti_path");
        runQuiet("CREATE TABLE IF NOT EXISTS profil_lembaga (id VARCHAR(16) PRIMARY KEY, nama VARCHAR(120) NOT NULL, alamat TEXT, nomor_telepon VARCHAR(32), email VARCHAR(120), updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB");
        runQuiet("INSERT IGNORE INTO profil_lembaga (id, nama, alamat, nomor_telepon, email) VALUES ('default', 'LPK Nida Course', 'Kudus, Jawa Tengah', '', '')");
        runQuiet("INSERT IGNORE INTO siswa_kursus (siswa_id, kursus_kode, tanggal_daftar) SELECT id, kategori_kursus, tanggal_daftar FROM siswa");
    }

    private static void runQuiet(String sql) {
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.executeUpdate();
        } catch (SQLException ignored) {
            // Additive migrations may already exist; keep startup resilient.
        }
    }
}
