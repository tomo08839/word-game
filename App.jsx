import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ============================================================
   早押しワードゲーム（プロトタイプ）
   ------------------------------------------------------------
   - 1台の画面で名前を入力して順番に回答 / ひとり練習モード対応
   - あらかじめ定義した実在単語リストから「頭文字」「文字数」の
     お題をランダム生成（該当語ゼロのお題が出ないようインデックス化）
   - 30秒カウントダウン + 早押しスコアリング
   ============================================================ */

// ---------- 1. 辞書データ（プロトタイプ用サンプル語彙） ----------
const WORD_LIST = [
  "あめ","あさ","あき","あし","あな","あご",
  "あたま","あひる","あくび","あんこ","あまど","あさひ",
  "あいさつ","あじさい","あきかぜ","あさがお","あまがさ",
  "いぬ","いす","いえ","いと","いか","いろ",
  "いちご","いのち","いかり","いもり","いたち",
  "いちにち","いいわけ","いなずま",
  "うま","うみ","うで","うそ","うた",
  "うさぎ","うちわ","うろこ","うでわ","うずら",
  "うたごえ",
  "えき","えだ","えび","えさ",
  "えがお","えほん","えんぴつ","えんそく",
  "えいがかん",
  "おに","おび","おか","おと","おや",
  "おかし","おかね","おどり","おもち","おふろ",
  "おてがみ","おにぎり","おかあさん","おとうさん",
  "かめ","かさ","かぎ","かに","かお","かわ",
  "かがみ","からす","かびん","かもめ","かたち","かさぶた",
  "かみなり","かたつむり","かぶとむし",
  "きく","きつね","きいろ","きもの","きしゃ",
  "きつつき","きゅうり","きんぎょ",
  "きょうりゅう",
  "くも","くつ","くし","くき",
  "くじら","くらげ","くるま","くすり",
  "くだもの","くうこう",
  "けむし","けしき","けいと","けむり",
  "けいさつ","けんだま",
  "こま","こい","こな","こめ",
  "こおり","こども","こばん","こおろぎ",
  "こうえん","こうもり",
  "さる","さば","さら","さめ",
  "さくら","さいふ","さかな","さんま","さとう",
  "さんかく","さつまいも",
  "しか","しお","しま",
  "しまうま","しんぶん","しゃしん","しろくま",
  "すし","すな","すず",
  "すいか","すずめ","すみれ","すいとう",
  "すべりだい",
  "せみ","せなか","せんす","せんぷうき",
  "そら","そで","そうめん","そろばん",
  "たこ","たね","たいこ","たまご","たぬき","たんぽぽ","たいよう",
  "ちず","ちから","ちきゅう","ちょうちょ",
  "つき","つの","つばめ","つくえ","つなみ","つみき",
  "てら","てがみ","てぶくろ",
  "とり","とけい","とうふ","とかげ","となかい",
  "なつ","なべ","なみだ","なっとう","なわとび",
  "にじ","にもつ","にわとり","にんじん",
  "ぬいぐるみ",
  "ねこ","ねぎ","ねずみ",
  "のり","のはら","のみもの",
  "はな","はし","はと","はさみ","はなび","はんかち","はちみつ",
  "ひも","ひかり","ひつじ","ひまわり","ひこうき",
  "ふね","ふゆ","ふとん","ふくろう","ふうせん",
  "へび","へや","へいわ",
  "ほし","ほん","ほうき","ほたる","ほうせき",
  "まど","まめ","まくら","まつり","まほう",
  "みず","みかん","みなと","みどり",
  "むし","むぎ","むらさき",
  "めがね","めだま",
  "もり","もも","もぐら","もみじ",
  "やま","やね","やさい","やかん",
  "ゆき","ゆめ","ゆびわ",
  "よる","よこ","ようふく",
  "らくだ","らっぱ",
  "りす","りんご","りゆう",
  "るす",
  "れんこん","れいぞうこ",
  "わに","わたし","わりばし",
  // ---- 追加語彙（不正解になりやすかった語を補強） ----
  "あゆ","あわ","あじ","あくま","あらし","あんず","あまぐも","あさやけ",
  "いわ","いき","いるか","いかだ","いばら","いなか","いねむり","いろがみ",
  "うし","うつわ","うわぎ","うちがわ","うでどけい",
  "えもの","えんとつ","えだまめ",
  "おおかみ","おりがみ","おおさじ","おうさま",
  "かたな","かえる","かぶと","かんむり","かいだん","かたぐるま",
  "きた","きし","きんこ","きかい","きたかぜ",
  "くつした","くうき","くちびる",
  "けんこう","けもの",
  "こんぶ","こくばん","こうちゃ","こしょう",
  "さいころ","さかだち","さんぽ","さかや",
  "しっぽ","しずく","しあわせ","しんごう",
  "すもう","すいどう","すなば",
  "せかい","せんたく","せいざ",
  "そうじ","そつぎょう","そこ",
  "たいふう","たからばこ","たまねぎ",
  "ちかてつ","ちゃわん","ちょきん",
  "つゆ","つばさ","つうがく",
  "てじな","てんき","てつぼう",
  "とうだい","とんぼ",
  "なみき","なんきょく",
  "にほん","にんぎょう",
  "ぬの",
  "ねだん","ねんど",
  "のうか",
  "はくしゅ","はなたば","はいけい",
  "ひだまり","ひろば",
  "ふうふ","ふでばこ",
  "へいや","へんじ",
  "ほうこう","ほけん","ほどう",
  "まいご","まんなか",
  "みらい","みつばち","みかづき",
  "むかし","むすめ",
  "めいろ","めざまし",
  "もくば",
  "やきゅう","やおや",
  "ゆうがた","ゆうびん",
  "よこがお",
  "らいねん",
  "りょこう","りくじょう",
  "れきし","れんしゅう",
  "ろうか","ろけっと",
  "わかば","わすれもの",
];

// カタカナ→ひらがな正規化
const toHiragana = (str) =>
  str.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );

const normalize = (str) =>
  toHiragana(String(str || "").trim().replace(/\s+/g, ""));

const WORD_SET = new Set(WORD_LIST.map(normalize));

// ---------- 1b. 外部辞書API判定 ----------
// ブラウザから直接 Jisho / Wiktionary を叩くとCORSで失敗しやすいため、
// 同一オリジンの Vercel サーバー関数（/api/check-word）を経由して問い合わせる。
// 戻り値: { exists: true|false|null, source: "jisho"|"wiktionary"|"offline" }
// exists が null のときはAPIに到達できなかったことを意味し、呼び出し側は
// ローカル辞書（WORD_SET）で最終判定する。
async function checkWordExistsOnline(word) {
  try {
    const res = await fetch(`/api/check-word?word=${encodeURIComponent(word)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.exists !== "undefined") {
        return data;
      }
    }
  } catch (e) {
    // サーバー関数に到達できない（ローカルの `npm run dev` 単体実行時など）
  }
  return { exists: null, source: "offline" };
}



// 出題に使ってはいけない頭文字
const NG_CHARS = new Set(["ん", "を", "ゐ", "ゑ", "ー", "ゃ", "ゅ", "ょ", "っ"]);
const MIN_LEN = 2;
const MAX_LEN = 5;
const MIN_WORD_COUNT = 2; // このセット数未満の（頭文字,文字数）は出題しない

// ---------- 2. インデックス構築 ----------
function buildIndex() {
  const index = new Map(); // key: `${char}-${len}` -> [words]
  for (const raw of WORD_LIST) {
    const w = normalize(raw);
    if (!w) continue;
    const chars = Array.from(w);
    const first = chars[0];
    const len = chars.length;
    if (NG_CHARS.has(first)) continue;
    if (len < MIN_LEN || len > MAX_LEN) continue;
    const key = `${first}-${len}`;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(w);
  }
  return index;
}

const ROUND_SECONDS = 30;
const RANK_POINTS = [100, 80, 60, 40]; // 5位以降は一律
const LATE_POINT = 20;
const pointsFor = (idx) => RANK_POINTS[idx] ?? LATE_POINT;

function buildFontLink() {
  return "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@700;800;900&display=swap";
}

// お題インデックスはモジュール読み込み時に一度だけ構築（LocalGame / OnlineGame 共通で使う）
const WORD_INDEX = buildIndex();
const VALID_COMBOS = Array.from(WORD_INDEX.entries())
  .filter(([, words]) => words.length >= MIN_WORD_COUNT)
  .map(([key]) => key);

function pickTopic(used) {
  const usedSet = new Set((used || []).slice(-8));
  let pool = VALID_COMBOS.filter((c) => !usedSet.has(c));
  if (pool.length === 0) pool = VALID_COMBOS;
  if (pool.length === 0) return { char: "か", len: 3, key: "か-3" }; // 最終フォールバック
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const [char, lenStr] = pick.split("-");
  return { char, len: Number(lenStr), key: pick };
}

// ================= トップレベル：ゲームモード選択 =================
export default function HayaoshiWordGame() {
  const [gameType, setGameType] = useState(null); // null | "local" | "online"
  const [localInitialMode, setLocalInitialMode] = useState("multi");

  if (gameType === "online") {
    return <OnlineGame onExit={() => setGameType(null)} />;
  }
  if (gameType === "local") {
    return (
      <LocalGame
        initialMode={localInitialMode}
        onExit={() => setGameType(null)}
      />
    );
  }
  return (
    <ModeSelectScreen
      onSelectSolo={() => {
        setLocalInitialMode("solo");
        setGameType("local");
      }}
      onSelectLocalMulti={() => {
        setLocalInitialMode("multi");
        setGameType("local");
      }}
      onSelectOnline={() => setGameType("online")}
    />
  );
}

function ModeSelectScreen({ onSelectSolo, onSelectLocalMulti, onSelectOnline }) {
  return (
    <div style={styles.app}>
      <style>{`@import url('${buildFontLink()}'); * { box-sizing: border-box; } .pop-btn { transition: transform .12s ease, box-shadow .12s ease, filter .12s ease; cursor: pointer; } .pop-btn:hover { transform: translateY(-2px); filter: brightness(1.05); } .pop-btn:active { transform: translateY(1px) scale(0.98); }`}</style>
      <div style={{ ...styles.blob, top: -60, left: -40, background: "#FF5D8F" }} />
      <div style={{ ...styles.blob, bottom: -70, right: -50, background: "#2EC4B6" }} />
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>⚡</span>
            <h1 style={styles.title}>早押しワードゲーム</h1>
          </div>
        </header>
        <div style={{ ...styles.card, animation: "popIn .35s ease" }}>
          <div style={styles.sectionLabel}>あそびかたを選んでね</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
            <button className="pop-btn" onClick={onSelectSolo} style={styles.modeCard}>
              🧍 ひとりで練習
              <span style={styles.modeCardSub}>1台の端末でひとりで遊ぶ</span>
            </button>
            <button className="pop-btn" onClick={onSelectLocalMulti} style={styles.modeCard}>
              👥 同じ端末でみんなで対戦
              <span style={styles.modeCardSub}>1台を回し合って対戦</span>
            </button>
            <button className="pop-btn" onClick={onSelectOnline} style={{ ...styles.modeCard, background: "linear-gradient(135deg, #FF5D8F, #FFD23F)" }}>
              🌐 友達とオンライン対戦
              <span style={styles.modeCardSub}>それぞれの端末から部屋に参加</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocalGame({ initialMode, onExit }) {

  // ------- ゲーム全体の状態 -------
  const [phase, setPhase] = useState("setup"); // setup | playing | roundResult | gameOver
  const [mode, setMode] = useState(initialMode || "multi"); // multi | solo
  const [playerNames, setPlayerNames] = useState(["", ""]);
  const [players, setPlayers] = useState([]); // {id, name, score}
  const [totalRounds, setTotalRounds] = useState(7);
  const [currentRound, setCurrentRound] = useState(0);

  // ------- ラウンド内の状態 -------
  const [topic, setTopic] = useState(null); // {char, len}
  const [usedCombos, setUsedCombos] = useState([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [answeringId, setAnsweringId] = useState(null);
  const [checkingIds, setCheckingIds] = useState(() => new Set()); // API判定待ちのプレイヤーID
  const [inputValue, setInputValue] = useState("");
  const [roundAnswers, setRoundAnswers] = useState([]); // {playerId, word, correct, elapsed, checkedVia}
  const [toast, setToast] = useState(null); // {text, ok}
  const roundStartRef = useRef(0);
  const roundIdRef = useRef(0); // 非同期判定が古いラウンドの結果を反映しないようにするための識別子
  const inputRef = useRef(null);

  // ---------- 補助関数 ----------
  const answeredIds = useMemo(
    () => new Set(roundAnswers.map((a) => a.playerId)),
    [roundAnswers]
  );

  const startRound = useCallback(
    (roundNum, used) => {
      const t = pickTopic(used);
      roundIdRef.current += 1;
      setTopic(t);
      setUsedCombos((prev) => [...prev, t.key || `${t.char}-${t.len}`]);
      setRoundAnswers([]);
      setAnsweringId(null);
      setCheckingIds(new Set());
      setInputValue("");
      setTimeLeft(ROUND_SECONDS);
      setRevealed(false);
      setToast(null);
      setPhase("playing");
      // 少し間を置いてから公開演出
      setTimeout(() => setRevealed(true), 350);
      setTimeout(() => {
        roundStartRef.current = Date.now();
        setRunning(true);
      }, 900);
    },
    [pickTopic]
  );

  // ---------- ゲーム開始 ----------
  const handleStart = () => {
    let initial;
    if (mode === "solo") {
      initial = [{ id: 1, name: playerNames[0]?.trim() || "プレイヤー", score: 0 }];
    } else {
      initial = playerNames
        .map((n, i) => n.trim())
        .filter(Boolean)
        .map((n, i) => ({ id: i + 1, name: n, score: 0 }));
    }
    setPlayers(initial);
    setCurrentRound(1);
    setUsedCombos([]);
    startRound(1, []);
  };

  // ---------- タイマー（判定待ちが無いことを確認してから終了する） ----------
  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) return; // 終了判定は下の useEffect にまとめる
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft]);

  // 「時間切れ」または「全員回答済み」になったら、API判定待ちが無いことを確認してラウンド終了
  useEffect(() => {
    if (phase !== "playing" || !running || players.length === 0) return;
    if (checkingIds.size > 0) return; // まだオンライン辞書の返事待ち → 終了しない
    const allAnswered = answeredIds.size >= players.length;
    const timeUp = timeLeft <= 0;
    if (allAnswered || timeUp) {
      finishRound();
    }
  }, [answeredIds, checkingIds, timeLeft, phase, running, players.length]);

  function finishRound() {
    setRunning(false);
    setPhase("roundResult");
  }

  // ---------- 回答処理 ----------
  const openAnswerBox = (playerId) => {
    if (answeredIds.has(playerId) || checkingIds.has(playerId)) return;
    setAnsweringId(playerId);
    setInputValue("");
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  };

  const finalizeAnswer = (playerId, roundId, entry) => {
    // ラウンドが切り替わっていたら（時間切れ等で）この結果は反映しない
    if (roundIdRef.current !== roundId) return;
    setRoundAnswers((prev) => [...prev, entry]);
    setCheckingIds((prev) => {
      const next = new Set(prev);
      next.delete(playerId);
      return next;
    });
    setToast({
      text: entry.correct ? `せいかい！「${entry.word}」` : `ざんねん… ${entry.reason}`,
      ok: entry.correct,
    });
    setTimeout(() => setToast(null), 2200);
  };

  const submitAnswer = async (playerId) => {
    if (!topic) return;
    const raw = inputValue;
    const norm = normalize(raw);
    const chars = Array.from(norm);
    const elapsed = Date.now() - roundStartRef.current;
    const roundId = roundIdRef.current;

    setAnsweringId(null);
    setInputValue("");

    // 空欄はターンを消費させず、その場で入力を促すだけにする
    if (chars.length === 0) {
      setToast({ text: "ざんねん… 文字を入力してね", ok: false });
      setTimeout(() => setToast(null), 1500);
      return;
    }

    // 頭文字・文字数はその場でわかるので即時判定
    if (chars[0] !== topic.char) {
      finalizeAnswer(playerId, roundId, {
        playerId, word: raw, correct: false, elapsed,
        reason: `「${topic.char}」から始まっていないよ`,
      });
      return;
    }
    if (chars.length !== topic.len) {
      finalizeAnswer(playerId, roundId, {
        playerId, word: raw, correct: false, elapsed,
        reason: `${topic.len}文字にしてね（今は${chars.length}文字）`,
      });
      return;
    }

    // ここから先は「実在する言葉か」を外部辞書APIにリアルタイムで問い合わせる
    setCheckingIds((prev) => new Set(prev).add(playerId));
    const result = await checkWordExistsOnline(norm);
    if (roundIdRef.current !== roundId) return; // ラウンドが変わっていたら破棄

    const existsLocally = WORD_SET.has(norm);
    const correct = result.exists === true || existsLocally;

    let reason = "";
    if (!correct) {
      reason =
        result.source === "offline"
          ? "オンライン辞書に接続できず、手元の辞書にも見つからなかったよ"
          : "オンライン辞書に見つからなかったよ";
    }

    finalizeAnswer(playerId, roundId, {
      playerId,
      word: raw,
      correct,
      elapsed,
      reason,
      checkedVia: result.source,
    });
  };

  // ---------- ラウンド結果 → 得点反映 ----------
  const rankedAnswers = useMemo(() => {
    const correctOnes = roundAnswers
      .filter((a) => a.correct)
      .sort((a, b) => a.elapsed - b.elapsed);
    const wrongOnes = roundAnswers.filter((a) => !a.correct);
    const noAnswer = players
      .filter((p) => !roundAnswers.some((a) => a.playerId === p.id))
      .map((p) => ({ playerId: p.id, word: "", correct: false, noAnswer: true }));
    return { correctOnes, wrongOnes, noAnswer };
  }, [roundAnswers, players]);

  const pointsFor = (idx) => RANK_POINTS[idx] ?? LATE_POINT;

  const applyScoresAndContinue = () => {
    setPlayers((prev) =>
      prev.map((p) => {
        const idx = rankedAnswers.correctOnes.findIndex((a) => a.playerId === p.id);
        if (idx === -1) return p;
        return { ...p, score: p.score + pointsFor(idx) };
      })
    );
    if (currentRound >= totalRounds) {
      setPhase("gameOver");
    } else {
      const next = currentRound + 1;
      setCurrentRound(next);
      startRound(next, usedCombos);
    }
  };

  const resetGame = () => {
    setPhase("setup");
    setPlayers([]);
    setCurrentRound(0);
    setTopic(null);
    setUsedCombos([]);
    setRoundAnswers([]);
  };

  // ---------- プレイヤー名の管理（セットアップ画面） ----------
  const updateName = (i, v) => {
    setPlayerNames((prev) => {
      const arr = [...prev];
      arr[i] = v;
      return arr;
    });
  };
  const addPlayer = () =>
    setPlayerNames((prev) => (prev.length < 10 ? [...prev, ""] : prev));
  const removePlayer = (i) =>
    setPlayerNames((prev) => (prev.length > 2 ? prev.filter((_, j) => j !== i) : prev));

  const canStart =
    mode === "solo"
      ? true
      : playerNames.filter((n) => n.trim()).length >= 2;

  const timerPct = timeLeft / ROUND_SECONDS;
  const timerColor =
    timerPct > 0.5 ? "#2EC4B6" : timerPct > 0.2 ? "#FFD23F" : "#FF5D8F";

  const sortedFinal = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players]
  );

  // ================= 描画 =================
  return (
    <div style={styles.app}>
      <style>{`
        @import url('${buildFontLink()}');
        * { box-sizing: border-box; }
        .pop-btn { transition: transform .12s ease, box-shadow .12s ease, filter .12s ease; cursor: pointer; }
        .pop-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .pop-btn:active { transform: translateY(1px) scale(0.98); }
        @keyframes flipIn {
          0% { transform: rotateY(90deg) scale(.85); opacity: 0; }
          60% { transform: rotateY(-8deg) scale(1.03); opacity: 1; }
          100% { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes floatBg {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes toastSlide {
          0% { transform: translate(-50%, 20px); opacity: 0; }
          15% { transform: translate(-50%, 0); opacity: 1; }
          85% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -10px); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:focus { outline: 3px solid #FFD23F; outline-offset: 1px; }
        button:focus-visible { outline: 3px solid #FFD23F; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* 背景の浮遊デコレーション */}
      <div style={{ ...styles.blob, top: -60, left: -40, background: "#FF5D8F", animation: "floatBg 7s ease-in-out infinite" }} />
      <div style={{ ...styles.blob, bottom: -70, right: -50, background: "#2EC4B6", animation: "floatBg 9s ease-in-out infinite" }} />
      <div style={{ ...styles.blob, top: "40%", right: -80, width: 160, height: 160, background: "#FFD23F", opacity: 0.35, animation: "floatBg 8s ease-in-out infinite" }} />

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>⚡</span>
            <h1 style={styles.title}>早押しワードゲーム</h1>
          </div>
          {phase !== "setup" && (
            <div style={styles.roundBadge}>
              ラウンド {currentRound} / {totalRounds}
            </div>
          )}
          {phase === "setup" && onExit && (
            <button className="pop-btn" onClick={onExit} style={styles.backBtn}>
              ← モード選択に戻る
            </button>
          )}
        </header>

        {phase === "setup" && (
          <SetupScreen
            mode={mode}
            setMode={setMode}
            playerNames={playerNames}
            updateName={updateName}
            addPlayer={addPlayer}
            removePlayer={removePlayer}
            totalRounds={totalRounds}
            setTotalRounds={setTotalRounds}
            canStart={canStart}
            handleStart={handleStart}
          />
        )}

        {phase === "playing" && topic && (
          <PlayingScreen
            players={players}
            topic={topic}
            revealed={revealed}
            timeLeft={timeLeft}
            timerColor={timerColor}
            answeredIds={answeredIds}
            answeringId={answeringId}
            checkingIds={checkingIds}
            openAnswerBox={openAnswerBox}
            inputValue={inputValue}
            setInputValue={setInputValue}
            submitAnswer={submitAnswer}
            inputRef={inputRef}
            toast={toast}
          />
        )}

        {phase === "roundResult" && (
          <RoundResultScreen
            players={players}
            topic={topic}
            rankedAnswers={rankedAnswers}
            pointsFor={pointsFor}
            isLastRound={currentRound >= totalRounds}
            onContinue={applyScoresAndContinue}
          />
        )}

        {phase === "gameOver" && (
          <GameOverScreen sortedFinal={sortedFinal} onReset={resetGame} />
        )}
      </div>
    </div>
  );
}

// ================= サブコンポーネント =================

function SetupScreen({
  mode, setMode, playerNames, updateName, addPlayer, removePlayer,
  totalRounds, setTotalRounds, canStart, handleStart,
}) {
  return (
    <div style={{ ...styles.card, animation: "popIn .35s ease" }}>
      <div style={styles.modeToggle}>
        <button
          className="pop-btn"
          onClick={() => setMode("multi")}
          style={{
            ...styles.toggleBtn,
            ...(mode === "multi" ? styles.toggleBtnActive : {}),
          }}
        >
          👥 みんなで対戦
        </button>
        <button
          className="pop-btn"
          onClick={() => setMode("solo")}
          style={{
            ...styles.toggleBtn,
            ...(mode === "solo" ? styles.toggleBtnActive : {}),
          }}
        >
          🧍 ひとりで練習
        </button>
      </div>

      {mode === "multi" ? (
        <div style={{ marginTop: 18 }}>
          <div style={styles.sectionLabel}>プレイヤー（2〜10人）</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {playerNames.map((name, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={styles.playerNum}>{i + 1}</div>
                <input
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  placeholder={`プレイヤー${i + 1}の名前`}
                  style={styles.input}
                  maxLength={10}
                />
                {playerNames.length > 2 && (
                  <button
                    className="pop-btn"
                    onClick={() => removePlayer(i)}
                    style={styles.removeBtn}
                    aria-label="このプレイヤーを削除"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {playerNames.length < 10 && (
            <button className="pop-btn" onClick={addPlayer} style={styles.addBtn}>
              ＋ プレイヤーを追加
            </button>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <div style={styles.sectionLabel}>あなたの名前（省略可）</div>
          <input
            value={playerNames[0]}
            onChange={(e) => updateName(0, e.target.value)}
            placeholder="プレイヤー"
            style={styles.input}
            maxLength={10}
          />
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <div style={styles.sectionLabel}>ラウンド数</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[5, 7, 10].map((n) => (
            <button
              key={n}
              className="pop-btn"
              onClick={() => setTotalRounds(n)}
              style={{
                ...styles.roundOption,
                ...(totalRounds === n ? styles.roundOptionActive : {}),
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        className="pop-btn"
        disabled={!canStart}
        onClick={handleStart}
        style={{
          ...styles.startBtn,
          ...(canStart ? {} : { opacity: 0.5, cursor: "not-allowed" }),
        }}
      >
        スタート！ 🚀
      </button>

      <p style={styles.helpText}>
        あそびかた：お題（頭文字・文字数）が発表されたら、条件に合う言葉を考えて自分の名前ボタンを押して回答しよう。
        早く正解するほど高得点！制限時間は30秒。
      </p>
    </div>
  );
}

function PlayingScreen({
  players, topic, revealed, timeLeft, timerColor, answeredIds, answeringId,
  checkingIds, openAnswerBox, inputValue, setInputValue, submitAnswer, inputRef, toast,
}) {
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - timeLeft / 30);

  return (
    <div style={{ position: "relative" }}>
      {/* お題カード */}
      <div style={{ ...styles.topicCard, animation: revealed ? "flipIn .5s ease" : "none", opacity: revealed ? 1 : 0 }}>
        <div style={styles.topicLabel}>おだい</div>
        <div style={styles.topicRow}>
          <div style={styles.topicChunk}>
            <div style={styles.topicChunkLabel}>頭文字</div>
            <div style={styles.topicChar}>{revealed ? topic.char : "？"}</div>
          </div>
          <div style={styles.topicChunk}>
            <div style={styles.topicChunkLabel}>文字数</div>
            <div style={styles.topicChar}>{revealed ? `${topic.len}文字` : "？"}</div>
          </div>
        </div>
        <div style={styles.apiBadge}>🌐 実在判定：オンライン辞書API（自動フォールバックあり）</div>
      </div>

      {/* タイマーリング */}
      <div style={styles.timerWrap}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" stroke="#3a2960" strokeWidth="10" fill="none" />
          <circle
            cx="50" cy="50" r="42"
            stroke={timerColor}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1s linear, stroke .3s" }}
          />
          <text x="50" y="57" textAnchor="middle" fontSize="26" fontWeight="800" fill="#FFF8EC" fontFamily="Fredoka, sans-serif">
            {timeLeft}
          </text>
        </svg>
      </div>

      {/* プレイヤーリスト */}
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {players.map((p) => {
          const done = answeredIds.has(p.id);
          const isAnswering = answeringId === p.id;
          const isChecking = checkingIds.has(p.id);
          return (
            <div key={p.id} style={styles.playerRow}>
              <div style={styles.playerRowLeft}>
                <span style={styles.playerRowScore}>{p.score}pt</span>
                <span style={styles.playerRowName}>{p.name}</span>
              </div>
              {isChecking ? (
                <div style={styles.checkingBadge}>
                  <span style={styles.spinner} />
                  辞書に確認中…
                </div>
              ) : !isAnswering ? (
                <button
                  className="pop-btn"
                  onClick={() => openAnswerBox(p.id)}
                  disabled={done}
                  style={{
                    ...styles.answerBtn,
                    ...(done ? styles.answerBtnDone : {}),
                  }}
                >
                  {done ? "回答ずみ ✓" : "回答する ✋"}
                </button>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      // 日本語入力（IME）で変換・確定中のEnterは無視する
                      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        submitAnswer(p.id);
                      }
                    }}
                    placeholder="ひらがなで入力"
                    style={styles.answerInput}
                  />
                  <button
                    type="button"
                    className="pop-btn"
                    onClick={() => submitAnswer(p.id)}
                    style={styles.submitBtn}
                  >
                    決定
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toast && (
        <div
          style={{
            ...styles.toast,
            background: toast.ok ? "#2EC4B6" : "#FF5D8F",
            animation: "toastSlide 1.8s ease forwards",
          }}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

function RoundResultScreen({ players, topic, rankedAnswers, pointsFor, isLastRound, onContinue, hideButton }) {
  const nameOf = (id) => players.find((p) => p.id === id)?.name || "?";
  return (
    <div style={{ ...styles.card, animation: "popIn .35s ease" }}>
      <div style={styles.sectionLabel}>
        ラウンド結果 — 「{topic.char}」で始まる{topic.len}文字の言葉
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {rankedAnswers.correctOnes.map((a, i) => (
          <div key={a.playerId} style={styles.resultRow}>
            <span style={styles.resultRank}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}位`}</span>
            <span style={styles.resultName}>{nameOf(a.playerId)}</span>
            <span style={styles.resultWord}>「{a.word}」</span>
            <span style={styles.resultPoint}>+{pointsFor(i)}pt</span>
          </div>
        ))}
        {rankedAnswers.wrongOnes.map((a) => (
          <div key={a.playerId} style={{ ...styles.resultRow, opacity: 0.6 }}>
            <span style={styles.resultRank}>✗</span>
            <span style={styles.resultName}>{nameOf(a.playerId)}</span>
            <span style={styles.resultWord}>「{a.word}」不正解</span>
            <span style={styles.resultPoint}>+0pt</span>
          </div>
        ))}
        {rankedAnswers.noAnswer.map((a) => (
          <div key={a.playerId} style={{ ...styles.resultRow, opacity: 0.5 }}>
            <span style={styles.resultRank}>—</span>
            <span style={styles.resultName}>{nameOf(a.playerId)}</span>
            <span style={styles.resultWord}>タイムアップ</span>
            <span style={styles.resultPoint}>+0pt</span>
          </div>
        ))}
      </div>
      {hideButton ? (
        <p style={styles.helpText}>ホストが次のラウンドを準備しています…</p>
      ) : (
        <button className="pop-btn" onClick={onContinue} style={styles.startBtn}>
          {isLastRound ? "最終結果を見る 🏁" : "次のラウンドへ ▶"}
        </button>
      )}
    </div>
  );
}

function GameOverScreen({ sortedFinal, onReset }) {
  return (
    <div style={{ ...styles.card, animation: "popIn .4s ease" }}>
      <div style={{ ...styles.sectionLabel, fontSize: 20, textAlign: "center" }}>🎉 ゲーム終了！ 🎉</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {sortedFinal.map((p, i) => (
          <div
            key={p.id}
            style={{
              ...styles.resultRow,
              background: i === 0 ? "#FFD23F" : "#FFF8EC",
              fontWeight: i === 0 ? 900 : 700,
            }}
          >
            <span style={styles.resultRank}>{i === 0 ? "👑" : `${i + 1}位`}</span>
            <span style={{ ...styles.resultName, flex: 1 }}>{p.name}</span>
            <span style={styles.resultPoint}>{p.score}pt</span>
          </div>
        ))}
      </div>
      <button className="pop-btn" onClick={onReset} style={styles.startBtn}>
        もう一度あそぶ 🔄
      </button>
    </div>
  );
}

// ================= オンライン対戦（Firebase Realtime Database） =================
//
// データ構造: rooms/{roomCode}
//   status: "lobby" | "playing" | "roundResult" | "gameOver"
//   hostId, totalRounds, currentRound, topic, roundId, roundStartAt(サーバー時刻)
//   usedCombos: [...], players: { [id]: {name, score} }, answers: { [roundId]: { [id]: {...} } }
//
// 判定の公平性のため、回答の並び順は「サーバーに書き込まれた時刻」を使う。
// ラウンドの終了判定・得点計算は部屋の作成者（ホスト）の端末だけが行う。

function makeRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}
function makePlayerId() {
  return "p_" + Math.random().toString(36).slice(2, 10);
}

function OnlineGame({ onExit }) {
  const [dbApi, setDbApi] = useState(null); // firebase/database の関数一式（動的import）
  const [loadError, setLoadError] = useState(null);
  const [sub, setSub] = useState("home"); // home | join | room
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [roomCode, setRoomCode] = useState(null);
  const [myId, setMyId] = useState(null);
  const [room, setRoom] = useState(null); // 部屋のスナップショット
  const [inputValue, setInputValue] = useState("");
  const [toast, setToast] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [checking, setChecking] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const offsetRef = useRef(0); // サーバー時刻とのズレ(ms)
  const roundIdSeenRef = useRef(0);
  const roomRef = useRef(null);
  const unsubRef = useRef(null);
  const finalizingRef = useRef(false);

  // firebase/database を動的import（未設定でもアプリ全体が壊れないように）
  useEffect(() => {
    let mounted = true;
    import("firebase/database")
      .then(async (mod) => {
        const { db } = await import("./firebase.js");
        if (!mounted) return;
        setDbApi({ ...mod, db });
        const offRef = mod.ref(db, ".info/serverTimeOffset");
        mod.onValue(offRef, (snap) => {
          offsetRef.current = snap.val() || 0;
        });
      })
      .catch((e) => {
        if (mounted) setLoadError(e?.message || "Firebaseの読み込みに失敗しました");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const serverNow = () => Date.now() + offsetRef.current;

  // ---------- 部屋を作る ----------
  const createRoom = async () => {
    if (!dbApi || busy) return;
    const trimmed = name.trim() || "ホスト";
    setBusy(true);
    setErrorMsg("");
    try {
      const { db, ref, set, get, serverTimestamp } = dbApi;
      let code = makeRoomCode();
      // 衝突チェック（簡易）
      for (let i = 0; i < 5; i++) {
        const snap = await get(ref(db, `rooms/${code}`));
        if (!snap.exists()) break;
        code = makeRoomCode();
      }
      const pid = makePlayerId();
      await set(ref(db, `rooms/${code}`), {
        status: "lobby",
        hostId: pid,
        totalRounds: 7,
        currentRound: 0,
        topic: null,
        roundId: 0,
        roundStartAt: null,
        usedCombos: [],
        players: { [pid]: { name: trimmed, score: 0 } },
        answers: {},
        createdAt: serverTimestamp(),
      });
      setRoomCode(code);
      setMyId(pid);
      setSub("room");
    } catch (e) {
      setErrorMsg("部屋の作成に失敗しました。Firebaseの設定を確認してください。");
    } finally {
      setBusy(false);
    }
  };

  // ---------- 部屋に参加する ----------
  const joinRoom = async () => {
    if (!dbApi || busy) return;
    const code = joinCode.trim();
    const trimmed = name.trim() || "プレイヤー";
    if (!code) {
      setErrorMsg("ルームコードを入力してね");
      return;
    }
    setBusy(true);
    setErrorMsg("");
    try {
      const { db, ref, get, set } = dbApi;
      const snap = await get(ref(db, `rooms/${code}`));
      if (!snap.exists()) {
        setErrorMsg("そのルームコードは見つからなかったよ");
        setBusy(false);
        return;
      }
      const val = snap.val();
      if (val.status !== "lobby") {
        setErrorMsg("このルームはもう始まっているみたい");
        setBusy(false);
        return;
      }
      const pid = makePlayerId();
      await set(ref(db, `rooms/${code}/players/${pid}`), { name: trimmed, score: 0 });
      setRoomCode(code);
      setMyId(pid);
      setSub("room");
    } catch (e) {
      setErrorMsg("参加に失敗しました。通信環境を確認してください。");
    } finally {
      setBusy(false);
    }
  };

  // ---------- 部屋の状態を購読 ----------
  useEffect(() => {
    if (!dbApi || !roomCode) return;
    const { db, ref, onValue } = dbApi;
    const rRef = ref(db, `rooms/${roomCode}`);
    roomRef.current = rRef;
    const unsub = onValue(rRef, (snap) => {
      setRoom(snap.val());
    });
    unsubRef.current = unsub;
    return () => {
      unsub && unsub();
    };
  }, [dbApi, roomCode]);

  // ラウンドが切り替わったら演出・入力欄をリセット
  useEffect(() => {
    if (!room) return;
    if (room.roundId && room.roundId !== roundIdSeenRef.current) {
      roundIdSeenRef.current = room.roundId;
      finalizingRef.current = false;
      setInputValue("");
      setRevealed(false);
      setChecking(false);
      setTimeout(() => setRevealed(true), 350);
    }
  }, [room]);

  // タイマー表示の更新（サーバー時刻基準）
  useEffect(() => {
    if (!room || room.status !== "playing" || !room.roundStartAt) return;
    const tick = () => {
      const elapsedSec = Math.floor((serverNow() - room.roundStartAt) / 1000);
      setTimeLeft(Math.max(0, ROUND_SECONDS - elapsedSec));
    };
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [room?.status, room?.roundStartAt, room?.roundId]);

  const isHost = room && myId && room.hostId === myId;
  const playersArr = useMemo(
    () => (room?.players ? Object.entries(room.players).map(([id, p]) => ({ id, ...p })) : []),
    [room]
  );
  const myAnswers = room?.answers?.[room?.roundId] || {};
  const answeredCount = Object.keys(myAnswers).length;
  const hasAnswered = myId ? Boolean(myAnswers[myId]) : false;

  // ---------- ホスト操作：ラウンド開始 ----------
  const hostStartRound = async (nextRoundNum, used) => {
    if (!dbApi || !isHost) return;
    const { db, ref, update, serverTimestamp } = dbApi;
    const t = pickTopic(used);
    const nextRoundId = (room.roundId || 0) + 1;
    await update(ref(db, `rooms/${roomCode}`), {
      status: "playing",
      currentRound: nextRoundNum,
      topic: t,
      roundId: nextRoundId,
      roundStartAt: serverTimestamp(),
      usedCombos: [...(room.usedCombos || []), t.key].slice(-8),
    });
  };

  const hostBeginGame = async () => {
    if (!dbApi || !isHost || !room) return;
    await hostStartRound(1, []);
  };

  // ---------- ホスト操作：ラウンド終了→採点 ----------
  const hostFinishRound = async () => {
    if (!dbApi || !isHost || !room || finalizingRef.current) return;
    finalizingRef.current = true;
    const { db, ref, update } = dbApi;
    const answers = room.answers?.[room.roundId] || {};
    const correctOnes = Object.entries(answers)
      .filter(([, a]) => a.correct)
      .sort((a, b) => (a[1].serverTime || 0) - (b[1].serverTime || 0));

    const scoreUpdates = {};
    correctOnes.forEach(([pid], idx) => {
      const cur = room.players?.[pid]?.score || 0;
      scoreUpdates[`players/${pid}/score`] = cur + pointsFor(idx);
    });
    await update(ref(db, `rooms/${roomCode}`), {
      status: "roundResult",
      ...scoreUpdates,
    });
  };

  // ホストのみ：時間切れ or 全員回答済みでラウンド終了
  useEffect(() => {
    if (!isHost || !room || room.status !== "playing") return;
    const allAnswered = playersArr.length > 0 && answeredCount >= playersArr.length;
    if (allAnswered || timeLeft <= 0) {
      hostFinishRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, room?.status, answeredCount, timeLeft, playersArr.length]);

  const hostNextOrEnd = async () => {
    if (!dbApi || !isHost || !room) return;
    if (room.currentRound >= room.totalRounds) {
      const { db, ref, update } = dbApi;
      await update(ref(db, `rooms/${roomCode}`), { status: "gameOver" });
    } else {
      await hostStartRound(room.currentRound + 1, room.usedCombos || []);
    }
  };

  // ---------- 自分の回答送信 ----------
  const submitMyAnswer = async () => {
    if (!dbApi || !room?.topic || hasAnswered) return;
    const raw = inputValue;
    const norm = normalize(raw);
    const chars = Array.from(norm);
    const { db, ref, set, serverTimestamp } = dbApi;
    const path = `rooms/${roomCode}/answers/${room.roundId}/${myId}`;
    setInputValue("");

    if (chars.length === 0) {
      setToast({ text: "文字を入力してね", ok: false });
      setTimeout(() => setToast(null), 1400);
      return;
    }
    if (chars[0] !== room.topic.char) {
      await set(ref(db, path), {
        word: raw, correct: false,
        reason: `「${room.topic.char}」から始まっていないよ`,
        serverTime: serverTimestamp(),
      });
      return;
    }
    if (chars.length !== room.topic.len) {
      await set(ref(db, path), {
        word: raw, correct: false,
        reason: `${room.topic.len}文字にしてね（今は${chars.length}文字）`,
        serverTime: serverTimestamp(),
      });
      return;
    }

    setChecking(true);
    const result = await checkWordExistsOnline(norm);
    setChecking(false);
    const correct = result.exists === true || WORD_SET.has(norm);
    await set(ref(db, path), {
      word: raw,
      correct,
      reason: correct ? "" : "オンライン辞書に見つからなかったよ",
      checkedVia: result.source,
      serverTime: serverTimestamp(),
    });
  };

  const leaveRoom = async () => {
    try {
      if (dbApi && roomCode && myId) {
        const { db, ref, remove } = dbApi;
        await remove(ref(db, `rooms/${roomCode}/players/${myId}`));
      }
    } catch (e) {}
    setRoomCode(null);
    setRoom(null);
    setMyId(null);
    setSub("home");
  };

  const sortedFinal = useMemo(() => [...playersArr].sort((a, b) => b.score - a.score), [playersArr]);
  const timerPct = timeLeft / ROUND_SECONDS;
  const timerColor = timerPct > 0.5 ? "#2EC4B6" : timerPct > 0.2 ? "#FFD23F" : "#FF5D8F";

  return (
    <div style={styles.app}>
      <style>{`
        @import url('${buildFontLink()}');
        * { box-sizing: border-box; }
        .pop-btn { transition: transform .12s ease, box-shadow .12s ease, filter .12s ease; cursor: pointer; }
        .pop-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .pop-btn:active { transform: translateY(1px) scale(0.98); }
        @keyframes popIn { 0% { transform: scale(.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes flipIn { 0% { transform: rotateY(90deg) scale(.85); opacity: 0; } 60% { transform: rotateY(-8deg) scale(1.03); opacity: 1; } 100% { transform: rotateY(0deg) scale(1); opacity: 1; } }
        @keyframes toastSlide { 0% { transform: translate(-50%, 20px); opacity: 0; } 15% { transform: translate(-50%, 0); opacity: 1; } 85% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, -10px); opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ ...styles.blob, top: -60, left: -40, background: "#FF5D8F" }} />
      <div style={{ ...styles.blob, bottom: -70, right: -50, background: "#2EC4B6" }} />
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>⚡</span>
            <h1 style={styles.title}>オンライン対戦</h1>
          </div>
          {room?.status && room.status !== "lobby" && (
            <div style={styles.roundBadge}>ラウンド {room.currentRound} / {room.totalRounds}</div>
          )}
          <button className="pop-btn" onClick={sub === "room" ? leaveRoom : onExit} style={styles.backBtn}>
            ← {sub === "room" ? "退出する" : "モード選択に戻る"}
          </button>
        </header>

        {loadError && (
          <div style={{ ...styles.card, color: "#c9457a", fontWeight: 800 }}>
            Firebaseの読み込みに失敗しました：{loadError}
            <br />firebase パッケージのインストールと src/firebase.js の設定を確認してください。
          </div>
        )}

        {!loadError && sub === "home" && (
          <div style={{ ...styles.card, animation: "popIn .35s ease" }}>
            <div style={styles.sectionLabel}>あなたの名前</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="プレイヤー"
              style={styles.input}
              maxLength={10}
            />
            <button
              className="pop-btn"
              onClick={createRoom}
              disabled={!dbApi || busy}
              style={{ ...styles.startBtn, opacity: !dbApi || busy ? 0.6 : 1 }}
            >
              🎉 ルームを作る（ホストになる）
            </button>
            <button
              className="pop-btn"
              onClick={() => setSub("join")}
              style={{ ...styles.roundOption, marginTop: 12, width: "100%" }}
            >
              🔑 ルームコードで参加する
            </button>
            {errorMsg && <p style={{ color: "#c9457a", fontWeight: 800, marginTop: 10 }}>{errorMsg}</p>}
          </div>
        )}

        {!loadError && sub === "join" && (
          <div style={{ ...styles.card, animation: "popIn .35s ease" }}>
            <div style={styles.sectionLabel}>あなたの名前</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="プレイヤー"
              style={styles.input}
              maxLength={10}
            />
            <div style={{ ...styles.sectionLabel, marginTop: 16 }}>ルームコード（4桁）</div>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="1234"
              style={{ ...styles.input, letterSpacing: 4, fontSize: 22, textAlign: "center" }}
              maxLength={4}
            />
            <button
              className="pop-btn"
              onClick={joinRoom}
              disabled={!dbApi || busy}
              style={{ ...styles.startBtn, opacity: !dbApi || busy ? 0.6 : 1 }}
            >
              参加する 🚪
            </button>
            <button className="pop-btn" onClick={() => setSub("home")} style={{ ...styles.addBtn, marginTop: 10 }}>
              戻る
            </button>
            {errorMsg && <p style={{ color: "#c9457a", fontWeight: 800, marginTop: 10 }}>{errorMsg}</p>}
          </div>
        )}

        {!loadError && sub === "room" && room && room.status === "lobby" && (
          <div style={{ ...styles.card, animation: "popIn .35s ease" }}>
            <div style={styles.sectionLabel}>ルームコード（友達に伝えてね）</div>
            <div style={styles.roomCodeBig}>{roomCode}</div>
            <div style={{ ...styles.sectionLabel, marginTop: 18 }}>参加者（{playersArr.length}人）</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {playersArr.map((p) => (
                <div key={p.id} style={styles.playerRow}>
                  <span style={styles.playerRowName}>
                    {p.name} {p.id === room.hostId ? "👑" : ""}
                  </span>
                </div>
              ))}
            </div>
            {isHost ? (
              <>
                <div style={{ ...styles.sectionLabel, marginTop: 18 }}>ラウンド数</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[5, 7, 10].map((n) => (
                    <button
                      key={n}
                      className="pop-btn"
                      onClick={() =>
                        dbApi &&
                        dbApi.update(dbApi.ref(dbApi.db, `rooms/${roomCode}`), { totalRounds: n })
                      }
                      style={{
                        ...styles.roundOption,
                        ...(room.totalRounds === n ? styles.roundOptionActive : {}),
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button className="pop-btn" onClick={hostBeginGame} style={styles.startBtn}>
                  ゲーム開始！ 🚀
                </button>
              </>
            ) : (
              <p style={styles.helpText}>ホストがゲームを開始するのを待っています…</p>
            )}
          </div>
        )}

        {!loadError && sub === "room" && room && room.status === "playing" && room.topic && (
          <div style={{ position: "relative" }}>
            <div style={{ ...styles.topicCard, animation: revealed ? "flipIn .5s ease" : "none", opacity: revealed ? 1 : 0 }}>
              <div style={styles.topicLabel}>おだい</div>
              <div style={styles.topicRow}>
                <div style={styles.topicChunk}>
                  <div style={styles.topicChunkLabel}>頭文字</div>
                  <div style={styles.topicChar}>{revealed ? room.topic.char : "？"}</div>
                </div>
                <div style={styles.topicChunk}>
                  <div style={styles.topicChunkLabel}>文字数</div>
                  <div style={styles.topicChar}>{revealed ? `${room.topic.len}文字` : "？"}</div>
                </div>
              </div>
            </div>

            <div style={styles.timerWrap}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#3a2960" strokeWidth="10" fill="none" />
                <circle
                  cx="50" cy="50" r="42" stroke={timerColor} strokeWidth="10" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - timeLeft / ROUND_SECONDS)}
                  transform="rotate(-90 50 50)"
                  style={{ transition: "stroke-dashoffset .25s linear, stroke .3s" }}
                />
                <text x="50" y="57" textAnchor="middle" fontSize="26" fontWeight="800" fill="#FFF8EC" fontFamily="Fredoka, sans-serif">
                  {timeLeft}
                </text>
              </svg>
            </div>

            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {playersArr.map((p) => {
                const answered = Boolean(myAnswers[p.id]);
                const isMe = p.id === myId;
                return (
                  <div key={p.id} style={styles.playerRow}>
                    <div style={styles.playerRowLeft}>
                      <span style={styles.playerRowScore}>{p.score}pt</span>
                      <span style={styles.playerRowName}>{p.name}{isMe ? "（あなた）" : ""}</span>
                    </div>
                    {isMe ? (
                      checking ? (
                        <div style={styles.checkingBadge}>
                          <span style={styles.spinner} />辞書に確認中…
                        </div>
                      ) : hasAnswered ? (
                        <span style={{ ...styles.answerBtn, ...styles.answerBtnDone }}>回答ずみ ✓</span>
                      ) : (
                        <div style={{ display: "flex", gap: 6 }}>
                          <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                submitMyAnswer();
                              }
                            }}
                            placeholder="ひらがなで入力"
                            style={styles.answerInput}
                          />
                          <button type="button" className="pop-btn" onClick={submitMyAnswer} style={styles.submitBtn}>
                            決定
                          </button>
                        </div>
                      )
                    ) : (
                      <span style={{ ...styles.answerBtn, ...styles.answerBtnDone }}>
                        {answered ? "回答ずみ ✓" : "考え中…"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {toast && (
              <div style={{ ...styles.toast, background: toast.ok ? "#2EC4B6" : "#FF5D8F", animation: "toastSlide 1.8s ease forwards" }}>
                {toast.text}
              </div>
            )}
          </div>
        )}

        {!loadError && sub === "room" && room && room.status === "roundResult" && (
          <RoundResultScreen
            players={playersArr}
            topic={room.topic}
            rankedAnswers={(() => {
              const answers = room.answers?.[room.roundId] || {};
              const list = Object.entries(answers).map(([pid, a]) => ({ playerId: pid, ...a }));
              const correctOnes = list.filter((a) => a.correct).sort((a, b) => (a.serverTime || 0) - (b.serverTime || 0));
              const wrongOnes = list.filter((a) => !a.correct);
              const noAnswer = playersArr
                .filter((p) => !list.some((a) => a.playerId === p.id))
                .map((p) => ({ playerId: p.id }));
              return { correctOnes, wrongOnes, noAnswer };
            })()}
            pointsFor={pointsFor}
            isLastRound={room.currentRound >= room.totalRounds}
            onContinue={isHost ? hostNextOrEnd : () => {}}
            hideButton={!isHost}
          />
        )}

        {!loadError && sub === "room" && room && room.status === "gameOver" && (
          <GameOverScreen sortedFinal={sortedFinal} onReset={leaveRoom} />
        )}
      </div>
    </div>
  );
}

// ================= スタイル定義 =================
const styles = {
  app: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #241443 0%, #3a2166 45%, #5a2f8f 100%)",
    fontFamily: "'Nunito', 'Hiragino Sans', sans-serif",
    padding: "24px 14px 60px",
    position: "relative",
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: "50%",
    filter: "blur(10px)",
    opacity: 0.28,
    pointerEvents: "none",
  },
  container: {
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    flexWrap: "wrap",
    gap: 8,
  },
  logoRow: { display: "flex", alignItems: "center", gap: 8 },
  logoIcon: { fontSize: 28 },
  title: {
    color: "#FFF8EC",
    fontFamily: "'Fredoka', 'Nunito', sans-serif",
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    letterSpacing: 0.3,
  },
  roundBadge: {
    background: "#FFD23F",
    color: "#241443",
    fontWeight: 800,
    fontSize: 13,
    padding: "6px 12px",
    borderRadius: 999,
  },
  card: {
    background: "#FFF8EC",
    borderRadius: 24,
    padding: "22px 20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  },
  modeToggle: { display: "flex", gap: 8 },
  toggleBtn: {
    flex: 1,
    padding: "12px 8px",
    borderRadius: 14,
    border: "2px solid #e4dcc9",
    background: "#fff",
    color: "#6b5d8f",
    fontWeight: 800,
    fontSize: 14,
  },
  toggleBtnActive: {
    background: "#241443",
    color: "#FFD23F",
    border: "2px solid #241443",
  },
  modeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    padding: "16px 18px",
    borderRadius: 16,
    border: "none",
    background: "#241443",
    color: "#fff",
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    fontSize: 17,
    textAlign: "left",
  },
  modeCardSub: {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: 12,
    opacity: 0.75,
  },
  backBtn: {
    padding: "6px 12px",
    borderRadius: 999,
    border: "2px solid rgba(255,248,236,0.4)",
    background: "transparent",
    color: "#FFF8EC",
    fontWeight: 800,
    fontSize: 12,
  },
  roomCodeBig: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: 44,
    fontWeight: 700,
    letterSpacing: 8,
    color: "#241443",
    textAlign: "center",
    background: "#FFD23F",
    borderRadius: 16,
    padding: "10px 0",
  },
  sectionLabel: {
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    color: "#241443",
    fontSize: 14,
    marginBottom: 8,
  },
  playerNum: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#2EC4B6",
    color: "#fff",
    fontWeight: 800,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "2px solid #e4dcc9",
    fontSize: 15,
    fontWeight: 700,
    color: "#241443",
    background: "#fff",
  },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    border: "none",
    background: "#FF5D8F",
    color: "#fff",
    fontWeight: 800,
    flexShrink: 0,
  },
  addBtn: {
    marginTop: 10,
    width: "100%",
    padding: "10px",
    borderRadius: 12,
    border: "2px dashed #b9aee0",
    background: "transparent",
    color: "#6b5d8f",
    fontWeight: 800,
  },
  roundOption: {
    flex: 1,
    padding: "10px",
    borderRadius: 12,
    border: "2px solid #e4dcc9",
    background: "#fff",
    color: "#6b5d8f",
    fontWeight: 800,
    fontSize: 16,
  },
  roundOptionActive: {
    background: "#2EC4B6",
    color: "#fff",
    border: "2px solid #2EC4B6",
  },
  startBtn: {
    marginTop: 22,
    width: "100%",
    padding: "16px",
    borderRadius: 16,
    border: "none",
    background: "linear-gradient(135deg, #FF5D8F, #FFD23F)",
    color: "#241443",
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 700,
    fontSize: 18,
    boxShadow: "0 6px 0 #c9457a",
  },
  helpText: {
    marginTop: 16,
    fontSize: 12.5,
    color: "#7a6f99",
    lineHeight: 1.6,
  },
  topicCard: {
    background: "#FFF8EC",
    borderRadius: 24,
    padding: "22px 16px",
    textAlign: "center",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    perspective: 600,
  },
  topicLabel: {
    fontFamily: "'Fredoka', sans-serif",
    color: "#b9aee0",
    fontWeight: 700,
    letterSpacing: 4,
    fontSize: 12,
  },
  topicRow: { display: "flex", justifyContent: "center", gap: 28, marginTop: 8 },
  topicChunk: { display: "flex", flexDirection: "column", alignItems: "center" },
  topicChunkLabel: { fontSize: 12, color: "#9088ad", fontWeight: 800, marginBottom: 2 },
  topicChar: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: 48,
    fontWeight: 700,
    color: "#241443",
    lineHeight: 1.1,
  },
  timerWrap: { display: "flex", justifyContent: "center", marginTop: -20, marginBottom: -8 },
  playerRow: {
    background: "rgba(255,248,236,0.95)",
    borderRadius: 16,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  playerRowLeft: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  playerRowScore: {
    background: "#241443",
    color: "#FFD23F",
    fontWeight: 800,
    fontSize: 11,
    padding: "3px 8px",
    borderRadius: 999,
    flexShrink: 0,
  },
  playerRowName: {
    fontWeight: 800,
    color: "#241443",
    fontSize: 15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  answerBtn: {
    padding: "9px 14px",
    borderRadius: 12,
    border: "none",
    background: "#2EC4B6",
    color: "#fff",
    fontWeight: 800,
    fontSize: 13,
    flexShrink: 0,
  },
  answerBtnDone: { background: "#cfc7e6", color: "#8f88ad" },
  apiBadge: {
    marginTop: 10,
    fontSize: 10.5,
    color: "#9088ad",
    fontWeight: 700,
  },
  checkingBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 14px",
    borderRadius: 12,
    background: "#efe9ff",
    color: "#6b5d8f",
    fontWeight: 800,
    fontSize: 12.5,
    flexShrink: 0,
  },
  spinner: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    border: "2px solid #b9aee0",
    borderTopColor: "#6b5d8f",
    display: "inline-block",
    animation: "spin .7s linear infinite",
  },
  answerInput: {
    width: 120,
    padding: "8px 10px",
    borderRadius: 10,
    border: "2px solid #241443",
    fontWeight: 700,
    fontSize: 14,
  },
  submitBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    background: "#FFD23F",
    color: "#241443",
    fontWeight: 800,
    fontSize: 13,
  },
  toast: {
    position: "fixed",
    left: "50%",
    bottom: 30,
    transform: "translateX(-50%)",
    color: "#fff",
    fontWeight: 800,
    padding: "12px 20px",
    borderRadius: 14,
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    zIndex: 10,
    maxWidth: "88%",
    textAlign: "center",
  },
  resultRow: {
    background: "#fff",
    borderRadius: 14,
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
    color: "#241443",
  },
  resultRank: { width: 28, textAlign: "center", fontSize: 16 },
  resultName: { fontWeight: 800 },
  resultWord: { flex: 1, color: "#6b5d8f", fontSize: 13 },
  resultPoint: { fontWeight: 900, color: "#c9457a" },
};
