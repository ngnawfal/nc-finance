@echo off
setlocal

cd /d "%~dp0"

:: ─── DB credentials ───────────────────────────────────────────────────────────
:: Password TIDAK di-hardcode di sini. Disimpan di secret.env.bat (tidak di-commit).
:: Setup: salin secret.env.bat.example -> secret.env.bat lalu isi password DB.
if exist "secret.env.bat" call "secret.env.bat"

:: Boleh juga di-override dari luar: set NC_DB_PASS=xxx && run-backend.bat
if "%NC_DB_USER%"==""          set "NC_DB_USER=ncfinance_app"
if "%NC_ALLOWED_ORIGINS%"==""  set "NC_ALLOWED_ORIGINS=http://localhost:3000"

if "%NC_DB_PASS%"=="" (
  echo [ERROR] NC_DB_PASS belum diset.
  echo         Salin secret.env.bat.example menjadi secret.env.bat lalu isi password DB,
  echo         atau jalankan: set NC_DB_PASS=passwordmu ^&^& run-backend.bat
  exit /b 1
)

if not exist build mkdir build

echo [BUILD] Mengkompilasi Java...
javac -cp "lib\mysql-connector-j-8.4.0.jar" -d build ^
  src\com\ncfinance\Main.java ^
  src\com\ncfinance\model\*.java ^
  src\com\ncfinance\manager\*.java ^
  src\com\ncfinance\util\*.java ^
  src\com\ncfinance\interfaces\*.java ^
  src\com\ncfinance\server\*.java ^
  src\com\ncfinance\database\*.java
if errorlevel 1 ( echo [ERROR] Kompilasi gagal. & exit /b 1 )

echo [RUN] Menjalankan server...
java -cp "build;lib\mysql-connector-j-8.4.0.jar" ^
  -DNC_DB_USER="%NC_DB_USER%" ^
  -DNC_DB_PASS="%NC_DB_PASS%" ^
  -DNC_ALLOWED_ORIGINS="%NC_ALLOWED_ORIGINS%" ^
  com.ncfinance.Main
