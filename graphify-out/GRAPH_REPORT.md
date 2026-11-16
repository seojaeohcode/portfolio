# Graph Report - 포폴  (2026-11-16)

## Corpus Check
- 34 files · ~53,114 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 8, .css 1)

## Summary
- 386 nodes · 425 edges · 29 communities (25 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a85925e6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- build.mjs
- Humanize Korean — AI 한글 티 제거 오케스트레이터 (v2.4)
- Humanizer: remove AI writing patterns
- Quick Rules — Monolith Fast Path 전용 (v2.0)
- Flow
- portfolio — agent brief (Claude Code + Codex 공통)
- tasteskill 2.5
- 설계서 — 포트폴리오 양식 v1
- 신입 AI·소프트웨어 엔지니어 포트폴리오 검수 페르소나
- 한국 기업 신입 DX·AX·AI 포트폴리오 조사
- RULES.md
- Frontend Design
- ergo-audit.js
- impeccable/SKILL.md
- Ponytail
- app.js
- cx.sh
- CLAUDE.md
- .claude/CLAUDE.md
- deploy
- pages.yml
- portfolio
- 포트폴리오 웹사이트의 전달력: 이론·근거·검증 규칙
- 공개 원문 12개
- 대상별 분석
- 한국 IT 기술 면접관이 포트폴리오·이력서·GitHub에서 보는 것
- 한국 기업은 신입·주니어 개발자 이력서와 포트폴리오를 어떻게 보는가
- G-praised-portfolios.md

## God Nodes (most connected - your core abstractions)
1. `esc()` - 18 edges
2. `Humanize Korean — AI 한글 티 제거 오케스트레이터 (v2.4)` - 18 edges
3. `대상별 분석` - 15 edges
4. `공개 원문 12개` - 13 edges
5. `Quick Rules — Monolith Fast Path 전용 (v2.0)` - 13 edges
6. `설계서 — 포트폴리오 양식 (현재 v6)` - 13 edges
7. `조사 종합 → v3 설계 규칙` - 11 edges
8. `Humanizer: remove AI writing patterns` - 11 edges
9. `포트폴리오 웹사이트의 전달력: 이론·근거·검증 규칙` - 10 edges
10. `casePage()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `2. 코드에서 확인한 위반·위험` --references--> `page()`  [INFERRED]
  docs/ERGONOMICS.md → scripts/build.mjs
- `3. 수정 우선순위 Top 10 — 제안만 기록, 코드 미수정` --references--> `still()`  [INFERRED]
  docs/ERGONOMICS.md → src/app.js
- `3. 수정 우선순위 Top 10 — 제안만 기록, 코드 미수정` --references--> `media()`  [INFERRED]
  docs/ERGONOMICS.md → scripts/build.mjs
- `3. 수정 우선순위 Top 10 — 제안만 기록, 코드 미수정` --references--> `page()`  [INFERRED]
  docs/ERGONOMICS.md → scripts/build.mjs
- `3. 수정 우선순위 Top 10 — 제안만 기록, 코드 미수정` --references--> `casePage()`  [INFERRED]
  docs/ERGONOMICS.md → scripts/build.mjs

## Import Cycles
- None detected.

## Communities (29 total, 4 thin omitted)

### Community 0 - "build.mjs"
Cohesion: 0.10
Nodes (41): 1. 원리별 측정 가능한 기준, 2. 코드에서 확인한 위반·위험, 3. 수정 우선순위 Top 10 — 제안만 기록, 코드 미수정, 다크 테마 한국어 포트폴리오 인간공학 감사, 직접 열어 확인한 출처, awards(), bar(), bars() (+33 more)

### Community 1 - "Humanize Korean — AI 한글 티 제거 오케스트레이터 (v2.4)"
Cohesion: 0.08
Nodes (25): Finalize 승급 규칙 (전 경로 공통), Heavy 경로 (3+콜) — 중증 AI 슬롭·검증 증적 필요, Humanize Korean — AI 한글 티 제거 오케스트레이터 (v2.4), Light 경로 (1콜) — 잘 쓴 글, Phase 0: 컨텍스트 확인 및 경로 결정, Phase 1: 입력 저장 + 정량 사전 점수 (input shim — 전 경로 공통), Phase 2.4: 서법 국소 복원 (전 경로 공통, 게이트 **직전**), Phase 2.5: 구조 게이트 (철칙 #4 — 결정적 검증, 전 경로 공통) (+17 more)

### Community 2 - "Humanizer: remove AI writing patterns"
Cohesion: 0.05
Nodes (39): 10. Hyphenated pairs everywhere, 11. Passive voice and missing subjects, 12. Overused AI words, 13. Inflated significance, 14. Vague connection or association, 15. Shallow -ing phrases, 16. Sales language, 17. Borrowed authority (+31 more)

### Community 3 - "Quick Rules — Monolith Fast Path 전용 (v2.0)"
Cohesion: 0.13
Nodes (13): A. 번역투 (Translation-ese) — S1~S2, B. 영어 인용·용어 과다 — S2, C. 구조적 AI 패턴 (서식·레이아웃) — S1~S2, D. AI 특유의 관용구 (Signature Phrases) — S1, E. 리듬·문장 길이 균일성 — S2, F. 과도한 수식·중복 — S2, G. 과도한 Hedging (완곡) — S2, H. 접속사 남발 — S2 (+5 more)

### Community 4 - "Flow"
Cohesion: 0.15
Nodes (12): 0. Pre-flight, 1. Ask once, 2. Shape, 3. Direction, 4. Load, 5. The Picks block, 6. Build, 7. Sweep (+4 more)

### Community 5 - "portfolio — agent brief (Claude Code + Codex 공통)"
Cohesion: 0.20
Nodes (9): Before you write, graphify, Ponytail, lazy senior dev mode, portfolio — agent brief (Claude Code + Codex 공통), The smallest complete change, 사용자가 누적해서 요구한 것 (이전 Codex 세션 기록에서 추출), 스킬 (`.agents/skills/`), 읽는 사람 (+1 more)

### Community 6 - "tasteskill 2.5"
Cohesion: 0.20
Nodes (9): 1. The kind of business decides everything, 2. The page plan by kind, 3. What serves which page, 4. The run, 5. Checklist, 6. Never, House rules, References (+1 more)

### Community 7 - "설계서 — 포트폴리오 양식 v1"
Cohesion: 0.08
Nodes (24): 0. 한 문장, 1. 읽는 시간별 설계 (정보 위계), 2. 시그니처 시각화: 성과 지도, 3. 대표 작업 스트립 (카드 반복 금지), 4. 시각 언어, 5. 감성 설계 (심장을 울리는 부분), 6. 공학적 장치, 7. 금지 목록 (+16 more)

### Community 8 - "신입 AI·소프트웨어 엔지니어 포트폴리오 검수 페르소나"
Cohesion: 0.22
Nodes (8): 1. 대기업 인사팀 채용담당 — 현업에 넘길 근거를 찾는다, 2. 스타트업 개발 리드/CTO — 작은 기능을 맡겨 끝까지 낼 수 있는가, 3. AI 연구 리드 — 개선이라는 주장을 검증할 수 있는가, 4. DX·AX 현업 리더 — 우리 업무에 넣으면 무엇이 달라지는가, 5. 테크 기업 시니어 엔지니어(면접관) — 설명과 구현이 맞는가, 공통 결론, 신입 AI·소프트웨어 엔지니어 포트폴리오 검수 페르소나, 출처

### Community 9 - "한국 기업 신입 DX·AX·AI 포트폴리오 조사"
Cohesion: 0.29
Nodes (6): 1. 대기업 vs 스타트업·플랫폼사 서류 검토 차이, 2. FDE·AX·DX 직무가 보고 싶어 하는 증거, 3. 유튜브 첨삭·인터뷰의 부정 패턴 10개 / 긍정 패턴 10개, 4. Design implication: 웹 포트폴리오 첫 화면, 5. 출처 목록, 한국 기업 신입 DX·AX·AI 포트폴리오 조사

### Community 10 - "RULES.md"
Cohesion: 0.25
Nodes (7): 1 레이아웃·구성, 2 색, 3 타이포(한글), 4 모션, 5 시각화, 6 카피(한국어 AI 티), 7 감사 절차

### Community 11 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground your designs in the subject matter, More on writing in design, Process: plan, review against the brief, build, critique, Restraint and self-critique

### Community 12 - "ergo-audit.js"
Cohesion: 0.57
Nodes (6): audit(), bgOf(), lum(), measure(), ratio(), rgb()

### Community 13 - "impeccable/SKILL.md"
Cohesion: 0.40
Nodes (4): Commands, How to design, Modes, Setup

### Community 14 - "Ponytail"
Cohesion: 0.40
Nodes (4): Before you write, Levels, Ponytail, The smallest complete change

### Community 15 - "app.js"
Cohesion: 0.29
Nodes (7): f, io, reduce, still(), tl, to, toEl

### Community 20 - "deploy"
Cohesion: 0.12
Nodes (18): runs-on, steps, environment, needs, runs-on, steps, name, url (+10 more)

### Community 21 - "pages.yml"
Cohesion: 0.15
Nodes (12): concurrency, cancel-in-progress, group, name, on, push, workflow_dispatch, permissions (+4 more)

### Community 22 - "portfolio"
Cohesion: 0.40
Nodes (4): portfolio, 구조, 내용 넣는 법 (프로젝트 1개), 작업 방식 (로컬 디스크 절약)

### Community 23 - "포트폴리오 웹사이트의 전달력: 이론·근거·검증 규칙"
Cohesion: 0.05
Nodes (36): 1.1 시각 위계: 중요도 차이를 지각 가능한 차이로 바꾼다, 1.2 게슈탈트: 근접·유사·공통 영역·연속성·도형/배경, 1.3 타이포 위계: 크기보다 역할의 일관성, 1.4 그리드·여백: 관계를 정렬하고 검색 위치를 고정한다, 1. 시각 위계·게슈탈트·타이포 위계·그리드·여백, 2.1 F 패턴은 고정 배치도가 아니라 특정 읽기 행동이다, 2.2 국내 연구와 Z 패턴: 과제·언어·레이아웃을 함께 봐야 한다, 2.3 레이어케이크: 제목만 훑어도 내용을 고를 수 있게 한다 (+28 more)

### Community 24 - "공개 원문 12개"
Cohesion: 0.09
Nodes (22): 01. 이도현 — 토스 iOS 신입 합격 확인, 02. mjin.park — 카카오, 3년차 주니어 이직 합격 확인, 03. 정종윤·재그지그 — 네이버 신입 공채 합격, 현재는 경력 누적본, 04. 강다혜·rhei — 카카오 FE 인턴 합격 확인, 05. 정현수 — 당근마켓 FE 코어팀 인턴 재직 확인, 06. 강철민 — 루닛 Research Engineer 경력 확인, AI 연구형 비교, 07. 이정윤·promm — 당근·LINE Financial+ 경력형 추천 사례, 08. 함종현 — 토스 Server Developer 경력 확인, 추천 이력서 (+14 more)

### Community 25 - "대상별 분석"
Cohesion: 0.10
Nodes (19): 10. 점핏 이력서 — 관리 행동을 분명하게 표시, 11. 카카오 채용 — 열람 실패로 제외, 12. 네이버 채용 — 비교할 속성을 고정, 13. 배민 디자인 시스템 글 — 변경 전후와 차이를 함께, 14. 뱅크샐러드 리포트 — 기간을 정하고 대표 값을 읽기, 1. 토스 앱 — 요약 금액 → 구성비 → 상세 목록, 2. 토스 채용 — 검색할 조건을 먼저 제공, 3. 토스피드 — 제목에 상황, 부제에 맥락 (+11 more)

### Community 26 - "한국 IT 기술 면접관이 포트폴리오·이력서·GitHub에서 보는 것"
Cohesion: 0.22
Nodes (8): 1. 출처별 요약 표, 2. 공통 패턴: 무엇이 면접에서 더 알아볼 이유가 되는가, 3. 직무별 차이: 같은 프로젝트라도 강조할 증거가 다르다, 4. 포트폴리오 웹사이트 설계에 바로 쓰는 시사점, 감점·신뢰 저하 신호와 근거 강도, 성과 수치는 어떻게 검증 대상으로 바뀌는가, 한국 IT 기술 면접관이 포트폴리오·이력서·GitHub에서 보는 것, 해석의 경계

### Community 27 - "한국 기업은 신입·주니어 개발자 이력서와 포트폴리오를 어떻게 보는가"
Cohesion: 0.25
Nodes (7): 1. 출처별 핵심 발언 요약, 2. 국내 서류 검토 시간: 비교 가능한 것과 아닌 것, 3. 공통 패턴, 4. 상충 의견과 적용 판단, 5. 근거의 빈틈과 조사 범위, 포트폴리오 웹사이트 설계에 바로 쓰는 시사점, 한국 기업은 신입·주니어 개발자 이력서와 포트폴리오를 어떻게 보는가

### Community 29 - "G-praised-portfolios.md"
Cohesion: 0.50
Nodes (3): 12개 레퍼런스, 다크 한국어 포트폴리오: 구체적인 3안, 첫 화면을 감각적이고 전문적으로 만드는 10가지 규칙

## Knowledge Gaps
- **1 isolated node(s):** `PATH`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 281 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Humanize Korean — AI 한글 티 제거 오케스트레이터 (v2.4)` connect `Humanize Korean — AI 한글 티 제거 오케스트레이터 (v2.4)` to `Quick Rules — Monolith Fast Path 전용 (v2.0)`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `PATH` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `build.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09758454106280193 - nodes in this community are weakly interconnected._
- **Should `Humanize Korean — AI 한글 티 제거 오케스트레이터 (v2.4)` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Humanizer: remove AI writing patterns` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Quick Rules — Monolith Fast Path 전용 (v2.0)` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `설계서 — 포트폴리오 양식 v1` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._