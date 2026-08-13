import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// ⚠️ 下の値を、あなた自身のFirebaseプロジェクトの本物の設定値に置き換えてください。
// Firebaseコンソール → プロジェクトの設定 → 「マイアプリ」内の SDK 設定と構成 に表示されます。
// （Web用のAPIキーはクライアント側に公開される前提のものなので、そのままコードに書いて問題ありません。
//   アクセス制御は Realtime Database の「ルール」側で行います）
const firebaseConfig = {
  apiKey: "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
