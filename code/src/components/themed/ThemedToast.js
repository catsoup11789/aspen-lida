import React from 'react';
import { Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { ALERT_ACTION_CLASSNAMES, normalizeStatusAction } from './statusStyles';

export const ThemedToast = React.forwardRef(({ action, variant = 'solid', className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = ALERT_ACTION_CLASSNAMES[normalizedAction] ?? ALERT_ACTION_CLASSNAMES.default;
     const toastClasses =
          variant === 'accent'
               ? [statusClasses.solid, 'border-0', 'border-l-4', statusClasses.accentBorder, 'shadow-soft-4'].join(' ')
               : variant === 'solid' ? statusClasses.solid : statusClasses.subtle ?? statusClasses.solid;

     return <Toast ref={ref} action={action} variant={variant} className={[toastClasses, className].filter(Boolean).join(' ')} {...props} />;
});

export const ThemedToastTitle = React.forwardRef(({ action, variant = 'solid', className, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const statusClasses = ALERT_ACTION_CLASSNAMES[normalizedAction] ?? ALERT_ACTION_CLASSNAMES.default;
     const textClasses = variant === 'solid' ? statusClasses.text : statusClasses.subtleText ?? statusClasses.text;

     return <ToastTitle ref={ref} className={[textClasses, className].filter(Boolean).join(' ')} {...props} />;
});

export const ThemedToastDescription = React.forwardRef(({ className, ...props }, ref) => {
     return <ToastDescription ref={ref} className={className} {...props} />;
});

ThemedToast.displayName = 'ThemedToast';
ThemedToastTitle.displayName = 'ThemedToastTitle';
ThemedToastDescription.displayName = 'ThemedToastDescription';
