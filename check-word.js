// Vercel Serverless Function
// ブラウザから直接 Jisho / Wiktionary を叩くとCORSで失敗することがあるため、
// このAPIルートを経由してサーバー側から問い合わせる（サーバー間通信はCORSの影響を受けない）。
//
// 呼び出し例: GET /api/check-word?word=さくら
// 戻り値: { exists: true|false|null, source: "jisho"|"wiktionary"|"offline" }

export default async function handler(req, res) {
  const word = (req.query.word || "").toString().trim();

  if (!word) {
    res.status(400).json({ exists: null, source: "invalid", error: "word is required" });
    return;
  }

  // 1) Jisho.org API：読み仮名 or 見出し語の完全一致を確認
  try {
    const r = await fetch(
      `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`,
      { headers: { "User-Agent": "hayaoshi-word-game/1.0" } }
    );
    if (r.ok) {
      const data = await r.json();
      if (data && Array.isArray(data.data)) {
        const found = data.data.some(
          (entry) =>
            Array.isArray(entry.japanese) &&
            entry.japanese.some((j) => j.reading === word || j.word === word)
        );
        if (found) {
          res.status(200).json({ exists: true, source: "jisho" });
          return;
        }
      }
    }
  } catch (e) {
    // 到達不可 → 次のソースへ
  }

  // 2) Wiktionary（日本語版）：ページの有無で存在確認
  try {
    const r2 = await fetch(
      `https://ja.wiktionary.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`,
      { headers: { "User-Agent": "hayaoshi-word-game/1.0" } }
    );
    if (r2.status === 200) {
      res.status(200).json({ exists: true, source: "wiktionary" });
      return;
    }
    if (r2.status === 404) {
      res.status(200).json({ exists: false, source: "wiktionary" });
      return;
    }
  } catch (e) {
    // 到達不可
  }

  // どちらのソースにも到達できなかった
  res.status(200).json({ exists: null, source: "offline" });
}
