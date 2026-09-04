import { Button, ButtonText } from '@/components/ui/button';
import React from 'react';
import {navigate} from '../../../helpers/RootNavigator';
import { useTheme } from '../../../themes/theme';


export const StartLocalIllRequest = (props) => {
     const openLocalIllRequest = () => {
          if (typeof props.onBeforeNavigate === 'function') {
               props.onBeforeNavigate();
          }
          navigate('CreateLocalIllRequest', {
               id: props.record,
               workTitle: props.workTitle,
               volumeId: props.volumeId ?? null,
               volumeName: props.volumeName ?? null
          });
     };
     const { theme } = useTheme();

     return (
          <Button
               size="md"
               variant="solid"
               style={{ backgroundColor: theme.tokens.colors.primary['500'], minWidth: '100%', maxWidth: '100%' }}
               onPress={openLocalIllRequest}>
               <ButtonText style={{ color: theme.tokens.colors.primary['500-text'], textAlign: 'center' }}>
                    {props.title}
               </ButtonText>
          </Button>
     );
};
