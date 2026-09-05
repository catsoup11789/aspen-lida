import React from 'react';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { ThemedMaterialIcons as MaterialIcons } from './ThemedMaterialIcons';
import { ALERT_ACTION_CLASSNAMES, normalizeStatusAction } from './statusStyles';

const ALERT_ICON_NAMES = {
     default: 'info',
     error: 'error',
     warning: 'warning',
     success: 'check-circle',
     info: 'info',
     muted: 'info',
};

export const ThemedAlert = React.forwardRef(({ action, variant = 'default', className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = ALERT_ACTION_CLASSNAMES[normalizedAction] ?? ALERT_ACTION_CLASSNAMES.default;
     const alertClasses = variant === 'solid' ? statusClasses.solid : statusClasses.subtle ?? statusClasses.solid;

     return <Alert ref={ref} variant="default" className={[alertClasses, className].filter(Boolean).join(' ')} {...props} />;
});

export const ThemedAlertText = React.forwardRef(({ action, variant = 'default', className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = ALERT_ACTION_CLASSNAMES[normalizedAction] ?? ALERT_ACTION_CLASSNAMES.default;
     const textClasses = variant === 'solid' ? statusClasses.text : statusClasses.subtleText ?? statusClasses.text;

     return <AlertText ref={ref} className={[textClasses, className].filter(Boolean).join(' ')} {...props} />;
});

export const ThemedAlertIcon = React.forwardRef(({ action, variant = 'default', as, name, className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = ALERT_ACTION_CLASSNAMES[normalizedAction] ?? ALERT_ACTION_CLASSNAMES.default;
     const iconClasses = variant === 'solid' ? statusClasses.icon : statusClasses.subtleIcon ?? statusClasses.icon;

     return <AlertIcon ref={ref} as={as ?? MaterialIcons} name={name ?? ALERT_ICON_NAMES[normalizedAction]} className={[iconClasses, className].filter(Boolean).join(' ')} {...props} />;
});

ThemedAlert.displayName = 'ThemedAlert';
ThemedAlertText.displayName = 'ThemedAlertText';
ThemedAlertIcon.displayName = 'ThemedAlertIcon';
