import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Dimensions,
  Platform,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Inbox, Compass, Film, Tv, ArrowLeft, Send, Sparkles, Star, ThumbsUp } from 'lucide-react-native';
import { useAuth } from './_layout';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { MediaRequest } from '../types';

export default function RequestMediaScreen() {
  const router = useRouter();
  const { user, isRtl } = useAuth();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'movie' | 'tv'>('movie');
  const [desc, setDesc] = useState('');
  const [isSending, setIsSending] = useState(false);

  // List of previously requested items
  const [requests, setRequests] = useState<MediaRequest[]>([
    { id: '1', userId: 'usr-1', userName: 'خالد العنزي', title: 'Gladiator II', type: 'movie', status: 'approved', timestamp: '2026-05-24', likes: 12 },
    { id: '2', userId: 'usr-2', userName: 'منى السعيد', title: 'The Penguin', type: 'tv', status: 'pending', timestamp: '2026-05-28', likes: 3 }
  ]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const q = query(collection(db, 'media_requests'), orderBy('timestamp', 'desc'), limit(10));
        const snap = await getDocs(q);
        const fetched: MediaRequest[] = [];
        snap.forEach(doc => {
          fetched.push({ id: doc.id, ...doc.data() } as MediaRequest);
        });
        if (fetched.length > 0) {
          setRequests(fetched);
        }
      } catch (e) {
        console.warn('Silent cloud requests fetch error', e);
      } finally {
        setLoadingRequests(false);
      }
    }
    fetchRequests();
  }, []);

  const handleRequestSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(isRtl ? 'حقل فارغ' : 'Field empty', isRtl ? 'يرجى كتابة اسم الفيلم أو المسلسل المطلوب.' : 'Please write requested title name.');
      return;
    }

    setIsSending(true);
    const newRequest: Omit<MediaRequest, 'id'> = {
      userId: user?.uid || 'guest-uuid',
      userName: user?.displayName || 'زائر كورا',
      title: title.trim(),
      type,
      status: 'pending',
      timestamp: new Date().toISOString().split('T')[0],
      likes: 1
    };

    try {
      // 1. Save to Firestore
      if (user && user.uid !== 'guest-user') {
        await addDoc(collection(db, 'media_requests'), newRequest);
      }
      
      // 2. Prepend local list
      setRequests([{ id: `req-${Date.now()}`, ...newRequest } as MediaRequest, ...requests]);
      
      setTitle('');
      setDesc('');
      
      Alert.alert(
        isRtl ? 'طلب ناجح' : 'Request success',
        isRtl 
          ? 'تم استلام طلبك بنجاح! سيقوم فريق المسؤولين بمراجعته وإضافته لقسم الحصريات قريباً.' 
          : 'Your request has been received! Our admin team will review and establish its stream soon.'
      );
    } catch (e: any) {
      Alert.alert(isRtl ? 'فشل إرسال الطلب' : 'Submission failed', e.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isRtl ? 'اطلب فيلمك المفضل' : 'Request Exclusive Media'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        
        {/* Intro */}
        <View style={styles.introCard}>
          <Sparkles size={20} color="#fbbf24" style={{ marginBottom: 8 }} />
          <Text style={styles.introTitle}>{isRtl ? 'هل تفتقد كتاباً أو فيلماً؟' : 'Missing a movie or show?'}</Text>
          <Text style={styles.introText}>
            {isRtl 
              ? 'مكتبة كورا فليكس تتسع للجميع! اكتب اسم أى عمل تود رؤيته وسنقوم بتوفيره على السيرفرات فائقة السرعة فوراً.'
              : 'Our streaming node cluster supports catalog expansions. Request any Hollywood or Arabic exclusive to watch instantly in 4K.'
            }
          </Text>
        </View>

        {/* Request Form */}
        <View style={styles.formCard}>
          <Text style={styles.formHeadline}>{isRtl ? 'نموذج إرسال الطلبات' : 'Request Submission Form'}</Text>
          
          <View style={styles.inputGrp}>
            <Text style={styles.inputLabel}>{isRtl ? 'اسم العمل السينمائي المطلوب بالكامل' : 'Full Media Title Requested'}</Text>
            <TextInput
              placeholder={isRtl ? 'مثال: السيرة الذاتية لـ أوبنهايمر' : 'e.g., Gladiator II (2025)'}
              placeholderTextColor="#64748b"
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGrp}>
            <Text style={styles.inputLabel}>{isRtl ? 'تصنيف الصيغة المطلوبة' : 'Media category type'}</Text>
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'movie' && styles.typeBtnActive]}
                onPress={() => setType('movie')}
                activeOpacity={0.7}
              >
                <Film size={14} color={type === 'movie' ? '#fff' : '#64748b'} style={{ marginRight: 6 }} />
                <Text style={[styles.typeBtnText, type === 'movie' && styles.typeBtnTextActive]}>{isRtl ? 'فيلم سينمائي' : 'Movie'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.typeBtn, type === 'tv' && styles.typeBtnActive]}
                onPress={() => setType('tv')}
                activeOpacity={0.7}
              >
                <Tv size={14} color={type === 'tv' ? '#fff' : '#64748b'} style={{ marginRight: 6 }} />
                <Text style={[styles.typeBtnText, type === 'tv' && styles.typeBtnTextActive]}>{isRtl ? 'مسلسل تلفزيوني' : 'TV Series'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGrp}>
            <Text style={styles.inputLabel}>{isRtl ? 'ملاحظات إضافية للمسؤولين (اختياري)' : 'Additional details (Optional)'}</Text>
            <TextInput
              placeholder={isRtl ? 'فضلاً أضف سنة الإنتاج أو سيرفر البث المفضل...' : 'e.g. Include 4K release or specific actors...'}
              placeholderTextColor="#64748b"
              style={[styles.textInput, { height: 70, textAlignVertical: 'top', paddingTop: 8 }]}
              multiline
              value={desc}
              onChangeText={setDesc}
            />
          </View>

          {isSending ? (
            <ActivityIndicator size="small" color="#fbbf24" style={{ marginTop: 10 }} />
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleRequestSubmit} activeOpacity={0.8}>
              <Send size={14} color="#06020f" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>{isRtl ? 'إرسال طلب الحصريات' : 'Submit Exclusive Request'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Existing public request log boards */}
        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>{isRtl ? 'طلبات الأعضاء الحالية' : 'Public Request Board'}</Text>
          {loadingRequests ? (
            <ActivityIndicator size="small" color="#f43f5e" />
          ) : (
            requests.map((item, idx) => (
              <View key={idx} style={styles.requestItemCard}>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }]}>
                  <Text style={[styles.statusText, { color: item.status === 'approved' ? '#10b981' : '#f59e0b' }]}>
                    {item.status === 'approved' ? (isRtl ? 'مستجاب ✓' : 'Approved') : (isRtl ? 'قيد المراجعة' : 'Pending')}
                  </Text>
                </View>
                <Text style={styles.reqTitleText}>{item.title}</Text>
                <View style={styles.requestCmtRow}>
                  <Text style={styles.requesterText}>By: {item.userName}</Text>
                  <View style={styles.likesRow}>
                    <ThumbsUp size={11} color="#38bdf8" style={{ marginRight: 4 }} />
                    <Text style={styles.likesCountText}>{item.likes} {isRtl ? 'تأييد' : 'likes'}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06020f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1d1538',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#130a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#241249',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  scrollPad: {
    padding: 16,
  },
  introCard: {
    backgroundColor: '#0c071e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.15)',
    padding: 16,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fbbf24',
    marginBottom: 6,
  },
  introText: {
    fontSize: 11.5,
    color: '#cbd5e1',
    lineHeight: 18,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: '#0c071e',
    borderWidth: 1,
    borderColor: '#1d1538',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  formHeadline: {
    fontSize: 13,
    fontWeight: '950',
    color: '#fff',
    marginBottom: 14,
  },
  inputGrp: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#130a2a',
    borderWidth: 1,
    borderColor: '#1d1538',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#130a2a',
    borderWidth: 1,
    borderColor: '#1d1538',
    height: 40,
    borderRadius: 10,
  },
  typeBtnActive: {
    backgroundColor: '#f43f5e',
    borderColor: '#f43f5e',
  },
  typeBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  typeBtnTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
  submitBtn: {
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#06020f',
    fontSize: 12.5,
    fontWeight: 'black',
  },
  logContainer: {
    gap: 10,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fbbf24',
    marginBottom: 4,
  },
  requestItemCard: {
    backgroundColor: '#0c071e',
    borderWidth: 1,
    borderColor: '#1d1538',
    borderRadius: 14,
    padding: 12,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 8.5,
    fontWeight: 'black',
  },
  reqTitleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
    width: '70%',
  },
  requestCmtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requesterText: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: 'bold',
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCountText: {
    fontSize: 10,
    color: '#38bdf8',
    fontWeight: 'black',
  }
});
