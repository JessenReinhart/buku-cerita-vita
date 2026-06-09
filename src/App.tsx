import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { JournalEntry } from './types';
import { MOCK_ENTRIES } from './mockData';
import { PublicSite } from './components/PublicSite';
import { AdminSite } from './components/AdminSite';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';

export default function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'entries'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JournalEntry[];
      
      setEntries(newEntries);
      setIsLoaded(true);
    }, (error) => {
      console.warn("Falling back to local data due to missing configuration or permissions", error);
      
      // Fallback
      if (!isLoaded) {
        const saved = localStorage.getItem('journal_entries');
        if (saved) {
          try {
            setEntries(JSON.parse(saved));
            setIsLoaded(true);
            return;
          } catch (e) {}
        }
        setEntries(MOCK_ENTRIES);
        setIsLoaded(true);
      }
    });

    return () => unsubscribe();
  }, [isLoaded]);

  // Synchronize localStorage when playing locally
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('journal_entries', JSON.stringify(entries));
    }
  }, [entries, isLoaded]);

  const handleSaveEntry = async (newEntryObj: Omit<JournalEntry, 'id' | 'createdAt' | 'ownerId'>, ownerId: string) => {
    const newEntry = {
      ...newEntryObj,
      createdAt: Date.now(),
      ownerId
    };
    
    try {
      if (document.location.hostname !== 'localhost' && !import.meta.env.VITE_FIREBASE_API_KEY) {
        throw new Error('No Firebase Config');
      }
      await addDoc(collection(db, 'entries'), newEntry);
    } catch (error) {
      console.warn("Using local state because Firebase failed", error);
      const localEntry = { ...newEntry, id: Math.random().toString(36).substr(2, 9) };
      setEntries(prev => [localEntry, ...prev]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEntry = async (id: string) => {
    // Determine if it's a local fallback entry
    const isLocal = !id.includes('-'); // Firebase IDs typically are alphanumeric of length 20, Math.random is length 9, let's just try deleteDoc directly

    try {
      if (document.location.hostname !== 'localhost' && !import.meta.env.VITE_FIREBASE_API_KEY) {
        throw new Error('Local item');
      }
      await deleteDoc(doc(db, 'entries', id));
    } catch (error) {
      console.warn('Fallback local delete', error);
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  if (!isLoaded) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite entries={entries} />} />
        <Route 
          path="/admin" 
          element={
            <AdminSite 
              entries={entries} 
              onSaveEntry={handleSaveEntry} 
              onDeleteEntry={handleDeleteEntry} 
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

