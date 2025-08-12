from PyQt6.QtWidgets import QWidget, QHBoxLayout, QVBoxLayout, QPushButton, QLabel
from PyQt6.QtCore import Qt, pyqtSignal, QRect
from PyQt6.QtGui import QPainter, QColor, QBrush, QPen, QFont, QMouseEvent
from typing import Dict, Optional
from ui.qt_compat import AlignCenter, AlignTop, AlignBottom, LeftButton, PointingHandCursor

class KeyWidget(QWidget):
    clicked = pyqtSignal(int)  # Emits MIDI note number
    
    def __init__(self, note: int, is_black: bool = False, parent=None):
        super().__init__(parent)
        self.note = note
        self.is_black = is_black
        self.is_pressed = False
        self.velocity = 0
        self.mapping_text = ""
        
        self.setMinimumHeight(100 if not is_black else 60)
        self.setMinimumWidth(40 if not is_black else 30)
        self.setCursor(PointingHandCursor)
        
    def set_pressed(self, pressed: bool, velocity: int = 0):
        self.is_pressed = pressed
        self.velocity = velocity
        self.update()
        
    def set_mapping_text(self, text: str):
        self.mapping_text = text
        self.update()
        
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        # Draw key
        if self.is_black:
            base_color = QColor(20, 20, 20)
            pressed_color = QColor(100, 100, 200)
        else:
            base_color = QColor(250, 250, 250)
            pressed_color = QColor(150, 150, 255)
            
        if self.is_pressed:
            alpha = int(100 + (self.velocity / 127.0) * 155)
            color = QColor(pressed_color)
            color.setAlpha(alpha)
        else:
            color = base_color
            
        painter.fillRect(self.rect(), QBrush(color))
        
        # Draw border
        painter.setPen(QPen(QColor(100, 100, 100), 2))
        painter.drawRect(self.rect())
        
        # Draw note name
        painter.setPen(QPen(QColor(0, 0, 0) if not self.is_black else QColor(255, 255, 255)))
        font = QFont("Arial", 8)
        painter.setFont(font)
        
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        note_name = note_names[self.note % 12]
        octave = (self.note // 12) - 2
        
        painter.drawText(self.rect(), AlignCenter | AlignTop, f"{note_name}{octave}")
        
        # Draw mapping text
        if self.mapping_text:
            font.setPointSize(7)
            painter.setFont(font)
            painter.setPen(QPen(QColor(50, 50, 50) if not self.is_black else QColor(200, 200, 200)))
            painter.drawText(self.rect(), AlignCenter | AlignBottom, self.mapping_text)
            
    def mousePressEvent(self, event: QMouseEvent):
        if event.button() == LeftButton:
            self.clicked.emit(self.note)

class ControlButton(QPushButton):
    def __init__(self, text: str, control_id: int, parent=None):
        super().__init__(text, parent)
        self.control_id = control_id
        self.setCheckable(True)
        self.setMinimumSize(80, 40)

class NanoKeyWidget(QWidget):
    key_clicked = pyqtSignal(int)  # Emits MIDI note number
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.keys: Dict[int, KeyWidget] = {}
        self.control_buttons: Dict[str, ControlButton] = {}
        self._init_ui()
        
    def _init_ui(self):
        main_layout = QVBoxLayout(self)
        
        # Control buttons row
        control_layout = QHBoxLayout()
        control_layout.addStretch()
        
        # Create control buttons
        controls = [
            ("OCT-", 0x15),
            ("OCT+", 0x16),
            ("PITCH-", 0x17),
            ("PITCH+", 0x18),
            ("MOD", 0x01),
            ("SUSTAIN", 0x40)
        ]
        
        for text, control_id in controls:
            btn = ControlButton(text, control_id)
            self.control_buttons[text] = btn
            control_layout.addWidget(btn)
            
        control_layout.addStretch()
        main_layout.addLayout(control_layout)
        
        # Keyboard layout
        keyboard_layout = QHBoxLayout()
        keyboard_layout.setSpacing(0)
        
        # nanoKEY2 has 25 keys from C1 (MIDI note 48) to C3 (MIDI note 72)
        start_note = 48  # C1
        
        # Key pattern for one octave: W B W B W W B W B W B W (12 keys)
        # Where W = White key, B = Black key
        key_pattern = [
            (True, False),   # C
            (False, True),   # C#
            (True, False),   # D
            (False, True),   # D#
            (True, False),   # E
            (True, False),   # F
            (False, True),   # F#
            (True, False),   # G
            (False, True),   # G#
            (True, False),   # A
            (False, True),   # A#
            (True, False),   # B
        ]
        
        # Create keys
        white_key_layout = QHBoxLayout()
        white_key_layout.setSpacing(2)
        
        black_keys = []
        black_key_positions = []
        
        white_key_index = 0
        for i in range(25):  # 25 keys total
            note = start_note + i
            pattern_index = i % 12
            is_white, is_black = key_pattern[pattern_index]
            
            if is_white:
                key = KeyWidget(note, False)
                key.clicked.connect(self.key_clicked.emit)
                self.keys[note] = key
                white_key_layout.addWidget(key)
                
                # Calculate black key position
                if pattern_index in [0, 2, 5, 7, 9]:  # C, D, F, G, A
                    black_key_positions.append(white_key_index)
                white_key_index += 1
            else:
                key = KeyWidget(note, True)
                key.clicked.connect(self.key_clicked.emit)
                self.keys[note] = key
                black_keys.append(key)
                
        keyboard_layout.addLayout(white_key_layout)
        
        # Position black keys as overlay
        # This would be better done with absolute positioning in a custom widget
        # For now, we'll add them to the layout
        
        main_layout.addLayout(keyboard_layout)
        main_layout.addStretch()
        
    def set_key_state(self, note: int, pressed: bool, velocity: int = 0):
        if note in self.keys:
            self.keys[note].set_pressed(pressed, velocity)
            
    def set_control_state(self, control_id: int, value: int):
        for btn in self.control_buttons.values():
            if btn.control_id == control_id:
                btn.setChecked(value > 63)
                break
                
    def update_mappings(self, config):
        for note, key_widget in self.keys.items():
            mapping = config.get_note_mapping(note)
            if mapping:
                if mapping.key:
                    text = mapping.key
                    if mapping.modifiers:
                        text = "+".join(mapping.modifiers + [text])
                    key_widget.set_mapping_text(text)
                elif mapping.text:
                    key_widget.set_mapping_text(f'"{mapping.text[:5]}..."')
                elif mapping.command:
                    key_widget.set_mapping_text("CMD")
                else:
                    key_widget.set_mapping_text("")
            else:
                key_widget.set_mapping_text("")