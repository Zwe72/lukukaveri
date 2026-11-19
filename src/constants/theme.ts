/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';


export const Colors = {
  light: {
    text: '#26352C',
    background: '#F8F7F3',
    backgroundElement: '#E9EEE7',
    backgroundSelected: '#D9E4D8',
    textSecondary: '#777777',
    primary: '#64816D',
    card: '#FFFFFF',
    border: '#E8E6DF',
    lightButtonText: '#FFFFFF',
  },
  dark: {
    text: '#F2F4EF',
    background: '#151B17',
    backgroundElement: '#242D26',
    backgroundSelected: '#334136',
    textSecondary: '#B8C1B8',
    primary: '#9BB69E',
    card: '#1D251F',
    border: '#354238',
    lightButtonText: '#151B17',
  },
} as const;


export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
