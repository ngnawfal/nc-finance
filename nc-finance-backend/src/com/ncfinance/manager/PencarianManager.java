package com.ncfinance.manager;

import com.ncfinance.model.Transaksi;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * STRUKTUR DATA 5 — TREE / TreeMap (Red-Black Tree)
 * Index transaksi berdasarkan tanggal.
 * - put/get: O(log n)
 * - subMap(from,to): O(log n) untuk range search
 */
public class PencarianManager {

    private final TreeMap<LocalDate, List<Transaksi>> dateIndex = new TreeMap<>();

    public void clear() {
        dateIndex.clear();
    }

    public void indexkan(Transaksi t) {
        LocalDate tanggal = t.getCreatedAt().toLocalDate();
        dateIndex.computeIfAbsent(tanggal, k -> new ArrayList<>()).add(t);
    }

    public void indexSemua(List<Transaksi> transaksiList) {
        clear();
        for (Transaksi t : transaksiList) indexkan(t);
    }

    public List<Transaksi> cariByRentangTanggal(LocalDate dari, LocalDate sampai) {
        Map<LocalDate, List<Transaksi>> sub = dateIndex.subMap(dari, true, sampai, true);
        List<Transaksi> hasil = new ArrayList<>();
        for (List<Transaksi> list : sub.values()) hasil.addAll(list);
        return hasil;
    }

    public List<Transaksi> cariByTanggal(LocalDate tanggal) {
        return new ArrayList<>(dateIndex.getOrDefault(tanggal, new ArrayList<>()));
    }

    public List<Transaksi> semuaTerurut() {
        List<Transaksi> hasil = new ArrayList<>();
        for (List<Transaksi> list : dateIndex.values()) hasil.addAll(list);
        return hasil;
    }

    public LocalDate tanggalPertama() {
        return dateIndex.isEmpty() ? null : dateIndex.firstKey();
    }

    public LocalDate tanggalTerakhir() {
        return dateIndex.isEmpty() ? null : dateIndex.lastKey();
    }
}
