// シンプルなBGM（外部音源ファイル不要／Web Audio APIでその場生成）
// ブラウザの自動再生制限があるため、ユーザーの操作（ボタンクリック）をきっかけに再生を開始する。

let audioCtx = null;
let isPlaying = false;
let schedulerTimer = null;
let nextNoteTime = 0;
let noteIndex = 0;

const TEMPO = 128; // BPM
const NOTE_DURATION = 60 / TEMPO / 2; // 8分音符ぶんの長さ（秒）
const LOOKAHEAD_MS = 50; // どのくらいの頻度でスケジューリングするか
const SCHEDULE_AHEAD_SEC = 0.15; // どのくらい先の音まで予約しておくか

// ポップで明るい雰囲気のコード進行（C → G → Am → F）をアルペジオで鳴らす
const PATTERN = [
  261.63, 329.63, 392.0, 329.63, // C
  392.0, 493.88, 587.33, 493.88, // G
  440.0, 523.25, 659.25, 523.25, // Am
  349.23, 440.0, 523.25, 440.0, // F
];

function scheduleNote(freq, time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.1, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + NOTE_DURATION * 0.9);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + NOTE_DURATION);
}

function scheduler() {
  if (!audioCtx) return;
  while (nextNoteTime < audioCtx.currentTime + SCHEDULE_AHEAD_SEC) {
    scheduleNote(PATTERN[noteIndex % PATTERN.length], nextNoteTime);
    nextNoteTime += NOTE_DURATION;
    noteIndex++;
  }
}

export function startBgm() {
  if (isPlaying) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return; // 対応していないブラウザでは何もしない
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") audioCtx.resume();
  isPlaying = true;
  nextNoteTime = audioCtx.currentTime + 0.1;
  noteIndex = 0;
  schedulerTimer = setInterval(scheduler, LOOKAHEAD_MS);
}

export function stopBgm() {
  isPlaying = false;
  if (schedulerTimer) clearInterval(schedulerTimer);
  schedulerTimer = null;
}

export function toggleBgm() {
  if (isPlaying) stopBgm();
  else startBgm();
  return isPlaying;
}

export function isBgmOn() {
  return isPlaying;
}
