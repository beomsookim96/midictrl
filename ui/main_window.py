from PyQt6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                             QComboBox, QLabel, QPushButton, QGroupBox,
                             QMenuBar, QMenu, QStatusBar, QSystemTrayIcon,
                             QSplitter, QScrollArea)
from PyQt6.QtCore import Qt, pyqtSlot, QTimer
from PyQt6.QtGui import QAction, QIcon
from pathlib import Path

from midi.device_manager import MidiDeviceManager
from core.key_mapper import KeyMapperConfig
from ui.nanokey_widget import NanoKeyWidget
from ui.mapping_list_widget import MappingListWidget
from ui.styles import DARK_THEME, LIGHT_THEME
from ui.qt_compat import Vertical
from core.keyboard_controller import KeyboardController

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("MidiCtrl - KORG nanoKEY2 Mapper")
        self.setMinimumSize(900, 600)
        
        self.midi_manager = MidiDeviceManager()
        self.config = KeyMapperConfig()
        self.keyboard_controller = KeyboardController(self.config)
        self.dark_theme = False
        
        self._init_ui()
        self._init_menu()
        self._init_tray()
        self._connect_signals()
        self._apply_theme()
        
        self._refresh_midi_devices()
        self._auto_connect_nanokey()
        
    def _init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        main_layout = QVBoxLayout(central_widget)
        
        # Device connection area
        device_group = QGroupBox("MIDI Device Connection")
        device_layout = QHBoxLayout()
        
        self.device_combo = QComboBox()
        self.device_combo.setMinimumWidth(300)
        device_layout.addWidget(QLabel("Device:"))
        device_layout.addWidget(self.device_combo)
        
        self.refresh_btn = QPushButton("Refresh")
        self.connect_btn = QPushButton("Connect")
        device_layout.addWidget(self.refresh_btn)
        device_layout.addWidget(self.connect_btn)
        
        self.status_label = QLabel("Not connected")
        self.status_label.setStyleSheet("QLabel { color: red; font-weight: bold; }")
        device_layout.addWidget(self.status_label)
        
        device_layout.addStretch()
        device_group.setLayout(device_layout)
        main_layout.addWidget(device_group)
        
        # Main content area with splitter
        splitter = QSplitter(Vertical)
        
        # NanoKey visualization
        self.nanokey_widget = NanoKeyWidget()
        splitter.addWidget(self.nanokey_widget)
        
        # Mapping list
        self.mapping_list = MappingListWidget(self.config)
        splitter.addWidget(self.mapping_list)
        
        splitter.setStretchFactor(0, 1)
        splitter.setStretchFactor(1, 2)
        
        main_layout.addWidget(splitter)
        
        # Status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("Ready")
        
    def _init_menu(self):
        menubar = self.menuBar()
        
        # File menu
        file_menu = menubar.addMenu("File")
        
        load_preset_action = QAction("Load Preset...", self)
        load_preset_action.setShortcut("Ctrl+O")
        load_preset_action.triggered.connect(self._load_preset)
        file_menu.addAction(load_preset_action)
        
        save_preset_action = QAction("Save Preset...", self)
        save_preset_action.setShortcut("Ctrl+S")
        save_preset_action.triggered.connect(self._save_preset)
        file_menu.addAction(save_preset_action)
        
        file_menu.addSeparator()
        
        exit_action = QAction("Exit", self)
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        # View menu
        view_menu = menubar.addMenu("View")
        
        theme_action = QAction("Toggle Dark Theme", self)
        theme_action.triggered.connect(self._toggle_theme)
        view_menu.addAction(theme_action)
        
        # Help menu
        help_menu = menubar.addMenu("Help")
        
        about_action = QAction("About", self)
        about_action.triggered.connect(self._show_about)
        help_menu.addAction(about_action)
        
    def _init_tray(self):
        self.tray_icon = QSystemTrayIcon(self)
        self.tray_icon.setToolTip("MidiCtrl")
        
        tray_menu = QMenu()
        
        show_action = QAction("Show", self)
        show_action.triggered.connect(self.show)
        tray_menu.addAction(show_action)
        
        hide_action = QAction("Hide", self)
        hide_action.triggered.connect(self.hide)
        tray_menu.addAction(hide_action)
        
        tray_menu.addSeparator()
        
        exit_action = QAction("Exit", self)
        exit_action.triggered.connect(self.close)
        tray_menu.addAction(exit_action)
        
        self.tray_icon.setContextMenu(tray_menu)
        self.tray_icon.show()
        
    def _connect_signals(self):
        self.refresh_btn.clicked.connect(self._refresh_midi_devices)
        self.connect_btn.clicked.connect(self._toggle_connection)
        self.device_combo.currentIndexChanged.connect(self._device_selection_changed)
        
        self.midi_manager.device_connected.connect(self._on_device_connected)
        self.midi_manager.device_disconnected.connect(self._on_device_disconnected)
        self.midi_manager.midi_event.connect(self._on_midi_event)
        
        self.nanokey_widget.key_clicked.connect(self._on_key_clicked)
        self.mapping_list.mapping_changed.connect(self._on_mapping_changed)
        
    def _refresh_midi_devices(self):
        self.device_combo.clear()
        devices = self.midi_manager.get_available_devices()
        
        if not devices:
            self.device_combo.addItem("No MIDI devices found")
            self.connect_btn.setEnabled(False)
        else:
            for port_id, name in devices:
                self.device_combo.addItem(name, port_id)
            self.connect_btn.setEnabled(True)
            
    def _auto_connect_nanokey(self):
        nanokey = self.midi_manager.find_nanokey2()
        if nanokey:
            port_id, name = nanokey
            index = self.device_combo.findText(name)
            if index >= 0:
                self.device_combo.setCurrentIndex(index)
                self._toggle_connection()
                
    def _toggle_connection(self):
        if self.midi_manager.current_device:
            self.midi_manager.disconnect_device()
        else:
            index = self.device_combo.currentIndex()
            if index >= 0:
                port_id = self.device_combo.currentData()
                port_name = self.device_combo.currentText()
                if port_id is not None:
                    self.midi_manager.connect_device(port_id, port_name)
                    
    def _device_selection_changed(self, index):
        self.connect_btn.setEnabled(index >= 0 and self.device_combo.currentData() is not None)
        
    @pyqtSlot(str)
    def _on_device_connected(self, device_name):
        self.status_label.setText(f"Connected to {device_name}")
        self.status_label.setStyleSheet("QLabel { color: green; font-weight: bold; }")
        self.connect_btn.setText("Disconnect")
        self.status_bar.showMessage(f"Connected to {device_name}")
        self.keyboard_controller.start()
        
    @pyqtSlot()
    def _on_device_disconnected(self):
        self.status_label.setText("Not connected")
        self.status_label.setStyleSheet("QLabel { color: red; font-weight: bold; }")
        self.connect_btn.setText("Connect")
        self.status_bar.showMessage("Disconnected")
        self.keyboard_controller.stop()
        
    @pyqtSlot(dict)
    def _on_midi_event(self, event):
        if event['type'] == 'note':
            self.nanokey_widget.set_key_state(event['note'], event['velocity'] > 0, event['velocity'])
            self.keyboard_controller.handle_midi_event(event)
        elif event['type'] == 'control':
            self.keyboard_controller.handle_midi_event(event)
            
    @pyqtSlot(int)
    def _on_key_clicked(self, note):
        from ui.mapping_dialog import MappingDialog
        dialog = MappingDialog(note, self.config.get_note_mapping(note), self)
        if dialog.exec():
            mapping = dialog.get_mapping()
            if mapping:
                self.config.set_note_mapping(note, mapping)
            else:
                self.config.clear_note_mapping(note)
            self.mapping_list.refresh()
            
    @pyqtSlot()
    def _on_mapping_changed(self):
        self.nanokey_widget.update_mappings(self.config)
        
    def _load_preset(self):
        from PyQt6.QtWidgets import QFileDialog
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Load Preset", str(Path.home() / ".midictrl" / "presets"),
            "JSON Files (*.json)")
        if file_path:
            self.config.load_preset(Path(file_path))
            self.mapping_list.refresh()
            self.nanokey_widget.update_mappings(self.config)
            
    def _save_preset(self):
        from PyQt6.QtWidgets import QFileDialog
        file_path, _ = QFileDialog.getSaveFileName(
            self, "Save Preset", str(Path.home() / ".midictrl" / "presets"),
            "JSON Files (*.json)")
        if file_path:
            if not file_path.endswith('.json'):
                file_path += '.json'
            self.config.save_preset(Path(file_path))
            
    def _toggle_theme(self):
        self.dark_theme = not self.dark_theme
        self._apply_theme()
        
    def _apply_theme(self):
        if self.dark_theme:
            self.setStyleSheet(DARK_THEME)
        else:
            self.setStyleSheet(LIGHT_THEME)
        
    def _show_about(self):
        from PyQt6.QtWidgets import QMessageBox
        QMessageBox.about(self, "About MidiCtrl",
                          "MidiCtrl v1.0\n\n"
                          "KORG nanoKEY2 MIDI Key Mapper\n\n"
                          "Map your MIDI controller to keyboard shortcuts and actions.")
        
    def closeEvent(self, event):
        self.keyboard_controller.stop()
        self.midi_manager.disconnect_device()
        self.tray_icon.hide()
        event.accept()