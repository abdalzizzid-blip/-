import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Switch,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, 
  Crown, 
  Globe, 
  MonitorPlay, 
  History, 
  ShieldAlert, 
  LogOut, 
  ChevronRight, 
  Settings, 
  Tv, 
  Check, 
  Sparkles,
  Inbox
} from 'lucide-react-native';
import { useAuth } from '../_layout';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isRtl, setIsRtl, logout, removeFromHistory } = useAuth();
  const [preferredServer, setPreferredServer] = useState('srv-primary');
  const [allowPush, setAllowPush] = useState(true);

  const serverOptions = [
    { id: 'srv-primary', name: 'KoraStream Ultra (4K)' },
    { id: 'srv-backup', name: 'Nvidia CDN (1080p)' },
    { id: 'srv-third', name: 'Backup High-speed (720p)' }
  ];

  const handleClearHistory = () => {
    Alert.alert(
      isRtl ? 'حذف سجل المشاهدة' : 'Clear Watch History',
      isRtl 
        ? 'هل أنت متأكد من رغبتك في مسح كافة تواريخ المشاهدات السابقة بالكامل؟' 
        : 'Are you sure you want to completely wipe out your continue watching logs?',
      [
        { text: isRtl ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { 
          text: isRtl ? 'تأكيد الحذف' : 'Confirm Wipe', 
          style: 'destructive',
          onPress: async () => {
            // Remove individually in sequence
            if (user?.history) {
              for (const h of user.history) {
                await removeFromHistory(h.mediaId);
              }
            }
          }
        }
      ]
    );
  };

  const handleLogoutAction = async () => {
    Alert.alert(
      isRtl ? 'تسجيل الخروج' : 'Logout',
      isRtl ? 'هل تريد الخروج من حسابك الحالي؟' : 'Are you sure you want to end your session?',
      [
        { text: isRtl ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { 
          text: isRtl ? 'تسجيل الخروج' : 'Log me out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 1. Header Profile Banner */}
      <View style={styles.profileHeader}>
        <Text style={styles.headerTitle}>{isRtl ? 'الرمز التعريفي' : 'Account Details'}</Text>
        <View style={styles.avatarRow}>
          <Image source={{ uri: user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }} style={styles.avatarImage} />
          <View style={styles.userMetadata}>
            <View style={styles.nameRow}>
              <Text style={styles.userNameText}>{user?.displayName}</Text>
              <Crown size={14} color="#fbbf24" style={{ marginLeft: 5 }} />
            </View>
            <Text style={styles.userEmailText}>{user?.email}</Text>
            <Text style={styles.roleBadge}>
              {user?.role === 'admin' 
                ? (isRtl ? '👑 مسؤول التطبيق الكامل' : '👑 System Root Admin') 
                : (isRtl ? '🍿 عضوية بريميوم نشطة' : '🍿 Active Premium Member')
              }
            </Text>
          </View>
        </View>

        {/* Premium Banner layout */}
        <View style={styles.premiumBanner}>
          <Crown size={18} color="#06020f" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumTitle}>{isRtl ? 'كورا فليكس VIP نشط' : 'KoraFlix VIP Engaged'}</Text>
            <Text style={styles.premiumSubtitle}>
              {isRtl ? 'تتمتع بمشاهدة خالية من الإعلانات وسيرفرات فائقة السرعة.' : 'Enjoy ad-free cinematic streams on high-speed premium server rails.'}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Language localization configurations */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>{isRtl ? 'تفضيلات اللغة والمظهر' : 'Localization & Look'}</Text>
        
        <View style={styles.configItem}>
          <View style={styles.configLabelGroup}>
            <Globe size={18} color="#a855f7" style={{ marginRight: 10 }} />
            <Text style={styles.configLabelText}>{isRtl ? 'الواجهة باللغة العربية' : 'RTL Arabic Layout'}</Text>
          </View>
          <Switch
            value={isRtl}
            onValueChange={(val) => setIsRtl(val)}
            thumbColor={isRtl ? '#fbbf24' : '#64748b'}
            trackColor={{ false: '#1e293b', true: '#fbbf24' }}
          />
        </View>

        <View style={styles.configItem}>
          <View style={styles.configLabelGroup}>
            <Settings size={18} color="#f43f5e" style={{ marginRight: 10 }} />
            <Text style={styles.configLabelText}>{isRtl ? 'الإشعارات وتحديثات الحصريات' : 'Push notifications'}</Text>
          </View>
          <Switch
            value={allowPush}
            onValueChange={setAllowPush}
            thumbColor={allowPush ? '#f43f5e' : '#64748b'}
            trackColor={{ false: '#1e293b', true: '#f43f5e' }}
          />
        </View>
      </View>

      {/* 3. Server Node selectors */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>{isRtl ? 'خوادم المشاهدة المفضلة لك' : 'Default Playback Nodes'}</Text>
        <Text style={styles.serverAlert}>
          {isRtl 
            ? '💡 سيقوم مشغل الفيديو المدمج في التطبيق بمحاولة استخدام الخادم المحدد تلقائياً عند تشغيل أي محتوى.'
            : '💡 Integrated video controller will pre-select your preferred node during playback initialized states.'
          }
        </Text>
        
        {serverOptions.map((srv, idx) => {
          const isSelected = preferredServer === srv.id;
          return (
            <TouchableOpacity 
              key={idx} 
              style={[styles.serverPill, isSelected && styles.serverPillActive]}
              onPress={() => setPreferredServer(srv.id)}
              activeOpacity={0.7}
            >
              <Tv size={16} color={isSelected ? '#fff' : '#94a3b8'} style={{ marginRight: 8 }} />
              <Text style={[styles.serverText, isSelected && styles.serverTextActive]}>{srv.name}</Text>
              {isSelected && <Check size={16} color="#fbbf24" style={{ marginLeft: 'auto' }} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. Settings utilities */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>{isRtl ? 'أدوات وسجلات النظام والخصوصية' : 'System & Utilities'}</Text>

        <TouchableOpacity style={styles.utilBtn} onPress={() => router.push('/request')} activeOpacity={0.7}>
          <Inbox size={16} color="#38bdf8" style={{ marginRight: 10 }} />
          <Text style={styles.utilBtnText}>{isRtl ? 'الطلبات المرسلة والمقترحات' : 'Submitted Media Requests'}</Text>
          <ChevronRight size={16} color="#64748b" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.utilBtn} onPress={handleClearHistory} activeOpacity={0.7}>
          <History size={16} color="#f43f5e" style={{ marginRight: 10 }} />
          <Text style={styles.utilBtnText}>{isRtl ? 'حذف سجل متابعة المشاهدة' : 'Wipe Watch logs history'}</Text>
          <ChevronRight size={16} color="#64748b" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {user?.uid === 'guest-user' ? (
          <TouchableOpacity style={styles.loginCardBtn} onPress={() => router.replace('/auth')} activeOpacity={0.7}>
            <User size={16} color="#fbbf24" style={{ marginRight: 10 }} />
            <Text style={styles.loginCardBtnText}>{isRtl ? 'تسجيل دخول بحساب شخصي ↗️' : 'Authenticate personalized account ↗️'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutAction} activeOpacity={0.7}>
            <LogOut size={16} color="#ef4444" style={{ marginRight: 10 }} />
            <Text style={styles.logoutBtnText}>{isRtl ? 'تسجيل الخروج من الحساب' : 'Logout current session'}</Text>
            <ChevronRight size={16} color="#ef4444" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.versionFooter}>KoraFlix Mobile App v1.0.0 (EAS Multi-Platform Cloud-Build Template)</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06020f',
  },
  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c071e',
    borderWidth: 1,
    borderColor: '#1d1538',
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#130a2a',
    marginRight: 14,
  },
  userMetadata: {
    justifyContent: 'center',
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  userEmailText: {
    color: '#64748b',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  roleBadge: {
    color: '#f43f5e',
    fontSize: 10,
    fontWeight: '950',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf24',
    padding: 12,
    borderRadius: 16,
  },
  premiumTitle: {
    color: '#06020f',
    fontSize: 12,
    fontWeight: 'black',
    marginBottom: 2,
  },
  premiumSubtitle: {
    color: '#1a0f00',
    fontSize: 9.5,
    fontWeight: 'bold',
    opacity: 0.85,
  },
  sectionCard: {
    marginHorizontal: 16,
    backgroundColor: '#0c071e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1d1538',
    padding: 16,
    marginBottom: 18,
  },
  sectionHeader: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#fbbf24',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(29, 21, 56, 0.5)',
  },
  configLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  configLabelText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serverAlert: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontWeight: 'bold',
    lineHeight: 16,
    marginBottom: 12,
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#130a2a',
    borderWidth: 1,
    borderColor: '#1d1538',
    padding: 11,
    borderRadius: 12,
    marginBottom: 8,
  },
  serverPillActive: {
    backgroundColor: '#f43f5e',
    borderColor: '#f43f5e',
  },
  serverText: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  serverTextActive: {
    color: '#fff',
    fontWeight: 'black',
  },
  utilBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(29, 21, 56, 0.5)',
  },
  utilBtnText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loginCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    justifyContent: 'center',
  },
  loginCardBtnText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'black',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'black',
  },
  versionFooter: {
    color: '#475569',
    fontSize: 9.5,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  }
});
