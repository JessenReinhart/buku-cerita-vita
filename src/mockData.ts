import { JournalEntry, Mood } from './types';

export const MOODS: Mood[] = [
  { id: 'Happy', emoji: '✨', label: 'Senang', color: 'bg-[#FFF3C7] text-[#D4AF37]' },
  { id: 'Inspired', emoji: '🌸', label: 'Inspirasi', color: 'bg-blush/40 text-rose-500' },
  { id: 'Cozy', emoji: '🧸', label: 'Nyaman', color: 'bg-sand/60 text-brown-dark' },
  { id: 'Dreamy', emoji: '☁️', label: 'Mimpi', color: 'bg-sky-100 text-sky-600' },
  { id: 'Calm', emoji: '☕', label: 'Tenang', color: 'bg-[#EFE3DB] text-[#8C6D53]' },
];

export const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    title: 'Kopi Susu & Hujan Sore ☕',
    content: '<p>Hari ini hujan deras banget dari siang. Bikin kopi susu hangat dan nonton drakor favorit sampai lupa waktu. Rasanya tenang banget bisa istirahat sejenak dari kesibukan kerjaan. Kucing-kucing juga ikut tidur pules di ujung kasur. Hal-hal kecil begini emang yang paling bikin seneng.</p>',
    mood: 'Cozy',
    isPublic: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1 // 1 day ago
  },
  {
    id: '2',
    title: 'Nemu Cafe Baru yang Aesthetic! ✨',
    content: '<p>Tadi jalan-jalan sore terus gak sengaja nemu cafe baru di pojokan jalan deket taman kota. Tempatnya super aesthetic, banyak tanaman hias, dan pajangan keramik yang lucu-lucu! Aku pesan matcha latte dan croissant. Definisi me-time yang sempurna untuk hari ini.</p>',
    mood: 'Happy',
    isPublic: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 // 3 days ago
  },
  {
    id: '3',
    title: 'Ide Sketsa Gaun Musim Panas 🌸',
    content: '<p>Mendadak dapat inspirasi buat bikin desain gaun musim panas yang flowy dengan motif floral pastel. Pengen nge-wujud-in sketsanya mumpung lagi dapet mood yang pas. Mungkin minggu depan cari kainnya di pasar. Warnanya pasti cantik banget kalau pakai palet warna peach dan mint.</p>',
    mood: 'Inspired',
    isPublic: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7 // 7 days ago
  }
];
