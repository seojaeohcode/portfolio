# 다크 테마 한국어 포트폴리오 인간공학 감사

조사일: 2026-11-15. 대상: `scripts/build.mjs`, `src/styles.css`, `src/app.js`, `docs/DESIGN.md`, `docs/PERSONAS.md`.
인사·개발·연구 리드의 빠른 검토, 40~50대의 근거리 시력 변화, 모니터와 한 손 휴대폰을 가정한다. 검토량은 사용자 시나리오이지 모집단 통계가 아니다.
**[규범]** 표준의 해당 적합성 수준 요건, **[권고]** 출처의 지침, **[설계·추정]** 이 사이트의 검증 전 목표를 구별한다. px는 CSS px이며, iOS pt·Android dp를 물리적 크기나 CSS px와 동일시하지 않는다.
코드 정적 감사다. 예시 데이터는 총 9개·대표 3개 프로젝트이며 실적의 진위를 평가하지 않았다. 브라우저 렌더·실기기·사용자 실험은 수행하지 않았다.

## 1. 원리별 측정 가능한 기준

| 항목 | 기준값 | 근거(출처 URL) | 이 사이트 적용 |
|---|---|---|---|
| 시각: 최소 크기·노안 | [설계·추정] 본문 18px, 필수 보조정보 ≥16px; 200% 확대 허용. WCAG에 보편적인 최소 px 규정은 없다. | [WCAG 1.4.4][W], [극성·연령 실험][V] | 기간·역할·평가 조건을 13px로 낮추지 않는다. 크기만으로 노안 대응 완료를 선언하지 않는다. |
| 시각: 다크·할레이션·난시 | [설계·추정] `#101113`/`#ececec` 유지, 글자 발광·그림자 0개. 난시·노안 참여자의 번짐/오독을 별도 측정. | [Piepenbrock 외, 2013][V] | 다크가 항상 편하다는 근거는 없다. 원 연구는 난시별 할레이션 임계값을 제시하지 않으므로 완화 효과는 추정이다. 밝기·교정시력·주변 조명도 기록한다. |
| 시각: WCAG 대비 | [규범 AA] 일반 글자 ≥4.5:1; 큰 글자(24px 또는 약 18.67px 굵게) ≥3:1. [설계] 설명문 ≥7:1. | [WCAG 1.4.3][C] | 기본색뿐 아니라 hover·active·focus와 `--surface` 위도 계산한다. 장식선에 텍스트 기준을 적용하지 않는다. |
| 시각: APCA·굵기 | [권고] 본문 Lc 절댓값 ≥75: 18px/400 또는 16px/500; 90 선호. 비본문 Lc 60은 24px/400·18px/600 등 크기 조건을 동반한다. | [APCA 개발자 지침][A] | 밝은 글자는 음수 Lc로 기록한다. APCA는 WCAG 2.2 적합성 판정법이 아니며 라틴 기준 서체 수치를 한글 검증으로 간주하지 않는다. 본문 400~500, 제목 650~700을 출발점으로 삼는다. |
| 읽기: 한글 한 줄 | [설계·추정] PC 30~40자, 휴대폰 18~24자 목표(공백 포함, 실제 줄 계수); [규범 AAA] CJK 40자 이하로 조정 가능한 수단. | [WCAG 1.4.8][L], [한글 실험설계 연구 초록][K] | 긴 본문 `max-inline-size:36em`; `ch`는 한글 한 글자 폭이 아니다. 36em도 혼합문자 36자를 보장하지 않는다. 320px에서는 폭에 맞춰 더 짧아져도 허용한다. |
| 읽기: 행간·문단 간격 | [설계·추정] 본문 1.7, 연속 문단 간격 1em. [규범 AA] 사용자 지정 행간 1.5·문단 2em·자간 .12em·어간 .16em에서 내용/기능 손실 0. | [WCAG 1.4.12][S], [한글 연구][K] | 지정값은 기본 스타일 강제가 아닌 변경 내성 검사다. `keep-all`, 제목 `balance`, 본문 `pretty`, 숫자 `tabular-nums` 유지. |
| 읽기: front-loading | [설계·추정] 첫 2문단에 문제·담당·결과; 제목 첫 2어절에 정보어. 5초 뒤 대표 문제/결과를 회상하는지 검사. | [NN/g 시선추적 연구][F] | `.lead-line`과 수치를 우선한다. 한국어 2어절·5초는 영어 연구의 직접 결과가 아닌 적용 가설이다. |
| 읽기: F·레이어 케이크 | [설계·추정] 섹션 제목 ≥22px/650; 제목만 읽고 섹션의 내용을 예측 가능. | [NN/g F 패턴][F], [레이어 케이크][LC] | F는 모든 사람의 고정 경로가 아니다. 설명적인 소제목과 일정한 왼쪽 정렬로 필요한 근거를 골라 읽게 한다. |
| 주의: 전주의 속성 | [설계·추정] 강조색 의미 1개; 색과 형태를 중복 부호화, 색만으로 구분하는 상태 0개. | [Treisman·Gelade 실험][T] | 금색=상위 성과, 원/마름모/테두리 유지. 이 연구가 ‘모든 정보를 200ms에 이해’한다고 입증한 것은 아니다. |
| 주의: von Restorff | [설계·추정] 프로젝트의 대표 결과 1개를 가장 강하게 표시. | [Fabiani·Donchin 실험 초록][R] | 모든 칩을 강조하지 않는다. 구별되는 항목의 기억 이점은 부호화 과제·맥락에 의존하며 금색의 효과량은 미측정이다. |
| 주의: 계열 위치 | [설계·추정] 프로젝트 첫머리에 결론, 끝에 근거/한계로 연결되는 항목 1개. | [Murdock 원논문 출판사 미리보기][SP] | 초두·최신 효과는 목록 회상 결과다. 긴 페이지의 끝까지 읽는다는 보장은 없으므로 핵심을 맨 끝에만 두지 않는다. |
| 인지 부하: Miller/Cowan | [연구] Miller 7±2와 Cowan 약 4±1 청크는 과제·청킹 조건이 다르다. [설계] 한 묶음의 요약 3~5개. | [Miller 원문][M], [Cowan 원문][CO] | 대표 작업 3개·설계 결정 3개는 합리적 출발점. 화면 전체 링크 수를 4개로 제한하는 법칙으로 쓰지 않는다. |
| 인지 부하: Hick | [연구] 선택 반응시간은 대안 수의 log₂에 따라 증가하는 경향. [설계] 현재 필터 4개 유지, 모호한 이름 0개. | [Schneider·Anderson 모형·실험][H] | 탐색·읽기·숙련도에 따라 달라진다. 메뉴 하나를 없애면 몇 ms 줄어든다고 계산하지 않는다. |
| 운동: Fitts | [연구] `MT=a+b·log₂(D/W+1)`(Shannon형); [설계] 자주 누르는 독립 조작 ≥48×48px. | [MacKenzie 논문][FT] | 목표 폭 W를 키우고 이동거리 D를 줄인다. a,b를 이 사이트에서 측정하지 않았으므로 시간 예측은 하지 않는다. |
| 운동: 터치 타깃·간격 | [규범 AA] 2.5.8 ≥24×24px 또는 간격·인라인 등 예외. [권고] HIG 44×44pt, Material 48×48dp·간격 ≥8dp. [설계] 웹 48px·간격 8px. | [WCAG 2.5.8][TS], [Apple HIG][HI], [Material][MA], [Baymard 테스트][B] | 24px는 접근성 최소선이며 편안한 엄지 목표와 다르다. 작은 타깃의 간격 예외는 중심의 지름 24px 원과 다른 타깃/원의 겹침으로 판정한다. |
| 운동: 엄지 영역 | [설계·추정] 이전/다음은 자료 바로 아래 중앙, 좌우 손 모두 10회 조작 시 오탭·그립 변경 횟수 기록. 목표: 오탭 0회. | [Trudeau 외 원실험][TH] | 고정된 ‘하단 1/3 안전지대’는 가정하지 않는다. 손 크기·그립·기기 폭에 따라 도달 범위가 다르다. |
| 시간: Doherty 400ms | [설계·추정] 필터 등 국소 조작 완료 ≤400ms, 누름 피드백 ≤100ms. | [Doherty·Thadhani 1982 재수록 원문][D] | 원문은 sub-second 이점과 0.3초 사례를 다룬다. 400ms를 보편적 생리 임계값/로딩 합격선으로 단정하지 않는다. IBM 2018 자료의 ‘0.4ms’ 표기는 수치 근거로 채택하지 않았다. |
| 시간: 애니메이션·전정기관 | [권고] 작은 전환 150~200ms, 큰 모바일 전환 300~400ms. [설계] 핵심 정보 등장 지연 0ms, reduce에서 비필수 이동/확대 0개. | [Material 모션][MO], [WCAG 2.3.3 AAA][RM] | 지도는 즉시 표시. 영상은 사용자가 재생/정지하고 재진입해도 자동 재개하지 않는다. 짧은 모션도 전정 민감 사용자에게 안전하다고 단정하지 않는다. |
| 키보드·초점 | [규범 AA] 2.4.7 초점 식별, 2.4.11 작성자 콘텐츠에 완전히 가리지 않음. [설계] 2px 윤곽·3px 간격·초점 전체 노출. | [2.4.7][FV], [2.4.11][FO] | Tab/Shift+Tab/Enter/Space/방향키로 핵심 작업 검사. 2px는 2.4.7의 숫자 요건이 아닌 사이트 목표다. |
| 건너뛰기·한국 표준 | [규범] 반복 영역 우회 수단; KWCAG 6.1.1·6.1.2 키보드/초점, 6.4.1 건너뛰기, 5.4.3 일반 글자 4.5:1. | [WCAG 2.4.1][SK], [KWCAG 2.2 원문 pp.12,14–15,18][KW], [공식 표준 등록][KR] | 첫 Tab에 ‘본문으로’ 제공. KWCAG 2.2와 WCAG 2.2는 같은 문서가 아니다. KWCAG 6.1.3의 대각선 6mm 권고도 CSS px로 단순 환산하지 않는다. |
| 호버 의존 금지 | [설계] 터치에서 핵심 정보 누락 0개. [규범 AA] 호버/초점 추가 콘텐츠는 해당 조건에서 닫기·포인터 진입·지속성 충족. | [WCAG 1.4.13][HV] | 수상명은 항상 읽게 한다. 미리보기에는 키보드 초점·터치 대안을 둔다. `title`이나 첫 탭의 우연한 hover 구현에 의존하지 않는다. |

한글 연구는 석재원·구자은(2018)의 저자 초록을 확인했다. 크기·굵기·행간과 속도·피로·이해도를 함께 평가하라는 근거이며, ‘18px·36자 최적’의 실험 근거는 아니다.

## 2. 코드에서 확인한 위반·위험

색 수치는 불투명 기본 상태의 sRGB 코드값 계산이다. WCAG 상대휘도식과 [APCA 0.0.98G, 배포 0.1.9 공식 구현][AC]의 수식을 대조했으며 화면의 휘도·서체 렌더 측정이 아니다.

| 선택자/코드·현재 값 | 판정 및 영향 |
|---|---|
| `body:400 var(--f15)/1.65`=15px; `.meta,.note,.d-why,.d-basis,.dx dl,.eval td:last-child`: `--f13`=13px | **설계 목표 미달**. 본인 역할·측정 조건이 가장 작아 인사·연구 리드의 검증에 불리하다. WCAG 글자 크기 위반으로 단정하지 않는다. |
| `.by,.st,.flow span.by`:11px/18px; `small:.55em` | **설계 목표 미달**. AI/사람·실패 상태가 작다. 22px 수치의 단위는 12.1px로 더 작아진다. |
| `--text/--text-2/--text-3`=`#ececec/#a4a7ad/#8a8d94` | `--bg` 위 WCAG **15.99/7.83/5.68:1**, APCA **−95.0/−54.0/−40.5 Lc**. `--surface` 위 **15.17/7.43/5.39:1**, **−94.5/−53.5/−40.0 Lc**. 기본 텍스트 AA 대비는 통과하지만 보조 설명은 APCA 크기별 권고 미달. |
| `.row a:hover {opacity:.7}` 및 전역 `a:active,button:active` | **코드값 계산상 AA 대비 미달**. `--bg`에 .7 합성하면 `--text-2`는 약 4.39:1, `--text-3`는 3.38:1이다. 일반 지도 행 이름/작은 링크가 해당한다. `.row aa:active`는 오타이며 전역 active 규칙은 별도로 작동한다. |
| `.sec`:13px/600; `.case-sec h2`:17px/650 | 작은 섹션 제목이 22~32px 결과 숫자에 묻힐 위험. 전후 지표는 보여도 연구 조건·역할 섹션을 빠르게 찾기 어렵다. |
| `.row a`:높이 30px; `.deck-ctl button`:36×36px; `.filter button`:13px·상하 padding 4px | **48px 설계 목표 미달**, 앞의 두 항목은 24px 기준을 크기만으로 위반하지 않는다. 필터 약 31.5px 높이는 상속 행간에 따른 추정. `.links a,.crumb a,.site-foot a`는 최소 타깃 크기 보장 없음. |
| `.row-tip`:opacity 0·absolute·nowrap·pointer-events none; ≤560px `.row-top`:display none | **터치 정보 접근 위험**. hover/focus에는 하위 성과명을 보여 주지만 독립 펼침 동작이 없다. 겹침·Escape 처리 부재는 1.4.13 위험이며 실제 가림은 미검증. `.sr`는 화면낭독 대안이지 눈으로 읽는 터치 대안이 아니다. |
| `outcomeMap()`의 `--i:rows.length-i`; draw .7s, pop .4s, 지연 `i×70+500ms` | 9개 예시에서 마지막 표식 완료는 **1,530ms**(observer 발동 후). 설계서 0.9초와 다르다. `.js .map:not(.is-in)`은 JS 실패 시 표식이 계속 숨는 위험도 있다. |
| `still=matchMedia(...).matches` 1회; `.show-media img` opacity .25s; 영상 observer의 `v.play()` | 지도·슬라이드는 초기 reduce에 대응하지만 실행 중 설정 변경은 반영하지 않는다. 영상 controls는 이미 있으나 사용자가 멈춘 뒤 다시 보이면 재생되어 정지 의도를 덮는다. opacity 전환 자체를 전정기관 위반으로 단정하지 않는다. |
| `page()`에 skip 링크 없음; `<main>`에 id 없음 | **우회 편의 미흡**. `main` 랜드마크와 2px `:focus-visible`는 이미 있다. 반복 블록 여부·대체 우회 수단을 확인하지 않고 2.4.1 실패로 확정하지 않는다. 고정 헤더에 의한 2.4.11 위반도 확인되지 않았다. |
| `.deck {gap:16px}` vs `at()/go()`의 `d.clientWidth` | 페이지 간격을 이동 계산에서 누락. n번째 목표가 `(n−1)×16px`만큼 어긋나며 snap 보정/쪽수 반올림에 의존한다. keydown에 `preventDefault()`가 없어 기본 스크롤과 중복될 수 있다. |
| ≤560px `.eval thead {display:none}`, `tr {display:flex}`, 셀 `nowrap` | **정보 관계 손실 위험(1.3.1)**. 기준선/변경 후/조건 머리글이 사라지고 미측정 셀에는 ‘에서’도 없다. 보조기술별 표 의미 유지 여부는 미검증이다. |
| `html,body {overflow-x:clip}`, `.filter` nowrap, `.row-name` ellipsis, `.l-out` nowrap | **확대·간격 변경 위험(1.4.4/1.4.10/1.4.12)**. 긴 이름·수상·4개 필터가 320px/200%에서 잘릴 가능성. `.scene.is-lead:30em`, `.retro li:36em`은 이미 본문 폭 제한을 제공한다. |
| `.mk`:색+형태; `.lead a`:mouseenter+focus; ≤860px `.lead-thumb` 표시 | **유지할 구현**. 색 단독 부호화·모바일 hero 미리보기 누락으로 오판하지 않는다. 필터 4개/대표 작업 3개도 현재 인지 부하 기준의 결함이 아니다. |
| 설계서 ‘첫 화면 성과 지도’ vs `home`의 지도 위치=`.ledger`; ‘3개만’ vs `F=projects.filter(featured)` | 문서와 구현의 정보 순서가 다르다. 첫 화면은 `.lead`가 담당하고 지도는 전체 기록에 있다. 대표 개수도 코드 상한이 없으므로 데이터 증가 시 다시 검수해야 한다. |

## 3. 수정 우선순위 Top 10 — 제안만 기록, 코드 미수정

각 값은 위 기준을 적용한 설계안이다. CSS는 해당 기존 선언 교체 또는 화면용 규칙 끝에 추가하고, 인쇄 규칙 앞에 둔다. 구조 변경은 `scripts/build.mjs`의 HTML 템플릿에서 처리한다.

1. **본문·필수 보조정보 확대** — `:root {--f13:1rem;--f15:1.125rem;--f17:1.125rem}`; `.by,.st,.flow span.by {font-size:1rem;line-height:1.5}`; `small {font-size:max(1rem,.55em)}`. 기본 루트 16px에서 16/18px이며 사용자 루트 설정을 고정하지 않는다.
2. **작은 설명의 대비 확보** — `:root {--text-2:#d4d5d8;--text-3:#cfd1d6}`. 각각 `--bg` 위 Lc −80.6/−78.1, `--surface` 위 −80.1/−77.6. `.row a:hover,a:active,button:active {opacity:1}`로 변경하고 `.row aa:active` 삭제; `a:active,button:active {text-decoration:underline}`로 피드백 유지. 색 간 위계가 줄어든 만큼 크기·굵기·간격으로 구분한다.
3. **모바일 검증표의 머리글·관계 보존** — ≤560px의 `.eval` 재배치 규칙 묶음을 삭제. 템플릿의 표를 `<div class="eval-scroll" role="region" tabindex="0" aria-label="검증 결과, 좌우로 스크롤">…기존 table…</div>`로 감싸고 `.eval-scroll {max-width:100%;overflow-x:auto}.eval {min-width:40rem}`. 표만 가로 이동하게 한다(2차원 표의 reflow 예외); 기준선·변경 후·조건을 항상 함께 제공한다.
4. **엄지 타깃 확대** — `.filter {flex-wrap:wrap;gap:8px}.filter button,.deck-ctl button {min-width:48px;min-height:48px}.deck-ctl button {width:48px;height:48px}.row a {height:auto;min-height:48px}.row + .row {margin-top:8px}.links a,.crumb a,.site-foot a,.code:is(a) {display:inline-flex;align-items:center;min-height:48px;min-width:48px}`. `.deck-ctl`의 중앙 배치·16px 간격은 유지한다.
5. **성과명을 모든 입력 방식에 상시 제공** — `.row-tip,.row-top {display:none}`; `.row a > .sr {position:static;width:auto;height:auto;overflow:visible;clip-path:none;white-space:normal;grid-column:1/-1;font-size:1rem;color:var(--text-2)}`; `.row-track {min-height:24px}.row-name {white-space:normal;overflow:visible;text-overflow:clip}`. 이미 생성하는 전체 성과 요약을 노출해 별도 툴팁 JS 없이 해결한다.
6. **키보드 진입 경로 완성** — `page()`의 `<body>` 직후 `<a class="skip" href="#main">본문으로</a>`, 두 main에 `id="main" tabindex="-1"` 추가. `.skip {position:fixed;top:8px;left:8px;z-index:1000;transform:translateY(-200%);padding:12px 16px;background:var(--surface);color:var(--text)}.skip:focus {transform:none}#main {scroll-margin-top:24px}`. 기존 `:focus-visible` 2px/3px 유지; 가림 없는 Tab 이동을 검사한다.
7. **핵심 표시 지연·자동 재개 제거** — CSS의 지도 `no-preference` 애니메이션 블록과 JS의 지도 observer, 영상 observer 블록을 삭제한다. `media()`의 `controls preload="none"`는 유지하고 `loop`만 삭제해 사용자 재생으로 전환. `const still=()=>matchMedia('(prefers-reduced-motion: reduce)').matches`로 바꾸고 슬라이드에서 `still()` 호출. `.show-media img {transition:opacity 180ms ease}`와 `@media(prefers-reduced-motion:reduce){.show-media img{transition:none}.deck{scroll-behavior:auto}}`를 추가한다.
8. **슬라이드 이동값·키 입력 일치** — deck 루프에서 `const step=()=>d.clientWidth+parseFloat(getComputedStyle(d).columnGap); const at=()=>Math.max(0,Math.min(total-1,Math.round(d.scrollLeft/step()))); const go=i=>d.scrollTo({left:Math.max(0,Math.min(total-1,i))*step(),behavior:still()?'auto':'smooth'});`로 교체. keydown은 `if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(at()+(e.key==='ArrowRight'?1:-1));}`로 교체(7번과 함께 적용).
9. **확대·문단 읽기 내성 확보** — `html,body {overflow-x:visible}`; `body {line-height:1.7}`; `.summary,.scene,.retro li {max-inline-size:36em}.strip-text > p + p {margin-top:1em}.l-out {white-space:normal;flex-wrap:wrap}.site-foot p:last-child {flex-wrap:wrap}.by-key {float:none;flex-wrap:wrap}`. 1번 확대 후 320px·200%·사용자 간격 변경에서 잘림을 확인하고, 숨김으로 실패를 덮지 않는다.
10. **제목만으로 근거 탐색 가능하게** — `.sec,.case-sec h2 {font-size:1.375rem;line-height:1.4;font-weight:650;color:var(--text)}`. `casePage()` 문자열을 `현장과 제약→문제와 제약`, `구조→처리 구조와 내 작업`, `검증→평가 조건과 결과`, `역할→내 담당과 팀 역할`로 변경. `.lead`의 기존 핵심 문장·전후 수치 순서는 유지하고 새 성과 문구는 만들지 않는다.

후속 검수(미실시): 대표 프로젝트 3개 이상으로 PC 1440×900·모바일 390×844 및 320px reflow, 200% 글자 확대·400% 브라우저 확대, 간격 override, Tab/Shift+Tab·방향키·터치, 실행 중 reduce 변경을 확인한다.
인사: 5초 문제/결과 회상, 개발: 60초 담당/예외/코드 찾기, 연구: 60초 기준선/조건/한계 찾기. 40~50대·교정시력/난시 및 좌우 손 사용자를 포함해 오독·완료시간·오탭·불편을 기록한다. 시간 목표·참여자 구성은 설계 가정이다.
한계: `graphify query`는 CLI/모듈 미설치로 실패하여 기존 그래프의 파일 위치와 원문을 대조했다. 코드 변경이 없어 그래프를 갱신하지 않았다. 빌드·화면 검수·실측 성능·접근성 인증은 수행하지 않았고, 이 문서만으로 표준 적합성을 선언하지 않는다.

## 직접 열어 확인한 출처

아래 링크는 표의 근거와 연결된다. 원논문 재수록·출판사 미리보기·저자 초록은 확인 범위를 그대로 표시했으며, 검색 결과만 보거나 접근에 실패한 페이지는 근거에 포함하지 않았다.

[W]: https://www.w3.org/TR/WCAG22/
[V]: https://www.psychologie.hhu.de/fileadmin/redaktion/Oeffentliche_Medien/Fakultaeten/Mathematisch-Naturwissenschaftliche_Fakultaet/Psychologie/AAP/Publikationen/2013/Piepenbrock-2013-Positive_display_polarity_is_.pdf
[C]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
[A]: https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell
[AC]: https://raw.githubusercontent.com/Myndex/apca-w3/master/src/apca-w3.js
[L]: https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html
[K]: https://www.kci.go.kr/kciportal/landing/article.kci?arti_id=ART002403349
[S]: https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html
[F]: https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
[LC]: https://www.nngroup.com/articles/layer-cake-pattern-scanning/
[T]: https://cseweb.ucsd.edu/classes/fa09/cse258a/papers/treisman_gelade.pdf
[R]: https://digitalcommons.usf.edu/psy_facpub/318/
[SP]: https://www.researchgate.net/publication/232580580_The_serial_position_effect_of_free_recall
[M]: https://cse.buffalo.edu/~rapaport/575/F01/miller56.html
[CO]: https://memory.psych.missouri.edu/assets/doc/articles/2001/cowan-bbs-2001.pdf
[H]: https://pmc.ncbi.nlm.nih.gov/articles/PMC3031137/
[FT]: https://www.yorku.ca/mack/hci1992.html
[TS]: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
[HI]: https://developer.apple.com/design/human-interface-guidelines/buttons.md
[MA]: https://m1.material.io/usability/accessibility.html
[B]: https://baymard.com/research-articles/mobile-commerce-design
[TH]: https://stacks.cdc.gov/view/cdc/202344/cdc_202344_DS1.pdf
[D]: https://jlelliotton.blogspot.com/p/the-economic-value-of-rapid-response.html
[MO]: https://m1.material.io/motion/material-motion.html
[RM]: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
[FV]: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
[FO]: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
[SK]: https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html
[KW]: https://www.webwatch.or.kr/static/homepage/attach/wa/korea_contents_law.pdf
[KR]: https://www.rra.go.kr/ko/reference/kcsList_view.do?nb_seq=5247&nb_type=6
[HV]: https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html
