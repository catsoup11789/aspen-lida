import { Button, ButtonText } from '@/components/ui/button';
import React from 'react';
import {navigate} from '@/src/helpers/RootNavigator';
import { useTheme } from '@/src/themes/theme';

/**
 * StartLocalIllRequestEmail component for displaying a button that navigates to the "Create Local ILL Request Email" screen.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const StartLocalIllRequestEmail = (props) => {
     const { runtimeColors } = useTheme();
     //logDebugMessage("Props for StartLocalIllRequest");
     //logDebugMessage(props);
     const openLocalIllRequestEmail = () => {
          if (typeof props.onBeforeNavigate === 'function') {
               props.onBeforeNavigate();
          }
          navigate('CreateLocalIllRequestEmail', {
               id: props.record,
               workTitle: props.workTitle,
               workAuthor: props.workAuthor,
               volumeName: props.volumeName ?? null,
               recordId: props.recordId
          });
     };

     return (
          <Button
               size="md"
               variant="solid"
               style={{ backgroundColor: runtimeColors.primary[500], minWidth: '100%', maxWidth: '100%' }}
               onPress={openLocalIllRequestEmail}>
               <ButtonText style={{ color: runtimeColors.primary['500-text'], textAlign: 'center' }}>
                    {props.title}
               </ButtonText>
          </Button>
     );
};
