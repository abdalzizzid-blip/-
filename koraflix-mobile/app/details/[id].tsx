import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert, 
  TextInput,
  Dimensions,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Play, Star, Bookmark, Share2, Compass, Tv, ArrowLeft, Send } from 'lucide-react-native';
import { useAuth } from '../_layout';
import { initialMockMediaList } from '../../services/mediaData';
import { MediaItem, MovieComment } from '../../types';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, isRtl, toggleWatchlist, isInWatchlist } = useAuth();

  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Custom Reviews details
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    const item = initialMockMediaList.find(m => m.id === id);
    if (item) {
      setMediaItem(item);
      setComments(item.comments || []);
    }
    setLoading(false);
  }, [id]);

  const handleShare = () => {
    Alert.alert(
      isRtl ? 'مشاركة الفيلم' : 'Share Title',
      isRtl 
        ? `شارك "كورا فليكس: ${mediaItem?.title}" مع أصدقائك عبر شبكات التواصل!` 
        : `Share "${mediaItem?.title}" via instant messagers to stream in 4K!`
    );
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      Alert.alert(isRtl ? 'تنبيه' : 'Alert', isRtl ? 'يرجى كتابة تعليقك أولاً' : 'Please input your feedback first');
      return;
    }

    setIsSending(true);
    const newComment: MovieComment = {
      id: `c-${Date.now()}`,
      userId: user?.uid || 'guest-uuid',
      userName: user?.displayName || 'زائر كورا',
      rating: ratingInput,
      text: commentText.trim(),
      timestamp: isRtl ? 'الآن' : 'Just now'
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    setCommentText('');

    // If real logged-in user, attempt to push of comments sync into Firebase db
    if (user && user.uid !== 'guest-user') {
      try {
        const docRef = doc(db, 'media_reviews', String(id));
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          // Setup initial layout
          await updateDoc(docRef, { reviews: arrayUnion(newComment) });
        } else {
          await updateDoc(docRef, { reviews: arrayUnion(newComment) });
        }
      } catch (err) {
        console.warn('Silent cloud comments sync error:', err);
      }
    }
    setIsSending(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  if (!mediaItem) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#fff' }}>{isRtl ? 'عذراً، العنوان غير موجود.' : 'Title not found.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 1. Immersive backdrop header */}
      <View style={styles.backdropContainer}>
        <Image source={{ uri: mediaItem.backdropUrl }} style={styles.backdropImage} />
        <View style={styles.imageOverlay} />
        
        {/* Back navigation */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={18} color="#fff" />
        </TouchableOpacity>

        {/* Action controls row */}
        <View style={styles.topActionsRow}>
          <TouchableOpacity 
            style={[styles.circleAction, isInWatchlist(mediaItem.id) && styles.circleActionActive]} 
            onPress={() => toggleWatchlist(mediaItem.id)}
            activeOpacity={0.7}
          >
            <Bookmark size={15} color={isInWatchlist(mediaItem.id) ? '#fff' : '#fbbf24'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleAction} onPress={handleShare} activeOpacity={0.7}>
            <Share2 size={15} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Main Title and quick badges */}
      <View style={styles.metaCard}>
        <View style={styles.typeRow}>
          <Text style={styles.mediaTypeBadge}>
            {mediaItem.type === 'movie' ? (isRtl ? 'فيلم سينمائي VIP' : 'Movie VIP') : (isRtl ? 'مسلسل حصري' : 'Exclusive TV Series')}
          </Text>
          <View style={styles.ratingBox}>
            <Star size={11} color="#fbbf24" style={{ marginRight: 4 }} />
            <Text style={styles.ratingText}>{mediaItem.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.titleText}>{mediaItem.title}</Text>
        {mediaItem.originalTitle && mediaItem.originalTitle !== mediaItem.title && (
          <Text style={styles.originalTitleText}>{mediaItem.originalTitle}</Text>
        )}

        {/* Quick descriptors */}
        <View style={styles.descriptorsRow}>
          <Text style={styles.descSpecText}>{mediaItem.releaseDate.split('-')[0]}</Text>
          <Text style={styles.descSpecText}>•</Text>
          <Text style={styles.descSpecText}>{mediaItem.duration || `${mediaItem.seasonsCount} ${isRtl ? 'مواسم' : 'seasons'}`}</Text>
          <Text style={styles.descSpecText}>•</Text>
          <View style={styles.tagUHD}>
            <Text style={styles.tagUHDText}>4K HDR</Text>
          </View>
        </View>

        {/* Genre pills */}
        <View style={styles.genreRow}>
          {mediaItem.genres.map((g, idx) => (
            <View key={idx} style={styles.genrePill}>
              <Text style={styles.genreText}>{isRtl && g === 'Arabic' ? 'عربي' : g}</Text>
            </View>
          ))}
        </View>

        {/* PLAY NOW CTA */}
        <TouchableOpacity 
          style={styles.mainPlayBtn}
          onPress={() => router.push({ pathname: '/stream/[id]', params: { id: mediaItem.id } })}
          activeOpacity={0.85}
        >
          <Play size={18} color="#06020f" fill="#06020f" style={{ marginRight: 8 }} />
          <Text style={styles.mainPlayBtnText}>{isRtl ? 'ابدأ المشاهدة الآن' : 'Start Streaming'}</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Media Overview */}
      <View style={styles.sectionPad}>
        <Text style={styles.sectionHeading}>{isRtl ? 'قصة العمل وملخصه العلمي' : 'Overview Storyline'}</Text>
        <Text style={styles.overviewText}>{mediaItem.overview}</Text>
      </View>

      {/* 4. Episodes Section (for TV Series) */}
      {mediaItem.type === 'tv' && mediaItem.episodes && (
        <View style={styles.sectionPad}>
          <Text style={styles.sectionHeading}>{isRtl ? 'الحلقات المتاحة للمشاهدة' : 'Available Episodes'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.episodeScroll}>
            {mediaItem.episodes.map((ep, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.epCard}
                onPress={() => router.push({ pathname: `/stream/[id]`, params: { id: mediaItem.id } })}
                activeOpacity={0.8}
              >
                <View style={[styles.epThumbnail, { backgroundColor: '#130a2a' }]}>
                  <Play size={16} color="#fbbf24" fill="#fbbf24" />
                </View>
                <Text style={styles.epNumText}>{isRtl ? `موسم ${ep.season} • حلقة ${ep.episodeNumber}` : `S${ep.season} • Ep${ep.episodeNumber}`}</Text>
                <Text style={styles.epNameText} numberOfLines={1}>{ep.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 5. Cast Section */}
      <View style={styles.sectionPad}>
        <Text style={styles.sectionHeading}>{isRtl ? 'طاقم العمل والتمثيل' : 'Casts & Crew'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castScroll}>
          {mediaItem.cast.map((actor, idx) => (
            <View key={idx} style={styles.castItem}>
              <View style={styles.castAvatarCircle}>
                <Compass size={18} color="#fbbf24" />
              </View>
              <Text style={styles.castActorName} numberOfLines={2}>{actor}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 6. Comments and interactive feed */}
      <View style={styles.sectionPad}>
        <Text style={styles.sectionHeading}>{isRtl ? 'آراء ومراجعات الأعضاء' : 'Premium Member Reviews'}</Text>
        
        {/* Comment field card */}
        <View style={styles.addCommentCard}>
          <Text style={styles.fieldLabel}>{isRtl ? 'أضف تقييمك الخاص' : 'Add Your Star Rating'}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRatingInput(star)} activeOpacity={0.6}>
                <Star 
                  size={20} 
                  color={star <= ratingInput ? '#fbbf24' : '#475569'} 
                  fill={star <= ratingInput ? '#fbbf24' : 'transparent'} 
                  style={{ marginRight: 6 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.commentInputRow}>
            <TextInput
              placeholder={isRtl ? 'اكتب رأيك الصادق في العمل السينمائي...' : 'Write your review...'}
              placeholderTextColor="#64748b"
              style={styles.commentTextInput}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity style={styles.sendIconBtn} onPress={handleAddComment} disabled={isSending} activeOpacity={0.7}>
              {isSending ? (
                <ActivityIndicator size="small" color="#fbbf24" />
              ) : (
                <Send size={15} color="#06020f" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Existing reviews listings */}
        <View style={styles.commentsList}>
          {comments.length > 0 ? (
            comments.map((cmt, idx) => (
              <View key={idx} style={styles.commentItemCard}>
                <View style={styles.commentHead}>
                  <Text style={styles.cmtUser}>{cmt.userName}</Text>
                  <View style={styles.starsRowCmt}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={8} 
                        color={s <= cmt.rating ? '#fbbf24' : '#475569'} 
                        fill={s <= cmt.rating ? '#fbbf24' : 'transparent'} 
                        style={{ marginRight: 1 }}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.cmtBodyText}>{cmt.text}</Text>
                <Text style={styles.cmtDate}>{cmt.timestamp}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noCommentsText}>
              {isRtl ? 'لا توجد تعليقات بعد. كن أول من يضيف تقييمه!' : 'No written reviews yet. Be the first to share yours!'}
            </Text>
          )}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
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
  backdropContainer: {
    height: 250,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 2, 15, 0.45)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 34,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActionsRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 34,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  circleAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  circleActionActive: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  metaCard: {
    padding: 16,
    backgroundColor: '#0c071e',
    borderBottomWidth: 1,
    borderBottomColor: '#1d1538',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mediaTypeBadge: {
    color: '#f43f5e',
    fontSize: 10,
    fontWeight: 'black',
    textTransform: 'uppercase',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: 'black',
  },
  titleText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  originalTitleText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  descSpecText: {
    color: '#64748b',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  tagUHD: {
    backgroundColor: '#cbd5e1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  tagUHDText: {
    color: '#06020f',
    fontSize: 8,
    fontWeight: 'black',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  genrePill: {
    backgroundColor: '#130a2a',
    borderWidth: 1,
    borderColor: '#1d1538',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  genreText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  mainPlayBtn: {
    backgroundColor: '#f43f5e',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  mainPlayBtnText: {
    color: '#06020f',
    fontSize: 13,
    fontWeight: 'black',
  },
  sectionPad: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1d1538',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fbbf24',
    marginBottom: 10,
  },
  overviewText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: 'bold',
  },
  episodeScroll: {
    gap: 12,
  },
  epCard: {
    width: 140,
    backgroundColor: '#0c071e',
    borderWidth: 1,
    borderColor: '#1d1538',
    borderRadius: 14,
    padding: 8,
  },
  epThumbnail: {
    height: 75,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  epNumText: {
    color: '#f43f5e',
    fontSize: 9.5,
    fontWeight: '900',
    marginBottom: 2,
  },
  epNameText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  castScroll: {
    gap: 12,
  },
  castItem: {
    alignItems: 'center',
    width: 70,
  },
  castAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#130a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#1d1538',
  },
  castActorName: {
    color: '#94a3b8',
    fontSize: 9.5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addCommentCard: {
    backgroundColor: '#0c071e',
    borderWidth: 1,
    borderColor: '#1d1538',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '900',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#130a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1d1538',
    height: 44,
    paddingHorizontal: 10,
  },
  commentTextInput: {
    flex: 1,
    color: '#fff',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  sendIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsList: {
    gap: 10,
  },
  commentItemCard: {
    backgroundColor: '#0c071e',
    borderWidth: 1,
    borderColor: '#1d1538',
    borderRadius: 14,
    padding: 12,
  },
  commentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cmtUser: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  starsRowCmt: {
    flexDirection: 'row',
  },
  cmtBodyText: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: 'medium',
    marginBottom: 4,
  },
  cmtDate: {
    color: '#64748b',
    fontSize: 8.5,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },
  noCommentsText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  }
});
