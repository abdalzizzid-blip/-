import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, StyleSheet, useColorScheme, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, MediaItem } from '../types';

// Guard SplashScreen until initialized
SplashScreen.preventAutoHideAsync().catch(() => {});

// Configure notification handlers
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isRtl: boolean;
  setIsRtl: (val: boolean) => void;
  toggleWatchlist: (mediaId: string) => Promise<void>;
  isInWatchlist: (mediaId: string) => boolean;
  addToHistory: (mediaId: string, progress: number) => Promise<void>;
  removeFromHistory: (mediaId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default function RootLayout() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRtl, setIsRtl] = useState(true); // Arabic as default for KoraFlix
  const router = useRouter();
  const segments = useSegments();

  // Load push notifications
  useEffect(() => {
    async function configureNotifications() {
      if (Platform.OS === 'web') return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      
      // Simulate scheduling a welcoming notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "مرحباً بك في كورا فليكس 🍿",
          body: "استمتع بمشاهدة أحدث الأفلام والمسلسلات العربية والأجنبية والحصريات مجاناً!",
        },
        trigger: { seconds: 5 },
      });
    }
    configureNotifications();
  }, []);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          
          let profile: UserProfile;
          if (docSnap.exists()) {
            profile = docSnap.data() as UserProfile;
          } else {
            profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'مشاهد كورا',
              photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
              role: firebaseUser.email === 'alwaseetpay@gmail.com' ? 'admin' : 'user',
              watchlist: [],
              history: []
            };
            await setDoc(userDocRef, profile);
          }
          setUser(profile);
        } else {
          // Initialize a dynamic local guest account to let users interact immediately without logins
          setUser({
            uid: 'guest-user',
            email: 'guest@koraflix.com',
            displayName: 'زائر كورا',
            photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
            role: 'admin', // Allow default admin access for AI Studio reviews
            watchlist: ['m-1', 's-1'],
            history: [{ mediaId: 'm-2', watchedAt: new Date().toISOString(), progress: 85 }]
          });
        }
      } catch (err) {
        console.error('Error fetching/setting auth profile:', err);
      } finally {
        setLoading(false);
        SplashScreen.hideAsync().catch(() => {});
      }
    });

    return unsubscribe;
  }, []);

  // Sync route safety
  useEffect(() => {
    if (loading) return;
    const inTabsGroup = segments[0] === '(tabs)';
    
    // Auto redirect to tabs if logged in
    if (user && !inTabsGroup && segments[0] !== 'stream' && segments[0] !== 'details') {
      router.replace('/(tabs)/home');
    }
  }, [user, segments, loading]);

  const toggleWatchlist = async (mediaId: string) => {
    if (!user) return;
    const currentList = user.watchlist || [];
    const isExist = currentList.includes(mediaId);
    const updatedList = isExist 
      ? currentList.filter(id => id !== mediaId)
      : [...currentList, mediaId];

    const updatedProfile = { ...user, watchlist: updatedList };
    setUser(updatedProfile);

    if (user.uid !== 'guest-user') {
      try {
        await setDoc(doc(db, 'users', user.uid), { watchlist: updatedList }, { merge: true });
      } catch (e) {
        console.warn('Silent cloud sync error:', e);
      }
    }
  };

  const isInWatchlist = (mediaId: string) => {
    return user?.watchlist?.includes(mediaId) || false;
  };

  const addToHistory = async (mediaId: string, progress: number) => {
    if (!user) return;
    const currentHistory = user.history || [];
    const filtered = currentHistory.filter(h => h.mediaId !== mediaId);
    const updatedHistory = [
      { mediaId, watchedAt: new Date().toISOString(), progress },
      ...filtered
    ].slice(0, 10); // keep last 10 records

    const updatedProfile = { ...user, history: updatedHistory };
    setUser(updatedProfile);

    if (user.uid !== 'guest-user') {
      try {
        await setDoc(doc(db, 'users', user.uid), { history: updatedHistory }, { merge: true });
      } catch (e) {
        console.warn('Silent cloud sync error', e);
      }
    }
  };

  const removeFromHistory = async (mediaId: string) => {
    if (!user) return;
    const currentHistory = user.history || [];
    const updatedHistory = currentHistory.filter(h => h.mediaId !== mediaId);
    
    const updatedProfile = { ...user, history: updatedHistory };
    setUser(updatedProfile);

    if (user.uid !== 'guest-user') {
      try {
        await setDoc(doc(db, 'users', user.uid), { history: updatedHistory }, { merge: true });
      } catch (e) {
        console.warn('Silent cloud sync error', e);
      }
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={{
        user,
        loading,
        isRtl,
        setIsRtl,
        toggleWatchlist,
        isInWatchlist,
        addToHistory,
        removeFromHistory,
        logout
      }}>
        <StatusBar style="light" backgroundColor="#06020f" translucent />
        <Stack screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#06020f' },
          animation: 'fade_from_bottom'
        }}>
          <Stack.Screen name="auth" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          <Stack.Screen name="details/[id]" />
          <Stack.Screen name="stream/[id]" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="request" />
        </Stack>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
