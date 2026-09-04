import React from 'react';
import { useStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';

const SCOPE = 'BUTTON';

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

export const ThemedButton = React.forwardRef(({ size = 'md', className, ...props }, ref) => {
     const sizeStyle = resolveButtonSizeStyle(size);

     return (
          <Button
               ref={ref}
               size={size}
               className={[sizeStyle.container, className].filter(Boolean).join(' ')}
               {...props}
          />
     );
});

export const ThemedButtonText = React.forwardRef(({ className, ...props }, ref) => {
     const { size: parentSize } = useStyleContext(SCOPE);
     const sizeStyle = resolveButtonSizeStyle(parentSize);

     return <ButtonText ref={ref} className={[sizeStyle.text, className].filter(Boolean).join(' ')} {...props} />;
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
