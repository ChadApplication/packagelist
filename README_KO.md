# PackageList

macOS에 설치된 패키지를 모니터링하고 관리하기 위한 로컬 대시보드 — Homebrew formulae/casks, Python pip, uv tools.

## 사전 요구 사항

- Python 3.12+
- Node.js 18+
- Homebrew

## 설치

```bash
git clone https://github.com/ChadApplication/packagelist.git
cd packagelist
./setup.sh
```

## 사용법

```bash
./run.sh start    # 서버 시작 (Backend :8020, Frontend :3020)
./run.sh stop     # 서버 중지
./run.sh restart  # 재시작
./run.sh live     # 시작 + 실시간 로그 스트리밍
```

http://localhost:3020 을 열고 **Scan**을 클릭합니다.

## 기능

- **패키지 스캔**: Homebrew (formulae + casks), pip, uv tools 병렬 스캔
- **카테고리 필터**: 자동 분류 (AI/LLM, Development, Terminal, Media 등)
- **검색**: 이름, 설명(다국어), 메모에 대한 실시간 검색
- **정렬**: 이름 오름차순/내림차순 토글
- **메모**: 패키지별 노트, 재스캔 후에도 보존
- **다국어 설명**: EN/KO/ZH — 설명 클릭으로 번역 편집
- **업데이트 확인**: 오래된 패키지 감지, 개별 또는 일괄 업데이트
- **매뉴얼/문서**: 각 패키지의 홈페이지를 원클릭으로 열기
- **내보내기**: CSV 및 Markdown 다운로드
- **다국어 UI**: EN / KO / ZH 인터페이스 전환

## 기술 스택

- **Backend:** Python 3.12 / FastAPI
- **Frontend:** Next.js 15 / React 19 / TypeScript / Tailwind CSS
- **Storage:** JSON 파일 (데이터베이스 없음)

## API

| 메서드 | 경로 | 설명 |
|--------|------|-------------|
| GET | /api/health | 헬스 체크 |
| POST | /api/packages/scan | 전체 스캔 (brew + pip + uv) |
| GET | /api/packages | 패키지 목록 (?category=, ?q=) |
| GET | /api/packages/categories | 카테고리별 개수 |
| PUT | /api/packages/{source}/{name}/memo | 메모 수정 |
| PUT | /api/packages/{source}/{name}/description | 다국어 설명 수정 |
| POST | /api/packages/check-updates | 전체 오래된 패키지 확인 |
| POST | /api/packages/{source}/{name}/check-update | 단일 패키지 확인 |
| POST | /api/packages/{source}/{name}/upgrade | 단일 패키지 업그레이드 |
| POST | /api/packages/upgrade-all | 전체 오래된 패키지 업그레이드 |
| GET | /api/packages/{source}/{name}/manual | 문서 URL 조회 |
| GET | /api/packages/export | CSV 또는 Markdown 내보내기 (?fmt=csv/md) |

## 변경 이력

### v0.0.1 (2026-03-17)

- 초기 릴리스
- 패키지 스캐너 (brew, pip, uv 병렬 스캔 및 설명 포함)
- 대시보드 UI (사이드바 필터, 접기 가능한 그룹, 인라인 메모/설명 편집)
- 업데이트 확인 + 개별/일괄 업그레이드
- 매뉴얼/문서 링크, CSV/MD 내보내기
- 다국어 UI (EN/KO/ZH) + 설명 번역
- 이름 정렬 (오름차순/내림차순)
- git 태그에서 자동 버전 표시 저작권 푸터

## 라이선스

Copyright (c) chadchae
