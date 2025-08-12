"""
Version information for MidiCtrl
"""

__version__ = "1.0.0"
__author__ = "MidiCtrl Development Team"
__email__ = "support@midictrl.dev"
__description__ = "KORG nanoKEY2 MIDI Key Mapper"
__url__ = "https://github.com/midictrl/midictrl"

VERSION_INFO = {
    'version': __version__,
    'author': __author__,
    'description': __description__,
    'url': __url__,
    'python_requires': '>=3.8',
    'dependencies': [
        'PyQt6>=6.4.0',
        'python-rtmidi>=1.5.0',
        'pynput>=1.7.6',
        'PyYAML>=6.0'
    ]
}