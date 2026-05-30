import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, Film, Tv, Star, X, Sparkles, Filter } from 'lucide-react-native';
import { useAuth } from '../_layout';
import { initialMockMediaList } from '../../services/mediaData';
import { MediaItem } from '../../types';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const router = useRouter();
  const { isRtl } = useAuth();
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // List of unique genres from mock list
  const genres = ['All', 'Sci-Fi', 'Adventure', 'Drama', 'Action', 'Arabic', 'Fantasy', 'Horror', 'Mystery'];

  // Handle Search Filtering
  const filteredMedia = initialMockMediaList.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) || 
                         (item.originalTitle && item.originalTitle.toLowerCase().includes(query.toLowerCase())) ||
                         item.overview.toLowerCase().includes(query.toLowerCase()) ||
                         item.cast.some(c => c.toLowerCase().includes(query.toLowerCase()));
    
    const matchesType = mediaType === 'all' ? true : item.type === mediaType;
    const matchesGenre = selectedGenre === 'All' ? true : 
                         (selectedGenre === 'Arabic' ? item.isArabic : item.genres.includes(selectedGenre));

    return matchesQuery && matchesType && matchesGenre;
  });

  const renderGridCard = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity 
      style={styles.gridCard} 
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: `/details/[id]`, params: { id: item.id } })}
    >
      <Image source={{ uri: item.posterUrl }} style={styles.cardImage} />
      <View style={styles.ratingBadge}>
        <Star size={11} color="#fbbf24" style={{ marginRight: 2 }} />
        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* 1. Header with search bar */}
      <View style={styles.searchHeader}>
        <Text style={styles.headerTitle}>{isRtl ? 'البحث الذكي' : 'Smart Search'}</Text>
        <View style={styles.searchBarContainer}>
          <SearchIcon size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            placeholder={isRtl ? 'ابحث عن أفلام، مسلسلات، ممثلين...' : 'Search movies, series, cast...'}
            placeholderTextColor="#64748b"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color="#94a3b8" style={{ padding: 5 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. Type selectors (Movies vs Series) */}
      <View style={styles.filtersRow}>
        <TouchableOpacity 
          style={[styles.filterTypeTab, mediaType === 'all' && styles.filterTypeTabActive]} 
          onPress={() => setMediaType('all')}
        >
          <Filter size={13} color={mediaType === 'all' ? '#fff' : '#94a3b8'} style={{ marginRight: 5 }} />
          <Text style={[styles.filterTypeText, mediaType === 'all' && styles.filterTypeTextActive]}>
            {isRtl ? 'الكل' : 'All'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTypeTab, mediaType === 'movie' && styles.filterTypeTabActive]} 
          onPress={() => setMediaType('movie')}
        >
          <Film size={13} color={mediaType === 'movie' ? '#fff' : '#94a3b8'} style={{ marginRight: 5 }} />
          <Text style={[styles.filterTypeText, mediaType === 'movie' && styles.filterTypeTextActive]}>
            {isRtl ? 'الأفلام' : 'Movies'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterTypeTab, mediaType === 'tv' && styles.filterTypeTabActive]} 
          onPress={() => setMediaType('tv')}
        >
          <Tv size={13} color={mediaType === 'tv' ? '#fff' : '#94a3b8'} style={{ marginRight: 5 }} />
          <Text style={[styles.filterTypeText, mediaType === 'tv' && styles.filterTypeTextActive]}>
            {isRtl ? 'المسلسلات' : 'Series'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Genres horizontal list picker */}
      <View style={{ marginBottom: 15 }}>
        <FlatList
          data={genres}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genresContainer}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected = selectedGenre === item;
            return (
              <TouchableOpacity
                style={[styles.genrePill, isSelected && styles.genrePillActive]}
                onPress={() => setSelectedGenre(item)}
              >
                <Text style={[styles.genrePillText, isSelected && styles.genrePillTextActive]}>
                  {isRtl && item === 'All' ? 'الكل' : (isRtl && item === 'Arabic' ? 'دراما عربية 🇪🇬' : item)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 4. Filtered Result Count Banner */}
      <View style={styles.resultsCountBar}>
        <Sparkles size={12} color="#f43f5e" style={{ marginRight: 5 }} />
        <Text style={styles.resultsCountText}>
          {isRtl 
            ? ` عثرنا على ${filteredMedia.length} نتيجة ملائمة لك`
            : `Found ${filteredMedia.length} premium results for you`
          }
        </Text>
      </View>

      {/* 5. Clean Grid representation */}
      {filteredMedia.length > 0 ? (
        <FlatList
          data={filteredMedia}
          renderItem={renderGridCard}
          keyExtractor={(item) => item.id}
          numColumns={3}
          key="3-columns"
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Film size={44} color="#334155" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>
            {isRtl ? 'عذراً، لم نجد أي تطابق للبحث.' : 'No matches found. Try spelling differently.'}
          </Text>
          <TouchableOpacity style={styles.resetBtn} onPress={() => { setQuery(''); setSelectedGenre('All'); setMediaType('all'); }}>
            <Text style={styles.resetBtnText}>{isRtl ? 'إعادة تعيين الفلاتر' : 'Reset filters'}</Text>
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
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#06020f',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#130a2a',
    borderWidth: 1,
    borderColor: '#241249',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 10,
    gap: 8,
  },
  filterTypeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#130a2a',
    borderWidth: 1,
    borderColor: '#241249',
  },
  filterTypeTabActive: {
    backgroundColor: '#f43f5e',
    borderColor: '#f43f5e',
  },
  filterTypeText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  filterTypeTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
  genresContainer: {
    paddingLeft: 16,
    paddingRight: 10,
    gap: 8,
  },
  genrePill: {
    backgroundColor: '#12072e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1d1538',
  },
  genrePillActive: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  genrePillText: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  genrePillTextActive: {
    color: '#06020f',
    fontWeight: '900',
  },
  resultsCountBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCountText: {
    color: '#f44336',
    fontSize: 11,
    fontWeight: 'bold',
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 12,
  },
  gridCard: {
    width: (width - 40) / 3, // Safe 3-column setup
    marginBottom: 10,
    paddingHorizontal: 4,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 155,
    borderRadius: 14,
    backgroundColor: '#130a2a',
    marginBottom: 5,
  },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  cardTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13.5,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  resetBtn: {
    marginTop: 15,
    backgroundColor: '#130a2a',
    borderWidth: 1,
    borderColor: '#241249',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  resetBtnText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
