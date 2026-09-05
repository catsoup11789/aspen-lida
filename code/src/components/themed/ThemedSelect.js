import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
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

const SELECT_ICON_SIZE = {
     xl: 'h-6 w-6',
     lg: 'h-5 w-5',
     md: 'h-4 w-4',
     sm: 'h-3.5 w-3.5',
};

// gluestack's own selectTriggerStyle only sets a min-h-* floor per size, which lets the trigger's
// actual rendered height drift above ThemedButton's exact per-size height (icon + text content can
// exceed the floor) -- an exact h-* here, matching ThemedButton's BUTTON_SIZE_STYLES min-h values,
// pins them to the same height so a Button and a Select sitting side by side in a row stay aligned
// regardless of content, instead of just relying on flex centering to paper over a height mismatch.
const SELECT_TRIGGER_HEIGHT = {
     xl: 'h-12',
     lg: 'h-11',
     md: 'h-10',
     sm: 'h-9',
};

const SelectValueContext = React.createContext(undefined);

export const ThemedSelect = React.forwardRef(({ selectedValue, ...props }, ref) => {
     return (
          <SelectValueContext.Provider value={selectedValue}>
               <Select ref={ref} selectedValue={selectedValue} {...props} />
          </SelectValueContext.Provider>
     );
});

ThemedSelect.displayName = 'ThemedSelect';

export const ThemedSelectInput = React.forwardRef(({ style, ...props }, ref) => {
     const { textColor } = useTheme();

     return <SelectInput ref={ref} style={[{ paddingVertical: 0, color: textColor }, style]} {...props} />;
});

ThemedSelectInput.displayName = 'ThemedSelectInput';

export const ThemedSelectTrigger = React.forwardRef(({ children, variant = 'outline', size = 'md', className, style, ...props }, ref) => {
     const { resolvedUiColors } = useTheme();
     const borderColor = resolvedUiColors.border;

     const heightClass = SELECT_TRIGGER_HEIGHT[size] ?? SELECT_TRIGGER_HEIGHT.md;
     const mergedStyle = Array.isArray(style) ? Object.assign({ borderColor }, ...style.filter(Boolean)) : { borderColor, ...style };

     return (
          <SelectTrigger variant="outline" ref={ref} size={size} className={['justify-between', heightClass, className].filter(Boolean).join(' ')} style={mergedStyle} {...props}>
               {children}
               <MaterialIcons name="expand-more" size={18} className="mr-3" />
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

export const ThemedSelectContent = React.forwardRef(({ style, ...props }, ref) => {
     const { resolvedUiColors } = useTheme();
     const insets = useSafeAreaInsets();
     const { height: windowHeight } = useWindowDimensions();
     const surfaceBg = resolvedUiColors.surface;
     const paddingBottom = Platform.OS === 'android' ? insets.bottom + 16 : 16;

     return <SelectContent ref={ref} style={[{ backgroundColor: surfaceBg, paddingBottom, maxHeight: windowHeight * 0.8 }, style]} {...props} />;
});

ThemedSelectContent.displayName = 'ThemedSelectContent';

export const ThemedSelectDragIndicator = SelectDragIndicator;
export const ThemedSelectDragIndicatorWrapper = SelectDragIndicatorWrapper;

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
