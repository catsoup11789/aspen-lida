import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { useTheme } from '../../themes/theme';

export const ModalHeader = ({ title, onBack, onClose, showBack = true, showClose = true, centerTitle = true }) => {
     const { theme, textColor, colorMode } = useTheme();
     const iconColor = colorMode === 'light' ? theme.tokens.colors.ui.icon.light : theme.tokens.colors.ui.icon.dark;
     const bg = colorMode === 'light' ? theme.tokens.colors.ui.surfaceSoft.light : theme.tokens.colors.ui.surfaceSoft.dark;

     return (
          <Box className="px-3 py-3" style={{ backgroundColor: bg }}>
               <HStack className="items-center justify-between">
                    <Box style={{ minWidth: 40 }}>
                         {showBack && onBack ? (
                              <Pressable onPress={onBack} className="p-1">
                                   <MaterialIcons name="chevron-left" size={28} color={iconColor} />
                              </Pressable>
                         ) : null}
                    </Box>

                    <Box className={centerTitle ? 'flex-1 items-center' : 'flex-1 items-start'}>
                         <Text bold numberOfLines={1} style={{ color: textColor }}>
                              {title}
                         </Text>
                    </Box>

                    <Box className="items-end" style={{ minWidth: 40 }}>
                         {showClose && onClose ? (
                              <Pressable onPress={onClose} className="p-1">
                                   <MaterialIcons name="close" size={24} color={iconColor} />
                              </Pressable>
                         ) : null}
                    </Box>
               </HStack>
          </Box>
     );
};
