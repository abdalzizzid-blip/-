import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  Dimensions, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Flame, Search, Crown, Sparkles, BookOpen, Clock, Film, Tv, Star } from 'lucide-react-native';
import { useAuth } from '../_layout';
import MovieCard from '../../components/MovieCard';
import { initialMockMediaList } from '../../services/mediaData';
import { MediaItem } from '../../types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isRtl } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Featured Media (Hero banner)
  const featuredMedia = initialMockMediaList[0];

  // Continue watching records
  const continueWatching = user?.history || [];

  // Filter lists based on categories
  const trendingMovies = initialMockMediaList.filter(item => item.isTrending);
  const arabicCinema = initialMockMediaList.filter(item => item.isArabic);
  const topSeries = initialMockMediaList.filter(item => item.type === 'tv');

  const genresList = isRtl 
    ? [
        { id: 'all', name: 'الكل', icon: Sparkles },
        { id: 'Action', name: 'أكشن', icon: Flame },
        { id: 'Sci-Fi', name: 'خيال علمي', icon: Film },
        { id: 'Arabic', name: 'عربي', icon: Crown },
        { id: 'Adventure', name: 'مغامرة', icon: BookOpen }
      ]
    : [
        { id: 'all', name: 'All', icon: Sparkles },
        { id: 'Action', name: 'Action', icon: Flame },
        { id: 'Sci-Fi', name: 'Sci-Fi', icon: Film },
        { id: 'Arabic', name: 'Arabic', icon: Crown },
        { id: 'Adventure', name: 'Adventure', icon: BookOpen }
      ];

  const renderMediaCard = ({ item }: { item: MediaItem }) => (
    <MovieCard item={item} isRtl={isRtl} />
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 1. Luxurious Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Crown size={22} color="#fbbf24" style={{ marginRight: 4 }} />
          <Text style={styles.logoLogo}>KORA<Text style={styles.logoAccent}>FLIX</Text></Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => router.push('/request')}
            activeOpacity={0.7}
          >
            <Sparkles size={18} color="#f43f5e" />
          </TouchableOpacity>
          {user?.role === 'admin' && (
            <TouchableOpacity 
              style={styles.adminBadge} 
              onPress={() => router.push('/admin')}
              activeOpacity={0.7}
            >
              <Text style={styles.adminBadgeText}>{isRtl ? 'لوحة المسؤول' : 'Admin'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. Hero cinematic banner */}
      {featuredMedia && (
        <TouchableOpacity 
          style={styles.heroContainer} 
          activeOpacity={0.9}
          onPress={() => router.push({ pathname: `/details/[id]`, params: { id: featuredMedia.id } })}
        >
          <Image source={{ uri: featuredMedia.backdropUrl }} style={styles.heroImage} />
          <View style={styles.heroGradient}>
            <View style={styles.trendingTag}>
              <Flame size={12} color="#f43f5e" style={{ marginRight: 4 }} />
              <Text style={styles.trendingTagText}>{isRtl ? 'رائج الآن على كورا' : 'Trending on Kora'}</Text>
            </View>
            <Text style={styles.heroTitle}>Dune: Part Two</Text>
            <Text style={styles.heroGenres}>Sci-Fi • Adventure • Drama • 2024</Text>
            <View style={styles.heroStats}>
              <View style={styles.statItem}>
                <Star size={12} color="#fbbf24" style={{ marginRight: 4 }} />
                <Text style={styles.statText}>8.9</Text>
              </View>
              <View style={styles.tagVIP}>
                <Text style={styles.tagVIPText}>4K ULTRA HD</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.playBtn}
              onPress={() => router.push({ pathname: `/stream/[id]`, params: { id: featuredMedia.id } })}
              activeOpacity={0.85}
            >
              <Play size={16} color="#06020f" fill="#06020f" style={{ marginRight: 5 }} />
              <Text style={styles.playBtnText}>{isRtl ? 'شاهد الآن مجاناً' : 'Watch Free Now'}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* 3. Continue watching progress row if populated */}
      {continueWatching.length > 0 && (
        <View style={styles.rowSection}>
          <Text style={styles.sectionTitle}>
            {isRtl ? 'متابعة المشاهدة' : 'Continue Watching'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.continueScroll}>
            {continueWatching.map((item, idx) => {
              const fullDetails = initialMockMediaList.find(m => m.id === item.mediaId);
              if (!fullDetails) return null;
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.continueCard}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: `/stream/[id]`, params: { id: fullDetails.id } })}
                >
                  <Image source={{ uri: fullDetails.backdropUrl }} style={styles.continueImage} />
                  <View style={styles.continueOverlay}>
                    <Play size={18} color="#fff" fill="#fff" style={styles.continuePlayIcon} />
                    <View style={styles.continueTextContainer}>
                      <Text style={styles.continueTitle} numberOfLines={1}>{fullDetails.title}</Text>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
                      </View>
                      <Text style={styles.continueSubtitle}>{item.progress}% {isRtl ? 'مكتمل' : 'completed'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 4. Elegant Category filter explorers */}
      <View style={styles.categoryHeader}>
        <Text style={styles.sectionTitle}>{isRtl ? 'تصنيفات كورا المميزة' : 'Kora Curated Feeds'}</Text>
      </View>
      <View style={{ marginBottom: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {genresList.map((g, idx) => {
            const IconComp = g.icon;
            const isSelected = selectedGenre === g.id;
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
                onPress={() => setSelectedGenre(g.id)}
                activeOpacity={0.7}
              >
                <IconComp size={14} color={isSelected ? '#fff' : '#94a3b8'} style={{ marginRight: 6 }} />
                <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive]}>
                  {g.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. Trending section */}
      {selectedGenre === 'all' && (
        <>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              {isRtl ? 'شائع على كورا فليكس 🔥' : 'Trending on Kora 🔥'}
            </Text>
          </View>
          <FlatList
            data={trendingMovies}
            renderItem={renderMediaCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />

          {/* 6. Exclusive Arabic Cinematic Exclusives Row */}
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              {isRtl ? 'حصريات ومسلسلات عربية 🇪🇬🇸🇦' : 'Exclusive Arabic Blockbusters 🇸🇦🇪🇬'}
            </Text>
          </View>
          <FlatList
            data={arabicCinema}
            renderItem={renderMediaCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />

          {/* 7. TV Series */}
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              {isRtl ? 'المواسم والمسلسلات التلفزيونية 📺' : 'Premier TV Series 📺'}
            </Text>
          </View>
          <FlatList
            data={topSeries}
            renderItem={renderMediaCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}

      {/* Generic Category Filtering Result */}
      {selectedGenre !== 'all' && (
        <View style={styles.filteredContainer}>
          <Text style={styles.filteredHeadline}>
            {isRtl ? `نتائج التصنيف: ${genresList.find(g => g.id === selectedGenre)?.name}` : `Category: ${selectedGenre}`}
          </Text>
          <View style={styles.gridContainer}>
            {initialMockMediaList
              .filter(item => selectedGenre === 'all' || item.genres.includes(selectedGenre) || (selectedGenre === 'Arabic' && item.isArabic))
              .map((item, idx) => (
                <View key={idx} style={styles.gridItem}>
                  {renderMediaCard({ item })}
                </View>
              ))
            }
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
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
    justifyContent: 'between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: '#06020f',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  logoAccent: {
    color: '#fbbf24',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 10,
  },
  actionBtn: {
    height: 38,
    width: 38,
    borderRadius: 19,
    backgroundColor: '#130a2a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#241249',
  },
  adminBadge: {
    backgroundColor: '#f43f5e',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  heroContainer: {
    marginHorizontal: 16,
    borderRadius: 24,
    height: 330,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 26,
    elevation: 8,
    shadowColor: '#f43f5e',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(6, 2, 15, 0.88)', 
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  trendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  trendingTagText: {
    color: '#f43f5e',
    fontSize: 10,
    fontWeight: 'black',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroGenres: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagVIP: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagVIPText: {
    color: '#06020f',
    fontSize: 9,
    fontWeight: 'black',
  },
  playBtn: {
    backgroundColor: '#fbbf24', 
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  playBtnText: {
    color: '#06020f',
    fontSize: 13,
    fontWeight: 'black',
  },
  rowSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  continueScroll: {
    paddingLeft: 16,
    gap: 14,
  },
  continueCard: {
    width: 220,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0c071e',
  },
  continueImage: {
    width: '100%',
    height: '100%',
  },
  continueOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 2, 15, 0.65)',
    justifyContent: 'flex-end',
    padding: 10,
  },
  continuePlayIcon: {
    position: 'absolute',
    top: '32%',
    left: '42%',
    opacity: 0.9,
  },
  continueTextContainer: {
    width: '100%',
  },
  continueTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    width: '100%',
    backgroundColor: '#1d1538',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f43f5e',
    borderRadius: 2,
  },
  continueSubtitle: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '900',
  },
  categoryHeader: {
    marginBottom: 8,
  },
  tabsScroll: {
    paddingLeft: 16,
    paddingRight: 10,
    gap: 10,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#130a2a',
    borderWidth: 1,
    borderColor: '#241249',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  categoryTabActive: {
    backgroundColor: '#f43f5e',
    borderColor: '#f43f5e',
  },
  categoryTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryTabTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    marginBottom: 6,
    marginTop: 10,
  },
  listContainer: {
    paddingLeft: 16,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    width: 125,
    marginRight: 12,
  },
  cardImage: {
    width: 125,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#130a2a',
    marginBottom: 6,
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#e11d48',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'black',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardTitle: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  filteredContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  filteredHeadline: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  gridItem: {
    width: (width - 48) / 3, // Three columns grid layout
    marginBottom: 10,
  }
});
