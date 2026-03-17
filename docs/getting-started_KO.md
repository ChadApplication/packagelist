# 시작하기

## 사전 요구 사항

- **Python 3.12+** (pyenv 또는 Homebrew를 통해)
- **Node.js 18+** (Homebrew를 통해: `brew install node`)
- **Homebrew** (brew 패키지 스캔에 필요)

## 설치

1. 리포지토리를 클론합니다:

```bash
git clone https://github.com/ChadApplication/packagelist.git
cd packagelist
```

2. 설정 스크립트를 실행합니다:

```bash
./setup.sh
```

이 스크립트는 다음을 수행합니다:
- Python, Node.js, Homebrew가 설치되어 있는지 확인
- `backend/venv/`에 Python 가상 환경 생성
- `backend/requirements.txt`에서 백엔드 의존성 설치
- 프론트엔드 npm 패키지 설치
- 기본 백엔드 포트로 `frontend/.env.local` 생성

## 실행

양쪽 서버를 시작합니다:

```bash
./run.sh start
```

백엔드(FastAPI)는 기본적으로 포트 8020에서, 프론트엔드(Next.js)는 포트 3020에서 실행됩니다. 해당 포트가 사용 중인 경우 스크립트가 `lsof`를 사용하여 자동으로 다음 사용 가능한 포트를 찾습니다.

기타 명령어:

```bash
./run.sh stop      # Stop all servers
./run.sh restart   # Stop then start
./run.sh status    # Show running status
./run.sh live      # Start + stream live logs
```

## 처음 사용 시

1. 브라우저에서 http://localhost:3020 을 엽니다.
2. **Scan**을 클릭하여 설치된 모든 패키지를 스캔합니다.
3. 사이드바를 사용하여 카테고리별로 필터링하거나, 검색 바에서 이름, 설명, 메모로 패키지를 검색합니다.
