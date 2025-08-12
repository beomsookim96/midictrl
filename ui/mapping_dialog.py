from PyQt6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QComboBox,
                             QLineEdit, QPushButton, QLabel, QCheckBox,
                             QSpinBox, QTabWidget, QWidget, QTextEdit,
                             QListWidget, QDialogButtonBox, QGroupBox,
                             QRadioButton, QButtonGroup)
from PyQt6.QtCore import Qt, pyqtSlot
from PyQt6.QtGui import QKeySequence
from core.key_mapper import KeyMapping, MappingType, TriggerMode
from ui.qt_compat import ControlModifier, ShiftModifier, AltModifier, MetaModifier, Key_Control, Key_Shift, Key_Alt, Key_Meta
from typing import Optional

class KeyCaptureButton(QPushButton):
    def __init__(self, parent=None):
        super().__init__("Click to capture key", parent)
        self.key = None
        self.modifiers = []
        
    def keyPressEvent(self, event):
        key = event.key()
        modifiers = event.modifiers()
        
        if key not in [Key_Control, Key_Shift, Key_Alt, Key_Meta]:
            self.key = QKeySequence(key).toString()
            self.modifiers = []
            
            if modifiers & ControlModifier:
                self.modifiers.append("Ctrl")
            if modifiers & ShiftModifier:
                self.modifiers.append("Shift")
            if modifiers & AltModifier:
                self.modifiers.append("Alt")
            if modifiers & MetaModifier:
                self.modifiers.append("Meta")
                
            self._update_text()
            
    def _update_text(self):
        if self.key:
            text = self.key
            if self.modifiers:
                text = "+".join(self.modifiers + [text])
            self.setText(text)
        else:
            self.setText("Click to capture key")
            
    def clear(self):
        self.key = None
        self.modifiers = []
        self._update_text()

class MappingDialog(QDialog):
    def __init__(self, midi_input: int, current_mapping: Optional[KeyMapping] = None, parent=None):
        super().__init__(parent)
        self.midi_input = midi_input
        self.current_mapping = current_mapping
        
        self.setWindowTitle(f"Edit Mapping - MIDI Input {midi_input}")
        self.setMinimumSize(500, 400)
        
        self._init_ui()
        if current_mapping:
            self._load_mapping(current_mapping)
            
    def _init_ui(self):
        layout = QVBoxLayout(self)
        
        # Mapping type selection
        type_group = QGroupBox("Mapping Type")
        type_layout = QVBoxLayout()
        
        self.type_combo = QComboBox()
        self.type_combo.addItems([
            "Single Key",
            "Key Combination",
            "Text Input",
            "System Command",
            "Macro"
        ])
        self.type_combo.currentIndexChanged.connect(self._on_type_changed)
        type_layout.addWidget(self.type_combo)
        type_group.setLayout(type_layout)
        layout.addWidget(type_group)
        
        # Content area
        self.content_widget = QTabWidget()
        layout.addWidget(self.content_widget)
        
        # Single Key tab
        self.single_key_widget = QWidget()
        single_key_layout = QVBoxLayout()
        
        self.key_capture = KeyCaptureButton()
        single_key_layout.addWidget(QLabel("Press the key combination:"))
        single_key_layout.addWidget(self.key_capture)
        single_key_layout.addStretch()
        
        self.single_key_widget.setLayout(single_key_layout)
        
        # Text Input tab
        self.text_widget = QWidget()
        text_layout = QVBoxLayout()
        
        self.text_edit = QTextEdit()
        self.text_edit.setPlaceholderText("Enter text to be typed...")
        text_layout.addWidget(QLabel("Text to input:"))
        text_layout.addWidget(self.text_edit)
        
        self.text_widget.setLayout(text_layout)
        
        # Command tab
        self.command_widget = QWidget()
        command_layout = QVBoxLayout()
        
        self.command_edit = QLineEdit()
        self.command_edit.setPlaceholderText("Enter command to execute...")
        command_layout.addWidget(QLabel("Command:"))
        command_layout.addWidget(self.command_edit)
        command_layout.addStretch()
        
        self.command_widget.setLayout(command_layout)
        
        # Macro tab
        self.macro_widget = QWidget()
        macro_layout = QVBoxLayout()
        
        self.macro_list = QListWidget()
        macro_layout.addWidget(QLabel("Macro steps:"))
        macro_layout.addWidget(self.macro_list)
        
        macro_button_layout = QHBoxLayout()
        add_step_btn = QPushButton("Add Step")
        remove_step_btn = QPushButton("Remove Step")
        macro_button_layout.addWidget(add_step_btn)
        macro_button_layout.addWidget(remove_step_btn)
        macro_layout.addLayout(macro_button_layout)
        
        self.macro_widget.setLayout(macro_layout)
        
        # Add tabs
        self.content_widget.addTab(self.single_key_widget, "Key")
        self.content_widget.addTab(self.text_widget, "Text")
        self.content_widget.addTab(self.command_widget, "Command")
        self.content_widget.addTab(self.macro_widget, "Macro")
        
        # Trigger mode
        trigger_group = QGroupBox("Trigger Mode")
        trigger_layout = QHBoxLayout()
        
        self.trigger_group = QButtonGroup()
        self.press_radio = QRadioButton("On Press")
        self.release_radio = QRadioButton("On Release")
        self.toggle_radio = QRadioButton("Toggle")
        self.hold_radio = QRadioButton("Hold")
        
        self.press_radio.setChecked(True)
        
        self.trigger_group.addButton(self.press_radio, 0)
        self.trigger_group.addButton(self.release_radio, 1)
        self.trigger_group.addButton(self.toggle_radio, 2)
        self.trigger_group.addButton(self.hold_radio, 3)
        
        trigger_layout.addWidget(self.press_radio)
        trigger_layout.addWidget(self.release_radio)
        trigger_layout.addWidget(self.toggle_radio)
        trigger_layout.addWidget(self.hold_radio)
        trigger_group.setLayout(trigger_layout)
        layout.addWidget(trigger_group)
        
        # Velocity options
        velocity_group = QGroupBox("Velocity Options")
        velocity_layout = QHBoxLayout()
        
        self.velocity_check = QCheckBox("Velocity sensitive")
        self.velocity_spin = QSpinBox()
        self.velocity_spin.setRange(0, 127)
        self.velocity_spin.setValue(64)
        self.velocity_spin.setEnabled(False)
        
        self.velocity_check.toggled.connect(self.velocity_spin.setEnabled)
        
        velocity_layout.addWidget(self.velocity_check)
        velocity_layout.addWidget(QLabel("Threshold:"))
        velocity_layout.addWidget(self.velocity_spin)
        velocity_layout.addStretch()
        velocity_group.setLayout(velocity_layout)
        layout.addWidget(velocity_group)
        
        # Buttons
        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | 
            QDialogButtonBox.StandardButton.Cancel |
            QDialogButtonBox.StandardButton.Reset
        )
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        buttons.button(QDialogButtonBox.StandardButton.Reset).clicked.connect(self._reset)
        layout.addWidget(buttons)
        
        self._on_type_changed(0)
        
    def _on_type_changed(self, index):
        self.content_widget.setCurrentIndex(index)
        
    def _load_mapping(self, mapping: KeyMapping):
        # Set mapping type
        type_map = {
            MappingType.SINGLE_KEY: 0,
            MappingType.KEY_COMBO: 0,
            MappingType.TEXT_INPUT: 1,
            MappingType.COMMAND: 2,
            MappingType.MACRO: 3
        }
        self.type_combo.setCurrentIndex(type_map.get(mapping.mapping_type, 0))
        
        # Load content
        if mapping.mapping_type in [MappingType.SINGLE_KEY, MappingType.KEY_COMBO]:
            self.key_capture.key = mapping.key
            self.key_capture.modifiers = mapping.modifiers
            self.key_capture._update_text()
        elif mapping.mapping_type == MappingType.TEXT_INPUT:
            self.text_edit.setText(mapping.text or "")
        elif mapping.mapping_type == MappingType.COMMAND:
            self.command_edit.setText(mapping.command or "")
        elif mapping.mapping_type == MappingType.MACRO:
            # TODO: Implement macro loading
            pass
            
        # Set trigger mode
        trigger_map = {
            TriggerMode.PRESS: 0,
            TriggerMode.RELEASE: 1,
            TriggerMode.TOGGLE: 2,
            TriggerMode.HOLD: 3
        }
        button = self.trigger_group.button(trigger_map.get(mapping.trigger_mode, 0))
        if button:
            button.setChecked(True)
            
        # Set velocity options
        self.velocity_check.setChecked(mapping.velocity_sensitive)
        self.velocity_spin.setValue(mapping.velocity_threshold)
        
    def _reset(self):
        self.key_capture.clear()
        self.text_edit.clear()
        self.command_edit.clear()
        self.macro_list.clear()
        self.velocity_check.setChecked(False)
        self.press_radio.setChecked(True)
        
    def get_mapping(self) -> Optional[KeyMapping]:
        mapping_type = [
            MappingType.SINGLE_KEY,
            MappingType.TEXT_INPUT,
            MappingType.COMMAND,
            MappingType.MACRO
        ][self.type_combo.currentIndex()]
        
        trigger_mode = [
            TriggerMode.PRESS,
            TriggerMode.RELEASE,
            TriggerMode.TOGGLE,
            TriggerMode.HOLD
        ][self.trigger_group.checkedId()]
        
        mapping = KeyMapping(
            mapping_type=mapping_type,
            trigger_mode=trigger_mode,
            velocity_sensitive=self.velocity_check.isChecked(),
            velocity_threshold=self.velocity_spin.value()
        )
        
        if mapping_type in [MappingType.SINGLE_KEY, MappingType.KEY_COMBO]:
            if not self.key_capture.key:
                return None
            mapping.key = self.key_capture.key
            mapping.modifiers = self.key_capture.modifiers
        elif mapping_type == MappingType.TEXT_INPUT:
            mapping.text = self.text_edit.toPlainText()
            if not mapping.text:
                return None
        elif mapping_type == MappingType.COMMAND:
            mapping.command = self.command_edit.text()
            if not mapping.command:
                return None
        elif mapping_type == MappingType.MACRO:
            # TODO: Implement macro saving
            pass
            
        return mapping