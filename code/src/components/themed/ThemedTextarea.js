import React from 'react';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { useTheme } from '../../themes/theme';

export const ThemedTextarea = React.forwardRef(({ style, ...props }, ref) => {
     const { resolvedUiColors } = useTheme();
     const borderColor = resolvedUiColors.border;

     return <Textarea ref={ref} style={[{ borderColor }, style]} {...props} />;
});

export const ThemedTextareaInput = React.forwardRef(({ style, ...props }, ref) => {
     const { textColor } = useTheme();

     return <TextareaInput ref={ref} style={[{ color: textColor }, style]} {...props} />;
});

ThemedTextarea.displayName = 'ThemedTextarea';
ThemedTextareaInput.displayName = 'ThemedTextareaInput';
