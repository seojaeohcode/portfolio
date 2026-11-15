# portfolio

서재오 포트폴리오 **양식**. 지금 들어 있는 프로젝트·수상·수치는 모두 가짜 예시입니다.

미리보기: https://seojaeohcode.github.io/portfolio/ · 콜드메일용: `?to=받는팀` (예: `?to=토스 ML팀`)

## 구조
| 경로 | 역할 |
|---|---|
| `content/site.json` | 내용 전부. 이것만 고치면 됨 |
| `scripts/build.mjs` | JSON → `dist/` 정적 HTML (Node 표준 라이브러리만) |
| `src/styles.css`, `src/app.js` | 디자인 토큰·레이아웃, 최소 상호작용 |
| `assets/` | 로고·시연 이미지/영상·발표자료 쪽 이미지 |
| `docs/DESIGN.md` | 설계 의도 · `docs/PERSONAS.md` 검수 기준 · `docs/RULES.md` 안티 슬롭 규칙 |

```bash
node scripts/build.mjs
```

## 내용 넣는 법 (프로젝트 1개)
- `start`/`end`: `YYYY-MM`, 진행 중이면 `end: ""`
- `outcomes[].tier`: 1 상위 수상 · 2 수상 · 3 본선/수료/참가. 한 프로젝트에 여러 개 가능 → 성과 지도에 한 줄로 찍힘
- `featured: true` 3개만: 홈 대표 작업 + `work/<id>/` 케이스 페이지 생성
- `scene`(현장 한 장면) → `metric`(전/후) → `decisions`(결정·이유·효과) → `case`(제약·구조·대안·검증·실패·역할·발표자료·회고)
- 숫자(수상 수 등)는 빌드가 계산. 손으로 쓰지 않음

## 작업 방식 (로컬 디스크 절약)
- 원본은 GitHub. 로컬은 텍스트만, `dist/`는 무시. 배포·빌드는 Actions.
- 생성 이미지: 만들고 → WebP 변환해 커밋 → 원본 즉시 삭제
- Codex 호출: `tools/cx.sh <모델> <추론> <프롬프트파일> <출력> [-i 이미지]` (Headroom 압축 프록시 경유)
  - `gpt-6-luna low/medium` 조회·요약 · `gpt-6.1-sol medium/high` 구현·생성 · `gpt-6-astra high` 비평·기획
- 스크린샷: `tools/shot.ps1 <url> <w,h> <out.png>` (설치 없이 Edge 헤드리스)
- 감사: `.agents/skills/` (impeccable · hallmark · taste-skill · frontend-design · humanize-korean · humanizer · ponytail), 코드 그래프 `graphify-out/`
