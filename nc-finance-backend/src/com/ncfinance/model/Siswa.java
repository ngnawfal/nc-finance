/*
 * NC Finance Code Note: Model data siswa/peserta.
 * Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
 */
package com.ncfinance.model;

import java.time.LocalDate;

/**
 * OOP — ENCAPSULATION
 * Model siswa. Node bertipe "siswa" pada Graph.
 */
public class Siswa {
    private String id;
    private String nim;
    private String nama;
    private String kategoriKursus;
    private String noHp;
    private String alamat;
    private double totalBiaya;
    private LocalDate tanggalDaftar;
    private LocalDate tanggalMulai;
    private LocalDate tanggalSelesai;
    private String status;

    public Siswa(String id, String nim, String nama, String kategoriKursus, String noHp,
                 String alamat, double totalBiaya, LocalDate tanggalDaftar, String status) {
        this(id, nim, nama, kategoriKursus, noHp, alamat, totalBiaya, tanggalDaftar, null, null, status);
    }

    public Siswa(String id, String nim, String nama, String kategoriKursus, String noHp,
                 String alamat, double totalBiaya, LocalDate tanggalDaftar, LocalDate tanggalMulai,
                 LocalDate tanggalSelesai, String status) {
        this.id = id;
        this.nim = nim;
        this.nama = nama;
        this.kategoriKursus = kategoriKursus;
        this.noHp = noHp;
        this.alamat = alamat;
        this.totalBiaya = totalBiaya;
        this.tanggalDaftar = tanggalDaftar;
        this.tanggalMulai = tanggalMulai;
        this.tanggalSelesai = tanggalSelesai;
        this.status = status;
    }

    public String getId() { return id; }
    public String getNim() { return nim; }
    public String getNama() { return nama; }
    public String getKategoriKursus() { return kategoriKursus; }
    public String getNoHp() { return noHp; }
    public String getAlamat() { return alamat; }
    public double getTotalBiaya() { return totalBiaya; }
    public LocalDate getTanggalDaftar() { return tanggalDaftar; }
    public LocalDate getTanggalMulai() { return tanggalMulai; }
    public LocalDate getTanggalSelesai() { return tanggalSelesai; }
    public String getStatus() { return status; }

    public void setNama(String nama) { this.nama = nama; }
    public void setKategoriKursus(String kategoriKursus) { this.kategoriKursus = kategoriKursus; }
    public void setNoHp(String noHp) { this.noHp = noHp; }
    public void setAlamat(String alamat) { this.alamat = alamat; }
    public void setTotalBiaya(double totalBiaya) { this.totalBiaya = totalBiaya; }
    public void setTanggalMulai(LocalDate tanggalMulai) { this.tanggalMulai = tanggalMulai; }
    public void setTanggalSelesai(LocalDate tanggalSelesai) { this.tanggalSelesai = tanggalSelesai; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "Siswa{" + nim + ", " + nama + ", " + kategoriKursus + "}";
    }
}
