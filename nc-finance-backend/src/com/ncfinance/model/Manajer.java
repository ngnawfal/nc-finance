package com.ncfinance.model;

import java.util.Arrays;
import java.util.List;

/**
 * OOP — INHERITANCE + POLYMORPHISM
 * Manajer mendapat menu lengkap + kewenangan validasi transaksi.
 */
public class Manajer extends User {

    public Manajer(String id, String email, String hashedPassword, String nama, String noHp) {
        super(id, email, hashedPassword, nama, "manajer", noHp);
    }

    @Override
    public List<String> aksesMenu() {
        return Arrays.asList(
            "dashboard", "transaksi", "transaksi/input",
            "transaksi/validasi", "siswa", "siswa/graph",
            "laporan", "pengaturan"
        );
    }

    /**
     * Hanya manajer yang berhak memvalidasi transaksi.
     * Return status baru.
     */
    public String validasiTransaksi(Transaksi t, boolean setujui, String alasan) {
        if (setujui) {
            t.setStatusValidasi("approved");
            return "approved";
        } else {
            t.setStatusValidasi("rejected");
            if (t instanceof Pembayaran) ((Pembayaran) t).setAlasanTolak(alasan);
            return "rejected";
        }
    }
}
