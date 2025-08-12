"""
UI Styling for MidiCtrl application
"""

DARK_THEME = """
QMainWindow {
    background-color: #2b2b2b;
    color: #ffffff;
}

QGroupBox {
    font-weight: bold;
    border: 2px solid #555555;
    border-radius: 5px;
    margin-top: 1ex;
    padding-top: 10px;
}

QGroupBox::title {
    subcontrol-origin: margin;
    left: 10px;
    padding: 0 5px 0 5px;
}

QPushButton {
    background-color: #404040;
    border: 1px solid #555555;
    border-radius: 4px;
    padding: 6px;
    min-width: 80px;
}

QPushButton:hover {
    background-color: #505050;
}

QPushButton:pressed {
    background-color: #303030;
}

QPushButton:disabled {
    background-color: #2a2a2a;
    color: #666666;
}

QComboBox {
    background-color: #404040;
    border: 1px solid #555555;
    border-radius: 4px;
    padding: 5px;
    min-width: 120px;
}

QComboBox::drop-down {
    border: none;
}

QComboBox::down-arrow {
    image: url(down_arrow.png);
    width: 12px;
    height: 12px;
}

QTableWidget {
    background-color: #363636;
    alternate-background-color: #404040;
    selection-background-color: #4a90e2;
    gridline-color: #555555;
}

QHeaderView::section {
    background-color: #505050;
    padding: 4px;
    border: 1px solid #666666;
    font-weight: bold;
}

QTabWidget::pane {
    border: 1px solid #555555;
    background-color: #363636;
}

QTabBar::tab {
    background-color: #404040;
    border: 1px solid #555555;
    padding: 8px 16px;
    margin-right: 2px;
}

QTabBar::tab:selected {
    background-color: #4a90e2;
}

QLineEdit, QTextEdit, QSpinBox {
    background-color: #404040;
    border: 1px solid #555555;
    border-radius: 4px;
    padding: 4px;
    selection-background-color: #4a90e2;
}

QCheckBox, QRadioButton {
    spacing: 8px;
}

QCheckBox::indicator, QRadioButton::indicator {
    width: 13px;
    height: 13px;
}

QCheckBox::indicator:unchecked {
    background-color: #404040;
    border: 1px solid #555555;
}

QCheckBox::indicator:checked {
    background-color: #4a90e2;
    border: 1px solid #4a90e2;
}

QScrollArea {
    background-color: #363636;
    border: 1px solid #555555;
}
"""

LIGHT_THEME = """
QMainWindow {
    background-color: #f0f0f0;
    color: #000000;
}

QGroupBox {
    font-weight: bold;
    border: 2px solid #cccccc;
    border-radius: 5px;
    margin-top: 1ex;
    padding-top: 10px;
}

QPushButton {
    background-color: #ffffff;
    border: 1px solid #cccccc;
    border-radius: 4px;
    padding: 6px;
    min-width: 80px;
}

QPushButton:hover {
    background-color: #e6f3ff;
    border-color: #4a90e2;
}

QPushButton:pressed {
    background-color: #cce7ff;
}

QTableWidget {
    background-color: #ffffff;
    alternate-background-color: #f8f8f8;
    selection-background-color: #4a90e2;
    gridline-color: #dddddd;
}

QHeaderView::section {
    background-color: #e0e0e0;
    padding: 4px;
    border: 1px solid #cccccc;
    font-weight: bold;
}
"""