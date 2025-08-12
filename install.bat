@echo off
echo ========================================
echo MidiCtrl Windows Installation Script
echo ========================================
echo.

echo Installing Python packages...
python -m pip install --upgrade pip
python -m pip install PyQt6 pynput PyYAML mido

echo.
echo Testing installation...
python test_install.py

echo.
echo ========================================
echo Installation complete!
echo.
echo To run MidiCtrl:
echo   python main.py
echo or
echo   run.bat
echo ========================================
pause