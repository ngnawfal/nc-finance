/*
 * NC Finance Code Note: Model program pelatihan/kursus.
 * Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
 */
package com.ncfinance.model;

/**
 * OOP — ENCAPSULATION
 * Node bertipe "kursus" pada Graph bipartite Siswa↔Kursus.
 */
public class Kursus {
    private String kode;
    private String nama;
    private double biaya;
    private String deskripsi;
    private boolean statusAktif;

    public Kursus(String kode, String nama, double biaya, String deskripsi, boolean statusAktif) {
        this.kode = kode;
        this.nama = nama;
        this.biaya = biaya;
        this.deskripsi = deskripsi;
        this.statusAktif = statusAktif;
    }

    public String getKode() { return kode; }
    public String getNama() { return nama; }
    public double getBiaya() { return biaya; }
    public String getDeskripsi() { return deskripsi; }
    public boolean isStatusAktif() { return statusAktif; }

    public void setNama(String nama) { this.nama = nama; }
    public void setBiaya(double biaya) { this.biaya = biaya; }
    public void setDeskripsi(String deskripsi) { this.deskripsi = deskripsi; }
    public void setStatusAktif(boolean statusAktif) { this.statusAktif = statusAktif; }

    @Override
    public String toString() {
        return "Kursus{" + kode + ", " + nama + ", Rp " + biaya + "}";
    }
}
