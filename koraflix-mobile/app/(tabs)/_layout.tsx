import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Home, Search, Bookmark, User } from 'lucide-react-native';
import { useAuth } from '../_layout';

export default function TabLayout() {
  const { isRtl } = useAuth();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: true,
      tabBarActiveTintColor: '#f43f5e', // Rose active color
      tabBarInactiveTintColor: '#94a3b8', // Gray inactive
      tabBarStyle: {
        backgroundColor: '#0c071e', // Dark purple-black matching KoraFlix theme
        borderTopWidth: 1,
        borderTopColor: '#1d1538',
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 24 : 10,
        height: Platform.OS === 'ios' ? 88 : 68,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      tabBarLabelStyle: {
        fontSize: 10.5,
        fontWeight: 'bold',
        marginTop: 2,
      }
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: isRtl ? 'الرئيسية' : 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: isRtl ? 'البحث' : 'Search',
          tabBarIcon: ({ color, focused }) => (
            <Search size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: isRtl ? 'مفضلتي' : 'Watchlist',
          tabBarIcon: ({ color, focused }) => (
            <Bookmark size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: isRtl ? 'حسابي' : 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
