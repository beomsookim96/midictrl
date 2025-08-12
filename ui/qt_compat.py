"""
PyQt5/PyQt6 compatibility layer
"""

from PyQt6.QtCore import Qt

# Qt enums compatibility
def get_qt_enum(enum_name, fallback_name):
    """Get Qt enum with fallback for different PyQt versions"""
    try:
        return getattr(Qt, enum_name)
    except AttributeError:
        return getattr(Qt, fallback_name)

# Common enums
try:
    # PyQt6 style
    AlignCenter = Qt.AlignmentFlag.AlignCenter
    AlignTop = Qt.AlignmentFlag.AlignTop
    AlignBottom = Qt.AlignmentFlag.AlignBottom
    LeftButton = Qt.MouseButton.LeftButton
    PointingHandCursor = Qt.CursorShape.PointingHandCursor
    Vertical = Qt.Orientation.Vertical
    Horizontal = Qt.Orientation.Horizontal
    ControlModifier = Qt.KeyboardModifier.ControlModifier
    ShiftModifier = Qt.KeyboardModifier.ShiftModifier
    AltModifier = Qt.KeyboardModifier.AltModifier
    MetaModifier = Qt.KeyboardModifier.MetaModifier
    Key_Control = Qt.Key.Key_Control
    Key_Shift = Qt.Key.Key_Shift
    Key_Alt = Qt.Key.Key_Alt
    Key_Meta = Qt.Key.Key_Meta
    UserRole = Qt.ItemDataRole.UserRole
except AttributeError:
    # PyQt5 style fallback
    AlignCenter = Qt.AlignCenter
    AlignTop = Qt.AlignTop
    AlignBottom = Qt.AlignBottom
    LeftButton = Qt.LeftButton
    PointingHandCursor = Qt.PointingHandCursor
    Vertical = Qt.Vertical
    Horizontal = Qt.Horizontal
    ControlModifier = Qt.ControlModifier
    ShiftModifier = Qt.ShiftModifier
    AltModifier = Qt.AltModifier
    MetaModifier = Qt.MetaModifier
    Key_Control = Qt.Key_Control
    Key_Shift = Qt.Key_Shift
    Key_Alt = Qt.Key_Alt
    Key_Meta = Qt.Key_Meta
    UserRole = Qt.UserRole