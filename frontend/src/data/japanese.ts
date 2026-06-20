export interface JpEntry {
  text: string;
  hiragana: string;
  romaji: string;
  meaning?: string;
}

/** Japanese labels used in the UI */
export const JP_LABELS = {
  japan: { text: '日本', hiragana: 'にほん', romaji: 'Nihon', meaning: 'Japan' },
  cities: { text: '都市', hiragana: 'とし', romaji: 'toshi', meaning: 'city' },
  activities: { text: 'アクティビティ', hiragana: 'あくてぃびてぃ', romaji: 'akutibiti', meaning: 'activity' },
  food: { text: '食べ物', hiragana: 'たべもの', romaji: 'tabemono', meaning: 'food' },
  trip: { text: '旅行', hiragana: 'りょこう', romaji: 'ryokou', meaning: 'travel / trip' },
  lodging: { text: '宿', hiragana: 'やど', romaji: 'yado', meaning: 'lodging / accommodation' },
  wordOfDay: { text: '今日の言葉', hiragana: 'きょうのことば', romaji: 'kyou no kotoba', meaning: 'word of the day' },
} as const satisfies Record<string, JpEntry>;

/** Useful vocabulary for travellers — one shown at random on each page load */
export const TRIP_VOCABULARY: JpEntry[] = [
  { text: 'こんにちは', hiragana: 'こんにちは', romaji: 'Konnichiwa', meaning: 'Hello / Good afternoon' },
  { text: 'ありがとう', hiragana: 'ありがとう', romaji: 'Arigatou', meaning: 'Thank you' },
  { text: 'すみません', hiragana: 'すみません', romaji: 'Sumimasen', meaning: 'Excuse me / Sorry' },
  { text: 'お願いします', hiragana: 'おねがいします', romaji: 'Onegaishimasu', meaning: 'Please' },
  { text: 'はい', hiragana: 'はい', romaji: 'Hai', meaning: 'Yes' },
  { text: 'いいえ', hiragana: 'いいえ', romaji: 'Iie', meaning: 'No' },
  { text: 'トイレ', hiragana: 'といれ', romaji: 'Toire', meaning: 'Toilet / bathroom' },
  { text: '駅', hiragana: 'えき', romaji: 'Eki', meaning: 'Train station' },
  { text: '電車', hiragana: 'でんしゃ', romaji: 'Densha', meaning: 'Train' },
  { text: '地下鉄', hiragana: 'ちかてつ', romaji: 'Chikatetsu', meaning: 'Subway' },
  { text: 'バス', hiragana: 'ばす', romaji: 'Basu', meaning: 'Bus' },
  { text: 'タクシー', hiragana: 'たくしー', romaji: 'Takushii', meaning: 'Taxi' },
  { text: 'いくら', hiragana: 'いくら', romaji: 'Ikura', meaning: 'How much?' },
  { text: '予約', hiragana: 'よやく', romaji: 'Yoyaku', meaning: 'Reservation / booking' },
  { text: 'チェックイン', hiragana: 'ちぇっくいん', romaji: 'Chekkuin', meaning: 'Check-in' },
  { text: 'メニュー', hiragana: 'めにゅー', romaji: 'Menyuu', meaning: 'Menu' },
  { text: 'お会計', hiragana: 'おかいけい', romaji: 'Okaikei', meaning: 'The bill / check please' },
  { text: '美味しい', hiragana: 'おいしい', romaji: 'Oishii', meaning: 'Delicious' },
  { text: '水', hiragana: 'みず', romaji: 'Mizu', meaning: 'Water' },
  { text: '助けて', hiragana: 'たすけて', romaji: 'Tasukete', meaning: 'Help!' },
  { text: '英語', hiragana: 'えいご', romaji: 'Eigo', meaning: 'English language' },
  { text: 'わかりません', hiragana: 'わかりません', romaji: 'Wakarimasen', meaning: "I don't understand" },
  { text: '地図', hiragana: 'ちず', romaji: 'Chizu', meaning: 'Map' },
  { text: '切符', hiragana: 'きっぷ', romaji: 'Kippu', meaning: 'Ticket' },
  { text: '出口', hiragana: 'でぐち', romaji: 'Deguchi', meaning: 'Exit' },
  { text: '入口', hiragana: 'いりぐち', romaji: 'Iriguchi', meaning: 'Entrance' },
  { text: '左', hiragana: 'ひだり', romaji: 'Hidari', meaning: 'Left' },
  { text: '右', hiragana: 'みぎ', romaji: 'Migi', meaning: 'Right' },
  { text: 'まっすぐ', hiragana: 'まっすぐ', romaji: 'Massugu', meaning: 'Straight ahead' },
  { text: '何時', hiragana: 'なんじ', romaji: 'Nanji', meaning: 'What time?' },
  { text: '開いてます', hiragana: 'あいてます', romaji: 'Aitemasu', meaning: 'Open (for business)' },
  { text: '閉まってます', hiragana: 'しまってます', romaji: 'Shimattemasu', meaning: 'Closed' },
  { text: '写真', hiragana: 'しゃしん', romaji: 'Shashin', meaning: 'Photo' },
  { text: '荷物', hiragana: 'にもつ', romaji: 'Nimotsu', meaning: 'Luggage / baggage' },
  { text: 'コインラッカー', hiragana: 'こいんらっかー', romaji: 'Koinrakkaa', meaning: 'Coin locker' },
  { text: 'コンビニ', hiragana: 'こんびに', romaji: 'Konbini', meaning: 'Convenience store' },
  { text: '現金', hiragana: 'げんきん', romaji: 'Genkin', meaning: 'Cash' },
  { text: 'カード', hiragana: 'かーど', romaji: 'Kaado', meaning: 'Card (payment)' },
  { text: '大丈夫', hiragana: 'だいじょうぶ', romaji: 'Daijoubu', meaning: "It's okay / I'm fine" },
  { text: '頑張って', hiragana: 'がんばって', romaji: 'Ganbatte', meaning: 'Good luck / do your best' },
];

export function pickRandomWord(): JpEntry {
  return TRIP_VOCABULARY[Math.floor(Math.random() * TRIP_VOCABULARY.length)];
}
