# MidiCtrl 빠른 시작 가이드

## 5분만에 시작하기! 🚀

### 1. 필수 요구사항 확인
- ✅ Python 3.8 이상
- ✅ KORG nanoKEY2 USB 연결

### 2. 설치 (Windows)

**Option A: 자동 설치**
```cmd
python -m pip install PyQt6 pynput PyYAML mido
```

**Option B: 배치 파일 사용**
```cmd
install.bat
```

### 3. 실행
```cmd
python main.py
```

### 4. 첫 번째 매핑 설정

1. **디바이스 연결**
   - 애플리케이션 상단에서 "nanoKEY2" 확인
   - "Connect" 버튼 클릭 (자동 연결될 수도 있음)

2. **키 매핑**
   - 건반 시각화에서 아무 키나 클릭 (예: C1)
   - 매핑 다이얼로그에서 "Single Key" 선택
   - "Click to capture key" 버튼 클릭
   - 원하는 키보드 키를 눌러주세요 (예: Space)
   - "OK" 클릭

3. **테스트**
   - nanoKEY2의 해당 건반을 눌러보세요
   - 매핑된 키가 입력되는지 확인

### 5. 기본 프리셋 사용

빠르게 시작하려면 기본 프리셋을 로드하세요:

1. File → Load Preset
2. `.midictrl/presets/` 폴더에서 선택:
   - `daw_shortcuts.json` - DAW 단축키
   - `gaming_controls.json` - 게임 컨트롤 (WASD)
   - `text_shortcuts.json` - 텍스트 편집 단축키
   - `function_keys.json` - F1-F12 키

## 주요 기능 둘러보기

### 매핑 타입들
- **Single Key**: 단일 키 (예: Space, Enter)
- **Key Combination**: 조합 키 (예: Ctrl+C, Alt+Tab)  
- **Text Input**: 텍스트 자동 입력
- **System Command**: 프로그램 실행

### 트리거 모드들
- **Press**: 키를 누를 때 실행 (기본값)
- **Release**: 키를 뗄 때 실행
- **Toggle**: 누를 때마다 on/off 전환
- **Hold**: 누르고 있는 동안 유지

### 유용한 팁

1. **실시간 시각화**: 건반을 누르면 하이라이트됩니다
2. **매핑 확인**: 건반 위에 매핑된 키가 표시됩니다
3. **시스템 트레이**: 최소화하면 트레이에서 실행됩니다
4. **테마 변경**: View → Toggle Dark Theme

## 일반적인 사용 예시

### DAW 사용자
```
C1 → Space (재생/정지)
D1 → R (녹음)
E1 → Ctrl+S (저장)
F1 → Ctrl+Z (실행 취소)
```

### 게이머
```
C1 → W (앞으로)
D1 → A (왼쪽)
E1 → S (뒤로)
F1 → D (오른쪽)
G1 → Space (점프)
```

### 개발자
```
F1 → F5 (실행)
F2 → F10 (디버그)
F3 → Ctrl+` (터미널)
F4 → Ctrl+Shift+P (명령 팔레트)
```

## 문제 해결

### 디바이스가 인식되지 않는 경우
1. USB 케이블 다시 연결
2. "Refresh" 버튼 클릭
3. 다른 MIDI 프로그램 종료

### 키 매핑이 작동하지 않는 경우
1. 대상 애플리케이션이 활성화되어 있는지 확인
2. 관리자 권한으로 실행해보기
3. 매핑이 올바르게 설정되었는지 확인

### 설치 문제
`INSTALL_WINDOWS.md` 파일을 참조하세요.

---

🎵 **즐거운 미디 매핑 되세요!** 🎹

문제가 있으면 GitHub Issues에 문의하세요.