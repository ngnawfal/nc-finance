/*
 * NC Finance Code Note: Helper serialisasi JSON manual.
 * Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
 */
package com.ncfinance.server;

import com.ncfinance.model.Pembayaran;
import com.ncfinance.model.PendaftaranPeserta;
import com.ncfinance.model.Siswa;
import com.ncfinance.model.Transaksi;
import com.ncfinance.model.User;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/** Minimal JSON helper external framework, sesuai PRD Plain Java Class. */
public class JsonUtil {
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static String quote(String s) {
        if (s == null) return "null";
        StringBuilder out = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            switch (ch) {
                case '\\': out.append("\\\\"); break;
                case '"': out.append("\\\""); break;
                case '\n': out.append("\\n"); break;
                case '\r': out.append("\\r"); break;
                case '\t': out.append("\\t"); break;
                default:
                    if (ch < 0x20) out.append(String.format("\\u%04x", (int) ch));
                    else out.append(ch);
            }
        }
        return out.append('"').toString();
    }

    public static String siswa(Siswa s) {
        return "{"
            + "\"id\":" + quote(s.getId()) + ","
            + "\"nim\":" + quote(s.getNim()) + ","
            + "\"nama\":" + quote(s.getNama()) + ","
            + "\"kategoriKursus\":" + quote(s.getKategoriKursus()) + ","
            + "\"noHp\":" + quote(s.getNoHp()) + ","
            + "\"alamat\":" + quote(s.getAlamat()) + ","
            + "\"totalBiaya\":" + s.getTotalBiaya() + ","
            + "\"tanggalDaftar\":" + quote(s.getTanggalDaftar().toString()) + ","
            + "\"tanggalMulai\":" + quote(s.getTanggalMulai() == null ? null : s.getTanggalMulai().toString()) + ","
            + "\"tanggalSelesai\":" + quote(s.getTanggalSelesai() == null ? null : s.getTanggalSelesai().toString()) + ","
            + "\"status\":" + quote(s.getStatus())
            + "}";
    }

    public static String transaksi(Transaksi t) {
        String alasan = t instanceof Pembayaran ? ((Pembayaran) t).getAlasanTolak() : null;
        return "{"
            + "\"id\":" + quote(t.getId()) + ","
            + "\"siswaId\":" + quote(t.getSiswaId()) + ","
            + "\"siswaNama\":" + quote(t.getSiswaNama()) + ","
            + "\"siswaNim\":" + quote(t.getSiswaNim()) + ","
            + "\"userId\":" + quote(t.getUserId()) + ","
            + "\"nominal\":" + t.getNominal() + ","
            + "\"metode\":" + quote(t.getMetode()) + ","
            + "\"buktiPath\":" + quote(t.getBuktiPath()) + ","
            + "\"catatan\":" + quote(t.getCatatan()) + ","
            + "\"statusValidasi\":" + quote(t.getStatusValidasi()) + ","
            + "\"alasanTolak\":" + quote(alasan) + ","
            + "\"createdAt\":" + quote(t.getCreatedAt().format(ISO))
            + "}";
    }

    public static String user(User u) {
        return "{"
            + "\"id\":" + quote(u.getId()) + ","
            + "\"email\":" + quote(u.getEmail()) + ","
            + "\"nama\":" + quote(u.getNama()) + ","
            + "\"role\":" + quote(u.getRole()) + ","
            + "\"noHp\":" + quote(u.getNoHp())
            + "}";
    }

    public static String pendaftaran(PendaftaranPeserta p) {
        return "{"
            + "\"id\":" + quote(p.getId()) + ","
            + "\"nomorPendaftaran\":" + quote(p.getNomorPendaftaran()) + ","
            + "\"namaLengkap\":" + quote(p.getNamaLengkap()) + ","
            + "\"noKtp\":" + quote(p.getNoKtp()) + ","
            + "\"tempatLahir\":" + quote(p.getTempatLahir()) + ","
            + "\"tanggalLahir\":" + quote(p.getTanggalLahir().toString()) + ","
            + "\"jenisKelamin\":" + quote(p.getJenisKelamin()) + ","
            + "\"alamatLengkap\":" + quote(p.getAlamatLengkap()) + ","
            + "\"noTelpWa\":" + quote(p.getNoTelpWa()) + ","
            + "\"agama\":" + quote(p.getAgama()) + ","
            + "\"asalInstansi\":" + quote(p.getAsalInstansi()) + ","
            + "\"kejuruanPelatihan\":" + quote(p.getKejuruanPelatihan()) + ","
            + "\"namaAyah\":" + quote(p.getNamaAyah()) + ","
            + "\"namaIbu\":" + quote(p.getNamaIbu()) + ","
            + "\"alamatOrangTua\":" + quote(p.getAlamatOrangTua()) + ","
            + "\"dokKtp\":" + p.isDokKtp() + ","
            + "\"dokKtpFile\":" + quote(p.getDokKtpFile()) + ","
            + "\"dokKtpName\":" + quote(p.getDokKtpName()) + ","
            + "\"dokKk\":" + p.isDokKk() + ","
            + "\"dokKkFile\":" + quote(p.getDokKkFile()) + ","
            + "\"dokKkName\":" + quote(p.getDokKkName()) + ","
            + "\"dokIjasah\":" + p.isDokIjasah() + ","
            + "\"dokIjasahFile\":" + quote(p.getDokIjasahFile()) + ","
            + "\"dokIjasahName\":" + quote(p.getDokIjasahName()) + ","
            + "\"dokFoto\":" + p.isDokFoto() + ","
            + "\"dokFotoFile\":" + quote(p.getDokFotoFile()) + ","
            + "\"dokFotoName\":" + quote(p.getDokFotoName()) + ","
            + "\"tempatTtd\":" + quote(p.getTempatTtd()) + ","
            + "\"tanggalTtd\":" + quote(p.getTanggalTtd() == null ? null : p.getTanggalTtd().toString()) + ","
            + "\"namaTerang\":" + quote(p.getNamaTerang()) + ","
            + "\"statusPendaftaran\":" + quote(p.getStatusPendaftaran())
            + "}";
    }

    public static String pendaftaranList(List<PendaftaranPeserta> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(pendaftaran(list.get(i)));
        }
        return sb.append(']').toString();
    }

    public static String siswaList(List<Siswa> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(siswa(list.get(i)));
        }
        return sb.append(']').toString();
    }

    public static String transaksiList(List<Transaksi> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(transaksi(list.get(i)));
        }
        return sb.append(']').toString();
    }

    public static String stringList(List<String> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(quote(list.get(i)));
        }
        return sb.append(']').toString();
    }

    public static String graph(Map<String, List<String>> adj) {
        StringBuilder nodes = new StringBuilder("[");
        StringBuilder edges = new StringBuilder("[");
        int ni = 0;
        int ei = 0;
        for (Map.Entry<String, List<String>> e : adj.entrySet()) {
            if (ni++ > 0) nodes.append(',');
            String id = e.getKey();
            String type = id.startsWith("NC-") ? "siswa" : "kursus";
            nodes.append("{\"id\":").append(quote(id)).append(",\"label\":").append(quote(id)).append(",\"type\":").append(quote(type)).append('}');
            for (String target : e.getValue()) {
                if (id.compareTo(target) < 0) {
                    if (ei++ > 0) edges.append(',');
                    edges.append("{\"source\":").append(quote(id)).append(",\"target\":").append(quote(target)).append('}');
                }
            }
        }
        nodes.append(']');
        edges.append(']');
        return "{\"nodes\":" + nodes + ",\"edges\":" + edges + "}";
    }
}
