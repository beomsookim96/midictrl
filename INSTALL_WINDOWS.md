# Windows 설치 가이드

Windows에서 MidiCtrl을 설치하는 방법입니다.

## ⚠️ 중요: PyQt6 호환성 오류 해결

만약 다음과 같은 오류가 발생하면:
```
AttributeError: type object 'ApplicationAttribute' has no attribute 'AA_EnableHighDpiScaling'
```

이는 PyQt6 버전 차이로 인한 문제입니다. 최신 버전의 코드에는 이미 수정이 적용되어 있습니다.

## 옵션 1: 간편 설치 (권장)

### 1단계: 기본 패키지 설치
Windows Command Prompt 또는 PowerShell에서 다음 명령어를 실행하세요:

```cmd
python -m pip install PyQt6 pynput PyYAML mido
```

### 2단계: 애플리케이션 실행
```cmd
cd MidiCtrl
python main.py
```

## 옵션 2: RTMidi 사용 (고급)

RTMidi를 사용하려면 Visual Studio Build Tools가 필요합니다.

### 1단계: Visual Studio Build Tools 설치
1. [Visual Studio Build Tools](https://visualstudio.microsoft.com/ko/downloads/#build-tools-for-visual-studio-2022) 다운로드
2. "C++ 빌드 도구" 워크로드 설치
3. Windows SDK 포함

### 2단계: RTMidi 설치
```cmd
python -m pip install python-rtmidi
```

### 3단계: 나머지 패키지 설치
```cmd
python -m pip install PyQt6 pynput PyYAML
```

## 옵션 3: Pre-compiled Wheel 사용

RTMidi의 pre-compiled wheel을 찾아 설치:

```cmd
python -m pip install --find-links https://github.com/SpotlightKid/python-rtmidi/releases python-rtmidi
```

## 문제 해결

### PyQt6 호환성 오류들

#### "ApplicationAttribute has no attribute 'AA_EnableHighDpiScaling'"
- **해결책**: 최신 코드를 사용하면 자동으로 해결됩니다. `ui/qt_compat.py` 모듈이 호환성을 처리합니다.

#### "AlignmentFlag has no attribute 'AlignCenter'" 등의 오류들
- **해결책**: 마찬가지로 `qt_compat.py`에서 처리됩니다.

### "컴파일러를 찾을 수 없습니다" 오류
- 옵션 1을 사용하세요 (mido 라이브러리 사용)
- 또는 Visual Studio Build Tools 설치

### "MIDI 디바이스를 찾을 수 없습니다" 오류
1. nanoKEY2가 올바르게 연결되었는지 확인
2. Windows 장치 관리자에서 MIDI 디바이스 확인
3. 다른 MIDI 프로그램이 디바이스를 사용 중이 아닌지 확인

### "pynput" 권한 오류
일부 시스템에서는 관리자 권한으로 실행해야 할 수 있습니다:
1. Command Prompt를 관리자 권한으로 실행
2. 애플리케이션 실행

### 모듈 import 오류
Python이 올바르게 설치되어 있고, 올바른 디렉토리에서 실행하고 있는지 확인:
```cmd
cd MidiCtrl
python --version
python -c "import sys; print(sys.path)"
```

## 테스트

설치가 완료되면 다음으로 테스트하세요:

```cmd
python test_install.py
```

## 실행

```cmd
python main.py
```

또는 batch 파일 사용:

```cmd
run.bat
```

## 지원되는 Windows 버전

- Windows 10 이상
- Python 3.8 이상

## 추가 도움말

문제가 계속 발생하면:

1. Python 버전 확인: `python --version`
2. 패키지 목록 확인: `python -m pip list`
3. 오류 메시지를 포함하여 GitHub Issues에 보고