import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import {
     Select,
     SelectTrigger,
     SelectInput,
     SelectIcon,
     SelectPortal,
     SelectBackdrop,
     SelectContent,
     SelectDragIndicator,
     SelectDragIndicatorWrapper,
     SelectItem,
     SelectScrollView,
     SelectVirtualizedList,
     SelectFlatList,
     SelectSectionList,
     SelectSectionHeaderText,
} from '@/components/ui/select';
import { ThemedMaterialIcons as MaterialIcons } from './ThemedMaterialIcons';
import { useTheme } from '../../themes/theme';

// Select's sizing already closely matches gluestack v1 -- same xl/lg/md/sm keys, matching
// trigger heights (h-9 through h-12) and input text sizes. The one drift: the icon currently
// uses the app's shared icon-size scale (18px for "md", 16px for "sm") instead of v1's own
// SelectTrigger-specific icon sizes (packages/config/src/theme/SelectTrigger.ts: 16px for
// "md", 14px for "sm"). Re-exported here mainly so Select has the same themed import surface
// as Checkbox/Radio/Button for consistency and future custom styling.
const SELECT_ICON_SIZE = {
     xl: 'h-6 w-6',
     lg: 'h-5 w-5',
     md: 'h-4 w-4',
     sm: 'h-3.5 w-3.5',
};

// Exposes the enclosing Select's selectedValue to ThemedSelectItem so it can auto-highlight
// the currently-selected item, matching the pattern every screen was hand-rolling.
const SelectValueContext = React.createContext(undefined);

export const ThemedSelect = React.forwardRef(({ selectedValue, ...props }, ref) => {
     return (
          <SelectValueContext.Provider value={selectedValue}>
               <Select ref={ref} selectedValue={selectedValue} {...props} />
          </SelectValueContext.Provider>
     );
});

ThemedSelect.displayName = 'ThemedSelect';

// paddingVertical: 0 and color: textColor were already being passed manually at nearly every
// call site -- baked in here as defaults so new Selects get them for free, while callers can
// still override via their own style prop.
export const ThemedSelectInput = React.forwardRef(({ style, ...props }, ref) => {
     const { textColor } = useTheme();

     return <SelectInput ref={ref} style={[{ paddingVertical: 0, color: textColor }, style]} {...props} />;
});

ThemedSelectInput.displayName = 'ThemedSelectInput';

// Standardized on src/screens/GroupedWork/SelectPickupLocation.js: variant="outline"
// size="md" (already the underlying primitive's own defaults, but explicit here so every
// Select gets them without repeating at the call site), plus the trigger chevron -- a plain
// (full-opacity) Icon rather than the dimmed SelectIcon, with marginRight: 12. Every call site
// used to render this icon manually with drifting spacing/color -- it's now built into the
// trigger itself so all Selects render it identically.
//
// The primitive's own className border (border-border) is the same unreliable/too-faint
// className-driven border ThemedInput already works around -- explicit borderColor here so a
// closed Select reads as a normal input field, matching ThemedInput's own borderColor override.
export const ThemedSelectTrigger = React.forwardRef(({ children, variant = 'outline', size = 'md', className, style, ...props }, ref) => {
     const { uiColors, colorMode } = useTheme();
     const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;

     return (
          <SelectTrigger variant="outline" ref={ref} size={size} className={['justify-between', className].filter(Boolean).join(' ')} style={[{ borderColor }, style]} {...props}>
               {children}
               <MaterialIcons name="expand-more" size={18} style={{ marginRight: 12 }} />
          </SelectTrigger>
     );
});

ThemedSelectTrigger.displayName = 'ThemedSelectTrigger';

export const ThemedSelectIcon = React.forwardRef(({ size, className, ...props }, ref) => {
     const { size: parentSize } = useStyleContext();
     const resolvedSize = size ?? parentSize;
     const sizeClass = SELECT_ICON_SIZE[resolvedSize] ?? SELECT_ICON_SIZE.md;

     return <SelectIcon ref={ref} size={size} className={[sizeClass, className].filter(Boolean).join(' ')} {...props} />;
});

export const ThemedSelectPortal = SelectPortal;
export const ThemedSelectBackdrop = SelectBackdrop;

// backgroundColor: surfaceBg (matching the app's theme surface) and a bottom-safe-area-aware
// paddingBottom were already being passed manually at nearly every call site -- baked in here
// as defaults, overridable via the caller's own style prop.
export const ThemedSelectContent = React.forwardRef(({ style, ...props }, ref) => {
     const { uiColors, colorMode } = useTheme();
     const insets = useSafeAreaInsets();
     const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
     const paddingBottom = Platform.OS === 'android' ? insets.bottom + 16 : 16;

     return <SelectContent ref={ref} style={[{ backgroundColor: surfaceBg, paddingBottom }, style]} {...props} />;
});

ThemedSelectContent.displayName = 'ThemedSelectContent';

export const ThemedSelectDragIndicator = SelectDragIndicator;
export const ThemedSelectDragIndicatorWrapper = SelectDragIndicatorWrapper;

// Auto-highlights the item matching the enclosing Select's selectedValue, using the same
// runtimeColors.tertiary[300]/[500] highlight every screen was already computing by hand.
// selectedValue is accepted as an explicit prop rather than read purely from
// SelectValueContext -- gluestack's Select renders its dropdown through an Actionsheet/Overlay
// portal that doesn't reliably preserve React context across the boundary, so context is kept
// only as a fallback. Loose equality since selectedValue/value pairs are sometimes a string on
// one side and a number on the other (e.g. value="-1" vs a numeric -1 selectedValue) in
// existing usage. Callers can still override via their own style prop.
export const ThemedSelectItem = React.forwardRef(({ value, selectedValue: selectedValueProp, style, ...props }, ref) => {
     const selectedValueFromContext = React.useContext(SelectValueContext);
     const selectedValue = selectedValueProp !== undefined ? selectedValueProp : selectedValueFromContext;
     const { runtimeColors } = useTheme();
     const highlightColor = runtimeColors.tertiary[300] ?? runtimeColors.tertiary[500];
     // eslint-disable-next-line eqeqeq
     const isSelected = selectedValue !== undefined && selectedValue !== null && selectedValue == value;

     return <SelectItem ref={ref} value={value} style={[{ backgroundColor: isSelected ? highlightColor : 'transparent' }, style]} {...props} />;
});

ThemedSelectItem.displayName = 'ThemedSelectItem';

export const ThemedSelectScrollView = SelectScrollView;
export const ThemedSelectVirtualizedList = SelectVirtualizedList;
export const ThemedSelectFlatList = SelectFlatList;
export const ThemedSelectSectionList = SelectSectionList;
export const ThemedSelectSectionHeaderText = SelectSectionHeaderText;

ThemedSelectIcon.displayName = 'ThemedSelectIcon';
