import Markdown from 'react-markdown';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry, MoodId } from '../types';
import { MOODS } from '../mockData';
import { Globe, Lock, Trash2, X, Check, Search } from 'lucide-react';
import { cn, formatDate } from '../utils';

interface FeedViewProps {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
  isAdmin?: boolean;
}

export function FeedView({ entries, onDelete, isAdmin = false }: FeedViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'public' | 'private'>('all');

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterMode === 'all' 
                          ? true 
                          : (filterMode === 'public' ? entry.isPublic : !entry.isPublic);
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="pb-24"
    >
      {/* Search & Filter Zone */}
      <div className="mb-12 max-w-xl mx-auto">
        <div className="relative group mb-4">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-brown-muted group-focus-within:text-brown-dark transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Cari kenangan atau cerita..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/60 backdrop-blur-sm border-2 border-transparent focus:border-sand pl-14 pr-6 py-4 rounded-full text-lg shadow-sm focus:shadow-md transition-all outline-none placeholder:text-brown-muted/70 text-brown-dark"
          />
        </div>

        {/* Filter Toggle - Only for Admin */}
        {isAdmin && (
          <div className="bg-sand/30 p-1.5 rounded-full flex gap-1 relative w-max mx-auto">
            <FilterButton
              active={filterMode === 'all'}
              onClick={() => setFilterMode('all')}
              label="Semua Terlihat"
            />
            <FilterButton
              active={filterMode === 'public'}
              onClick={() => setFilterMode('public')}
              label="Hanya Blog"
            />
            <FilterButton
              active={filterMode === 'private'}
              onClick={() => setFilterMode('private')}
              label="Rahasia"
            />
          </div>
        )}
      </div>

      {/* Asymmetric Scrapbook Feed */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-20 text-brown-muted flex flex-col items-center">
          <div className="text-6xl mb-4 opacity-50">☁️</div>
          <p className="text-xl font-display font-medium">Belum ada cerita yang cocok...</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 auto-rows-max">
          <AnimatePresence>
            {filteredEntries.map((entry, index) => (
              <JournalCard 
                key={entry.id} 
                entry={entry} 
                index={index} 
                onDelete={() => onDelete(entry.id)} 
                isAdmin={isAdmin}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}

function JournalCard({ entry, index, onDelete, isAdmin }: { entry: JournalEntry, index: number, onDelete: () => void, isAdmin: boolean }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const mood = MOODS.find(m => m.id === entry.mood) || MOODS[0];
  
  // Every 3rd entry spans full width and uses the milk background to break the grid monotony
  const isLarge = index % 3 === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
      className={cn(
        "rounded-[32px] p-8 md:p-10 transition-all duration-300 shadow-soft hover:shadow-hover hover:-translate-y-1 relative group bg-white overflow-hidden",
        isLarge ? "md:col-span-2 bg-milk/80" : "col-span-1"
      )}
    >
      {/* Decorative top badge */}
      <div className="flex justify-between items-start mb-6">
        <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold tracking-wide", mood.color)}>
          <span className="text-lg">{mood.emoji}</span>
          <span>{mood.label}</span>
        </div>
        
        <div className="flex gap-2">
          {isAdmin && (
            isConfirming ? (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                Hapus?
                <button 
                  onClick={onDelete} 
                  className="hover:scale-110 p-1 bg-white rounded-full ml-2 shadow-sm transition-transform"
                >
                  <Check size={14} />
                </button>
                <button 
                  onClick={() => setIsConfirming(false)} 
                  className="hover:scale-110 p-1 bg-white rounded-full shadow-sm transition-transform"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ) : (
              <button 
                onClick={() => setIsConfirming(true)}
                className="opacity-0 group-hover:opacity-100 p-2 text-brown-muted hover:text-red-400 hover:bg-red-50 rounded-full transition-all"
              >
                <Trash2 size={18} />
              </button>
            )
          )}
        </div>
      </div>

      <h3 className="text-3xl font-display font-medium text-brown-dark mb-4 leading-tight">
        {entry.title}
      </h3>
      
      <div 
        className="text-brown-dark/80 text-lg mb-8 line-clamp-4 overflow-hidden markdown-body prose-sm"
        dangerouslySetInnerHTML={{ __html: entry.content }}
      />

      <div className="flex items-center justify-between border-t border-sand/50 pt-5 mt-auto">
        <span className="text-brown-muted font-medium text-sm">
          {formatDate(entry.createdAt)}
        </span>
        {isAdmin && (
          <div className="text-brown-muted flex items-center gap-1.5 text-sm font-medium bg-sand/30 px-3 py-1.5 rounded-full">
            {entry.isPublic ? (
              <><Globe size={14} /> <span>Terpublish</span></>
            ) : (
              <><Lock size={14} /> <span>Rahasia</span></>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-5 py-2 rounded-full font-bold text-sm transition-colors z-10 whitespace-nowrap",
        active ? "text-brown-dark" : "text-brown-muted hover:text-brown-dark"
      )}
    >
      {active && (
        <motion.div
          layoutId="active-filter"
          className="absolute inset-0 bg-white rounded-full shadow-sm"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
}
