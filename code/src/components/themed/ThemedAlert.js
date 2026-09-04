import React from 'react';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { STATUS_ACTION_CLASSNAMES, normalizeStatusAction } from './statusStyles';

export const ThemedAlert = React.forwardRef(({ action, variant = 'default', className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = STATUS_ACTION_CLASSNAMES[normalizedAction] ?? STATUS_ACTION_CLASSNAMES.default;
     const alertClasses = variant === 'solid' ? statusClasses.solid : statusClasses.subtle ?? statusClasses.solid;

     return <Alert ref={ref} variant="default" className={[alertClasses, className].filter(Boolean).join(' ')} {...props} />;
});

export const ThemedAlertText = React.forwardRef(({ action, variant = 'default', className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = STATUS_ACTION_CLASSNAMES[normalizedAction] ?? STATUS_ACTION_CLASSNAMES.default;
     const textClasses = variant === 'solid' ? statusClasses.text : statusClasses.subtleText ?? statusClasses.text;

     return <AlertText ref={ref} className={[textClasses, className].filter(Boolean).join(' ')} {...props} />;
});

export const ThemedAlertIcon = React.forwardRef(({ action, variant = 'default', className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = STATUS_ACTION_CLASSNAMES[normalizedAction] ?? STATUS_ACTION_CLASSNAMES.default;
     const iconClasses = variant === 'solid' ? statusClasses.icon : statusClasses.subtleIcon ?? statusClasses.icon;

     return <AlertIcon ref={ref} className={[iconClasses, className].filter(Boolean).join(' ')} {...props} />;
});

ThemedAlert.displayName = 'ThemedAlert';
ThemedAlertText.displayName = 'ThemedAlertText';
ThemedAlertIcon.displayName = 'ThemedAlertIcon';
