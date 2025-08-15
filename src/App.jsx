import React, { useMemo, useRef, useState, useEffect } from "react";

/**
 * Emotionography — 감정 나이 테스트
 * - 브랜드: #9880ff, Nanum Gothic (Gotham Medium 후보)
 * - 28문항 / 결과 즉시 표시 / 공유 / 이메일 게이트(수집만)
 */

// (선택) 카카오톡 공유를 쓰려면 index.html에 SDK 포함 + 키 설정
const KAKAO_JS_KEY = ""; // 예: "xxxxxxxx..." (없으면 카톡 버튼은 링크복사로 대체)

export default function EmotionalAgeLanding() {
  const brandColor = "#9880ff";
  const fontStack = "'Gotham Medium','Nanum Gothic','Noto Sans KR',system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif";

  // 28문항
  const questions = [
    // A. 인식
    { id: 1, area: "A", text: "강한 감정이 올라올 때 감정에 이름을 붙인다." },
    { id: 2, area: "A", text: "감정이 생길 때 몸의 신호(가슴 답답, 어깨 긴장 등)를 의식한다." },
    { id: 3, area: "A", text: "하루를 마감하며 감정의 하이라이트를 떠올리거나 기록한다." },
    { id: 4, area: "A", text: "반복적으로 나를 흔드는 트리거(사람·상황·단어)를 인지한다." },
    { id: 5, area: "A", text: "감정과 생각이 섞일 때 '느낌/판단'을 구분해 본다." },
    { id: 6, area: "A", text: "중요한 결정을 앞두고 감정의 영향을 메모로 정리한다." },
    { id: 7, area: "A", text: "감정이 컸던 순간을 뒤늦게 깨닫는 편이다.", reverse: true },
    // B. 조절
    { id: 8, area: "B", text: "뜨거워질 때 멈춤–호흡(3-3-3)으로 속도를 낮출 수 있다." },
    { id: 9, area: "B", text: "감정이 커지면 즉시 말/행동으로 터뜨리는 편이다.", reverse: true },
    { id: 10, area: "B", text: "각성 신호를 호흡/스트레칭/물 마시기 등으로 낮춘다." },
    { id: 11, area: "B", text: "치우친 해석을 재평가(다른 관점 시도)로 조정한다." },
    { id: 12, area: "B", text: "힘든 감정을 없애기보다 파도처럼 지나가게 둔다." },
    { id: 13, area: "B", text: "스트레스를 폭식·과소비·무한스크롤로 달래는 경우가 잦다.", reverse: true },
    { id: 14, area: "B", text: "갈등에서 목소리·말속도·표현 강도를 의식적으로 조절한다." },
    // C. 공감
    { id: 15, area: "C", text: "상대의 말 뒤에 있는 감정·욕구(무엇이 중요했는지)를 가늠해 본다." },
    { id: 16, area: "C", text: "처음 듣자마자 옳다/그르다로 단정짓는 편이다.", reverse: true },
    { id: 17, area: "C", text: "정서적 검증(‘그럴 수 있겠다/그랬구나’)을 자연스럽게 사용한다." },
    { id: 18, area: "C", text: "상대의 강한 감정에 영향받되, 내 감정과 분리해 관찰한다." },
    { id: 19, area: "C", text: "비난·충고 대신 호기심 질문(무슨 일이 있었어?)을 쓴다." },
    { id: 20, area: "C", text: "상대의 침묵·느린 답장을 개인적 거절로 받아들이는 경향이 있다.", reverse: true },
    { id: 21, area: "C", text: "어려운 대화에서도 요약·반영(‘네 말은 …라는 거지?’)으로 연결을 유지한다." },
    // D. 경계
    { id: 22, area: "D", text: "거절해도 관계가 유지될 수 있다고 믿고, 필요하면 거절한다." },
    { id: 23, area: "D", text: "타인의 불편한 감정을 내 책임으로 느끼는 편이다.", reverse: true },
    { id: 24, area: "D", text: "내 한계를 알리고 시간·도움을 요청할 수 있다." },
    { id: 25, area: "D", text: "공감하면서도 나의 선택/원칙을 분명히 말한다." },
    { id: 26, area: "D", text: "갈등에서 내 책임과 상대 책임을 구분해 본다." },
    { id: 27, area: "D", text: "상대 요구에 늘 맞추다 서운함·원망이 쌓이는 경우가 잦다.", reverse: true },
    { id: 28, area: "D", text: "중요한 관계에서 가치·우선순위·경계를 사전에 공유한다." },
  ];
  const maxScore = questions.length * 5; // 140

  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [gateOK, setGateOK] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const quizRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (KAKAO_JS_KEY && typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized?.()) {
      try { window.Kakao.init(KAKAO_JS_KEY); } catch {}
    }
  }, []);

  const progress = useMemo(() => Math.round((Object.keys(answers).length / questions.length) * 100), [answers]);

  const levelForAge = (age) => {
    if (age <= 17) return "유년";
    if (age <= 24) return "청소년";
    if (age <= 34) return "청년";
    if (age <= 49) return "중년";
    return "원숙";
  };

  const compute = () => {
    if (Object.keys(answers).length !== questions.length) return;
    let raw = 0;
    const areaSums = { A: 0, B: 0, C: 0, D: 0 };
    const areaCounts = { A: 0, B: 0, C: 0, D: 0 };

    questions.forEach((q) => {
      const a = answers[q.id];
      const scored = q.reverse ? 6 - a : a; // 역채점
      raw += scored;
      areaSums[q.area] += scored;
      areaCounts[q.area] += 1;
    });

    const normalized = (raw - questions.length) / (maxScore - questions.length); // 0~1
    const age = Math.round(12 + normalized * (60 - 12));
    const level = levelForAge(age);

    // 영역 평균(1~5)
    const areas = { A: 0, B: 0, C: 0, D: 0 };
    Object.keys(areaSums).forEach((k) => {
      areas[k] = parseFloat((areaSums[k] / areaCounts[k]).toFixed(2));
    });

    const payload = { name: name?.trim() || null, age, level, at: new Date().toISOString(), areas };
    try { localStorage.setItem("emotional-age:last", JSON.stringify(payload)); } catch {}

    setResult({ age, level, raw, areas });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const levelNarrative = (lvl) => {
    switch (lvl) {
      case "유년":
        return "감정의 파도가 빠르게 올라왔다가 사그라드는 리듬을 지녔습니다. 솔직함과 생동감이 강점이며, ‘속도 조절’과 감정 라벨링으로 선택지를 넓힐 수 있습니다.";
      case "청소년":
        return "감정을 섬세하게 감지하고 타인의 마음에도 민감합니다. 공감과 경계의 균형을 훈련하면 소진 없이 깊은 연결을 만들 수 있습니다.";
      case "청년":
        return "자기이해와 재평가 능력이 발달했습니다. 기록으로 패턴을 드러내면 자동반응을 줄이고 선택의 폭을 넓힐 수 있습니다.";
      case "중년":
        return "파도 속에서도 관점을 유지하며 경계·협상에 능숙합니다. 솔직함과 책임 나눔을 함께 가져가면 관계의 질이 높아집니다.";
      case "원숙":
        return "다양성을 포용하고 경험을 의미로 엮어 나눌 지혜가 있습니다. ‘돌봄의 균형’을 회복하며 자기돌봄을 우선순위에 두어 보세요.";
      default:
        return "";
    }
  };

  const programsMap = {
    유년: [
      { title: "감정과 마음챙김 비기너 클래스", href: "https://www.emotionography.co.kr/housestore/?idx=18" },
      { title: "성장과 연결을 돕는 31가지 질문엽서", href: "https://www.emotionography.co.kr/housestore/?idx=15" },
      { title: "AMAMO 정기모임(선택)", href: "https://www.emotionography.co.kr/housestore/?idx=17" },
    ],
    청소년: [
      { title: "토크 이모션 감정 워크북", href: "https://www.emotionography.co.kr/housestore/?idx=10" },
      { title: "이모션 디자인 클래스", href: "https://www.emotionography.co.kr/housestore/?idx=16" },
      { title: "AMAMO 정기모임(선택)", href: "https://www.emotionography.co.kr/housestore/?idx=17" },
    ],
    청년: [
      { title: "나의 인사이드아웃 찾는 디지털 프로그램", href: "https://www.emotionography.co.kr/housestore/?idx=13" },
      { title: "이모션 디자인 클래스", href: "https://www.emotionography.co.kr/housestore/?idx=16" },
      { title: "AMAMO 정기모임(선택)", href: "https://www.emotionography.co.kr/housestore/?idx=17" },
    ],
    중년: [
      { title: "이모션 디자인 클래스", href: "ttps://www.emotionography.co.kr/housestore/?idx=16" },
      { title: "AMAMO 정기모임", href: "https://www.emotionography.co.kr/housestore/?idx=17" },
      { title: "토크 이모션 감정 워크북", href: "https://www.emotionography.co.kr/housestore/?idx=10" },
    ],
    원숙: [
      { title: "AMAMO 정기모임", href: "https://www.emotionography.co.kr/housestore/?idx=17" },
      { title: "토크 이모션 감정 워크북", href: "https://www.emotionography.co.kr/housestore/?idx=10" },
      { title: "감정과 마음챙김 심화/리더십 코칭(선택)", href: "https://www.emotionography.co.kr/housestore/?idx=16" },
    ],
  };

  const areaLabel = { A: "인식", B: "조절", C: "공감", D: "경계" };

  const topAreas = (areas, n = 2) =>
    Object.entries(areas).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => areaLabel[k]).join(", ");

  const lowAreas = (areas, n = 1) =>
    Object.entries(areas).sort((a, b) => a[1] - b[1]).slice(0, n).map(([k]) => areaLabel[k]).join(", ");

  // 공유
  const shareUrl = () => {
    if (!result) return window.location.href;
    const base = typeof window !== "undefined" ? (window.location.origin + window.location.pathname) : "";
    const qs = new URLSearchParams({ age: String(result.age), level: result.level, ...(name ? { name } : {}) });
    return `${base}?${qs.toString()}`;
  };
  const shareText = () => `${name ? name + '님의 ' : ''}감정 나이 ${result?.age}세 (${result?.level}) — Emotionography`;

  const doWebShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "감정 나이 테스트", text: shareText(), url: shareUrl() });
      else await copyLink();
    } catch {}
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(`${shareText()}\n${shareUrl()}`); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };
  const shareFacebook = () => {
    const u = encodeURIComponent(shareUrl());
    const q = encodeURIComponent(shareText());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${q}`, "_blank", "noopener,width=640,height=680");
  };
  const shareThreads = () => {
    const txt = encodeURIComponent(`${shareText()} ${shareUrl()}`);
    window.open(`https://www.threads.net/intent/post?text=${txt}`, "_blank", "noopener,width=640,height=680");
  };
  const shareKakao = () => {
    try {
      if (window.Kakao && window.Kakao.Link) {
        window.Kakao.Link.sendDefault({
          objectType: 'text',
          text: `${shareText()}`,
          link: { mobileWebUrl: shareUrl(), webUrl: shareUrl() },
        });
      } else {
        copyLink(); // SDK 없으면 링크 복사
      }
    } catch { copyLink(); }
  };
  const copyInstaCaption = async () => {
    try {
      const cap = `${shareText()}
#감정나이 #감정디자인 #Emotionography`;
      await navigator.clipboard.writeText(cap);
      setCopied(true); setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  // 스타일
  const container = { minHeight: "100vh", backgroundColor: brandColor, color: "#fff", fontFamily: fontStack };
  const maxW = { maxWidth: 960, margin: "0 auto" };
  const card = { background: "#fff", color: "#374151", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" };
  const buttonPrimary = { background: "#fff", color: brandColor, border: "none", borderRadius: 9999, padding: "12px 22px", fontWeight: 500, cursor: "pointer" };
  const buttonGhost = { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.8)", borderRadius: 9999, padding: "10px 18px", fontWeight: 500, cursor: "pointer" };

  // 로고
  const LOGO_SRC = "/logo-emotionography.svg"; // public 폴더에 업로드 후 파일명 맞추기
  const LOGO_ALT = "Emotionography";
  const LOGO_HEIGHT = 56;

  // 이메일 수집 엔드포인트(Google Apps Script 웹앱 URL)
  const COLLECT_ENDPOINT = "https://script.google.com/macros/s/AKfycbzoaeIWmR0a16I5eNZwXVJy6huHnJ0qG7B0O_DTmvrhu-3FUXsElAxDnYBUvcMEC27m/exec";

  async function collectEmail() {
    if (!COLLECT_ENDPOINT) return true;
    try {
      const payload = { name, email, consent, ts: new Date().toISOString() };
      await fetch(COLLECT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors",
      });
      return true;
    } catch (e) { console.warn("collectEmail error", e); return true; }
  }

  const emailValid = /.+@.+\..+/.test(email);

  return (
    <div style={container}>
      {/* 헤더 */}
      <header style={{ ...maxW, padding: "20px 16px", display: "flex", justifyContent: "center" }}>
        <img src={LOGO_SRC} alt={LOGO_ALT} style={{ height: LOGO_HEIGHT }} />
      </header>

      {/* 히어로 */}
      <section style={{ ...maxW, padding: "40px 16px 24px" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>
            내 <span style={{ background: "rgba(255,255,255,0.9)", color: brandColor, padding: "0 8px", borderRadius: 8 }}>감정 나이</span>는 몇 살일까?
          </h1>
          <p style={{ marginTop: 12, opacity: 0.95, fontSize: 18 }}>
            28문항, 3~4분이면 충분해요. 인식·조절·공감·경계를 종합하여 <b>정서적 성숙도</b>를 추정합니다. (비임상 셀프 체크)
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#gate" style={{ ...buttonPrimary, textDecoration: "none" }}>테스트 시작</a>
            <a href="#faq" style={{ ...buttonGhost, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>FAQ</a>
          </div>
        </div>
      </section>

      {/* 이메일 게이트 */}
      <section id="gate" style={{ ...maxW, padding: "0 16px 24px" }}>
        <div style={card}>
          <div style={{ marginBottom: 8, fontSize: 18 }}>결과 리포트를 받으실 이메일을 입력해 주세요</div>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label style={{ display: "block", fontSize: 14, color: "#6b7280", marginBottom: 6 }}>이름(선택)</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="결과 카드에 표시됩니다" style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, color: "#6b7280", marginBottom: 6 }}>이메일(필수)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }} />
            </div>
          </div>
          <label style={{ display: "block", marginTop: 10, fontSize: 12, color: "#6b7280" }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginRight: 8 }} />
            개인정보·마케팅 안내 수신에 동의합니다.
          </label>
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button
              onClick={async () => {
                if (emailValid && consent) {
                  await collectEmail();
                  setGateOK(true);
                  setTimeout(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                }
              }}
              disabled={!emailValid || !consent}
              style={{ background: (emailValid && consent) ? brandColor : "#c7c7c7", color: "#fff", border: "none", borderRadius: 12, padding: "10px 14px", fontWeight: 500, cursor: (emailValid && consent) ? 'pointer' : 'not-allowed' }}
            >
              테스트 시작하기
            </button>
            {!emailValid && <span style={{ alignSelf: "center", fontSize: 12, color: "#dc2626" }}>올바른 이메일을 입력해 주세요.</span>}
          </div>
        </div>
      </section>

      {/* 퀴즈 */}
      <section ref={quizRef} style={{ ...maxW, padding: "24px 16px" }}>
        <div style={{ ...card, opacity: gateOK ? 1 : 0.6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>테스트</h2>
            <span style={{ fontSize: 14, color: "#6b7280" }}>{Object.keys(answers).length}/{questions.length}</span>
          </div>

          {!gateOK && (
            <div style={{ marginBottom: 12, fontSize: 14, color: "#6b7280" }}>
              이메일을 입력하고 동의해야 문항에 응답할 수 있어요. 위 섹션에서 먼저 완료해 주세요.
            </div>
          )}

          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            {questions.map((q) => (
              <li key={q.id} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                  <div>{q.id}. [{areaLabel[q.area]}] {q.text} {q.reverse ? <span style={{ color: "#9ca3af", marginLeft: 6, fontSize: 12 }}>(역)</span> : null}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{answers[q.id] ? `${answers[q.id]} / 5` : "미응답"}</div>
                </div>
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {[1,2,3,4,5].map((v) => (
                    <button
                      key={v}
                      onClick={() => gateOK && setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                      style={{
                        padding: "10px 8px",
                        borderRadius: 12,
                        border: `1px solid ${answers[q.id] === v ? brandColor : '#e5e7eb'}`,
                        background: answers[q.id] === v ? brandColor : "#fff",
                        color: answers[q.id] === v ? "#fff" : "#374151",
                        cursor: gateOK ? "pointer" : "not-allowed",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                      aria-label={`${v}점 선택`}
                      disabled={!gateOK}
                    >
                      {labelFor(v)}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          {/* 진행률 */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
              <span>응답 진행률</span>
              <span>{Object.keys(answers).length}/{questions.length}</span>
            </div>
            <div style={{ height: 10, background: "#e5e7eb", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: brandColor }} />
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={compute}
              disabled={Object.keys(answers).length !== questions.length || !gateOK}
              style={{ ...buttonPrimary, opacity: (Object.keys(answers).length === questions.length && gateOK) ? 1 : 0.6, cursor: (Object.keys(answers).length === questions.length && gateOK) ? 'pointer' : 'not-allowed' }}
            >
              결과 보기
            </button>
            {(Object.keys(answers).length !== questions.length || !gateOK) && (
              <span style={{ fontSize: 13, color: "#6b7280" }}>이메일 동의 후 모든 문항에 응답해 주세요</span>
            )}
          </div>
        </div>
      </section>

      {/* 결과 */}
      <section ref={resultRef} style={{ ...maxW, padding: "8px 16px 40px" }}>
        {result && (
          <div style={card}>
            <h2 style={{ marginTop: 0, fontSize: 20 }}>결과 리포트</h2>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>{name ? `${name}님의 감정 나이` : "감정 나이"}</div>
                <div style={{ marginTop: 4, fontSize: 48 }}>{result.age}<span style={{ fontSize: 20, marginLeft: 4 }}>세</span></div>
                <div style={{ marginTop: 6, color: "#374151" }}>단계: {result.level} · 강점 영역: {topAreas(result.areas, 2)} · 성장 포인트: {lowAreas(result.areas, 1)}</div>
              </div>

              {/* 해석 */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#fff" }}>
                <div style={{ marginBottom: 6 }}>해석</div>
                <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>{levelNarrative(result.level)}</p>
              </div>

              {/* 추천 프로그램 */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#fff" }}>
                <div style={{ marginBottom: 6 }}>추천 프로그램</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: "#374151" }}>
                  {programsMap[result.level].map((p, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      {p.href ? <a href={p.href} style={{ color: brandColor }} target="_blank" rel="noreferrer">{p.title}</a> : <span>{p.title}</span>}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>※ 링크는 사업 페이지 URL을 채우면 자동 활성화됩니다.</div>
              </div>

              {/* 공유 */}
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ marginBottom: 2 }}>공유하기</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button onClick={doWebShare} style={{ background: brandColor, color: "#fff", border: "none", borderRadius: 12, padding: "10px 14px", cursor: 'pointer' }}>공유(모바일)</button>
                  <button onClick={shareFacebook} style={{ background: "#fff", color: brandColor, border: `1px solid ${brandColor}`, borderRadius: 12, padding: "10px 14px", cursor: 'pointer' }}>페이스북</button>
                  <button onClick={shareThreads} style={{ background: "#fff", color: brandColor, border: `1px solid ${brandColor}`, borderRadius: 12, padding: "10px 14px", cursor: 'pointer' }}>Threads</button>
                  <button onClick={shareKakao} style={{ background: "#fff", color: brandColor, border: `1px solid ${brandColor}`, borderRadius: 12, padding: "10px 14px", cursor: 'pointer' }}>카카오톡</button>
                  <button onClick={copyInstaCaption} style={{ background: "#fff", color: brandColor, border: `1px solid ${brandColor}`, borderRadius: 12, padding: "10px 14px", cursor: 'pointer' }}>인스타 캡션 복사</button>
                  <button onClick={copyLink} style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", cursor: 'pointer' }}>{copied ? "복사됨!" : "링크 복사"}</button>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  인스타그램은 웹에서 바로 게시가 불가해요. <b>인스타 캡션 복사</b> 또는 <b>링크 복사</b>를 사용해 붙여넣어 주세요.
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section id="faq" style={{ ...maxW, padding: "0 16px 40px" }}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr" }}>
          <Faq q="임상 진단인가요?" a="아니요. 자기이해를 돕는 비임상 셀프체크입니다." />
          <Faq q="점수는 어떻게 나와요?" a="역문항을 포함해 28문항(1~5점)을 합산 후 12~60세 스케일로 환산합니다." />
          <Faq q="데이터 저장은?" a="이메일은 게이트 통과 시 수집됩니다(결과 이메일 발송 없음). COLLECT_ENDPOINT를 설정하면 서버/양식에 저장되고, 미설정 시 브라우저에만 남습니다." />
          <Faq q="카카오톡 공유는 어떻게 하나요?" a="카카오 SDK를 추가하고 JS 키를 넣으면 버튼이 앱 공유를 호출합니다. 미설정 시 링크 복사로 대체됩니다." />
        </div>
      </section>

      {/* 푸터 */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.35)" }}>
        <div style={{ ...maxW, padding: "18px 16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 12, opacity: 0.9 }}>
          <span>© {new Date().getFullYear()} Emotionography — Self-reflection tool</span>
          <span>문의: emotionography@my-emo.com</span>
        </div>
      </footer>
    </div>
  );
}

function Faq({ q, a }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#fff", color: "#374151" }}>
      <div>{q}</div>
      <div style={{ marginTop: 4, fontSize: 14, color: "#374151" }}>{a}</div>
    </div>
  );
}

function labelFor(v) {
  switch (v) {
    case 1: return "전혀 아니다";
    case 2: return "드물다";
    case 3: return "가끔";
    case 4: return "자주";
    case 5: return "거의 항상";
    default: return String(v);
  }
}

// Kakao 전역(없어도 무방, 오류 회피용)
window.Kakao = window.Kakao || undefined;
