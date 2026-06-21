package com.ncfinance.model;

import java.util.List;

/**
 * OOP — ABSTRACTION (abstract class) + ENCAPSULATION
 * Base class untuk semua pengguna sistem.
 * Method aksesMenu() abstract, di-override oleh Staf / Manajer (POLYMORPHISM).
 */
public abstract class User {
    private String id;
    private String email;
    private String hashedPassword;
    private String nama;
    private String role;
    private String noHp;

    public User(String id, String email, String hashedPassword, String nama, String role, String noHp) {
        this.id = id;
        this.email = email;
        this.hashedPassword = hashedPassword;
        this.nama = nama;
        this.role = role;
        this.noHp = noHp;
    }

    // Polymorphism: setiap subclass mendefinisikan menu sendiri
    public abstract List<String> aksesMenu();

    // Getters / setters (Encapsulation)
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getHashedPassword() { return hashedPassword; }
    public String getNama() { return nama; }
    public String getRole() { return role; }
    public String getNoHp() { return noHp; }

    public void setEmail(String email) { this.email = email; }
    public void setHashedPassword(String hashedPassword) { this.hashedPassword = hashedPassword; }
    public void setNama(String nama) { this.nama = nama; }
    public void setNoHp(String noHp) { this.noHp = noHp; }
}
