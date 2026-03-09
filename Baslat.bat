@echo off
echo Kurulum Yapiliyor (Bu islem bir defaya mahsus biraz surebilir)...
SET PATH=C:\Program Files\nodejs;%PATH%
call npm install

echo.
echo =========================================
echo Gym-Gamer Uygulamasi Baslatiliyor...
echo Tarayicida otomatik olarak acilacaktir! (http://localhost:5173/)
echo =========================================
echo.
call npm run dev -- --open

pause
