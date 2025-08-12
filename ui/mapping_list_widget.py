from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QTableWidget, QTableWidgetItem,
                             QPushButton, QHBoxLayout, QHeaderView)
from PyQt6.QtCore import Qt, pyqtSignal
from ui.qt_compat import UserRole
from core.key_mapper import KeyMapperConfig

class MappingListWidget(QWidget):
    mapping_changed = pyqtSignal()
    
    def __init__(self, config: KeyMapperConfig, parent=None):
        super().__init__(parent)
        self.config = config
        self._init_ui()
        self.refresh()
        
    def _init_ui(self):
        layout = QVBoxLayout(self)
        
        # Table
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels(["Type", "MIDI Input", "Mapping", "Mode", "Actions"])
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        layout.addWidget(self.table)
        
        # Buttons
        button_layout = QHBoxLayout()
        
        self.edit_btn = QPushButton("Edit")
        self.edit_btn.clicked.connect(self._edit_mapping)
        button_layout.addWidget(self.edit_btn)
        
        self.delete_btn = QPushButton("Delete")
        self.delete_btn.clicked.connect(self._delete_mapping)
        button_layout.addWidget(self.delete_btn)
        
        button_layout.addStretch()
        
        self.clear_all_btn = QPushButton("Clear All")
        self.clear_all_btn.clicked.connect(self._clear_all)
        button_layout.addWidget(self.clear_all_btn)
        
        layout.addLayout(button_layout)
        
    def refresh(self):
        self.table.setRowCount(0)
        
        # Add note mappings
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        for note, mapping in sorted(self.config.mappings.items()):
            row = self.table.rowCount()
            self.table.insertRow(row)
            
            # Type
            self.table.setItem(row, 0, QTableWidgetItem("Note"))
            
            # MIDI Input
            note_name = note_names[note % 12]
            octave = (note // 12) - 2
            self.table.setItem(row, 1, QTableWidgetItem(f"{note_name}{octave} ({note})"))
            
            # Mapping
            mapping_text = self._get_mapping_text(mapping)
            self.table.setItem(row, 2, QTableWidgetItem(mapping_text))
            
            # Mode
            self.table.setItem(row, 3, QTableWidgetItem(mapping.trigger_mode.value))
            
            # Store note in row data
            self.table.item(row, 0).setData(UserRole, ('note', note))
            
        # Add control mappings
        control_names = {
            0x01: "MOD",
            0x15: "OCT-",
            0x16: "OCT+",
            0x17: "PITCH-",
            0x18: "PITCH+",
            0x40: "SUSTAIN"
        }
        
        for control, mapping in sorted(self.config.control_mappings.items()):
            row = self.table.rowCount()
            self.table.insertRow(row)
            
            # Type
            self.table.setItem(row, 0, QTableWidgetItem("Control"))
            
            # MIDI Input
            control_name = control_names.get(control, f"CC {control}")
            self.table.setItem(row, 1, QTableWidgetItem(control_name))
            
            # Mapping
            mapping_text = self._get_mapping_text(mapping)
            self.table.setItem(row, 2, QTableWidgetItem(mapping_text))
            
            # Mode
            self.table.setItem(row, 3, QTableWidgetItem(mapping.trigger_mode.value))
            
            # Store control in row data
            self.table.item(row, 0).setData(UserRole, ('control', control))
            
        self.table.resizeColumnsToContents()
        
    def _get_mapping_text(self, mapping):
        if mapping.mapping_type.value == "single_key":
            text = mapping.key or "None"
            if mapping.modifiers:
                text = "+".join(mapping.modifiers + [text])
            return text
        elif mapping.mapping_type.value == "text_input":
            return f'Text: "{mapping.text}"'
        elif mapping.mapping_type.value == "command":
            return f'Command: {mapping.command}'
        elif mapping.mapping_type.value == "macro":
            return f'Macro ({len(mapping.macro_steps)} steps)'
        else:
            return "Unknown"
            
    def _edit_mapping(self):
        row = self.table.currentRow()
        if row < 0:
            return
            
        item = self.table.item(row, 0)
        if not item:
            return
            
        mapping_type, value = item.data(UserRole)
        
        from ui.mapping_dialog import MappingDialog
        if mapping_type == 'note':
            mapping = self.config.get_note_mapping(value)
            dialog = MappingDialog(value, mapping, self)
            if dialog.exec():
                new_mapping = dialog.get_mapping()
                if new_mapping:
                    self.config.set_note_mapping(value, new_mapping)
                else:
                    self.config.clear_note_mapping(value)
                self.refresh()
                self.mapping_changed.emit()
                
    def _delete_mapping(self):
        row = self.table.currentRow()
        if row < 0:
            return
            
        item = self.table.item(row, 0)
        if not item:
            return
            
        mapping_type, value = item.data(UserRole)
        
        if mapping_type == 'note':
            self.config.clear_note_mapping(value)
        elif mapping_type == 'control':
            self.config.clear_control_mapping(value)
            
        self.refresh()
        self.mapping_changed.emit()
        
    def _clear_all(self):
        from PyQt6.QtWidgets import QMessageBox
        reply = QMessageBox.question(self, "Clear All Mappings",
                                   "Are you sure you want to clear all mappings?",
                                   QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            self.config.mappings.clear()
            self.config.control_mappings.clear()
            self.config.save()
            self.refresh()
            self.mapping_changed.emit()