import React from 'react';
import { Heading } from '@/components/ui/heading';
import { useTheme } from '../../themes/theme';

export const ThemedHeading = React.forwardRef(({ style, ...props }, ref) => {
     const { textColor } = useTheme();

     return <Heading ref={ref} style={[{ color: textColor }, style]} {...props} />;
});

ThemedHeading.displayName = 'ThemedHeading';
