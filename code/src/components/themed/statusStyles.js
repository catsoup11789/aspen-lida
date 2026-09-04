export const STATUS_VARIANT_TO_UI_VARIANT = {
  default: 'default',
  muted: 'secondary',
  error: 'destructive',
};

export const STATUS_ACTION_CLASSNAMES = {
  default: {
    solid: 'bg-primary',
    text: 'text-primary-foreground',
    icon: 'text-primary-foreground',
  },
  error: {
    solid: 'bg-destructive border-destructive',
    subtle: 'bg-background-error border-destructive',
    text: 'text-white',
    subtleText: 'text-destructive',
    icon: 'text-white',
    subtleIcon: 'text-destructive',
  },
  warning: {
    solid: 'bg-warning border-warning',
    subtle: 'bg-background-warning border-warning',
    text: 'text-warning-foreground',
    subtleText: 'text-warning',
    icon: 'text-warning-foreground',
    subtleIcon: 'text-warning',
  },
  success: {
    solid: 'bg-success border-success',
    subtle: 'bg-background-success border-success',
    text: 'text-success-foreground',
    subtleText: 'text-success',
    icon: 'text-success-foreground',
    subtleIcon: 'text-success',
  },
  info: {
    solid: 'bg-info border-info',
    subtle: 'bg-background-info border-info',
    text: 'text-info-foreground',
    subtleText: 'text-info',
    icon: 'text-info-foreground',
    subtleIcon: 'text-info',
  },
  muted: {
    solid: 'bg-secondary border-secondary',
    subtle: 'bg-card border-border',
    text: 'text-secondary-foreground',
    subtleText: 'text-card-foreground',
    icon: 'text-secondary-foreground',
    subtleIcon: 'text-card-foreground',
  },
};

export function normalizeStatusAction(action) {
  if (action === 'danger') return 'error';
  if (action === 'none') return 'muted';
  return action || 'default';
}
