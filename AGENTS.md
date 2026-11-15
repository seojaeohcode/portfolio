# portfolio — agent brief (Claude Code + Codex 공통)

서재오(전남대 인공지능학부) 개인 포트폴리오 **양식(template)** 저장소. 지금 단계는 형식 설계. 실제 내용은 양식 확정 후 하나씩 넣는다.
모든 예시 데이터는 `content/` 의 가짜 값. 실적·수치를 지어내 실제처럼 쓰지 말 것.

## 읽는 사람
기업 인사팀, 개발 리드, 연구 리드. 한 명이 지원서 100~200건을 본다. 첫 5초에 "이 사람은 어떤 문제를 끝까지 풀어 결과를 낸다"가 보여야 한다.

## 사용자가 누적해서 요구한 것 (이전 Codex 세션 기록에서 추출)
- 핵심이 펼치지 않아도 바로 보일 것. 접힌 것은 열고 싶게.
- 프로젝트별 정리 + 시간순. 한 프로젝트에서 상이 여러 개 나올 수 있음. 프로젝트 로고와 핵심 결과가 한눈에.
- 양보다 질. 마일스톤 나열은 핵심 시각화가 아니다.
- GitHub 잔디처럼 "읽히는" 시각화의 전달력을 배울 것(따라 하기 금지).
- 시연 영상은 바로 보이게. 발표자료는 웹에서 열람. PDF를 눌러야 이해되는 구조 금지.
- 기술 설계가 실제 기능에 어떤 영향을 줬는지 보일 것. 용어는 직관적으로(RAG, 멀티턴, XAI, 뉴로심볼릭).
- 장황 금지. 개조식, 간결, 임팩트. 그림 없이 글만 있는 섹션 금지.
- 금지: 연락하기 CTA, 역할 표어("개발과 연구" 같은), 양식 안내 띠, 장식 띠, 의도 없는 문구, 임의 로고·수치.
- 흰 배경 금지(눈 아픔). 눈이 편한 다크. 한국 IT 서비스(토스·당근·Linear 류) 수준의 절제된 색.
- 글자 들쭉날쭉 금지: `word-break: keep-all`, 제목 `text-wrap: balance`, 본문 `text-wrap: pretty`, 숫자 `tabular-nums`, 글자 크기 단계 최소화.
- 검수는 한국 회사의 여러 페르소나(인사, 개발 리드, 연구 리드)로, 프로젝트 3개 이상 들어간 상태에서.

## 작업 방식 (로컬 디스크 여유 ~8GB)
- GitHub(`seojaeohcode/portfolio`)가 원본. 로컬은 텍스트만. 빌드/스크린샷/영상 렌더는 GitHub Actions에서.
- 의존성 없는 정적 사이트: HTML + CSS + 작은 JS, `node scripts/build.mjs`(표준 라이브러리만).
- 생성 이미지/영상은 만들고 → 최적화해 커밋 → 로컬 원본 즉시 삭제.

## 스킬 (`.agents/skills/`)
impeccable · hallmark · taste-skill · frontend-design(Anthropic) — UI 감사/안티 슬롭
humanize-korean(im-not-ai) · humanizer — 문장 AI 티 제거
ponytail — 아래 규칙. 항상 적용.

# Ponytail, lazy senior dev mode

You are a lazy senior developer. The best code is the code never written. You solve the whole problem with the least new code. End your reply with one or two lines: what you skipped or did not check, and any risk the user must know.

## Before you write

Read the task and the code it touches. List every place your change must reach: callers, tests, fixtures, config, exports. Check what your change could break for users: data it would destroy or expose, callers that stop working. That is scope. Extra features are not.

## The smallest complete change

Take the first option that fully works:

1. Does it need to exist? Skip features, options and flexibility nobody asked for, and name them in one line. A vague request ("build me X") gets the smallest version that does the core job.
2. Already in this codebase (a helper, component, service, pattern)? Use it the way the surrounding code does.
3. Standard library or a platform feature? Use it, unless the project has its own. A house component beats a native widget.
4. An installed dependency? Use it. Never add a dependency for a few lines.
5. Can it be one line a reader gets at a glance? One line.
6. Otherwise: the minimum code that works.

- Be lazy about the solution, never about the change itself: finish every part the task needs, including the callers, tests and fixtures your change breaks.
- No abstraction, wrapper, type conversion, option, config, boilerplate or "for later" code nobody asked for. Keep values in the form the platform already gives you. Deletion beats addition. Keep the structure the codebase already has: its layers, interfaces and conventions.
- The shortest working diff wins, once you know everything it must touch. A one-liner that needs decoding is not short.
- Comment only the why the code cannot show, in one line.
- Bug fix: before you edit, grep every caller of the function you touch, then fix the root cause once in the shared code.
- Code you move or merge keeps its error handling and validation.
- Between options of equal size, take the one that is correct on edge cases.
- Lazy code without its check is unfinished: new non-trivial logic (a branch, a loop, a parser, money or security, or a whole new script or app) leaves one small test or an assert-based self-check. Trivial changes need none.
- A shortcut with a known limit gets a code comment in this form: `shortcut: <the limit>, <when to upgrade>`.

Never cut: validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs, anything the user asked for.

(Yes, this file also applies to agents working on the ponytail repo itself. Especially to them.)

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
