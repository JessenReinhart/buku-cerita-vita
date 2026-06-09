import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, Lock, Loader2, Bold, Italic, List, Quote, Heading2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { JournalEntry, MoodId } from '../types';
import { MOODS } from '../mockData';
import { cn } from '../utils';

interface EditorViewProps {
  onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const QUOTES = [
  "Hai manis, hal indah apa yang terjadi hari ini?",
  "Selamat datang di tempat amanmu. Tarik napas...",
  "Setiap perasaan itu valid. Tuliskan saja pelan-pelan.",
  "Secangkir teh hangat mungkin pas untuk menemanimu menulis?",
  "Apa yang membuatmu tersenyum hari ini?"
];

export function EditorView({ onSave, onCancel }: EditorViewProps) {
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState<MoodId>('Happy');
  const [isPublic, setIsPublic] = useState(false);
  const [quote, setQuote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Mulai mengetik ceritamu di sini...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setHasContent(!editor.isEmpty);
    },
    editorProps: {
      attributes: {
        class: 'w-full min-h-[300px] text-xl bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-brown-dark leading-relaxed font-sans markdown-body',
      },
    },
  });

  const handleSave = () => {
    if (!title.trim() || !editor || !hasContent) return;
    setIsSaving(true);
    // Fake slight delay for tactile feedback
    setTimeout(() => {
      onSave({
        title,
        content: editor.getHTML(),
        mood,
        isPublic
      });
      setIsSaving(false);
    }, 400);
  };

  const isFormValid = title.trim().length > 0 && hasContent;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-soft p-8 md:p-12"
    >
      {/* Header Quote & Back */}
      <div className="flex items-center justify-between mb-10 text-brown-muted">
        <p className="font-medium flex-1 text-center italic text-xl">"{quote}"</p>
      </div>

      {/* Title Input */}
      <div className="mb-8 relative group">
        <input
          type="text"
          placeholder="Beri judul ceritamu..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl md:text-5xl font-display font-medium bg-transparent border-none focus:outline-none focus:ring-0 placeholder-sand text-brown-dark transition-all"
        />
        <div className="absolute -bottom-2 left-0 w-0 h-1 bg-blush rounded-full transition-all group-focus-within:w-16"></div>
      </div>

      {/* Mood Tracker */}
      <div className="mb-10 flex flex-wrap gap-3">
        {MOODS.map((m) => {
          const isSelected = mood === m.id;
          return (
            <motion.button
              key={m.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMood(m.id)}
              className={cn(
                "relative flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all duration-300",
                isSelected ? m.color + " shadow-sm ring-4 ring-white" : "bg-cream text-brown-muted hover:bg-sand/40"
              )}
            >
              <span className="text-xl">{m.emoji}</span>
              <span>{m.label}</span>
              {isSelected && (
                <motion.div 
                  layoutId="mood-active"
                  className="absolute inset-0 rounded-full border-2 border-brown-dark/5 pointer-events-none" 
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Content Textarea */}
      <div className="mb-10 relative">
        {/* Formatting Toolbar */}
        {editor && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-sand/30 rounded-full w-max mt-2">
            <ToolbarButton 
              icon={<Bold size={16} />} 
              onClick={() => editor.chain().focus().toggleBold().run()} 
              isActive={editor.isActive('bold')}
              title="Tebal (Bold)" 
            />
            <ToolbarButton 
              icon={<Italic size={16} />} 
              onClick={() => editor.chain().focus().toggleItalic().run()} 
              isActive={editor.isActive('italic')}
              title="Miring (Italic)" 
            />
            <ToolbarButton 
              icon={<Heading2 size={16} />} 
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading" 
            />
            <div className="w-px h-5 bg-brown-dark/20 mx-1"></div>
            <ToolbarButton 
              icon={<List size={16} />} 
              onClick={() => editor.chain().focus().toggleBulletList().run()} 
              isActive={editor.isActive('bulletList')}
              title="Daftar (List)" 
            />
            <ToolbarButton 
              icon={<Quote size={16} />} 
              onClick={() => editor.chain().focus().toggleBlockquote().run()} 
              isActive={editor.isActive('blockquote')}
              title="Kutipan (Quote)" 
            />
          </div>
        )}
        
        <div className="min-h-[300px] cursor-text" onClick={() => editor?.commands.focus()}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-sand/40 gap-6">
        
        {/* Publish Status Toggle */}
        <div className="flex bg-cream p-1.5 rounded-full items-center justify-between w-full md:w-[320px] relative cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
          <motion.div
            className="absolute bg-white shadow-sm rounded-full h-[calc(100%-12px)]"
            initial={false}
            animate={{
              left: isPublic ? '50%' : '6px',
              width: 'calc(50% - 6px)'
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
          <div className={cn("flex-1 flex items-center justify-center gap-2 z-10 py-3 text-sm font-bold transition-colors", !isPublic ? 'text-brown-dark' : 'text-brown-muted/70')}>
            <Lock size={18} /> Catatan Rahasia
          </div>
          <div className={cn("flex-1 flex items-center justify-center gap-2 z-10 py-3 text-sm font-bold transition-colors", isPublic ? 'text-brown-dark' : 'text-brown-muted/70')}>
            <Globe size={18} /> Ala Blog
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="flex-1 md:flex-none px-6 py-4 rounded-full font-bold text-brown-muted hover:bg-cream transition-colors"
          >
            Batal
          </motion.button>
          <motion.button
            whileHover={{ scale: isFormValid ? 1.02 : 1 }}
            whileTap={{ scale: isFormValid ? 0.95 : 1 }}
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all shadow-md",
              isFormValid 
                ? "bg-brown-dark hover:bg-brown-dark/90 hover:shadow-lg" 
                : "bg-sand cursor-not-allowed opacity-70"
            )}
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Simpan Kenangan"}
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
}

function ToolbarButton({ icon, onClick, title, isActive }: { icon: React.ReactNode, onClick: () => void, title: string, isActive?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={title}
      type="button"
      className={cn(
        "p-2 rounded-full transition-colors",
        isActive 
          ? "bg-white text-brown-dark shadow-sm" 
          : "text-brown-muted hover:text-brown-dark hover:bg-white/50"
      )}
    >
      {icon}
    </motion.button>
  );
}
