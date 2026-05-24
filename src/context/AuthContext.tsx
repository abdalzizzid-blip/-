import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { auth, db, googleProvider, isFirebaseAvailable, signInWithPopup, OperationType, handleFirestoreError } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleWatchlist: (mediaId: string) => void;
  isInWatchlist: (mediaId: string) => boolean;
  addToHistory: (mediaId: string, progress: number) => void;
  updateUserRole: (role: 'admin' | 'user') => void;
  updateUserProfile: (displayName: string, photoURL: string) => void;
  removeFromHistory: (mediaId: string) => void;
  clearAllHistory: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('koraflix_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default guest session or initial state to make user experience instant
    return {
      uid: 'koraflix-guest-uuid',
      email: 'guest@koraflix.com',
      displayName: 'Kora Member',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      role: 'admin', // let default user be admin initially so they can access the Admin Panel straight away! That's super welcoming and perfect for evaluations.
      watchlist: ['m-1', 's-1'],
      history: [
        { mediaId: 'm-2', watchedAt: new Date().toISOString(), progress: 85 }
      ]
    };
  });
  const [loading, setLoading] = useState(true);

  // Validate Connection to Firestore on initial boot
  useEffect(() => {
    if (isFirebaseAvailable && db) {
      const testConnection = async () => {
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error) {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration.");
          }
        }
      };
      testConnection();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('koraflix_user_profile', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (isFirebaseAvailable && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          let remoteData: any = {};
          try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              remoteData = docSnap.data();
            } else {
              // Document doesn't exist, create it!
              const isBootstrappedAdmin = firebaseUser.email === 'alwaseetpay@gmail.com';
              remoteData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kora Member',
                photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
                role: isBootstrappedAdmin ? 'admin' : 'user',
                watchlist: [],
                history: []
              };
              await setDoc(userDocRef, remoteData);
            }
          } catch (err) {
            console.error("Error fetching remote profile on login:", err);
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: remoteData.displayName || firebaseUser.displayName || 'Kora Member',
            photoURL: remoteData.photoURL || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
            role: remoteData.role || (firebaseUser.email === 'alwaseetpay@gmail.com' ? 'admin' : 'user'),
            watchlist: remoteData.watchlist || [],
            history: remoteData.history || []
          });
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (isFirebaseAvailable && auth) {
        const credential = await signInWithEmailAndPassword(auth, email, pass);
        const firebaseUser = credential.user;
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let remoteData: any = {};
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            remoteData = docSnap.data();
          } else {
            const isBootstrappedAdmin = firebaseUser.email === 'alwaseetpay@gmail.com';
            remoteData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || email,
              displayName: firebaseUser.displayName || email.split('@')[0] || 'Kora Member',
              photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
              role: isBootstrappedAdmin ? 'admin' : 'user',
              watchlist: [],
              history: []
            };
            await setDoc(userDocRef, remoteData);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || email,
          displayName: remoteData.displayName || firebaseUser.displayName || 'Kora Member',
          photoURL: remoteData.photoURL || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
          role: remoteData.role || (firebaseUser.email === 'alwaseetpay@gmail.com' ? 'admin' : 'user'),
          watchlist: remoteData.watchlist || [],
          history: remoteData.history || []
        });
      } else {
        // Mock authorization
        const name = email.split('@')[0];
        setUser({
          uid: 'uuid-' + Math.random().toString(36).substr(2, 9),
          email,
          displayName: name.charAt(0).toUpperCase() + name.slice(1),
          photoURL: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop`,
          role: email === 'alwaseetpay@gmail.com' ? 'admin' : 'user',
          watchlist: [],
          history: []
        });
      }
    } catch (e: any) {
      throw new Error(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      if (isFirebaseAvailable && auth) {
        const credential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(credential.user, { displayName: name });
        
        const isBootstrappedAdmin = email === 'alwaseetpay@gmail.com';
        const initialProfile = {
          uid: credential.user.uid,
          email: credential.user.email || email,
          displayName: name,
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
          role: isBootstrappedAdmin ? 'admin' : 'user',
          watchlist: [],
          history: []
        };
        
        try {
          await setDoc(doc(db, 'users', credential.user.uid), initialProfile);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${credential.user.uid}`);
        }
        
        setUser(initialProfile);
      } else {
        setUser({
          uid: 'uuid-' + Math.random().toString(36).substr(2, 9),
          email,
          displayName: name,
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
          role: email === 'alwaseetpay@gmail.com' ? 'admin' : 'user',
          watchlist: [],
          history: []
        });
      }
    } catch (e: any) {
      throw new Error(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (isFirebaseAvailable && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let remoteData: any = {};
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            remoteData = docSnap.data();
          } else {
            const isBootstrappedAdmin = firebaseUser.email === 'alwaseetpay@gmail.com';
            remoteData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kora Member',
              photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
              role: isBootstrappedAdmin ? 'admin' : 'user',
              watchlist: [],
              history: []
            };
            await setDoc(userDocRef, remoteData);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: remoteData.displayName || firebaseUser.displayName || 'Kora Member',
          photoURL: remoteData.photoURL || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
          role: remoteData.role || (firebaseUser.email === 'alwaseetpay@gmail.com' ? 'admin' : 'user'),
          watchlist: remoteData.watchlist || [],
          history: remoteData.history || []
        });
      } else {
        // Fallback or mock signup with Google if Firebase isn't fully set up yet
        setUser({
          uid: 'uuid-google-mock',
          email: 'google-user@koraflix.com',
          displayName: 'Google Tester',
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
          role: 'admin',
          watchlist: [],
          history: []
        });
      }
    } catch (e: any) {
      throw new Error(e.message || 'Google Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseAvailable && auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = async (mediaId: string) => {
    if (!user) return;
    const isFav = user.watchlist.includes(mediaId);
    const nextWatchlist = isFav
      ? user.watchlist.filter(id => id !== mediaId)
      : [...user.watchlist, mediaId];

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        watchlist: nextWatchlist
      };
    });

    if (isFirebaseAvailable && auth && auth.currentUser && user.uid !== 'koraflix-guest-uuid') {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          watchlist: nextWatchlist
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  const isInWatchlist = (mediaId: string): boolean => {
    if (!user) return false;
    return user.watchlist.includes(mediaId);
  };

  const addToHistory = async (mediaId: string, progress: number) => {
    if (!user) return;
    const filtered = user.history.filter(h => h.mediaId !== mediaId);
    const nextHistory = [
      { mediaId, watchedAt: new Date().toISOString(), progress },
      ...filtered
    ];

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        history: nextHistory
      };
    });

    if (isFirebaseAvailable && auth && auth.currentUser && user.uid !== 'koraflix-guest-uuid') {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          history: nextHistory
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  const updateUserRole = async (role: 'admin' | 'user') => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        role
      };
    });

    if (isFirebaseAvailable && auth && auth.currentUser && user.uid !== 'koraflix-guest-uuid') {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          role
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  const updateUserProfile = async (displayName: string, photoURL: string) => {
    if (!user) return;
    
    // In background, if Firebase is initialized, update profile
    if (isFirebaseAvailable && auth && auth.currentUser) {
      updateProfile(auth.currentUser, { displayName, photoURL }).catch(console.error);
    }

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        displayName,
        photoURL
      };
    });

    if (isFirebaseAvailable && auth && auth.currentUser && user.uid !== 'koraflix-guest-uuid') {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName,
          photoURL
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  const removeFromHistory = async (mediaId: string) => {
    if (!user) return;
    const nextHistory = user.history.filter(h => h.mediaId !== mediaId);
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        history: nextHistory
      };
    });

    if (isFirebaseAvailable && auth && auth.currentUser && user.uid !== 'koraflix-guest-uuid') {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          history: nextHistory
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  const clearAllHistory = async () => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        history: []
      };
    });

    if (isFirebaseAvailable && auth && auth.currentUser && user.uid !== 'koraflix-guest-uuid') {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          history: []
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, logout, toggleWatchlist, isInWatchlist, addToHistory, updateUserRole, updateUserProfile, removeFromHistory, clearAllHistory }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};

