import React from 'react';
import { StyleSheet } from 'react-native';
import { useStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { Button, ButtonGroup, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { useTheme } from '../../themes/theme';

const SCOPE = 'BUTTON';

const ButtonActionContext = React.createContext({ colorScheme: undefined, variant: undefined });

const ButtonGroupSizeContext = React.createContext(undefined);

function resolveActionColors(runtimeColors, colorScheme, variant) {
     const scale = runtimeColors?.[colorScheme];
     if (!scale) {
          return null;
     }
     if (variant === 'outline') {
          return { borderColor: scale[500], textColor: scale[500] };
     }
     if (variant === 'link' || variant === 'ghost') {
          return { textColor: scale[500] };
     }
     return { backgroundColor: scale[500], textColor: scale['500-text'] };
}

const BUTTON_SIZE_STYLES = {
     xs: { container: 'px-3.5 h-8', text: 'text-xs', icon: '2xs' },
     sm: { container: 'px-4 h-9', text: 'text-sm', icon: 'sm' },
     md: { container: 'px-5 h-10', text: 'text-base', icon: 'md' },
     lg: { container: 'px-6 h-11', text: 'text-lg', icon: 'md' },
     xl: { container: 'px-7 h-12', text: 'text-xl', icon: 'lg' },
};

function resolveButtonSizeStyle(size) {
     return BUTTON_SIZE_STYLES[size] ?? BUTTON_SIZE_STYLES.md;
}

export const ThemedButton = React.forwardRef(({ size, colorScheme, variant, className, style, ...props }, ref) => {
     const groupSize = React.useContext(ButtonGroupSizeContext);
     const resolvedSize = size ?? groupSize ?? 'md';
     const sizeStyle = resolveButtonSizeStyle(resolvedSize);
     const { runtimeColors } = useTheme();
     const actionColors = resolveActionColors(runtimeColors, colorScheme, variant);

     return (
          <ButtonActionContext.Provider value={{ colorScheme, variant }}>
               <Button
                    ref={ref}
                    size={resolvedSize}
                    variant={variant}
                    className={[sizeStyle.container, className].filter(Boolean).join(' ')}
                    style={[actionColors ? { backgroundColor: actionColors.backgroundColor, borderColor: actionColors.borderColor } : null, style]}
                    {...props}
               />
          </ButtonActionContext.Provider>
     );
});

export const ThemedButtonText = React.forwardRef(({ className, style, ...props }, ref) => {
     const { size: parentSize } = useStyleContext(SCOPE);
     const sizeStyle = resolveButtonSizeStyle(parentSize);
     const { colorScheme, variant } = React.useContext(ButtonActionContext);
     const { runtimeColors } = useTheme();
     const actionColors = resolveActionColors(runtimeColors, colorScheme, variant);

     return <ButtonText ref={ref} className={[sizeStyle.text, className].filter(Boolean).join(' ')} style={[actionColors ? { color: actionColors.textColor } : null, style]} {...props} />;
});

export const ThemedButtonIcon = React.forwardRef(({ size, ...props }, ref) => {
     const { size: parentSize } = useStyleContext(SCOPE);
     const sizeStyle = resolveButtonSizeStyle(parentSize);

     return <ButtonIcon ref={ref} size={size ?? sizeStyle.icon} {...props} />;
});

export const ThemedButtonSpinner = React.forwardRef((props, ref) => {
     return <ButtonSpinner ref={ref} {...props} />;
});

const BUTTON_BORDER_RADIUS = 6;

function applyAttachedCorners(children, flexDirection) {
     const items = React.Children.toArray(children);
     if (items.length < 2) {
          return children;
     }
     const isRow = flexDirection === 'row' || flexDirection === 'row-reverse';
     return items.map((child, index) => {
          if (!React.isValidElement(child)) {
               return child;
          }
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const startRadius = isFirst ? BUTTON_BORDER_RADIUS : 0;
          const endRadius = isLast ? BUTTON_BORDER_RADIUS : 0;
          const cornerStyle = isRow
               ? { borderTopLeftRadius: startRadius, borderBottomLeftRadius: startRadius, borderTopRightRadius: endRadius, borderBottomRightRadius: endRadius }
               : { borderTopLeftRadius: startRadius, borderTopRightRadius: startRadius, borderBottomLeftRadius: endRadius, borderBottomRightRadius: endRadius };
          const childStyle = StyleSheet.flatten(child.props.style) ?? {};
          const definedChildStyle = Object.fromEntries(Object.entries(childStyle).filter(([, value]) => value !== undefined));
          return React.cloneElement(child, {
               style: { ...definedChildStyle, ...cornerStyle },
          });
     });
}

export const ThemedButtonGroup = React.forwardRef(({ flexDirection = 'row', size, space, isAttached, children, ...props }, ref) => {
     return (
          <ButtonGroupSizeContext.Provider value={size}>
               <ButtonGroup ref={ref} flexDirection={flexDirection} space={space} isAttached={isAttached} {...props}>
                    {isAttached ? applyAttachedCorners(children, flexDirection) : children}
               </ButtonGroup>
          </ButtonGroupSizeContext.Provider>
     );
});

ThemedButton.displayName = 'ThemedButton';
ThemedButtonText.displayName = 'ThemedButtonText';
ThemedButtonIcon.displayName = 'ThemedButtonIcon';
ThemedButtonSpinner.displayName = 'ThemedButtonSpinner';
ThemedButtonGroup.displayName = 'ThemedButtonGroup';
