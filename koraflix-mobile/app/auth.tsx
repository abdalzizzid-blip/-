import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Crown, Mail, Lock, User, LogIn, ChevronRight, Compass } from 'lucide-react-native';
import { useAuth } from './_layout';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const router = useRouter();
  const { isRtl } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert(isRtl ? 'خطأ بالمدخلات' : 'Validation Error', isRtl ? 'يرجى كتابة البريد الإلكتروني وكلمة المرور' : 'Please input email and password');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        // Logging in
        await signInWithEmailAndPassword(auth, email.trim(), password);
        router.replace('/(tabs)/home');
      } else {
        // Registering
        if (!fullName) {
          Alert.alert(isRtl ? 'تنبيه' : 'Alert', isRtl ? 'يرجى كتابة الاسم بالكامل' : 'Please write your name');
          setIsLoading(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const userProfile = {
          uid: cred.user.uid,
          email: email.trim(),
          displayName: fullName.trim(),
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
          role: 'user',
          watchlist: [],
          history: []
        };
        await setDoc(doc(db, 'users', cred.user.uid), userProfile);
        router.replace('/(tabs)/home');
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert(isRtl ? 'فشل العملية' : 'Process failed', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestEntry = () => {
    // Rely on Guest session bootstrapping inside root layout
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Logo and Brand Branding */}
        <View style={styles.brandContainer}>
          <Crown size={48} color="#fbbf24" style={{ marginBottom: 10 }} />
          <Text style={styles.brandTitle}>KORA<Text style={styles.brandAccent}>FLIX</Text></Text>
          <Text style={styles.brandSubtitle}>
            {isRtl ? 'بوابة السينما العربية والأفلام التلفزيونية العالمية 📺' : 'Premier Destination for Cinematic Arab & Western Entertainment'}
          </Text>
        </View>

        {/* Input fields Card Container */}
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>
            {isLogin 
              ? (isRtl ? 'تسجيل دخول الأعضاء' : 'Premium Member Login') 
              : (isRtl ? 'إنشاء حساب مستخدم جديد' : 'Establish Premium Account')
            }
          </Text>

          {!isLogin && (
            <View style={styles.inputRow}>
              <User size={16} color="#94a3b8" style={styles.iconPrefix} />
              <TextInput
                placeholder={isRtl ? 'الاسم بالكامل' : 'Full Name'}
                placeholderTextColor="#64748b"
                style={styles.inputField}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          )}

          <View style={styles.inputRow}>
            <Mail size={16} color="#94a3b8" style={styles.iconPrefix} />
            <TextInput
              placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.inputField}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputRow}>
            <Lock size={16} color="#94a3b8" style={styles.iconPrefix} />
            <TextInput
              placeholder={isRtl ? 'كلمة المرور السرية' : 'Secure Password'}
              placeholderTextColor="#64748b"
              secureTextEntry
              autoCapitalize="none"
              style={styles.inputField}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Submit action buttons or spinners */}
          {isLoading ? (
            <ActivityIndicator size="large" color="#f43f5e" style={{ marginVertical: 14 }} />
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
              <LogIn size={16} color="#06020f" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>
                {isLogin 
                  ? (isRtl ? 'دخول بريميوم' : 'Log In') 
                  : (isRtl ? 'تأسيس حساب بريميوم' : 'Sign Up')
                }
              </Text>
            </TouchableOpacity>
          )}

          {/* Login/Signup layout toggler */}
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleRow}>
            <Text style={styles.toggleText}>
              {isLogin 
                ? (isRtl ? 'أليس لديك حساب؟ اضغط هنا للتسجيل' : "Don't have an account? Sign Up instead") 
                : (isRtl ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Have an account? Log In instead')
              }
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guest fallback button */}
        <TouchableOpacity style={styles.guestGateBtn} onPress={handleGuestEntry} activeOpacity={0.75}>
          <Compass size={16} color="#fbbf24" style={{ marginRight: 6 }} />
          <Text style={styles.guestGateBtnText}>
            {isRtl ? 'المتابعة كزائر سريع (تخطي)' : 'Continue to home feed as Guest (Skip)'}
          </Text>
          <ChevronRight size={14} color="#fbbf24" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#06020f',
  },
  container: {
    paddingGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
    backgroundColor: '#06020f',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
    textAlign: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '950',
    color: '#fff',
    letterSpacing: 1.5,
  },
  brandAccent: {
    color: '#fbbf24',
  },
  brandSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  authCard: {
    width: '100%',
    backgroundColor: '#0c071e',
    borderWidth: 1,
    borderColor: '#1d1538',
    borderRadius: 24,
    padding: 20,
    marginBottom: 26,
    elevation: 6,
  },
  authTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fbbf24',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#130a2a',
    borderWidth: 1,
    borderColor: '#1d1538',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  iconPrefix: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    color: '#fff',
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#fbbf24',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
  },
  submitBtnText: {
    color: '#06020f',
    fontSize: 13.5,
    fontWeight: 'black',
  },
  toggleRow: {
    marginTop: 16,
    alignSelf: 'center',
  },
  toggleText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  guestGateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#120428',
    borderWidth: 1,
    borderColor: '#241249',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  guestGateBtnText: {
    color: '#fbbf24',
    fontSize: 11.5,
    fontWeight: 'black',
  }
});
