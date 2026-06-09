import { JournalEntry } from '../types';
import { FeedView } from './FeedView';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface PublicSiteProps {
  entries: JournalEntry[];
}

export function PublicSite({ entries }: PublicSiteProps) {
  // Only show public entries
  const publicEntries = entries.filter((e) => e.isPublic);

  return (
    <div className="min-h-screen bg-cream font-sans text-brown-dark selection:bg-blush">
      {/* Top bar */}
      <div className="flex justify-end p-6 max-w-5xl mx-auto">
        <Link to="/admin" className="text-brown-muted hover:text-brown-dark flex items-center gap-2 text-sm font-bold transition-colors opacity-50 hover:opacity-100">
          <Settings size={16} /> Area Nulis
        </Link>
      </div>

      <header className="pt-8 pb-12 px-6 max-w-5xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-display font-medium text-brown-dark mb-4 tracking-tight flex items-center gap-3">
          Buku Cerita Vita <span className="text-blush">✿</span>
        </h1>
        <p className="text-xl text-brown-muted max-w-lg text-center leading-relaxed">
          Kumpulan potongan cerita manis, hari-hari yang tenang, dan segala memori yang ingin dikenang.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-4">
        <FeedView 
          entries={publicEntries} 
          onDelete={() => {}} 
          isAdmin={false}
        />
      </main>
    </div>
  );
}
