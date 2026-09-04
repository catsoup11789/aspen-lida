import React from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../themes/theme';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';


export const NotificationHistoryMessageModal = () => {
     const { textColor } = useTheme();
     const defaultMessage = {
          title: '',
          content: '',
          isRead: 0,
          dateSent: null };

     const route = useRoute();
     const message = route.params?.message ?? defaultMessage;

     const formatDate = (timestamp) => {
          if (!timestamp) return '';
          // Convert Unix timestamp (seconds) to milliseconds
          const date = new Date(timestamp * 1000);
          return date.toLocaleDateString(undefined, {
               year: 'numeric',
               month: 'long',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
          });
     };

     return (
          <ScrollView>
               <Box style={{ padding: 20 }}>
                    <VStack space="md">
                         <Heading size="lg" style={{ color: textColor }}>{message.title}</Heading>
                         <Text style={{ color: textColor }}>{message.content}</Text>
                         {message.dateSent && (
                              <Text size="sm" style={{ opacity: 0.7, color: textColor }}>
                                   {formatDate(message.dateSent)}
                              </Text>
                         )}
                    </VStack>
               </Box>
          </ScrollView>
     );
};
