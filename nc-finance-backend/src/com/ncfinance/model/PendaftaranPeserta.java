package com.ncfinance.model;

import java.time.LocalDate;

/** Model formulir pendaftaran offline versi digital. */
public class PendaftaranPeserta {
    private String id, nomorPendaftaran, namaLengkap, noKtp, tempatLahir, jenisKelamin;
    private LocalDate tanggalLahir;
    private String alamatLengkap, noTelpWa, agama, asalInstansi, kejuruanPelatihan;
    private String namaAyah, namaIbu, alamatOrangTua;
    private boolean dokKtp, dokKk, dokIjasah, dokFoto;
    private String dokKtpFile, dokKtpName, dokKkFile, dokKkName, dokIjasahFile, dokIjasahName, dokFotoFile, dokFotoName;
    private String tempatTtd, namaTerang, statusPendaftaran;
    private LocalDate tanggalTtd;

    public PendaftaranPeserta(String id, String nomorPendaftaran, String namaLengkap, String noKtp,
                              String tempatLahir, LocalDate tanggalLahir, String jenisKelamin,
                              String alamatLengkap, String noTelpWa, String agama, String asalInstansi,
                              String kejuruanPelatihan, String namaAyah, String namaIbu, String alamatOrangTua,
                              boolean dokKtp, boolean dokKk, boolean dokIjasah, boolean dokFoto,
                              String tempatTtd, LocalDate tanggalTtd, String namaTerang, String statusPendaftaran) {
        this.id = id;
        this.nomorPendaftaran = nomorPendaftaran;
        this.namaLengkap = namaLengkap;
        this.noKtp = noKtp;
        this.tempatLahir = tempatLahir;
        this.tanggalLahir = tanggalLahir;
        this.jenisKelamin = jenisKelamin;
        this.alamatLengkap = alamatLengkap;
        this.noTelpWa = noTelpWa;
        this.agama = agama;
        this.asalInstansi = asalInstansi;
        this.kejuruanPelatihan = kejuruanPelatihan;
        this.namaAyah = namaAyah;
        this.namaIbu = namaIbu;
        this.alamatOrangTua = alamatOrangTua;
        this.dokKtp = dokKtp;
        this.dokKk = dokKk;
        this.dokIjasah = dokIjasah;
        this.dokFoto = dokFoto;
        this.tempatTtd = tempatTtd;
        this.tanggalTtd = tanggalTtd;
        this.namaTerang = namaTerang;
        this.statusPendaftaran = statusPendaftaran;
    }

    public void setDokumenFiles(String ktpFile, String ktpName, String kkFile, String kkName, String ijasahFile, String ijasahName, String fotoFile, String fotoName) {
        this.dokKtpFile = ktpFile; this.dokKtpName = ktpName;
        this.dokKkFile = kkFile; this.dokKkName = kkName;
        this.dokIjasahFile = ijasahFile; this.dokIjasahName = ijasahName;
        this.dokFotoFile = fotoFile; this.dokFotoName = fotoName;
    }

    public String getId() { return id; }
    public String getNomorPendaftaran() { return nomorPendaftaran; }
    public String getNamaLengkap() { return namaLengkap; }
    public String getNoKtp() { return noKtp; }
    public String getTempatLahir() { return tempatLahir; }
    public LocalDate getTanggalLahir() { return tanggalLahir; }
    public String getJenisKelamin() { return jenisKelamin; }
    public String getAlamatLengkap() { return alamatLengkap; }
    public String getNoTelpWa() { return noTelpWa; }
    public String getAgama() { return agama; }
    public String getAsalInstansi() { return asalInstansi; }
    public String getKejuruanPelatihan() { return kejuruanPelatihan; }
    public String getNamaAyah() { return namaAyah; }
    public String getNamaIbu() { return namaIbu; }
    public String getAlamatOrangTua() { return alamatOrangTua; }
    public boolean isDokKtp() { return dokKtp; }
    public String getDokKtpFile() { return dokKtpFile; }
    public String getDokKtpName() { return dokKtpName; }
    public boolean isDokKk() { return dokKk; }
    public String getDokKkFile() { return dokKkFile; }
    public String getDokKkName() { return dokKkName; }
    public boolean isDokIjasah() { return dokIjasah; }
    public String getDokIjasahFile() { return dokIjasahFile; }
    public String getDokIjasahName() { return dokIjasahName; }
    public boolean isDokFoto() { return dokFoto; }
    public String getDokFotoFile() { return dokFotoFile; }
    public String getDokFotoName() { return dokFotoName; }
    public String getTempatTtd() { return tempatTtd; }
    public LocalDate getTanggalTtd() { return tanggalTtd; }
    public String getNamaTerang() { return namaTerang; }
    public String getStatusPendaftaran() { return statusPendaftaran; }
}
