import React from 'react';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../themes/theme';

export const ThemedMaterialIcons = React.forwardRef(({ color, ...props }, ref) => {
     const { textColor } = useTheme();

     return <MaterialIcons ref={ref} color={color ?? textColor} {...props} />;
});

export const ThemedMaterialCommunityIcons = React.forwardRef(({ color, ...props }, ref) => {
     const { textColor } = useTheme();

     return <MaterialCommunityIcons ref={ref} color={color ?? textColor} {...props} />;
});

ThemedMaterialIcons.displayName = 'ThemedMaterialIcons';
ThemedMaterialCommunityIcons.displayName = 'ThemedMaterialCommunityIcons';
