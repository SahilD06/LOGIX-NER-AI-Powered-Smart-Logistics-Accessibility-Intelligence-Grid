import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';

export interface CustomTabBarProps {
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string;
      params?: any;
    }>;
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarLabel?: any;
        tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
        tabBarAccessibilityLabel?: string;
        tabBarButtonTestID?: string;
      };
    }
  >;
  navigation: {
    emit: (event: any) => any;
    navigate: (name: string, params?: any) => void;
  };
}

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  // Elevate navbar above device system navigation bar
  const bottomMargin = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 10) + 6;

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom: bottomMargin,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.navFrame,
          {
            backgroundColor: isDark ? '#151926' : '#FFFFFF',
            borderColor: isDark ? '#262D42' : '#E2E8F0',
            shadowColor: '#000',
            shadowOpacity: isDark ? 0.45 : 0.12,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const activeLineColor = isDark ? '#38BDF8' : '#2563EB';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabItem,
                isFocused && [
                  styles.activeTabItem,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.08)',
                  },
                ],
              ]}
              activeOpacity={0.75}
            >
              <View style={styles.iconWrapper}>
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused
                      ? isDark
                        ? '#FFFFFF'
                        : '#2563EB'
                      : isDark
                      ? '#8B95A5'
                      : '#64748B',
                    size: 22,
                  })}
              </View>

              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused
                      ? isDark
                        ? '#FFFFFF'
                        : '#2563EB'
                      : isDark
                      ? '#8B95A5'
                      : '#64748B',
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {typeof label === 'string' ? label : ''}
              </Text>

              {/* Active Tab Bottom Indicator Bar (matching reference image) */}
              {isFocused && (
                <View
                  style={[
                    styles.activeIndicatorLine,
                    { backgroundColor: activeLineColor },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  navFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '92%',
    maxWidth: 480,
    height: 70,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 6,
    paddingVertical: 5,
    overflow: 'hidden',
    elevation: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    position: 'relative',
    paddingVertical: 6,
    overflow: 'hidden',
  },
  activeTabItem: {
    // Highlighted card block background matching reference frame
  },
  iconWrapper: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    letterSpacing: -0.1,
  },
  activeIndicatorLine: {
    position: 'absolute',
    bottom: 2,
    left: 14,
    right: 14,
    height: 3,
    borderRadius: 2,
  },
});
