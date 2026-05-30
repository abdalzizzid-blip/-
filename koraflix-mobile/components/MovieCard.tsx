import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';
import { MediaItem } from '../types';

interface Props {
  item: MediaItem;
  isRtl?: boolean;
}

export default function MovieCard({ item, isRtl }: Props) {
  const router = useRouter();
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePressIn = () => {
    timerRef.current = setTimeout(() => {
      setIsPressing(true);
    }, 400); // Delay
  };

  const handlePressOut = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPressing(false);
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: `/details/[id]`, params: { id: item.id } })}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {isPressing && item.trailerUrl ? (
        <Video
          source={{ uri: item.trailerUrl }}
          style={styles.cardImage}
          resizeMode={ResizeMode.COVER}
          isMuted={true}
          shouldPlay={true}
          isLooping={true}
        />
      ) : (
        <Image source={{ uri: item.posterUrl }} style={styles.cardImage} />
      )}
      
      {item.isExclusive && (
        <View style={styles.exclusiveBadge}>
          <Text style={styles.badgeText}>{isRtl ? 'حصرى VIP' : 'Exclusive'}</Text>
        </View>
      )}
      <View style={styles.ratingBadge}>
        <Star size={11} color="#fbbf24" style={{ marginRight: 2 }} />
        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
