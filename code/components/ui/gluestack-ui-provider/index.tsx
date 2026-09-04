import React, { useEffect } from 'react';
import { config } from './config';
import { View, ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import { useColorScheme } from 'nativewind';

export type ModeType = 'light' | 'dark' | 'system';

export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: ModeType;
  colorMode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const resolvedMode = props.colorMode ?? mode;
  const activeColorScheme = colorScheme ?? resolvedMode ?? 'light';

  useEffect(() => {
    setColorScheme(resolvedMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedMode]);

  return (
    <View
      style={[
      config[activeColorScheme],
        { flex: 1, height: '100%', width: '100%' },
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}

export { useColorScheme };
