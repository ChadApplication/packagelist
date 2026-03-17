# API 레퍼런스

모든 엔드포인트는 `/api` 접두사를 사용합니다. 백엔드는 기본적으로 포트 8020에서 실행됩니다.

## 엔드포인트

### 1. 헬스 체크

- **Method:** `GET`
- **Path:** `/api/health`
- **설명:** 서버 상태를 반환합니다.
- **응답:** `{"status": "ok"}`

### 2. 패키지 스캔

- **Method:** `POST`
- **Path:** `/api/packages/scan`
- **설명:** 모든 패키지 소스(Homebrew formulae, Homebrew casks, pip, uv tools)의 전체 병렬 스캔을 실행합니다. 결과는 JSON 스토어에 저장됩니다.
- **응답:** `{"status": "ok", "count": <number>}`

### 3. 패키지 목록

- **Method:** `GET`
- **Path:** `/api/packages`
- **설명:** 선택적 필터링과 함께 저장된 패키지 목록을 반환합니다.
- **쿼리 파라미터:**
  - `category` (선택): 카테고리 이름으로 필터링 (정확 일치).
  - `q` (선택): 이름, 설명, 메모에 대해 매칭되는 검색 문자열 (대소문자 무시).
- **응답:** `{"packages": [...]}`

### 4. 카테고리 조회

- **Method:** `GET`
- **Path:** `/api/packages/categories`
- **설명:** 패키지 수와 함께 고유한 카테고리 이름을 반환합니다.
- **응답:** `{"categories": {"AI / LLM": 5, "Development": 12, ...}}`

### 5. 메모 업데이트

- **Method:** `PUT`
- **Path:** `/api/packages/{source}/{name}/memo`
- **설명:** 특정 패키지의 사용자 메모를 업데이트합니다.
- **경로 파라미터:**
  - `source`: 패키지 소스 (예: `brew-formula`, `brew-cask`, `pip`, `uv-tool`).
  - `name`: 패키지 이름.
- **요청 본문:** `{"memo": "<text>"}`
- **응답:** `{"status": "ok"}` 또는 `{"status": "error", "message": "Package not found"}`

### 6. 번역된 설명 업데이트

- **Method:** `PUT`
- **Path:** `/api/packages/{source}/{name}/description`
- **설명:** 패키지의 번역된 설명을 업데이트합니다. `ko`와 `zh` 언어만 허용됩니다.
- **경로 파라미터:**
  - `source`: 패키지 소스.
  - `name`: 패키지 이름.
- **요청 본문:** `{"lang": "ko" | "zh", "text": "<translated description>"}`
- **응답:** `{"status": "ok"}` 또는 `{"status": "error", "message": "..."}`

### 7. 전체 업데이트 확인

- **Method:** `POST`
- **Path:** `/api/packages/check-updates`
- **설명:** 모든 소스(brew formulae, brew casks, pip)에서 오래된 패키지를 확인합니다. 스토어의 `update_available` 및 `latest_version` 필드를 업데이트합니다.
- **응답:** `{"status": "ok", "outdated_count": <number>}`

### 8. 단일 패키지 업데이트 확인

- **Method:** `POST`
- **Path:** `/api/packages/{source}/{name}/check-update`
- **설명:** 단일 패키지의 업데이트 가능 여부를 확인합니다. `brew-formula`, `brew-cask`, `pip` 소스를 지원합니다.
- **경로 파라미터:**
  - `source`: 패키지 소스.
  - `name`: 패키지 이름.
- **응답:** `{"status": "ok", "update_available": true|false, "latest": "<version>"}`

### 9. 단일 패키지 업그레이드

- **Method:** `POST`
- **Path:** `/api/packages/{source}/{name}/upgrade`
- **설명:** 적절한 패키지 매니저(`brew upgrade`, `brew upgrade --cask` 또는 `pip install --upgrade`)를 사용하여 단일 패키지를 업그레이드합니다. 완료 후 업데이트 플래그를 초기화합니다.
- **경로 파라미터:**
  - `source`: 패키지 소스.
  - `name`: 패키지 이름.
- **응답:** `{"status": "ok", "output": "<first 500 chars of command output>"}`

### 10. 전체 오래된 패키지 업그레이드

- **Method:** `POST`
- **Path:** `/api/packages/upgrade-all`
- **설명:** 모든 오래된 패키지를 업그레이드합니다. 모든 brew 패키지에 `brew upgrade`를, 오래된 pip 패키지에 `pip install --upgrade`를 실행합니다. 모든 업데이트 플래그를 초기화합니다.
- **응답:** `{"status": "ok", "upgraded": <number>}`

### 11. 매뉴얼/문서 URL 조회

- **Method:** `GET`
- **Path:** `/api/packages/{source}/{name}/manual`
- **설명:** 패키지의 문서 URL을 반환합니다. 패키지에 홈페이지가 있으면 파생 URL(GitHub의 경우 README, wiki; pypi.org의 경우 PyPI 링크)과 함께 반환합니다. 없으면 Google 검색 URL로 폴백합니다.
- **경로 파라미터:**
  - `source`: 패키지 소스.
  - `name`: 패키지 이름.
- **응답:** `{"status": "ok", "urls": {"homepage": "...", "readme": "...", ...}}`

### 12. 패키지 내보내기

- **Method:** `GET`
- **Path:** `/api/packages/export`
- **설명:** 전체 패키지 목록을 다운로드 가능한 파일로 내보냅니다. 패키지는 소스, 카테고리, 이름 순으로 정렬됩니다.
- **쿼리 파라미터:**
  - `fmt` (선택, 기본값 `csv`): 내보내기 형식. 값: `csv` 또는 `md`.
- **응답:** 파일 다운로드 (`text/csv` 또는 `text/markdown`).
  - CSV 열: Source, Category, Name, Version, Description, Homepage, Memo, Update Available, Latest Version.
  - Markdown: 동일한 열의 테이블.
