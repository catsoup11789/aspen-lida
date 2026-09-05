export const ALERT_ACTION_CLASSNAMES = {
  default: {
    solid: 'bg-primary',
    subtle: 'bg-primary',
    text: 'text-primary-foreground',
    subtleText: 'text-primary-foreground',
    icon: 'text-primary-foreground',
    subtleIcon: 'text-primary-foreground',
    accentBorder: 'border-l-primary',
  },
  error: {
    solid: 'bg-alert-error-bg',
    subtle: 'bg-alert-error-bg',
    text: 'text-alert-error-foreground',
    subtleText: 'text-alert-error-foreground',
    icon: 'text-alert-error-icon',
    subtleIcon: 'text-alert-error-icon',
    accentBorder: 'border-l-alert-error-icon',
  },
  warning: {
    solid: 'bg-alert-warning-bg',
    subtle: 'bg-alert-warning-bg',
    text: 'text-alert-warning-foreground',
    subtleText: 'text-alert-warning-foreground',
    icon: 'text-alert-warning-icon',
    subtleIcon: 'text-alert-warning-icon',
    accentBorder: 'border-l-alert-warning-icon',
  },
  success: {
    solid: 'bg-alert-success-bg',
    subtle: 'bg-alert-success-bg',
    text: 'text-alert-success-foreground',
    subtleText: 'text-alert-success-foreground',
    icon: 'text-alert-success-icon',
    subtleIcon: 'text-alert-success-icon',
    accentBorder: 'border-l-alert-success-icon',
  },
  info: {
    solid: 'bg-alert-info-bg',
    subtle: 'bg-alert-info-bg',
    text: 'text-alert-info-foreground',
    subtleText: 'text-alert-info-foreground',
    icon: 'text-alert-info-icon',
    subtleIcon: 'text-alert-info-icon',
    accentBorder: 'border-l-alert-info-icon',
  },
  muted: {
    solid: 'bg-secondary border-secondary',
    subtle: 'bg-card border-border',
    text: 'text-secondary-foreground',
    subtleText: 'text-card-foreground',
    icon: 'text-secondary-foreground',
    subtleIcon: 'text-card-foreground',
    accentBorder: 'border-l-border',
  },
};

export function normalizeStatusAction(action) {
  if (action === 'danger') return 'error';
  if (action === 'none') return 'muted';
  return action || 'default';
}
