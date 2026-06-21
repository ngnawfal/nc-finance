package com.ncfinance.interfaces;

import java.util.List;

/**
 * OOP — ABSTRACTION
 * Kontrak generik untuk semua manager yang mengelola koleksi entitas.
 * Diimplementasikan oleh TransaksiManager dan SiswaManager.
 */
public interface DataManager<T> {
    void tambah(T item);
    boolean hapus(String key);
    T cari(String key);
    List<T> tampilSemua();
}
