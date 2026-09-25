import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

interface ThemeToggleSwitchProps {
  scale?: number;
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({ scale = 1 }) => {
  const { isDark, toggleTheme } = useAppTheme();

  if (Platform.OS === 'web') {
    return (
      <label
        className="uiverse-switch"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'center center',
          display: 'inline-block',
          cursor: 'pointer',
        }}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      >
        <input
          type="checkbox"
          className="uiverse-input"
          checked={isDark}
          onChange={toggleTheme}
          style={{ display: 'none' }}
        />
        <span className="uiverse-slider">
          <span className="uiverse-sun">
            <svg viewBox="0 0 24 24" fill="#FFA500" stroke="#FFA500" strokeWidth="1.5">
              <circle cx="12" cy="12" r="5" fill="#FFA500" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
              />
            </svg>
          </span>
          <span className="uiverse-moon">
            <svg viewBox="0 0 24 24" fill="#73C0FC">
              <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          </span>
        </span>
      </label>
    );
  }

  // React Native fallback for Mobile Native
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={toggleTheme}
      style={[
        styles.nativeSwitch,
        {
          backgroundColor: isDark ? '#183153' : '#73C0FC',
          transform: [{ scale }],
        },
      ]}
    >
      <View
        style={[
          styles.nativeThumb,
          {
            transform: [{ translateX: isDark ? 30 : 0 }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nativeSwitch: {
    width: 64,
    height: 34,
    borderRadius: 30,
    padding: 3,
    justifyContent: 'center',
    position: 'relative',
  },
  nativeThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e8e8e8',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
});
