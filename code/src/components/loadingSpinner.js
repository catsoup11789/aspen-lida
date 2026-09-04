import React from 'react';
import {isEmpty, isUndefined} from 'lodash';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { VStack } from '@/components/ui/vstack';
import { logDebugMessage } from '../util/logging.js';
import { useTheme } from '../themes/theme';
/*
TODO: Translate the accessibility labels
*/

/**
 * Displays a loading spinner with an optional message.
 * @param message
 * @returns {React.JSX.Element}
 */
export function loadingSpinner(message = '') {
     return <LoadingSpinner message={message} />;
}

/**
 * LoadingSpinner component for displaying a loading spinner with an optional message.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const LoadingSpinner = (props) => {
     const { runtimeColors, textColor } = useTheme();
     if (!isUndefined(props) && !isEmpty(props) && !isUndefined(props.message) && !isEmpty(props.message)) {
          logDebugMessage("Showing loading spinner with message: " + props.message);
          return (
               <Center style={{ flex: 1, paddingHorizontal: 12 }}>
                    <VStack space="md" style={{ alignItems: 'center' }}>
                         <Spinner size="large" color={runtimeColors.primary[500]} accessibilityLabel="Loading..." />
                         <Heading size="md" style={{ color: textColor }}>
                              {props.message}
                         </Heading>
                    </VStack>
               </Center>
          );
     }

     return (
          <Center style={{ flex: 1 }}>
               <HStack>
                    <Spinner color={runtimeColors.primary[500]} size="large" accessibilityLabel="Loading..." />
               </HStack>
          </Center>
     );
};
