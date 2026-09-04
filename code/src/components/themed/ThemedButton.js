import React from 'react';
import { useStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { useTheme } from '../../themes/theme';

const SCOPE = 'BUTTON';

// colorScheme picks one of the app's brand color scales (runtimeColors.primary/secondary/tertiary),
// applied differently per variant: solid (default/destructive/etc.) gets a filled background with
// the '500-text' contrast color for text; outline gets a 500-shade border with 500-shade text, no
// fill; link/ghost get no border and no background, just 500-shade text. Threaded to
// ThemedButtonText via a local context -- Button's own context={{variant,size}} is set internally
// by the primitive, so it can't carry extra fields; this tree isn't portal-rendered, so a plain
// Context works fine (same approach as ThemedCheckbox's checked-state context).
const ButtonActionContext = React.createContext({ colorScheme: undefined, variant: undefined });

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

// The underlying Button primitive was regenerated against gluestack v5's shadcn-style size
// keys (default/sm/lg/icon), but the app calls it everywhere with gluestack v1's size keys
// (xs/sm/md/lg/xl). Since "md" (and friends) never matched any of v5's keys, the tva silently
// dropped ALL size-based classes -- including padding -- leaving buttons squished. This map
// restores v1's actual px/height/text/icon values (gluestack-ui v1.0.48, packages/config/src/
// theme/Button.ts) so the app's existing size props behave the way they did under v1.
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

export const ThemedButton = React.forwardRef(({ size = 'md', colorScheme, variant, className, style, ...props }, ref) => {
     const sizeStyle = resolveButtonSizeStyle(size);
     const { runtimeColors } = useTheme();
     const actionColors = resolveActionColors(runtimeColors, colorScheme, variant);

     return (
          <ButtonActionContext.Provider value={{ colorScheme, variant }}>
               <Button
                    ref={ref}
                    size={size}
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

ThemedButton.displayName = 'ThemedButton';
ThemedButtonText.displayName = 'ThemedButtonText';
ThemedButtonIcon.displayName = 'ThemedButtonIcon';
ThemedButtonSpinner.displayName = 'ThemedButtonSpinner';
