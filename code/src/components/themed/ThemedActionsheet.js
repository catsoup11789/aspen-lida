import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
     Actionsheet,
     ActionsheetBackdrop,
     ActionsheetContent,
     ActionsheetDragIndicator,
     ActionsheetDragIndicatorWrapper,
     ActionsheetFlatList,
     ActionsheetIcon,
     ActionsheetItem,
     ActionsheetItemText,
     ActionsheetScrollView,
     ActionsheetSectionHeaderText,
     ActionsheetSectionList,
     ActionsheetVirtualizedList,
} from '@/components/ui/actionsheet';
import { useTheme } from '../../themes/theme';

export const ThemedActionsheet = Actionsheet;
export const ThemedActionsheetBackdrop = ActionsheetBackdrop;
export const ThemedActionsheetDragIndicator = ActionsheetDragIndicator;
export const ThemedActionsheetDragIndicatorWrapper = ActionsheetDragIndicatorWrapper;
export const ThemedActionsheetFlatList = ActionsheetFlatList;
export const ThemedActionsheetIcon = ActionsheetIcon;
export const ThemedActionsheetItem = ActionsheetItem;
export const ThemedActionsheetScrollView = ActionsheetScrollView;
export const ThemedActionsheetSectionHeaderText = ActionsheetSectionHeaderText;
export const ThemedActionsheetSectionList = ActionsheetSectionList;
export const ThemedActionsheetVirtualizedList = ActionsheetVirtualizedList;

// backgroundColor: surfaceBg (matching the app's theme surface) and a bottom-safe-area-aware
// paddingBottom were already being passed manually at nearly every call site -- baked in here
// as defaults, overridable via the caller's own style prop.
export const ThemedActionsheetContent = React.forwardRef(({ style, ...props }, ref) => {
     const { uiColors, colorMode } = useTheme();
     const insets = useSafeAreaInsets();
     const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
     const paddingBottom = Platform.OS === 'android' ? insets.bottom + 16 : 16;

     return <ActionsheetContent ref={ref} style={[{ backgroundColor: surfaceBg, paddingBottom }, style]} {...props} />;
});

ThemedActionsheetContent.displayName = 'ThemedActionsheetContent';

// color: textColor was already being passed manually at nearly every call site -- baked in
// here as a default, overridable via the caller's own style prop.
export const ThemedActionsheetItemText = React.forwardRef(({ style, ...props }, ref) => {
     const { textColor } = useTheme();

     return <ActionsheetItemText ref={ref} style={[{ color: textColor }, style]} {...props} />;
});

ThemedActionsheetItemText.displayName = 'ThemedActionsheetItemText';
