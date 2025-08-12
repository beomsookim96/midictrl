# MidiCtrl - KORG nanoKEY2 MIDI Key Mapper

KORG nanoKEY2 미디 컨트롤러의 입력을 받아서 사용자가 원하는 키보드 키나 단축키로 매핑할 수 있는 PyQt 기반 데스크탑 애플리케이션입니다.

## 주요 기능

- **MIDI 디바이스 자동 감지**: nanoKEY2 자동 인식 및 연결
- **실시간 키 매핑**: 25개 건반과 컨트롤 버튼을 키보드 단축키로 매핑
- **다양한 매핑 타입**:
  - 단일 키 매핑 (예: C1 → Space)
  - 조합 키 매핑 (예: D1 → Ctrl+C)
  - 텍스트 입력 매핑
  - 시스템 명령어 실행
  - 매크로 (다단계 키 입력)
- **트리거 모드**:
  - Press: 키 누를 때 실행
  - Release: 키 뗄 때 실행
  - Toggle: 토글 방식
  - Hold: 누르고 있는 동안 유지
- **프리셋 관리**: 다양한 용도별 프리셋 저장/불러오기
- **실시간 시각화**: 누른 키 하이라이트 및 매핑 정보 표시
- **시스템 트레이**: 백그라운드 실행 지원

## 시스템 요구사항

- Python 3.8 이상
- KORG nanoKEY2 MIDI 컨트롤러
- Windows, macOS, 또는 Linux

## 설치 방법

### 자동 설치 (권장)

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd MidiCtrl
   ```

2. **자동 설치 실행**
   
   **Windows:**
   ```cmd
   install.bat
   ```
   또는
   ```cmd
   python install.py
   ```
   
   **macOS/Linux:**
   ```bash
   python install.py
   ```

### 수동 설치

1. **가상환경 생성 (권장)**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

2. **의존성 설치**
   ```bash
   # 기본 패키지 (모든 플랫폼)
   python -m pip install PyQt6 pynput PyYAML mido
   
   # 선택사항: 더 나은 성능을 위한 RTMidi (컴파일러 필요)
   python -m pip install python-rtmidi
   ```

3. **설치 확인**
   ```bash
   python test_install.py
   ```

4. **애플리케이션 실행**
   ```bash
   python main.py
   ```

### Windows 특별 지침

Windows에서 `python-rtmidi` 컴파일 오류가 발생하는 경우:

1. **간편한 해결법**: RTMidi 대신 Mido 사용 (이미 requirements.txt에 포함됨)
2. **고급 해결법**: [INSTALL_WINDOWS.md](INSTALL_WINDOWS.md) 참조

## 사용법

### 1. MIDI 디바이스 연결

1. KORG nanoKEY2를 컴퓨터에 연결하세요
2. 애플리케이션이 자동으로 디바이스를 감지합니다
3. "Connect" 버튼을 클릭하거나 자동 연결을 기다리세요

### 2. 키 매핑 설정

1. nanoKEY2 시각화 위젯에서 매핑하고 싶은 키를 클릭하세요
2. 매핑 다이얼로그에서 원하는 설정을 선택하세요:
   - **매핑 타입**: 단일 키, 텍스트 입력, 명령어, 매크로
   - **트리거 모드**: Press, Release, Toggle, Hold
   - **벨로시티 감도**: 키 누르는 강도에 따른 반응 설정

### 3. 프리셋 사용

애플리케이션에는 다음과 같은 기본 프리셋이 포함되어 있습니다:

- **DAW Shortcuts**: 디지털 오디오 워크스테이션용 단축키
- **Gaming Controls**: WASD 게임 컨트롤
- **Text Shortcuts**: 텍스트 편집 단축키
- **Function Keys**: F1-F12 기능키 매핑

프리셋을 불러오려면:
1. File → Load Preset 메뉴 선택
2. 원하는 프리셋 파일 선택

### 4. 사용자 프리셋 저장

1. 원하는 대로 키를 매핑하세요
2. File → Save Preset 메뉴 선택
3. 프리셋 이름을 입력하고 저장하세요

## 프로젝트 구조

```
MidiCtrl/
├── main.py                 # 애플리케이션 진입점
├── requirements.txt        # Python 의존성
├── midi/                   # MIDI 처리 모듈
│   ├── __init__.py
│   └── device_manager.py   # MIDI 디바이스 관리
├── core/                   # 핵심 로직
│   ├── __init__.py
│   ├── key_mapper.py       # 키 매핑 설정
│   └── keyboard_controller.py  # 키보드 이벤트 생성
├── ui/                     # 사용자 인터페이스
│   ├── __init__.py
│   ├── main_window.py      # 메인 윈도우
│   ├── nanokey_widget.py   # nanoKEY2 시각화
│   ├── mapping_dialog.py   # 매핑 설정 다이얼로그
│   └── mapping_list_widget.py  # 매핑 목록
└── presets/                # 기본 프리셋
    ├── __init__.py
    └── default_presets.py
```

## nanoKEY2 키 매핑

nanoKEY2는 다음과 같은 입력을 제공합니다:

- **25개 건반**: C1 (MIDI 노트 48) ~ C3 (MIDI 노트 72)
- **컨트롤 버튼**:
  - Octave Up/Down (OCT+/OCT-)
  - Pitch Up/Down
  - Mod 버튼
  - Sustain 버튼

## 트러블슈팅

### MIDI 디바이스가 감지되지 않는 경우

1. nanoKEY2가 올바르게 연결되었는지 확인하세요
2. 다른 MIDI 애플리케이션이 디바이스를 사용 중인지 확인하세요
3. "Refresh" 버튼을 클릭하여 디바이스 목록을 새로고침하세요

### 키 매핑이 작동하지 않는 경우

1. 애플리케이션이 MIDI 디바이스에 연결되어 있는지 확인하세요
2. 대상 애플리케이션이 활성 상태인지 확인하세요
3. 관리자 권한으로 실행해 보세요 (일부 시스템에서 필요)

### 성능 문제

1. 다른 MIDI 애플리케이션을 종료하세요
2. 시스템 리소스 사용량을 확인하세요
3. 불필요한 매핑을 제거하세요

## 개발자 정보

- 프로그래밍 언어: Python 3.8+
- GUI 프레임워크: PyQt6
- MIDI 라이브러리: python-rtmidi
- 키보드 제어: pynput

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 기여하기

버그 리포트나 기능 요청은 GitHub Issues를 통해 제출해 주세요.