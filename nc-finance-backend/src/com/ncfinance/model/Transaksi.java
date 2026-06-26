/*
 * NC Finance Code Note: Model transaksi pembayaran dan Comparable untuk sorting waktu.
 * Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
 */
package com.ncfinance.model;

import java.time.LocalDateTime;

/**
 * OOP ENCAPSULATION implements Comparable.
 * Model transaksi. Bisa diurutkan timestamp untuk TreeMap.
 */
public class Transaksi implements Comparable<Transaksi> {
    protected String id;
    protected String siswaId;
    protected String siswaNama;
    protected String siswaNim;
    protected String userId;
    protected double nominal;
    protected String metode; // qris transfer tunai
    protected String buktiPath;
    protected String catatan;
    protected String statusValidasi; // pending approved rejected
    protected LocalDateTime createdAt;

    public Transaksi(String id, String siswaId, String siswaNama, String siswaNim, String userId,
                     double nominal, String metode, String buktiPath, String catatan, String statusValidasi,
                     LocalDateTime createdAt) {
        this.id = id;
        this.siswaId = siswaId;
        this.siswaNama = siswaNama;
        this.siswaNim = siswaNim;
        this.userId = userId;
        this.nominal = nominal;
        this.metode = metode;
        this.buktiPath = buktiPath;
        this.catatan = catatan;
        this.statusValidasi = statusValidasi;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getSiswaId() { return siswaId; }
    public String getSiswaNama() { return siswaNama; }
    public String getSiswaNim() { return siswaNim; }
    public String getUserId() { return userId; }
    public double getNominal() { return nominal; }
    public String getMetode() { return metode; }
    public String getBuktiPath() { return buktiPath; }
    public String getCatatan() { return catatan; }
    public String getStatusValidasi() { return statusValidasi; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setStatusValidasi(String statusValidasi) { this.statusValidasi = statusValidasi; }
    public void setBuktiPath(String buktiPath) { this.buktiPath = buktiPath; }
    public void setCatatan(String catatan) { this.catatan = catatan; }
    public void setNominal(double nominal) { this.nominal = nominal; }
    public void setMetode(String metode) { this.metode = metode; }

    @Override
    public int compareTo(Transaksi other) {
        return this.createdAt.compareTo(other.createdAt);
    }

    @Override
    public String toString() {
        return "Transaksi{" + siswaNama + " " + nominal + " " + metode + "}";
    }
}
