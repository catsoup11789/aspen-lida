import React from 'react';
import { Text } from '@/components/ui/text';
import { useTheme } from '../../themes/theme';

export const ThemedText = React.forwardRef(({ size = 'sm', style, ...props }, ref) => {
     const { textColor } = useTheme();

     return <Text ref={ref} size={size} style={[{ color: textColor }, style]} {...props} />;
});

ThemedText.displayName = 'ThemedText';
