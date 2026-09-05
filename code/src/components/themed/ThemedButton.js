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

// container is a real style object, not a className, because gluestack's own Button already
// carries a "size" variant (its own px-*/min-h-* classes, e.g. "sm" -> px-3 min-h-8) that
// competes with ours -- Uniwind resolves className through the actual compiled Tailwind
// stylesheet, so which one wins is governed by real CSS cascade order, not by where each class
// appears in the className string. That's not reliably controllable from here, so container
// sizing goes through style instead, which always wins over any className-derived style.
// min-height (not a hard height), so a button with long, wrapped ButtonText can grow taller
// instead of the text getting clipped -- paddingVertical is set independently of that, since
// minHeight only guarantees the single-line height and wrapped text needs breathing room above/
// below once it exceeds that.
const BUTTON_SIZE_STYLES = {
     xs: { container: { paddingHorizontal: 14, paddingVertical: 4, minHeight: 32 }, text: 'text-2xs', icon: '2xs' },
     sm: { container: { paddingHorizontal: 16, paddingVertical: 6, minHeight: 36 }, text: 'text-xs', icon: 'sm' },
     md: { container: { paddingHorizontal: 20, paddingVertical: 8, minHeight: 40 }, text: 'text-sm', icon: 'md' },
     lg: { container: { paddingHorizontal: 24, paddingVertical: 10, minHeight: 44 }, text: 'text-base', icon: 'md' },
     xl: { container: { paddingHorizontal: 28, paddingVertical: 12, minHeight: 48 }, text: 'text-lg', icon: 'lg' },
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
     // Flat object, not a [container, actionColors, style] array -- a caller-provided style array
     // here ends up nested inside Uniwind's own className-derived style array on the underlying
     // Pressable, and the override doesn't reliably win once that happens.
     const mergedStyle = Array.isArray(style)
          ? Object.assign({}, sizeStyle.container, actionColors ? { backgroundColor: actionColors.backgroundColor, borderColor: actionColors.borderColor } : null, ...style.filter(Boolean))
          : { ...sizeStyle.container, ...(actionColors ? { backgroundColor: actionColors.backgroundColor, borderColor: actionColors.borderColor } : null), ...style };

     return (
          <ButtonActionContext.Provider value={{ colorScheme, variant }}>
               <Button
                    ref={ref}
                    size={resolvedSize}
                    variant={variant}
                    className={className}
                    style={mergedStyle}
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

     // flexShrink so long text actually wraps within the button's row layout instead of just
     // pushing it wider forever; textAlign keeps multi-line text centered like the single-line
     // case already was via the button's own items-center. Flat object for the same reason as
     // ThemedButton's own style above -- an array here nests inside Uniwind's className-derived
     // style array and the override doesn't reliably win.
     const mergedTextStyle = Array.isArray(style)
          ? Object.assign({ flexShrink: 1, textAlign: 'center' }, actionColors ? { color: actionColors.textColor } : null, ...style.filter(Boolean))
          : { flexShrink: 1, textAlign: 'center', ...(actionColors ? { color: actionColors.textColor } : null), ...style };

     return <ButtonText ref={ref} className={[sizeStyle.text, className].filter(Boolean).join(' ')} style={mergedTextStyle} {...props} />;
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
