import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry } from '../types';
import { FeedView } from './FeedView';
import { EditorView } from './EditorView';
import { PenLine, BookHeart, LogOut, Lock } from 'lucide-react';
import { cn } from '../utils';
import { Link } from 'react-router-dom';
import { auth, signInWithGoogle, logOut } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AdminSiteProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'ownerId'>, ownerId: string) => void;
  onDeleteEntry: (id: string) => void;
}

type Tab = 'feed' | 'editor';

export function AdminSite({ entries, onSaveEntry, onDeleteEntry }: AdminSiteProps) {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const ALLOWED_EMAILS = ['alvitafabiola@gmail.com', 'shawtynewt@gmail.com'];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email && !ALLOWED_EMAILS.includes(currentUser.email)) {
        logOut();
        alert('Maaf, email ini tidak memiliki akses ke Area Pribadi.');
        setUser(null);
      } else {
        setUser(currentUser);
      }
      setIsAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'ownerId'>) => {
    onSaveEntry(entry, user?.uid || 'local-user');
    setActiveTab('feed');
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login failed:", error);
      alert('Gagal masuk dengan Google. Pastikan domain aplikasi ini sudah ditambahkan di Firebase Authentication Authorized Domains. Error: ' + error.message);
    }
  };

  if (isAuthLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream font-sans text-brown-dark flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl max-w-sm w-full text-center border-4 border-sand"
        >
          <div className="bg-sand/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blush">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-display font-medium text-brown-dark mb-2">Area Pribadi</h2>
          <p className="text-brown-muted mb-8 text-sm">Halaman ini hanya dapat diakses oleh Anda dan istri Anda.</p>

          <button 
            onClick={handleLogin}
            className="w-full py-4 rounded-full bg-blush text-white font-bold text-lg hover:bg-blush/90 transition-colors shadow-sm mb-2"
          >
            Masuk dengan Google
          </button>
          
          <Link to="/" className="inline-block mt-6 text-sm text-brown-muted hover:text-brown-dark font-medium transition-colors">
            Kembali ke Halaman Depan
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-sans text-brown-dark selection:bg-blush">
      {/* Top bar */}
      <div className="flex justify-between items-center p-6 max-w-5xl mx-auto">
        <Link to="/" className="text-brown-muted hover:text-brown-dark flex items-center gap-2 text-sm font-bold transition-colors">
          <LogOut size={16} className="rotate-180" /> Kembali ke Blog
        </Link>
        <div className="flex items-center gap-4">
           {user.email && <div className="text-sm font-medium text-brown-muted/70">{user.email}</div>}
           <button onClick={logOut} className="text-sm font-bold text-blush hover:text-blush/80">Keluar</button>
        </div>
      </div>

      {/* App Header & Navigation */}
      <header className="pt-2 pb-8 px-6 max-w-5xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl font-display font-medium text-brown-dark mb-10 tracking-tight flex items-center gap-3">
          Buku Cerita Vita <span className="text-blush">✿</span>
        </h1>
        
        {/* Organic Tab Navigation */}
        <div className="bg-sand/30 p-1.5 rounded-full flex gap-1 relative z-10">
          <TabButton 
            active={activeTab === 'feed'} 
            onClick={() => setActiveTab('feed')}
            icon={<BookHeart size={18} />}
            label="Semua Cerita"
          />
          <TabButton 
            active={activeTab === 'editor'} 
            onClick={() => setActiveTab('editor')}
            icon={<PenLine size={18} />}
            label="Tulis Baru"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'feed' ? (
            <FeedView 
              key="feed" 
              entries={entries} 
              onDelete={onDeleteEntry} 
              isAdmin={true}
            />
          ) : (
            <EditorView 
              key="editor" 
              onSave={handleSave} 
              onCancel={() => setActiveTab('feed')} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-colors z-10",
        active ? "text-brown-dark" : "text-brown-muted hover:text-brown-dark"
      )}
    >
      {active && (
        <motion.div
          layoutId="active-tab-admin"
          className="absolute inset-0 bg-white rounded-full shadow-sm"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {label}
      </span>
    </button>
  );
}
