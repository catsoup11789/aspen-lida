import React from 'react';
import { StyleSheet } from 'react-native';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { BADGE_ACTION_CLASSNAMES, STATUS_VARIANT_TO_UI_VARIANT, normalizeStatusAction } from './statusStyles';

// Shared shape for the outline "tag" badges (format, registration, etc.) that are
// tinted with the library's dynamic brand color rather than a semantic action.
export function buildBrandOutlineBadgeStyle(color) {
     return { borderRadius: 8, borderColor: color, backgroundColor: 'transparent' };
}

export function buildBrandOutlineBadgeTextStyle(color, extra = {}) {
     return { color, ...extra };
}

export const ThemedBadge = React.forwardRef(({ action, variant = 'default', className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = BADGE_ACTION_CLASSNAMES[normalizedAction] ?? BADGE_ACTION_CLASSNAMES.default;
     const resolvedVariant = STATUS_VARIANT_TO_UI_VARIANT[normalizedAction] ?? variant;

     return (
          <Badge
               ref={ref}
               variant={resolvedVariant}
               className={[statusClasses.solid, className].filter(Boolean).join(' ')}
               {...props}
          />
     );
});

export const ThemedBadgeText = React.forwardRef(({ action, className, style, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = BADGE_ACTION_CLASSNAMES[normalizedAction] ?? BADGE_ACTION_CLASSNAMES.default;

     return <BadgeText ref={ref} className={[statusClasses.text, className].filter(Boolean).join(' ')} style={{ textTransform: 'none', ...StyleSheet.flatten(style) }} {...props} />;
});

export const ThemedBadgeIcon = React.forwardRef(({ action, className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = BADGE_ACTION_CLASSNAMES[normalizedAction] ?? BADGE_ACTION_CLASSNAMES.default;

     return <BadgeIcon ref={ref} className={[statusClasses.icon, className].filter(Boolean).join(' ')} {...props} />;
});

ThemedBadge.displayName = 'ThemedBadge';
ThemedBadgeText.displayName = 'ThemedBadgeText';
ThemedBadgeIcon.displayName = 'ThemedBadgeIcon';
