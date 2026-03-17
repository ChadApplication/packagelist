# 아키텍처

PackageList는 macOS 패키지를 모니터링하고 관리하기 위한 로컬 대시보드입니다. FastAPI 백엔드와 Next.js 프론트엔드를 사용하며 REST API로 통신합니다. 인증이나 데이터베이스가 없으며, 데이터는 단일 JSON 파일로 영속화됩니다.

## 백엔드

**스택:** Python 3.12 / FastAPI / Uvicorn

### 진입점 (`backend/main.py`)

FastAPI 앱은 `/api/` 하위에 12개의 REST 엔드포인트를 제공합니다. `PackageScanner`와 `PackageStore`를 초기화하며, 모든 엔드포인트에서 사용됩니다. 로컬 개발을 위해 CORS가 완전히 개방되어 있습니다 (`allow_origins=["*"]`).

### 스캐너 (`backend/services/scanner.py`)

`PackageScanner`는 `asyncio.gather`를 사용하여 네 가지 패키지 소스를 병렬로 스캔합니다:

- **Homebrew formulae** (`_scan_brew_formulae`): `brew leaves`로 최상위 formulae를 가져온 후 각각에 `brew info`를 실행하여 버전, 설명, 홈페이지를 추출합니다. `_categorize_brew`에서 키워드 매칭으로 카테고리가 자동 할당됩니다 (AI/LLM, Development, Search/Text, Terminal/System, Media/Image, Document/Presentation, Utility).
- **Homebrew casks** (`_scan_brew_casks`): `brew list --cask`를 실행한 후 각각에 `brew info --cask`를 실행합니다. 모든 cask는 "GUI App"으로 분류됩니다.
- **pip** (`_scan_pip`): `pip list --format=json`을 실행한 후 `pip show`로 설명과 홈페이지를 배치 조회합니다 (배치당 30개 패키지). "Python (pip)"으로 분류됩니다.
- **uv tools** (`_scan_uv_tools`): `uv tool list`를 실행하고 출력 라인에서 이름/버전을 파싱한 후 설명을 위해 `pip show`를 시도합니다. "Python (uv tool)"로 분류됩니다.

모든 서브프로세스 호출은 이벤트 루프 차단을 방지하기 위해 `asyncio.to_thread`에서 실행되며, 구성 가능한 타임아웃이 있습니다.

업데이트 확인도 병렬입니다: `check_outdated`는 `brew outdated --json=v2`와 `pip list --outdated --format=json`을 동시에 실행합니다.

### 스토어 (`backend/services/store.py`)

`PackageStore`는 `backend/data/packages.json`에서 JSON 파일 영속성을 처리합니다.

핵심 동작 -- **메모 및 설명 보존**: 저장 시 스토어는 기존 파일을 로드하고, `(source, name)` 키로 보존할 키(`memo`, `description_ko`, `description_zh`)의 맵을 구축한 후 새 패키지 목록에 병합합니다. 이를 통해 사용자가 입력한 메모와 번역된 설명이 재스캔 시에도 유지됩니다.

## 프론트엔드

**스택:** Next.js 15 / React 19 / TypeScript / Tailwind CSS

### 단일 페이지 앱 (`frontend/src/app/page.tsx`)

전체 UI는 단일 클라이언트 측 React 컴포넌트(`"use client"`)입니다. Next.js 리라이트 프록시(`/api/*`를 백엔드 포트로 포워딩하도록 구성)를 통해 백엔드와 통신합니다.

### 레이아웃

- **헤더**: 제목, 패키지/업데이트 수, 언어 선택기 (EN/KO/ZH), Scan 버튼, Check Updates 버튼, Update All 버튼, 전체 펼치기/접기 토글, CSV/MD 내보내기 링크.
- **사이드바**: 검색 입력 (이름, 설명, 메모에 대한 실시간 필터링) 및 패키지 수가 표시된 카테고리 필터 버튼.
- **메인 콘텐츠**: `source::category`별로 그룹화된 패키지가 접이식 아코디언 섹션으로 표시됩니다. 각 섹션은 이름, 버전, 설명, 메모, 문서, 액션 열이 있는 테이블로 펼쳐집니다.
- **푸터**: 저작권 및 버전 (`NEXT_PUBLIC_VERSION` 환경 변수 또는 git 태그에서).

### i18n 시스템

국제화는 언어 코드(`en`, `ko`, `zh`)를 문자열 키에 매핑하는 인라인 `i18n` 객체로 구현됩니다. 현재 언어는 React 상태에 저장됩니다. 카테고리 이름도 `cat:` 접두사 키를 통해 번역됩니다.

패키지 설명의 경우, 이중 표시 모드에서 번역된 설명(KO/ZH)을 원본 영어 설명과 함께 작은 텍스트로 아래에 표시합니다. 비영어 언어가 활성 상태일 때 설명을 클릭하면 번역을 위한 인라인 편집기가 열립니다. `ko`와 `zh` 번역만 지원됩니다 (각 패키지에 `description_ko`와 `description_zh`로 저장).

### 카테고리 자동 분류

카테고리는 스캐너에 의해 서버 측에서 할당됩니다. Brew formulae는 패키지 이름과 설명에 대한 키워드 매칭으로 분류됩니다. Brew cask는 기본적으로 "GUI App"입니다. pip과 uv-tool 패키지는 고유한 고정 카테고리를 갖습니다.
