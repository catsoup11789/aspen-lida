import React from 'react';
import { ScrollView } from '@/components/ui/scroll-view';

// horizontal ScrollViews should get a row-direction content container for free (this is
// documented, built-in RN behavior -- see ScrollView.js's `contentContainerHorizontal` style --
// but it wasn't taking effect for horizontal ScrollViews in this app, so every one of them was
// silently rendering its children in a vertical stack instead. Forcing flexDirection: 'row'
// explicitly here restores the expected layout regardless of why the built-in default wasn't
// applying; any caller-provided contentContainerStyle still wins for conflicting keys.
export const ThemedScrollView = React.forwardRef(({ horizontal, contentContainerStyle, ...props }, ref) => {
     return (
          <ScrollView
               ref={ref}
               horizontal={horizontal}
               contentContainerStyle={horizontal ? [{ flexDirection: 'row' }, contentContainerStyle] : contentContainerStyle}
               {...props}
          />
     );
});

ThemedScrollView.displayName = 'ThemedScrollView';
