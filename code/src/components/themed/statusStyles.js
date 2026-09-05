// Alert/Toast colors are entirely inline (no className) so there's one source of truth per action.
// error/warning/success/info/none use the fixed hex below; 'default' and 'muted' are resolved from
// the live theme (runtimeColors/resolvedUiColors) since they track the current brand/neutral colors.
export const ALERT_STATUS_COLORS = {
  error: { bg: '#fecaca', icon: '#dc2625', text: '#000000' },
  warning: { bg: '#ffd7aa', icon: '#ea580b', text: '#000000' },
  success: { bg: '#bbf7d0', icon: '#17a34a', text: '#000000' },
  info: { bg: '#bae6fe', icon: '#0084c7', text: '#000000' },
  none: { bg: '#e6e7ea', icon: '#4f5562', text: '#000000' },
};

export function normalizeStatusAction(action) {
  if (action === 'danger') return 'error';
  return action || 'default';
}

export function resolveAlertColors(action, runtimeColors, resolvedUiColors) {
  const normalizedAction = normalizeStatusAction(action);
  const statusColors = ALERT_STATUS_COLORS[normalizedAction];
  if (statusColors) {
    return { bg: statusColors.bg, border: statusColors.bg, icon: statusColors.icon, text: statusColors.text };
  }
  if (normalizedAction === 'muted') {
    return { bg: resolvedUiColors.surface, border: resolvedUiColors.border, icon: resolvedUiColors.text, text: resolvedUiColors.text };
  }
  return {
    bg: runtimeColors.primary[500],
    border: runtimeColors.primary[500],
    icon: runtimeColors.primary['500-text'],
    text: runtimeColors.primary['500-text'],
  };
}
