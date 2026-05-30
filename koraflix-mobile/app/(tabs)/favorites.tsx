import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bookmark, Star, Trash2, Library, Compass } from 'lucide-react-native';
import { useAuth } from '../_layout';
import { initialMockMediaList } from '../../services/mediaData';
import { MediaItem } from '../../types';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
  const router = useRouter();
  const { user, isRtl, toggleWatchlist } = useAuth();

  // Load user's watchlist items
  const favoritedList = initialMockMediaList.filter(item => 
    user?.watchlist?.includes(item.id)
  );

  const renderFavoriteItem = ({ item }: { item: MediaItem }) => (
    <View style={styles.favoriteRowCard}>
      <TouchableOpacity 
        style={styles.clickableArea} 
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: `/details/[id]`, params: { id: item.id } })}
      >
        <Image source={{ uri: item.posterUrl }} style={styles.posterImage} />
        <View style={styles.metaInfo}>
          <Text style={styles.mediaTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.mediaType}>
            {item.type === 'movie' 
              ? (isRtl ? '🎬 فيلم سينمائي' : '🎬 Movie') 
              : (isRtl ? '📺 مسلسل تلفزيوني' : '📺 TV Season')
            }
          </Text>
          <View style={styles.ratingRow}>
            <Star size={12} color="#fbbf24" style={{ marginRight: 4 }} />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)} / 10</Text>
          </View>
          <Text style={styles.genreText} numberOfLines={1}>
            {item.genres.join(' • ')}
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Remove button */}
      <TouchableOpacity 
        onPress={() => toggleWatchlist(item.id)} 
        style={styles.deleteBtn}
        activeOpacity={0.7}
      >
        <Trash2 size={16} color="#f43f5e" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleWithIcon}>
          <Bookmark size={20} color="#fbbf24" style={{ marginRight: 6 }} />
          <Text style={styles.headerTitle}>
            {isRtl ? 'قائمة مفضلاتي الحالية' : 'Curated Watchlist'}
          </Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {isRtl 
            ? 'المحتوى الذي قمت بحفظه لمشاهدته لاحقاً متزامن سحابياً' 
            : 'All your bookmarks synced smoothly across cloud platforms'
          }
        </Text>
      </View>

      {/* List content */}
      {favoritedList.length > 0 ? (
        <FlatList
          data={favoritedList}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listScroll}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.libraryCircle}>
            <Library size={44} color="#f43f5e" />
          </View>
          <Text style={styles.emptyTitle}>
            {isRtl ? 'قائمتك فارغة تماماً!' : 'Your list is empty!'}
          </Text>
          <Text style={styles.emptyDesc}>
            {isRtl 
              ? 'تصفح قائمة الأفلام والمسلسلات الحصرية بالرئيسية واضغط على زر المفضلة لإضافتها هنا.' 
              : 'Add your favorite cinematic titles, series, and exclusives in individual detailed views to sync them here.'
            }
          </Text>
          <TouchableOpacity 
            style={styles.exploreBtn} 
            onPress={() => router.push('/(tabs)/home')}
            activeOpacity={0.7}
          >
            <Compass size={16} color="#06020f" style={{ marginRight: 6 }} />
            <Text style={styles.exploreBtnText}>
              {isRtl ? 'تصفح العناوين المميزة' : 'Explore cinema feeds'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06020f',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1d1538',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
  },
  listScroll: {
    padding: 16,
    gap: 12,
  },
  favoriteRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0c071e',
    borderWidth: 1,
    borderColor: '#1d1538',
    borderRadius: 18,
    padding: 10,
    height: 110,
  },
  clickableArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  posterImage: {
    width: 65,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#130a2a',
    marginRight: 12,
  },
  metaInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  mediaTitle: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '900',
  },
  mediaType: {
    color: '#f43f5e',
    fontSize: 9.5,
    fontWeight: '950',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  genreText: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '900',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  libraryCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#130a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#241249',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    elevation: 4,
  },
  exploreBtnText: {
    color: '#06020f',
    fontSize: 12,
    fontWeight: 'black',
  }
});
