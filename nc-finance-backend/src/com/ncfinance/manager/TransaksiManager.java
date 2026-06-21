package com.ncfinance.manager;

import com.ncfinance.database.DatabaseConnection;
import com.ncfinance.interfaces.DataManager;
import com.ncfinance.model.Pembayaran;
import com.ncfinance.model.Transaksi;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Stack;

/** ArrayList transaksi, Stack undo, Queue validasi FIFO. */
public class TransaksiManager implements DataManager<Transaksi> {
    private final ArrayList<Transaksi> daftarTransaksi = new ArrayList<>();
    private final Stack<Transaksi> undoStack = new Stack<>();
    private final Queue<Transaksi> antriValidasi = new LinkedList<>();

    public synchronized void loadFromDatabase() throws SQLException {
        daftarTransaksi.clear();
        antriValidasi.clear();

        String sql = "SELECT t.id, t.siswa_id, s.nama siswa_nama, s.nim siswa_nim, t.user_id, "
            + "t.nominal, t.metode, t.bukti_path, t.catatan, t.status_validasi, t.alasan_tolak, t.created_at "
            + "FROM transaksi t JOIN siswa s ON s.id = t.siswa_id "
            + "ORDER BY t.created_at ASC";

        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Pembayaran p = new Pembayaran(
                    rs.getString("id"),
                    rs.getString("siswa_id"),
                    rs.getString("siswa_nama"),
                    rs.getString("siswa_nim"),
                    rs.getString("user_id"),
                    rs.getDouble("nominal"),
                    rs.getString("metode"),
                    rs.getString("bukti_path"),
                    rs.getString("catatan"),
                    rs.getString("status_validasi"),
                    rs.getTimestamp("created_at").toLocalDateTime(),
                    rs.getString("alasan_tolak")
                );
                daftarTransaksi.add(p);
                if ("pending".equals(p.getStatusValidasi())) antriValidasi.offer(p);
            }
        }
        System.out.println("[TransaksiManager] Loaded " + daftarTransaksi.size() + " transaksi (" + antriValidasi.size() + " pending Queue).");
    }

    @Override
    public synchronized void tambah(Transaksi t) {
        try {
            insertDb(t);
            daftarTransaksi.add(t);
            undoStack.push(t);
            if ("pending".equals(t.getStatusValidasi())) antriValidasi.offer(t);
        } catch (SQLException e) {
            throw new IllegalStateException("Gagal menyimpan transaksi: " + e.getMessage(), e);
        }
    }

    private void insertDb(Transaksi t) throws SQLException {
        String sql = "INSERT INTO transaksi (id, siswa_id, user_id, nominal, metode, bukti_path, catatan, status_validasi, created_at) VALUES (?,?,?,?,?,?,?,?,?)";
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, t.getId());
            ps.setString(2, t.getSiswaId());
            ps.setString(3, t.getUserId());
            ps.setDouble(4, t.getNominal());
            ps.setString(5, t.getMetode());
            ps.setString(6, t.getBuktiPath());
            ps.setString(7, t.getCatatan());
            ps.setString(8, t.getStatusValidasi());
            ps.setTimestamp(9, Timestamp.valueOf(t.getCreatedAt()));
            ps.executeUpdate();
        }
    }

    public synchronized Transaksi undo() {
        if (undoStack.isEmpty()) return null;
        Transaksi last = undoStack.pop();
        hapus(last.getId());
        return last;
    }

    /** Restore is explicit DB insert again, so frontend restore is not fake/local-only. */
    public synchronized boolean restore(Transaksi t) {
        if (t == null || cari(t.getId()) != null) return false;
        tambah(t);
        return true;
    }

    public synchronized Transaksi lihatAntrianTerdepan() { return antriValidasi.peek(); }
    public synchronized Transaksi pollAntrian() { return antriValidasi.poll(); }

    public synchronized boolean updateStatus(String id, String status, String alasanTolak) {
        for (Transaksi t : daftarTransaksi) {
            if (t.getId().equals(id)) {
                t.setStatusValidasi(status);
                if (t instanceof Pembayaran) ((Pembayaran) t).setAlasanTolak(alasanTolak);
                antriValidasi.remove(t);
                if ("pending".equals(status)) antriValidasi.offer(t);
                try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("UPDATE transaksi SET status_validasi=?, alasan_tolak=? WHERE id=?")) {
                    ps.setString(1, status);
                    ps.setString(2, alasanTolak);
                    ps.setString(3, id);
                    ps.executeUpdate();
                } catch (SQLException e) {
                    throw new IllegalStateException("Gagal memperbarui validasi: " + e.getMessage(), e);
                }
                return true;
            }
        }
        return false;
    }

    public synchronized boolean update(String id, double nominal, String metode, String status, String alasanTolak, String catatan) {
        for (Transaksi t : daftarTransaksi) {
            if (t.getId().equals(id)) {
                if (nominal >= 0) t.setNominal(nominal);
                if (metode != null && !metode.isBlank()) t.setMetode(metode);
                if (status != null && !status.isBlank()) t.setStatusValidasi(status);
                if (catatan != null) t.setCatatan(catatan);
                if (t instanceof Pembayaran) ((Pembayaran) t).setAlasanTolak(alasanTolak);
                antriValidasi.remove(t);
                if ("pending".equals(t.getStatusValidasi())) antriValidasi.offer(t);
                try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("UPDATE transaksi SET nominal=?, metode=?, status_validasi=?, alasan_tolak=?, catatan=? WHERE id=?")) {
                    ps.setDouble(1, t.getNominal());
                    ps.setString(2, t.getMetode());
                    ps.setString(3, t.getStatusValidasi());
                    ps.setString(4, alasanTolak);
                    ps.setString(5, t.getCatatan());
                    ps.setString(6, t.getId());
                    ps.executeUpdate();
                } catch (SQLException e) {
                    throw new IllegalStateException("Gagal memperbarui transaksi: " + e.getMessage(), e);
                }
                return true;
            }
        }
        return false;
    }

    @Override
    public synchronized boolean hapus(String id) {
        Transaksi target = null;
        for (Transaksi t : daftarTransaksi) if (t.getId().equals(id)) { target = t; break; }
        if (target == null) return false;
        try (Connection c = DatabaseConnection.get(); PreparedStatement ps = c.prepareStatement("DELETE FROM transaksi WHERE id=?")) {
            ps.setString(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Gagal menghapus transaksi: " + e.getMessage(), e);
        }
        daftarTransaksi.remove(target);
        antriValidasi.remove(target);
        return true;
    }

    @Override
    public synchronized Transaksi cari(String id) {
        for (Transaksi t : daftarTransaksi) if (t.getId().equals(id)) return t;
        return null;
    }

    @Override
    public synchronized List<Transaksi> tampilSemua() { return new ArrayList<>(daftarTransaksi); }

    public synchronized int jumlahAntrian() { return antriValidasi.size(); }
    public synchronized int jumlahUndoTersedia() { return undoStack.size(); }
    public synchronized int jumlahTransaksi() { return daftarTransaksi.size(); }

    public synchronized String generateNextId() {
        int max = 0;
        for (Transaksi t : daftarTransaksi) {
            try {
                int number = Integer.parseInt(t.getId().replace("TRX-", ""));
                if (number > max) max = number;
            } catch (NumberFormatException ignored) {
            }
        }
        return String.format("TRX-%03d", max + 1);
    }
}
