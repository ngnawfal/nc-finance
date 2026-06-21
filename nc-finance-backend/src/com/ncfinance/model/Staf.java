package com.ncfinance.model;

import java.util.Arrays;
import java.util.List;

/**
 * OOP — INHERITANCE + POLYMORPHISM
 * Staf hanya bisa akses menu operasional.
 */
public class Staf extends User {

    public Staf(String id, String email, String hashedPassword, String nama, String noHp) {
        super(id, email, hashedPassword, nama, "staf", noHp);
    }

    @Override
    public List<String> aksesMenu() {
        return Arrays.asList("dashboard", "transaksi", "transaksi/input", "siswa");
    }
}
