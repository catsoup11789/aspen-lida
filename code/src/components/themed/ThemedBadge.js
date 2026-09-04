import React from 'react';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { STATUS_ACTION_CLASSNAMES, STATUS_VARIANT_TO_UI_VARIANT, normalizeStatusAction } from './statusStyles';

export const ThemedBadge = React.forwardRef(({ action, variant = 'default', className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = STATUS_ACTION_CLASSNAMES[normalizedAction] ?? STATUS_ACTION_CLASSNAMES.default;
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

export const ThemedBadgeText = React.forwardRef(({ action, className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = STATUS_ACTION_CLASSNAMES[normalizedAction] ?? STATUS_ACTION_CLASSNAMES.default;

     return <BadgeText ref={ref} className={[statusClasses.text, className].filter(Boolean).join(' ')} {...props} />;
});

export const ThemedBadgeIcon = React.forwardRef(({ action, className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = STATUS_ACTION_CLASSNAMES[normalizedAction] ?? STATUS_ACTION_CLASSNAMES.default;

     return <BadgeIcon ref={ref} className={[statusClasses.icon, className].filter(Boolean).join(' ')} {...props} />;
});

ThemedBadge.displayName = 'ThemedBadge';
ThemedBadgeText.displayName = 'ThemedBadgeText';
ThemedBadgeIcon.displayName = 'ThemedBadgeIcon';
