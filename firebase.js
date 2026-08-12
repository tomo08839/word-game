import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// ⚠️ 下の値を、あなた自身のFirebaseプロジェクトの本物の設定値に置き換えてください。
// Firebaseコンソール → プロジェクトの設定 → 「マイアプリ」内の SDK 設定と構成 に表示されます。
// （Web用のAPIキーはクライアント側に公開される前提のものなので、そのままコードに書いて問題ありません。
//   アクセス制御は Realtime Database の「ルール」側で行います）
const firebaseConfig = {
  apiKey: "AIzaSyCmMMpT4dRO7_80UwoOWDUY0jIUiCNb_IM",
  authDomain: "word-game-f0e1a.firebaseapp.com",
  databaseURL: "https://word-game-f0e1a-default-rtdb.firebaseio.com",
  projectId: "word-game-f0e1a",
  storageBucket: "word-game-f0e1a.firebasestorage.app",
  messagingSenderId: "555248421902",
  appId: "1:555248421902:web:4441d8aa60da81b36d405f",
  measurementId: "G-SWMMKQ5CRZ"
};
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
