import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Video, ResizeMode, Audio } from 'expo-av';
import { 
  ArrowLeft, 
  Tv, 
  Smartphone, 
  RotateCw, 
  Bookmark, 
  Check, 
  ChevronRight, 
  Activity, 
  Minimize2, 
  Volume2, 
  SkipForward, 
  SkipBack,
  Play,
  Pause,
  Shuffle
} from 'lucide-react-native';
import { useAuth } from '../_layout';
import { initialMockMediaList } from '../../services/mediaData';
import { MediaItem, VideoServer } from '../../types';

const { width, height } = Dimensions.get('window');

export default function StreamPlayerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isRtl, addToHistory, toggleWatchlist, isInWatchlist } = useAuth();

  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [activeServer, setActiveServer] = useState<VideoServer | null>(null);
  const [loading, setLoading] = useState(true);

  // Playback States (for native controller)
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isMirrored, setIsMirrored] = useState(false);

  useEffect(() => {
    if (!id) return;
    const item = initialMockMediaList.find(m => m.id === id);
    if (item) {
      setMediaItem(item);
      const servers = item.servers || [];
      if (servers.length > 0) {
        setActiveServer(servers[0]);
      } else {
        // Fallback default
        setActiveServer({ id: 'srv-default', name: 'Default Direct CDN', url: item.videoUrl || '' });
      }
    }
    setLoading(false);
  }, [id]);

  // Log progress periodically during active play representation
  useEffect(() => {
    if (!mediaItem) return;
    
    // Simulate updating continue watching state
    addToHistory(mediaItem.id, 12); // Initial boot checkpoint 12%

    if (status.isLoaded && status.positionMillis && status.durationMillis) {
      const percentage = Math.round((status.positionMillis / status.durationMillis) * 100);
      if (percentage > 2) {
        addToHistory(mediaItem.id, percentage);
      }
    }
  }, [status.positionMillis]);

  const handleSkipForward = async () => {
    if (videoRef.current && status.isLoaded) {
      await videoRef.current.setPositionAsync(status.positionMillis + 10000);
    }
  };

  const handleSkipBackward = async () => {
    if (videoRef.current && status.isLoaded) {
      await videoRef.current.setPositionAsync(Math.max(0, status.positionMillis - 10000));
    }
  };

  const toggleMirror = () => {
    setIsMirrored(!isMirrored);
  };

  const cycleSpeed = async () => {
    const nextSpeeds = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = nextSpeeds.indexOf(playbackSpeed);
    const nextSpeed = nextSpeeds[(currentIndex + 1) % nextSpeeds.length];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(nextSpeed, true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  if (!mediaItem || !activeServer) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#fff' }}>{isRtl ? 'عذراً، لم يتم العثور على خوادم البث.' : 'Streaming nodes not loaded.'}</Text>
      </View>
    );
  }

  // Detect if the active URL is an iframe structure or external stream page needing WebView
  const isEmbedIframe = activeServer.url.trim().startsWith('<iframe') || 
                       activeServer.url.includes('embed') || 
                       activeServer.url.includes('youtube.com') ||
                       !activeServer.url.includes('.mp4') && !activeServer.url.includes('.m3u8');

  return (
    <View style={styles.container}>
      
      {/* 1. Immersive player interface container */}
      <View style={styles.playerContainer}>
        {isEmbedIframe ? (
          // Web player fallback (for Streamtape, Hydra, Youtube, premium nodes)
          <WebView
            source={{ 
              html: activeServer.url.trim().startsWith('<iframe') 
                ? `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body { margin: 0; background: #000; display:flex; align-items:center; justify-content:center; } iframe { width:100vw; height:100vh; border:none; }</style></head><body>${activeServer.url}</body></html>`
                : activeServer.url 
            }}
            style={[styles.webPlayer, isMirrored && { transform: [{ scaleX: -1 }] }]}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        ) : (
          // Direct native player file rendering
          <View style={{ flex: 1, position: 'relative' }}>
            <Video
              ref={videoRef}
              source={{ uri: activeServer.url }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              useNativeControls
              style={[styles.nativeVideo, isMirrored && { transform: [{ scaleX: -1 }] }]}
              onPlaybackStatusUpdate={status => setStatus(() => status)}
            />
            
            {/* Custom overlays when playing native files */}
            <View style={styles.customVideoOverlay}>
              <TouchableOpacity onPress={handleSkipBackward} style={styles.quickStepBtn}>
                <SkipBack size={15} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSkipForward} style={styles.quickStepBtn}>
                <SkipForward size={15} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 2. Controls Toolbar & Server Selectors scroll info */}
      <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.metaRow}>
          <TouchableOpacity style={styles.backButtonInline} onPress={() => router.back()} activeOpacity={0.7}>
            <ArrowLeft size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.backButtonText}>{isRtl ? 'الرجوع للتفاصيل' : 'Back to info'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.watchlistBtn, isInWatchlist(mediaItem.id) && styles.watchlistBtnActive]} 
            onPress={() => toggleWatchlist(mediaItem.id)}
            activeOpacity={0.7}
          >
            <Bookmark size={14} color={isInWatchlist(mediaItem.id) ? '#fff' : '#fbbf24'} style={{ marginRight: 5 }} />
            <Text style={styles.watchlistBtnText}>{isRtl ? 'حفظ' : 'Bookmark'}</Text>
          </TouchableOpacity>
        </View>

        {/* Title details */}
        <View style={styles.titlePad}>
          <Text style={styles.videoTitle}>{mediaItem.title}</Text>
          <Text style={styles.activeServerHeadline}>
            {isRtl ? `الخادم النشط حالياً: ${activeServer.name}` : `Active stream source: ${activeServer.name}`}
          </Text>
        </View>

        {/* Dynamic speed multiplier controls */}
        <View style={styles.controllersCard}>
          <Text style={styles.controlsSectionTitle}>{isRtl ? 'أدوات التحكم السريع للمشغل' : 'Micro Playback Controls'}</Text>
          <View style={styles.controlToolsGrid}>
            <TouchableOpacity style={styles.toolPill} onPress={cycleSpeed} activeOpacity={0.7}>
              <RotateCw size={14} color="#fbbf24" style={{ marginRight: 6 }} />
              <Text style={styles.toolPillText}>{isRtl ? `السرعة: ${playbackSpeed}x` : `Speed: ${playbackSpeed}x`}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolPill} onPress={toggleMirror} activeOpacity={0.7}>
              <Shuffle size={14} color="#f43f5e" style={{ marginRight: 6 }} />
              <Text style={styles.toolPillText}>
                {isRtl 
                  ? (isMirrored ? 'المرآة: مفعلة' : 'مرآة الشاشة (قلب)') 
                  : (isMirrored ? 'Mirrored: ON' : 'Flip Mirror Display')
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Server selection node list */}
        <View style={styles.serversCard}>
          <Text style={styles.controlsSectionTitle}>
            {isRtl ? 'تغيير خادم البث الفوري' : 'Live Streaming Servers'}
          </Text>
          <Text style={styles.serversSubinfo}>
            {isRtl 
              ? '💡 في حال واجهت بطء في التحميل أو تقطيع، نوصي بالتبديل فوراً لخادم بث آخر.'
              : '💡 If you experience buffering, toggle between different streaming nodes instantly.'
            }
          </Text>

          {mediaItem.servers && mediaItem.servers.map((srv, idx) => {
            const isSelected = activeServer.id === srv.id;
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.serverSelectRow, isSelected && styles.serverSelectRowActive]}
                onPress={() => setActiveServer(srv)}
                activeOpacity={0.7}
              >
                <Tv size={15} color={isSelected ? '#fff' : '#64748b'} style={{ marginRight: 8 }} />
                <Text style={[styles.serverSelectName, isSelected && styles.serverSelectNameActive]}>
                  {srv.name}
                </Text>
                {isSelected && <Check size={14} color="#fbbf24" style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            );
          })}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#06020f',
  },
  playerContainer: {
    width: '100%',
    height: Platform.OS === 'ios' ? 240 : 220,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  webPlayer: {
    flex: 1,
    backgroundColor: '#000',
  },
  nativeVideo: {
    width: '100%',
    height: '100%',
  },
  customVideoOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  quickStepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsScroll: {
    flex: 1,
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c071e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1d1538',
  },
  backButtonText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: 'bold',
  },
  watchlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c071e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1d1538',
  },
  watchlistBtnActive: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251,191,36,0.1)',
  },
  watchlistBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: 'bold',
  },
  titlePad: {
    marginBottom: 16,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  activeServerHeadline: {
    color: '#fbbf24',
    fontSize: 11.5,
    fontWeight: 'black',
  },
  controllersCard: {
    backgroundColor: '#0c071e',
    borderWidth: 1,
    borderColor: '#1d1538',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  controlsSectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#cbd5e1',
    marginBottom: 10,
  },
  controlToolsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  toolPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#130a2a',
    borderWidth: 1,
    borderColor: '#1d1538',
    height: 38,
    borderRadius: 10,
  },
  toolPillText: {
    color: '#fff',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  serversCard: {
    backgroundColor: '#0c071e',
    borderWidth: 1,
    borderColor: '#1d1538',
    borderRadius: 18,
    padding: 14,
  },
  serversSubinfo: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'semibold',
    lineHeight: 14,
    marginBottom: 12,
  },
  serverSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#130a2a',
    borderWidth: 1,
    borderColor: '#1d1538',
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  serverSelectRowActive: {
    backgroundColor: '#f43f5e',
    borderColor: '#f43f5e',
  },
  serverSelectName: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  serverSelectNameActive: {
    color: '#fff',
    fontWeight: 'black',
  }
});
