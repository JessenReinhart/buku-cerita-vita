import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { JournalEntry } from './types';
import { MOCK_ENTRIES } from './mockData';
import { PublicSite } from './components/PublicSite';
import { AdminSite } from './components/AdminSite';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, where } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Monitor auth state changes to dynamically switch Firestore query
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    // When unauthenticated, query only public entries as required by security rules.
    // When authenticated, query all entries for the user/admin.
    const entriesRef = collection(db, 'entries');
    const q = currentUser
      ? query(entriesRef)
      : query(entriesRef, where('isPublic', '==', true));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newEntries = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as JournalEntry[];

        // Sort in memory to avoid requiring manual composite indexes in Firestore
        newEntries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setEntries(newEntries);
        setIsLoaded(true);
      },
      (error) => {
        console.warn("Falling back to local data due to missing configuration or permissions", error);

        // Fallback to local storage or mock data if first load fails
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
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

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
      await addDoc(collection(db, 'entries'), newEntry);
    } catch (error: any) {
      const isPermissionError = error?.code === 'permission-denied' || (error?.message && error.message.toLowerCase().includes('permission'));
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.CREATE, 'entries');
      } else {
        console.warn("Using local state because Firebase failed", error);
        const localEntry = { ...newEntry, id: Math.random().toString(36).substr(2, 9) };
        setEntries(prev => [localEntry, ...prev]);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'entries', id));
    } catch (error: any) {
      const isPermissionError = error?.code === 'permission-denied' || (error?.message && error.message.toLowerCase().includes('permission'));
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.DELETE, `entries/${id}`);
      } else {
        console.warn('Fallback local delete', error);
        setEntries(prev => prev.filter(e => e.id !== id));
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <div className="text-blush text-5xl animate-pulse flex items-center justify-center">
          ✿
        </div>
      </div>
    );
  }

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
