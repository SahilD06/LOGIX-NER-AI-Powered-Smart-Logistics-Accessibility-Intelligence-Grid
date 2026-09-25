import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';

interface ThemeToggleSwitchProps {
  scale?: number;
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({ scale = 1 }) => {
  const { isDark, toggleTheme } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={toggleTheme}
      accessibilityRole="switch"
      accessibilityLabel={`Toggle theme mode. Current: ${isDark ? 'Dark' : 'Light'}`}
      style={[
        styles.switchTrack,
        {
          backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
          borderColor: isDark ? '#38BDF8' : '#CBD5E1',
          transform: scale !== 1 ? [{ scale }] : undefined,
        },
      ]}
    >
      <View style={styles.iconContainerLeft}>
        <Sun size={13} color={isDark ? '#64748B' : '#F59E0B'} />
      </View>
      <View style={styles.iconContainerRight}>
        <Moon size={13} color={isDark ? '#38BDF8' : '#94A3B8'} />
      </View>
      <View
        style={[
          styles.switchThumb,
          {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            borderColor: isDark ? '#38BDF8' : '#94A3B8',
            left: isDark ? 32 : 3,
          },
        ]}
      >
        {isDark ? (
          <Moon size={11} color="#38BDF8" fill="#38BDF8" />
        ) : (
          <Sun size={11} color="#F59E0B" fill="#F59E0B" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchTrack: {
    width: 60,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 7,
    position: 'relative',
  },
  iconContainerLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchThumb: {
    position: 'absolute',
    top: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

