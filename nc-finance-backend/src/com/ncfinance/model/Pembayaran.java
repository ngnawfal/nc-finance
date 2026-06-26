/*
 * NC Finance Code Note: Model turunan/representasi pembayaran.
 * Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
 */
package com.ncfinance.model;

import java.time.LocalDateTime;

/**
 * OOP INHERITANCE.
 * Pembayaran extends Transaksi menambah field alasan tolak (rejection reason).
 */
public class Pembayaran extends Transaksi {
    private String alasanTolak;

    public Pembayaran(String id, String siswaId, String siswaNama, String siswaNim, String userId,
                      double nominal, String metode, String buktiPath, String catatan, String statusValidasi,
                      LocalDateTime createdAt, String alasanTolak) {
        super(id, siswaId, siswaNama, siswaNim, userId, nominal, metode, buktiPath, catatan, statusValidasi, createdAt);
        this.alasanTolak = alasanTolak;
    }

    public String getAlasanTolak() { return alasanTolak; }
    public void setAlasanTolak(String alasanTolak) { this.alasanTolak = alasanTolak; }
}
