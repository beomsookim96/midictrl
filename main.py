#!/usr/bin/env python3
import sys
import json
from pathlib import Path
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QIcon
from ui.main_window import MainWindow

class MidiCtrlApp(QApplication):
    def __init__(self, argv):
        super().__init__(argv)
        self.setApplicationName("MidiCtrl")
        self.setOrganizationName("MidiCtrl")
        
        # High DPI support for PyQt6
        try:
            self.setAttribute(Qt.ApplicationAttribute.AA_EnableHighDpiScaling)
        except AttributeError:
            # In PyQt6, high DPI scaling is enabled by default
            pass
        
        self.config_dir = Path.home() / ".midictrl"
        self.config_dir.mkdir(exist_ok=True)
        
        # Install default presets
        from presets.default_presets import install_default_presets
        install_default_presets(self.config_dir)
        
        self.main_window = MainWindow()
        self.main_window.show()

def main():
    app = MidiCtrlApp(sys.argv)
    sys.exit(app.exec())

if __name__ == "__main__":
    main()