import { useState } from "react";

// ── Design Tokens ─────────────────────────────────────────
const T = {
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  border: "#EBEBEA",
  borderHover: "#D4D4D0",
  text: "#1A1A18",
  sub: "#6B6B68",
  muted: "#A8A8A4",
  accent: "#2D5BE3",
  accentBg: "#EEF2FD",
  green: "#18A058",
  greenBg: "#EDFAF3",
  red: "#E8445A",
  redBg: "#FEF0F2",
  amber: "#D97706",
  amberBg: "#FFFBEB",
  tag1: "#5B5BD6", tag1Bg: "#EFEFFD",
  tag2: "#C026D3", tag2Bg: "#FDF4FF",
  tag3: "#0891B2", tag3Bg: "#ECFEFF",
  tag4: "#059669", tag4Bg: "#ECFDF5",
  tag5: "#EA580C", tag5Bg: "#FFF7ED",
  tag6: "#7C3AED", tag6Bg: "#F5F3FF",
};

const tagPalette = [
  [T.tag1, T.tag1Bg],[T.tag2, T.tag2Bg],[T.tag3, T.tag3Bg],
  [T.tag4, T.tag4Bg],[T.tag5, T.tag5Bg],[T.tag6, T.tag6Bg],
];

const font = "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";

function Tag({ label, idx = 0, sm }) {
  const [fg, bg] = tagPalette[idx % tagPalette.length];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: bg, color: fg,
      fontSize: sm ? 11 : 12, fontWeight: 500,
      padding: sm ? "2px 8px" : "3px 10px",
      borderRadius: 6, letterSpacing: "-0.01em",
    }}>#{label}</span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: T.border, margin: "0 20px" }} />;
}

function SectionTitle({ children }) {
  return (
    <div style={{ color: T.muted, fontSize: 11, fontWeight: 600,
      letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "18px 20px 8px" }}>
      {children}
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────
function Avatar({ emoji = "🦊", size = 32, bg = "#F0EFFF" }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.44, flexShrink: 0 }}>
      {emoji}
    </div>
  );
}

// ── SCREEN 1: 홈 / 피드 ────────────────────────────────────
function HomeScreen() {
  const [liked, setLiked] = useState({ 2: true });
  const [tab, setTab] = useState("팔로우");

  const posts = [
    {
      id: 1, emoji: "🐻", emojiBg: "#FFF7ED", user: "조용한숲", time: "3분 전",
      content: "번아웃이 왔나봐. 아무것도 하기 싫은데 이 앱 켜는 건 왜 하게 되지.",
      tags: ["번아웃", "일상", "감정"], tIdx: [0, 1, 2], likes: 47, comments: 13,
    },
    {
      id: 2, emoji: "🌸", emojiBg: "#FDF4FF", user: "봄날기록", time: "21분 전",
      content: "오늘 제주 올레길 걸었다. 바람이 차가웠는데 이상하게 마음은 따뜻했어.",
      tags: ["여행", "제주", "산책"], tIdx: [3, 2, 4], likes: 24, comments: 6,
    },
    {
      id: 3, emoji: "☕", emojiBg: "#FFFBEB", user: "카페라떼", time: "1시간 전",
      content: "카페에서 세 시간. 읽은 것보다 멍한 시간이 더 좋았다.",
      tags: ["카페", "독서", "여유"], tIdx: [5, 3, 1], likes: 31, comments: 4,
    },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100%", fontFamily: font }}>
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 20px 0",
        borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>피드</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: T.greenBg, color: T.green, fontSize: 12, fontWeight: 600,
              padding: "4px 10px", borderRadius: 20 }}>🔥 7일</div>
            <Avatar emoji="🦊" size={30} />
          </div>
        </div>
        {/* Tab */}
        <div style={{ display: "flex", gap: 0 }}>
          {["팔로우", "전체"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, background: "none", border: "none", cursor: "pointer",
              padding: "8px 0", fontSize: 13, fontWeight: 600, fontFamily: font,
              color: tab === t ? T.text : T.muted,
              borderBottom: `2px solid ${tab === t ? T.text : "transparent"}`,
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Today Prompt */}
      <div style={{ margin: "12px 16px", background: T.accentBg,
        borderRadius: 12, padding: "12px 14px",
        display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 20 }}>💭</div>
        <div>
          <div style={{ color: T.accent, fontSize: 11, fontWeight: 600, marginBottom: 2 }}>오늘의 프롬프트</div>
          <div style={{ color: T.text, fontSize: 13 }}><b>#감사</b> — 오늘 작은 것 하나를 기록해보세요</div>
        </div>
      </div>

      {/* Trending */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{ color: T.muted, fontSize: 11, fontWeight: 600,
          letterSpacing: "0.05em", marginBottom: 8 }}>TODAY'S TAGS</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["번아웃",0],["여행",3],["산책",4],["카페",5],["성장",1],["새벽",2]].map(([t, i]) => (
            <Tag key={t} label={t} idx={i} sm />
          ))}
        </div>
      </div>

      <Divider />

      {/* Posts */}
      <div style={{ padding: "8px 0 20px" }}>
        {posts.map((p, pi) => (
          <div key={p.id}>
            <div style={{ padding: "14px 20px" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <Avatar emoji={p.emoji} emojiBg={p.emojiBg} size={34} bg={p.emojiBg} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{p.user}</span>
                    <span style={{ color: T.muted, fontSize: 11 }}>{p.time}</span>
                  </div>
                  <div style={{ color: T.sub, fontSize: 13, lineHeight: 1.65, marginTop: 5 }}>{p.content}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 5, marginLeft: 44, marginBottom: 10, flexWrap: "wrap" }}>
                {p.tags.map((t, i) => <Tag key={t} label={t} idx={p.tIdx[i]} sm />)}
              </div>
              <div style={{ display: "flex", gap: 16, marginLeft: 44 }}>
                <button onClick={() => setLiked(l => ({ ...l, [p.id]: !l[p.id] }))}
                  style={{ background: "none", border: "none", cursor: "pointer",
                    color: liked[p.id] ? T.red : T.muted, fontSize: 12,
                    display: "flex", alignItems: "center", gap: 4, padding: 0, fontFamily: font }}>
                  <span style={{ fontSize: 14 }}>{liked[p.id] ? "♥" : "♡"}</span>
                  {p.likes + (liked[p.id] ? 1 : 0)}
                </button>
                <span style={{ color: T.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                  <span>💬</span>{p.comments}
                </span>
              </div>
            </div>
            {pi < posts.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 일기 공통 상수 ────────────────────────────────────────
const moods = ["😤", "😔", "😐", "😌", "😊"];
const moodLabels = ["힘들다", "우울해", "보통", "편안해", "좋아!"];
const diaryMockData = [
  { id: 1, title: "2026-03-31", date: "2026. 03. 31  MON", content: "오늘 한강을 걸었다. 이어폰 없이 걸었더니 생각이 정리됐다. 침묵이 가끔은 제일 좋은 것 같다.", mood: 3, tags: ["한강", "산책", "혼자"], tIdx: [0, 3, 2] },
  { id: 2, title: "2026-03-30", date: "2026. 03. 30  SUN", content: "카페에서 책을 읽었다. 시간 가는 줄 몰랐다. 이런 여유가 필요했나보다.", mood: 4, tags: ["카페", "독서", "여유"], tIdx: [5, 3, 1] },
  { id: 3, title: "2026-03-28", date: "2026. 03. 28  FRI", content: "회사에서 힘든 하루. 야근 끝에 겨우 집에 왔다. 번아웃이 올 것 같다.", mood: 1, tags: ["번아웃", "야근"], tIdx: [0, 4] },
  { id: 4, title: "2026-03-25", date: "2026. 03. 25  TUE", content: "오랜만에 친구를 만났다. 수다가 이렇게 좋은 거였나.", mood: 4, tags: ["친구", "수다", "감사"], tIdx: [2, 1, 3] },
];

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// ── SCREEN 2: 일기 (라우터) ───────────────────────────────
function DiaryScreen() {
  const [view, setView] = useState("list"); // list | write | detail | edit
  const [selectedDiary, setSelectedDiary] = useState(null);

  if (view === "write") return <DiaryWriteScreen onBack={() => setView("list")} />;
  if (view === "detail") return (
    <DiaryDetailScreen
      diary={selectedDiary}
      onBack={() => setView("list")}
      onEdit={() => setView("edit")}
    />
  );
  if (view === "edit") return (
    <DiaryEditScreen
      diary={selectedDiary}
      onBack={() => setView("detail")}
    />
  );
  return (
    <DiaryListScreen
      onWrite={() => setView("write")}
      onSelect={(d) => { setSelectedDiary(d); setView("detail"); }}
    />
  );
}

// ── 일기 목록 ─────────────────────────────────────────────
function DiaryListScreen({ onWrite, onSelect }) {
  const [year] = useState(2026);
  const [month] = useState(3);
  const avgMood = diaryMockData.reduce((s, d) => s + d.mood, 0) / diaryMockData.length;

  return (
    <div style={{ background: T.bg, minHeight: "100%", fontFamily: font, position: "relative" }}>
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 20px 14px",
        borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>일기</span>
          {/* Average mood badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{moods[Math.round(avgMood) - 1]}</span>
            <span style={{ fontSize: 11, color: T.muted }}>평균 기분</span>
          </div>
        </div>

        {/* Month selector */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer",
            color: T.muted, fontSize: 16, padding: "4px 8px", fontFamily: font }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text,
            letterSpacing: "-0.02em" }}>{year}년 {month}월</span>
          <button style={{ background: "none", border: "none", cursor: "pointer",
            color: T.muted, fontSize: 16, padding: "4px 8px", fontFamily: font }}>›</button>
        </div>
      </div>

      {/* Diary cards */}
      <div style={{ padding: "12px 16px 80px" }}>
        {diaryMockData.map((d, i) => (
          <div key={d.id} onClick={() => onSelect(d)}
            style={{
              background: T.surface, borderRadius: 14,
              border: `1px solid ${T.border}`, padding: "14px 16px",
              marginBottom: i < diaryMockData.length - 1 ? 10 : 0,
              cursor: "pointer", transition: "border-color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.borderHover}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
          >
            {/* Top row: date + mood */}
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: T.muted, fontSize: 11 }}>{d.date}</span>
              <span style={{ fontSize: 16 }}>{moods[d.mood - 1]}</span>
            </div>
            {/* Title */}
            <div style={{ color: T.text, fontSize: 14, fontWeight: 600,
              letterSpacing: "-0.02em", marginBottom: 6 }}>{d.title}</div>
            {/* Content preview */}
            <div style={{ color: T.sub, fontSize: 13, lineHeight: 1.6,
              marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.content}</div>
            {/* Tags */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {d.tags.map((t, j) => <Tag key={t} label={t} idx={d.tIdx[j]} sm />)}
            </div>
          </div>
        ))}
      </div>

      {/* Floating write button */}
      <div style={{ position: "sticky", bottom: 16, display: "flex", justifyContent: "flex-end",
        padding: "0 16px", pointerEvents: "none" }}>
        <button onClick={onWrite} style={{
          width: 48, height: 48, borderRadius: 14,
          background: T.text, color: "#fff", border: "none",
          fontSize: 22, fontWeight: 300, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(26,26,24,0.18)",
          pointerEvents: "auto",
        }}>+</button>
      </div>
    </div>
  );
}

// ── 일기 작성 ─────────────────────────────────────────────
function DiaryWriteScreen({ onBack }) {
  const [title, setTitle] = useState(todayStr());
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState(2);
  const suggests = ["일상", "감정", "성장", "여행"];

  const addTag = (t) => { if (t.trim() && !tags.includes(t.trim()) && tags.length < 10) setTags([...tags, t.trim()]); setInput(""); };
  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  return (
    <div style={{ background: T.bg, minHeight: "100%", fontFamily: font }}>
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 20px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: T.text, padding: 0, lineHeight: 1,
            display: "flex", alignItems: "center",
          }}>←</button>
          <span style={{ color: T.text, fontSize: 17, fontWeight: 700,
            letterSpacing: "-0.03em" }}>오늘의 일기</span>
        </div>
        <button style={{ background: T.text, color: "#fff", border: "none",
          borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: font }}>저장</button>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Title */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ color: T.muted, fontSize: 11, fontWeight: 600,
            letterSpacing: "0.05em", marginBottom: 8 }}>TITLE</div>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            style={{ width: "100%", border: "none", outline: "none",
              background: "transparent", color: T.text, fontSize: 15,
              fontWeight: 600, fontFamily: font, letterSpacing: "-0.02em",
              boxSizing: "border-box" }} />
        </div>

        {/* Mood */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ color: T.muted, fontSize: 11, fontWeight: 600,
            letterSpacing: "0.05em", marginBottom: 10 }}>TODAY'S MOOD</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {moods.map((e, i) => (
              <button key={i} onClick={() => setMood(i)} style={{
                background: mood === i ? T.accentBg : "none",
                border: `1.5px solid ${mood === i ? T.accent : T.border}`,
                borderRadius: 10, padding: "8px 10px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4
              }}>
                <span style={{ fontSize: 20 }}>{e}</span>
                <span style={{ fontSize: 10, color: mood === i ? T.accent : T.muted,
                  fontWeight: mood === i ? 600 : 400 }}>{moodLabels[i]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Write */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 10 }}>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="오늘 어떤 하루였나요?"
            style={{ width: "100%", border: "none", outline: "none",
              background: "transparent", color: T.text, fontSize: 14,
              lineHeight: 1.75, resize: "none", minHeight: 120,
              fontFamily: font, boxSizing: "border-box" }} />
          <div style={{ color: T.muted, fontSize: 11, textAlign: "right" }}>{content.length}자</div>
        </div>

        {/* Tags */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ color: T.muted, fontSize: 11, fontWeight: 600,
              letterSpacing: "0.05em" }}>TAGS</div>
            <span style={{ color: T.muted, fontSize: 11 }}>{tags.length}/10</span>
          </div>
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {tags.map((t, i) => (
                <span key={t} style={{
                  background: tagPalette[i % tagPalette.length][1],
                  color: tagPalette[i % tagPalette.length][0],
                  fontSize: 12, fontWeight: 500, padding: "3px 8px 3px 10px",
                  borderRadius: 6, display: "flex", alignItems: "center", gap: 5
                }}>
                  #{t}
                  <span onClick={() => removeTag(t)} style={{
                    cursor: "pointer", fontSize: 14, lineHeight: 1,
                    color: tagPalette[i % tagPalette.length][0], opacity: 0.5,
                    fontWeight: 300
                  }}>×</span>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTag(input)}
              placeholder="태그 추가 후 Enter"
              disabled={tags.length >= 10}
              style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "7px 12px", fontSize: 13, color: T.text,
                background: T.bg, outline: "none", fontFamily: font,
                opacity: tags.length >= 10 ? 0.5 : 1 }} />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {suggests.filter(s => !tags.includes(s)).map(s => (
              <span key={s} onClick={() => addTag(s)} style={{
                border: `1px solid ${T.border}`, borderRadius: 20,
                padding: "3px 10px", fontSize: 11, color: T.sub,
                cursor: "pointer", background: T.bg
              }}>+ {s}</span>
            ))}
          </div>
        </div>

        {/* Recommended Feed Preview */}
        <div style={{ background: T.accentBg, borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ color: T.accent, fontSize: 11, fontWeight: 600,
            letterSpacing: "0.05em", marginBottom: 10 }}>비슷한 이야기</div>
          {[
            { text: "혼자 한강 걷기 좋아하는 분? 요즘 유일한 낙이에요.", tags: ["한강", "혼자"], tIdx: [2, 3] },
            { text: "산책하면서 아무 생각도 안 할 수 있다는 게 신기해.", tags: ["산책", "감정"], tIdx: [4, 0] },
          ].map((r, i) => (
            <div key={i} style={{ background: T.surface, borderRadius: 10,
              padding: "10px 12px", marginBottom: i === 0 ? 8 : 0,
              border: `1px solid ${T.border}` }}>
              <div style={{ color: T.sub, fontSize: 12, lineHeight: 1.6, marginBottom: 6 }}>{r.text}</div>
              <div style={{ display: "flex", gap: 5 }}>
                {r.tags.map((t, j) => <Tag key={t} label={t} idx={r.tIdx[j]} sm />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 일기 상세 ─────────────────────────────────────────────
function DiaryDetailScreen({ diary, onBack, onEdit }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (!diary) return null;

  return (
    <div style={{ background: T.bg, minHeight: "100%", fontFamily: font }}>
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 20px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 18, color: T.text, padding: 0, lineHeight: 1,
          display: "flex", alignItems: "center",
        }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>일기</span>
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowMenu(v => !v)} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: T.sub, padding: "2px 4px", letterSpacing: 2,
          }}>⋯</button>
          {/* Dropdown menu */}
          {showMenu && (
            <div style={{
              position: "absolute", top: 32, right: 0, zIndex: 20,
              background: T.surface, borderRadius: 10,
              border: `1px solid ${T.border}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              minWidth: 100, overflow: "hidden",
            }}>
              <button onClick={() => { setShowMenu(false); onEdit(); }} style={{
                display: "block", width: "100%", background: "none", border: "none",
                padding: "10px 16px", fontSize: 13, color: T.text, textAlign: "left",
                cursor: "pointer", fontFamily: font, borderBottom: `1px solid ${T.border}`,
              }}>수정</button>
              <button onClick={() => { setShowMenu(false); setShowDelete(true); }} style={{
                display: "block", width: "100%", background: "none", border: "none",
                padding: "10px 16px", fontSize: 13, color: T.red, textAlign: "left",
                cursor: "pointer", fontFamily: font,
              }}>삭제</button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px" }}>
        {/* Date & mood */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 12 }}>
          <span style={{ color: T.muted, fontSize: 12 }}>{diary.date}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 20 }}>{moods[diary.mood - 1]}</span>
            <span style={{ fontSize: 12, color: T.sub, fontWeight: 500 }}>
              {moodLabels[diary.mood - 1]}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700,
          letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.3 }}>
          {diary.title}
        </h2>

        {/* Body */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "18px 16px", marginBottom: 16 }}>
          <div style={{ color: T.text, fontSize: 14, lineHeight: 1.85,
            whiteSpace: "pre-wrap" }}>{diary.content}</div>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {diary.tags.map((t, i) => <Tag key={t} label={t} idx={diary.tIdx[i]} />)}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDelete && (
        <Modal title="일기 삭제" onClose={() => setShowDelete(false)}>
          <div style={{ color: T.sub, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            이 일기를 삭제할까요?<br />
            <span style={{ color: T.muted, fontSize: 12 }}>삭제된 일기는 복구할 수 없습니다.</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowDelete(false)} style={{
              flex: 1, background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "10px", fontSize: 13, color: T.sub,
              cursor: "pointer", fontFamily: font,
            }}>취소</button>
            <button onClick={() => { setShowDelete(false); onBack(); }} style={{
              flex: 1, background: T.red, border: "none",
              borderRadius: 10, padding: "10px", fontSize: 13, color: "#fff",
              cursor: "pointer", fontFamily: font, fontWeight: 600,
            }}>삭제</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── 일기 수정 ─────────────────────────────────────────────
function DiaryEditScreen({ diary, onBack }) {
  const [title, setTitle] = useState(diary?.title ?? "");
  const [content, setContent] = useState(diary?.content ?? "");
  const [tags, setTags] = useState(diary?.tags ?? []);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState(diary ? diary.mood - 1 : 2);
  const suggests = ["일상", "감정", "성장", "여행"];

  const addTag = (t) => { if (t.trim() && !tags.includes(t.trim()) && tags.length < 10) setTags([...tags, t.trim()]); setInput(""); };
  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  return (
    <div style={{ background: T.bg, minHeight: "100%", fontFamily: font }}>
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 20px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: T.text, padding: 0, lineHeight: 1,
            display: "flex", alignItems: "center",
          }}>←</button>
          <span style={{ color: T.text, fontSize: 17, fontWeight: 700,
            letterSpacing: "-0.03em" }}>일기 수정</span>
        </div>
        <button onClick={onBack} style={{ background: T.text, color: "#fff", border: "none",
          borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: font }}>저장</button>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Title */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ color: T.muted, fontSize: 11, fontWeight: 600,
            letterSpacing: "0.05em", marginBottom: 8 }}>TITLE</div>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            style={{ width: "100%", border: "none", outline: "none",
              background: "transparent", color: T.text, fontSize: 15,
              fontWeight: 600, fontFamily: font, letterSpacing: "-0.02em",
              boxSizing: "border-box" }} />
        </div>

        {/* Mood */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ color: T.muted, fontSize: 11, fontWeight: 600,
            letterSpacing: "0.05em", marginBottom: 10 }}>MOOD</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {moods.map((e, i) => (
              <button key={i} onClick={() => setMood(i)} style={{
                background: mood === i ? T.accentBg : "none",
                border: `1.5px solid ${mood === i ? T.accent : T.border}`,
                borderRadius: 10, padding: "8px 10px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4
              }}>
                <span style={{ fontSize: 20 }}>{e}</span>
                <span style={{ fontSize: 10, color: mood === i ? T.accent : T.muted,
                  fontWeight: mood === i ? 600 : 400 }}>{moodLabels[i]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 10 }}>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="오늘 어떤 하루였나요?"
            style={{ width: "100%", border: "none", outline: "none",
              background: "transparent", color: T.text, fontSize: 14,
              lineHeight: 1.75, resize: "none", minHeight: 120,
              fontFamily: font, boxSizing: "border-box" }} />
          <div style={{ color: T.muted, fontSize: 11, textAlign: "right" }}>{content.length}자</div>
        </div>

        {/* Tags */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ color: T.muted, fontSize: 11, fontWeight: 600,
              letterSpacing: "0.05em" }}>TAGS</div>
            <span style={{ color: T.muted, fontSize: 11 }}>{tags.length}/10</span>
          </div>
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {tags.map((t, i) => (
                <span key={t} style={{
                  background: tagPalette[i % tagPalette.length][1],
                  color: tagPalette[i % tagPalette.length][0],
                  fontSize: 12, fontWeight: 500, padding: "3px 8px 3px 10px",
                  borderRadius: 6, display: "flex", alignItems: "center", gap: 5
                }}>
                  #{t}
                  <span onClick={() => removeTag(t)} style={{
                    cursor: "pointer", fontSize: 14, lineHeight: 1,
                    color: tagPalette[i % tagPalette.length][0], opacity: 0.5,
                    fontWeight: 300
                  }}>×</span>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTag(input)}
              placeholder="태그 추가 후 Enter"
              disabled={tags.length >= 10}
              style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "7px 12px", fontSize: 13, color: T.text,
                background: T.bg, outline: "none", fontFamily: font,
                opacity: tags.length >= 10 ? 0.5 : 1 }} />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {suggests.filter(s => !tags.includes(s)).map(s => (
              <span key={s} onClick={() => addTag(s)} style={{
                border: `1px solid ${T.border}`, borderRadius: 20,
                padding: "3px 10px", fontSize: 11, color: T.sub,
                cursor: "pointer", background: T.bg
              }}>+ {s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 3: 마인드맵 ────────────────────────────────────
function MindmapScreen() {
  const [active, setActive] = useState("산책");
  const [period, setPeriod] = useState("월별");
  const [srcFilter, setSrcFilter] = useState("전체");

  const nodes = [
    { id: "산책", x: 195, y: 195, r: 30, color: T.tag1, bg: T.tag1Bg, count: 18, src: "write" },
    { id: "여행", x: 310, y: 110, r: 24, color: T.tag3, bg: T.tag3Bg, count: 12, src: "write" },
    { id: "감정", x: 90,  y: 120, r: 22, color: T.tag4, bg: T.tag4Bg, count: 10, src: "write" },
    { id: "카페", x: 305, y: 285, r: 20, color: T.tag5, bg: T.tag5Bg, count: 8,  src: "like" },
    { id: "음악", x: 95,  y: 295, r: 18, color: T.tag2, bg: T.tag2Bg, count: 7,  src: "comment" },
    { id: "독서", x: 210, y: 320, r: 16, color: T.tag6, bg: T.tag6Bg, count: 5,  src: "like" },
    { id: "새벽", x: 55,  y: 215, r: 15, color: T.tag1, bg: T.tag1Bg, count: 4,  src: "write" },
    { id: "성장", x: 360, y: 205, r: 14, color: T.tag4, bg: T.tag4Bg, count: 3,  src: "comment" },
  ];
  const edges = [["산책","여행"],["산책","감정"],["산책","카페"],["산책","음악"],["산책","독서"],["감정","새벽"],["여행","카페"],["성장","산책"]];
  const map = Object.fromEntries(nodes.map(n => [n.id, n]));
  const an = map[active];

  const visibleNodes = srcFilter === "전체" ? nodes
    : srcFilter === "직접작성" ? nodes.filter(n => n.src === "write")
    : srcFilter === "좋아요" ? nodes.filter(n => n.src === "like")
    : nodes.filter(n => n.src === "comment");

  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const srcSymbol = s => s === "like" ? "♥" : s === "comment" ? "·" : "";

  return (
    <div style={{ background: T.bg, minHeight: "100%", fontFamily: font }}>
      {/* Header */}
      <div style={{ background: T.surface, padding: "16px 20px 12px",
        borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>마인드맵</span>
          <span style={{ color: T.muted, fontSize: 11 }}>2026년 3월 · 8개 태그</span>
        </div>
        {/* Period tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {["주별", "월별", "연도별"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              background: period === p ? T.text : T.bg,
              color: period === p ? "#fff" : T.sub,
              border: `1px solid ${period === p ? T.text : T.border}`,
              borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: period === p ? 600 : 400,
              cursor: "pointer", fontFamily: font
            }}>{p}</button>
          ))}
        </div>
        {/* Source filter */}
        <div style={{ display: "flex", gap: 5 }}>
          {["전체", "직접작성", "좋아요", "댓글"].map(f => (
            <button key={f} onClick={() => setSrcFilter(f)} style={{
              background: srcFilter === f ? T.accentBg : "transparent",
              color: srcFilter === f ? T.accent : T.muted,
              border: `1px solid ${srcFilter === f ? T.accent : T.border}`,
              borderRadius: 6, padding: "3px 10px", fontSize: 11,
              cursor: "pointer", fontFamily: font, fontWeight: srcFilter === f ? 600 : 400
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* SVG */}
      <div style={{ background: T.surface, margin: "12px 16px",
        borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>
        <svg width="100%" viewBox="0 0 420 400" style={{ display: "block" }}>
          {edges.map(([a, b], i) => {
            const na = map[a], nb = map[b];
            const visible = visibleIds.has(a) && visibleIds.has(b);
            const hl = a === active || b === active;
            return (
              <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={hl && visible ? na.color + "80" : T.border}
                strokeWidth={hl && visible ? 1.5 : 1}
                strokeDasharray={hl ? "none" : "4 3"}
                opacity={visible ? 1 : 0.15} />
            );
          })}
          {nodes.map(n => {
            const visible = visibleIds.has(n.id);
            const isActive = n.id === active;
            return (
              <g key={n.id} onClick={() => setActive(n.id)} style={{ cursor: "pointer" }}>
                {isActive && (
                  <circle cx={n.x} cy={n.y} r={n.r + 8}
                    fill={n.color + "12"} stroke={n.color + "30"} strokeWidth={1} />
                )}
                <circle cx={n.x} cy={n.y} r={n.r}
                  fill={visible ? (isActive ? n.color + "22" : n.bg) : "#F5F5F4"}
                  stroke={visible ? (isActive ? n.color : n.color + "66") : T.border}
                  strokeWidth={isActive ? 2 : n.src === "write" ? 1.5 : 1}
                  strokeDasharray={n.src !== "write" ? "3 2" : "none"}
                  opacity={visible ? 1 : 0.3} />
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle"
                  fill={visible ? (isActive ? n.color : n.color + "CC") : T.muted}
                  fontSize={n.r > 22 ? 12 : 10} fontWeight={isActive ? 700 : 500}
                  fontFamily={font}>
                  {n.id}
                </text>
                {n.src !== "write" && visible && (
                  <text x={n.x + n.r - 2} y={n.y - n.r + 4} fontSize={8}
                    fill={n.src === "like" ? T.red : T.accent}>{srcSymbol(n.src)}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, padding: "0 20px 8px" }}>
        {[["실선", "직접 작성"], ["점선 ♥", "좋아요"], ["점선 ·", "댓글"]].map(([s, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10, color: T.muted }}>{s}</span>
            <span style={{ fontSize: 10, color: T.muted }}>= {l}</span>
          </div>
        ))}
      </div>

      {/* Tag Detail */}
      {an && (
        <div style={{ margin: "0 16px 20px", background: T.surface,
          borderRadius: 14, border: `1px solid ${T.border}`, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Tag label={an.id} idx={nodes.findIndex(n => n.id === active)} />
            <span style={{ color: T.sub, fontSize: 13, fontWeight: 600 }}>{an.count}회</span>
            <span style={{ color: T.muted, fontSize: 11 }}>
              {an.src === "write" ? "직접 작성" : an.src === "like" ? "좋아요에서" : "댓글에서"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["일기 2건", "게시글 5건", "좋아요 11건"].map(l => (
              <div key={l} style={{ background: T.bg, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "5px 10px", color: T.sub, fontSize: 11 }}>{l}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SCREEN 5: 프로필 설정 ─────────────────────────────────
function ProfileScreen({ onBack }) {
  const [nickname, setNickname] = useState("새벽달");
  const [nicknameEdit, setNicknameEdit] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("새벽달");

  const [pwStep, setPwStep] = useState(null); // null | "form" | "done"
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  const [showLogout, setShowLogout] = useState(false);

  const handleNicknameSave = () => {
    if (nicknameInput.trim()) setNickname(nicknameInput.trim());
    setNicknameEdit(false);
  };

  const handlePwSave = () => {
    if (!pw.current) { setPwError("현재 비밀번호를 입력해주세요."); return; }
    if (pw.next.length < 8) { setPwError("새 비밀번호는 8자 이상이어야 해요."); return; }
    if (pw.next !== pw.confirm) { setPwError("새 비밀번호가 일치하지 않아요."); return; }
    setPwError("");
    setPwStep("done");
  };

  const menuItems = [
    {
      section: "계정",
      items: [
        { icon: "✏️", label: "닉네임 수정", action: () => setNicknameEdit(true) },
        { icon: "🔒", label: "비밀번호 변경", action: () => { setPwStep("form"); setPw({ current:"", next:"", confirm:"" }); setPwError(""); } },
      ],
    },
    {
      section: "알림",
      items: [
        { icon: "🔔", label: "스트릭 알림", toggle: true, defaultOn: true },
        { icon: "💬", label: "댓글 알림", toggle: true, defaultOn: true },
        { icon: "♥", label: "좋아요 알림", toggle: true, defaultOn: false },
      ],
    },
    {
      section: "기타",
      items: [
        { icon: "🛡️", label: "개인정보처리방침", action: () => {} },
        { icon: "📄", label: "이용약관", action: () => {} },
      ],
    },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100%", fontFamily: font }}>
      {/* 헤더 */}
      <div style={{ background: T.surface, padding: "16px 20px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 18, color: T.text, padding: 0, lineHeight: 1,
          display: "flex", alignItems: "center",
        }}>←</button>
        <span style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>
          프로필 설정
        </span>
      </div>

      {/* 프로필 요약 */}
      <div style={{ background: T.surface, padding: "20px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%",
          background: "#F0EFFF", border: `2px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          cursor: "pointer" }}>🦊</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>
            {nickname}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>@midnight_moon</div>
        </div>
      </div>

      <div style={{ padding: "12px 16px 24px" }}>
        {/* 메뉴 섹션들 */}
        {menuItems.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 12 }}>
            <div style={{ color: T.muted, fontSize: 11, fontWeight: 600,
              letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "6px 4px 8px" }}>{section}</div>
            <div style={{ background: T.surface, borderRadius: 14,
              border: `1px solid ${T.border}`, overflow: "hidden" }}>
              {items.map((item, i) => (
                <SettingRow key={item.label} item={item}
                  showBorder={i < items.length - 1} />
              ))}
            </div>
          </div>
        ))}

        {/* 로그아웃 */}
        <button onClick={() => setShowLogout(true)} style={{
          width: "100%", background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 10,
          cursor: "pointer", fontFamily: font, color: T.red,
        }}>
          <span style={{ fontSize: 16 }}>🚪</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>로그아웃</span>
        </button>

        {/* 회원 탈퇴 */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer",
            color: T.muted, fontSize: 12, fontFamily: font,
            textDecoration: "underline", textUnderlineOffset: 3 }}>
            회원 탈퇴
          </button>
        </div>
      </div>

      {/* 닉네임 수정 모달 */}
      {nicknameEdit && (
        <Modal title="닉네임 수정" onClose={() => setNicknameEdit(false)}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>
              새 닉네임
            </label>
            <input
              value={nicknameInput}
              onChange={e => setNicknameInput(e.target.value)}
              maxLength={20}
              style={{
                width: "100%", border: `1px solid ${T.border}`, borderRadius: 10,
                padding: "10px 12px", fontSize: 14, color: T.text,
                background: T.bg, outline: "none", fontFamily: font, boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: 11, color: T.muted, textAlign: "right", marginTop: 4 }}>
              {nicknameInput.length}/20
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setNicknameEdit(false)} style={{
              flex: 1, background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "10px", fontSize: 13, color: T.sub,
              cursor: "pointer", fontFamily: font,
            }}>취소</button>
            <button onClick={handleNicknameSave} style={{
              flex: 1, background: T.text, border: "none",
              borderRadius: 10, padding: "10px", fontSize: 13, color: "#fff",
              cursor: "pointer", fontFamily: font, fontWeight: 600,
            }}>저장</button>
          </div>
        </Modal>
      )}

      {/* 비밀번호 변경 모달 */}
      {pwStep === "form" && (
        <Modal title="비밀번호 변경" onClose={() => setPwStep(null)}>
          {[
            { key: "current", label: "현재 비밀번호" },
            { key: "next", label: "새 비밀번호" },
            { key: "confirm", label: "새 비밀번호 확인" },
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 5 }}>
                {label}
              </label>
              <input
                type="password"
                value={pw[key]}
                onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                style={{
                  width: "100%", border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: "10px 12px", fontSize: 14, color: T.text,
                  background: T.bg, outline: "none", fontFamily: font, boxSizing: "border-box",
                }}
              />
            </div>
          ))}
          {pwError && (
            <div style={{ color: T.red, fontSize: 12, marginBottom: 10 }}>{pwError}</div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={() => setPwStep(null)} style={{
              flex: 1, background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "10px", fontSize: 13, color: T.sub,
              cursor: "pointer", fontFamily: font,
            }}>취소</button>
            <button onClick={handlePwSave} style={{
              flex: 1, background: T.text, border: "none",
              borderRadius: 10, padding: "10px", fontSize: 13, color: "#fff",
              cursor: "pointer", fontFamily: font, fontWeight: 600,
            }}>변경하기</button>
          </div>
        </Modal>
      )}

      {/* 비밀번호 변경 완료 */}
      {pwStep === "done" && (
        <Modal title="" onClose={() => setPwStep(null)}>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              비밀번호가 변경됐어요
            </div>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
              다음 로그인부터 새 비밀번호를 사용해주세요.
            </div>
            <button onClick={() => setPwStep(null)} style={{
              width: "100%", background: T.text, border: "none",
              borderRadius: 10, padding: "11px", fontSize: 13, color: "#fff",
              cursor: "pointer", fontFamily: font, fontWeight: 600,
            }}>확인</button>
          </div>
        </Modal>
      )}

      {/* 로그아웃 확인 */}
      {showLogout && (
        <Modal title="로그아웃" onClose={() => setShowLogout(false)}>
          <div style={{ color: T.sub, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
            정말 로그아웃 하시겠어요?
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowLogout(false)} style={{
              flex: 1, background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "10px", fontSize: 13, color: T.sub,
              cursor: "pointer", fontFamily: font,
            }}>취소</button>
            <button style={{
              flex: 1, background: T.red, border: "none",
              borderRadius: 10, padding: "10px", fontSize: 13, color: "#fff",
              cursor: "pointer", fontFamily: font, fontWeight: 600,
            }}>로그아웃</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── 설정 행 컴포넌트 ──────────────────────────────────────
function SettingRow({ item, showBorder }) {
  const [on, setOn] = useState(item.defaultOn ?? false);
  return (
    <div
      onClick={item.toggle ? undefined : item.action}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "13px 16px",
        borderBottom: showBorder ? `1px solid ${T.border}` : "none",
        cursor: item.toggle ? "default" : "pointer",
      }}
    >
      <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{item.icon}</span>
      <span style={{ flex: 1, fontSize: 14, color: T.text }}>{item.label}</span>
      {item.toggle ? (
        <div
          onClick={() => setOn(v => !v)}
          style={{
            width: 44, height: 26, borderRadius: 13, cursor: "pointer",
            background: on ? T.accent : T.border,
            position: "relative", transition: "background 0.2s",
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: "50%", background: "#fff",
            position: "absolute", top: 3,
            left: on ? 21 : 3,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }} />
        </div>
      ) : (
        <span style={{ color: T.muted, fontSize: 14 }}>›</span>
      )}
    </div>
  );
}

// ── 모달 공통 컴포넌트 ────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      {/* 딤 */}
      <div onClick={onClose} style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.4)",
      }} />
      {/* 시트 */}
      <div style={{
        position: "relative", width: "100%", maxWidth: 375,
        background: T.surface, borderRadius: "20px 20px 0 0",
        padding: "20px 20px 32px", zIndex: 1,
      }}>
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{title}</span>
            <button onClick={onClose} style={{
              background: "none", border: "none", cursor: "pointer",
              color: T.muted, fontSize: 18, lineHeight: 1, padding: 0,
            }}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── SCREEN 4: 마이페이지 / 스트릭 ─────────────────────────
function MyPageScreen({ onNavigate }) {
  const streak = [true,true,true,true,false,true,true];
  const days = ["월","화","수","목","금","토","일"];
  const topTags = [
    { name:"산책", count:18, idx:0 },
    { name:"여행", count:12, idx:2 },
    { name:"감정", count:10, idx:3 },
    { name:"카페", count:8,  idx:4 },
    { name:"음악", count:7,  idx:1 },
  ];
  const calRows = [
    [0,0,0,1,1,1,1],
    [1,1,0,1,1,1,1],
    [1,1,1,1,0,1,1],
    [1,1,1,1,1,0,0],
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100%", fontFamily: font }}>
      {/* Profile */}
      <div style={{ background: T.surface, padding: "20px 20px 16px",
        borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div onClick={() => onNavigate("profile")} style={{ width: 56, height: 56, borderRadius: "50%",
            background: "#F0EFFF", border: `2px solid ${T.border}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
            cursor: "pointer" }}>🦊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>새벽달</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>가입 42일째 · @midnight_moon</div>
          </div>
          <button onClick={() => onNavigate("profile")} style={{ background: T.bg, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "6px 12px", fontSize: 12, color: T.sub,
            cursor: "pointer", fontFamily: font }}>편집</button>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {[["일기","23"],["게시글","14"],["팔로워","89"],["팔로잉","56"]].map(([l,v], i) => (
            <div key={l} style={{ flex: 1, textAlign: "center",
              borderRight: i < 3 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{v}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 16px 24px" }}>
        {/* Streak */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>연속 기록</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: T.green, letterSpacing: "-0.05em" }}>7</span>
              <span style={{ fontSize: 12, color: T.muted }}>일 연속 🔥</span>
            </div>
          </div>
          {/* Week */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {days.map((d, i) => (
              <div key={d} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  background: streak[i] ? T.greenBg : T.bg,
                  border: `1.5px solid ${streak[i] ? T.green : T.border}`,
                  borderRadius: 8, height: 34,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: streak[i] ? T.green : T.muted,
                  marginBottom: 4
                }}>{streak[i] ? "✓" : ""}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{d}</div>
              </div>
            ))}
          </div>
          {/* Calendar heatmap */}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
            <div style={{ color: T.muted, fontSize: 11, marginBottom: 8 }}>이번 달 기록</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {calRows.map((row, ri) => (
                <div key={ri} style={{ display: "flex", gap: 3 }}>
                  {row.map((v, ci) => (
                    <div key={ci} style={{
                      width: 28, height: 18, borderRadius: 4,
                      background: v ? T.green + "33" : T.bg,
                      border: `1px solid ${v ? T.green + "44" : T.border}`
                    }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Retrospect */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ color: T.muted, fontSize: 11, fontWeight: 600,
            letterSpacing: "0.05em", marginBottom: 8 }}>1년 전 오늘</div>
          <div style={{ color: T.sub, fontSize: 13, lineHeight: 1.7, marginBottom: 8,
            fontStyle: "italic" }}>
            "봄이 시작되는 것 같았다. 아무것도 계획 없이 나온 산책인데 기분이 좋아졌다."
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <Tag label="산책" idx={0} sm />
            <Tag label="봄" idx={3} sm />
          </div>
        </div>

        {/* Top Tags */}
        <div style={{ background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ color: T.muted, fontSize: 11, fontWeight: 600,
            letterSpacing: "0.05em", marginBottom: 12 }}>이번 달 TOP 태그</div>
          {topTags.map((t, i) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 4 ? 10 : 0 }}>
              <span style={{ color: T.muted, fontSize: 11, width: 14, textAlign: "center" }}>{i + 1}</span>
              <Tag label={t.name} idx={t.idx} sm />
              <div style={{ flex: 1, background: T.bg, borderRadius: 4, height: 5, overflow: "hidden" }}>
                <div style={{ background: tagPalette[t.idx][0], height: "100%",
                  width: `${(t.count / 18) * 100}%`, borderRadius: 4 }} />
              </div>
              <span style={{ color: T.muted, fontSize: 11, width: 20, textAlign: "right" }}>{t.count}</span>
            </div>
          ))}
        </div>

        {/* Monthly Report */}
        <div style={{ background: T.amberBg, borderRadius: 14,
          border: `1px solid ${T.amber}33`, padding: "14px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: T.amber, fontSize: 11, fontWeight: 600,
              letterSpacing: "0.05em", marginBottom: 4 }}>2월 월간 리포트</div>
            <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>31회 기록 · 태그 12종</div>
          </div>
          <button style={{ background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "7px 14px", fontSize: 12, color: T.sub,
            cursor: "pointer", fontFamily: font }}>공유 ↗</button>
        </div>
      </div>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────
const tabs = [
  { label: "피드",    icon: "⊞", screen: HomeScreen },
  { label: "일기",   icon: "✎", screen: DiaryScreen },
  { label: "맵",     icon: "◎", screen: MindmapScreen },
  { label: "내 기록", icon: "◉", screen: MyPageScreen },
];

export default function App() {
  const [idx, setIdx] = useState(0);
  // "tab" | "profile" — 바텀 탭 위에 올라오는 서브 화면 관리
  const [subScreen, setSubScreen] = useState(null);

  const handleNavigate = (screen) => setSubScreen(screen);
  const handleBack = () => setSubScreen(null);

  const Screen = tabs[idx].screen;

  // 프로필 화면은 바텀 네비 없이 전체 표시
  const isSubScreen = subScreen !== null;

  return (
    <div style={{ background: "#E8E7E3", minHeight: "100vh",
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      padding: "32px 0 32px" }}>
      <div style={{
        width: 375, background: T.bg,
        borderRadius: 40,
        boxShadow: "0 24px 64px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden", border: "1px solid #D4D3CF"
      }}>
        {/* Status bar */}
        <div style={{ background: T.surface, padding: "10px 28px 8px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: font }}>9:41</span>
          <div style={{ width: 72, height: 14, background: "#1A1A18",
            borderRadius: 10, opacity: 0.9 }} />
          <span style={{ fontSize: 11, color: T.sub, fontFamily: font }}>●●●</span>
        </div>

        {/* Content */}
        <div style={{ maxHeight: 660, overflowY: "auto",
          scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {isSubScreen
            ? <ProfileScreen onBack={handleBack} />
            : idx === 3
              ? <MyPageScreen onNavigate={handleNavigate} />
              : <Screen />
          }
        </div>

        {/* Bottom nav — 서브 화면에서는 숨김 */}
        {!isSubScreen && (
          <div style={{ background: T.surface, borderTop: `1px solid ${T.border}`,
            display: "flex", padding: "10px 0 18px" }}>
            {tabs.map((t, i) => (
              <button key={t.label} onClick={() => setIdx(i)} style={{
                flex: 1, background: "none", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                fontFamily: font
              }}>
                <span style={{ fontSize: 18, opacity: idx === i ? 1 : 0.3 }}>{t.icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: idx === i ? 700 : 400,
                  color: idx === i ? T.text : T.muted
                }}>{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
