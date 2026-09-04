import React, {useContext} from 'react';
import { Button, ButtonText } from '@/components/ui/button';


// custom components and helper files
import { navigate, navigateStack } from '../../helpers/RootNavigator';
import { useTheme } from '../../themes/theme';

export const OnHoldForYou = (props) => {
     const { theme } = useTheme();
     const handleNavigation = () => {
          if (typeof props.onBeforeNavigate === 'function') {
               props.onBeforeNavigate();
          }
          if (props.prevRoute === 'DiscoveryScreen' || props.prevRoute === 'SearchResults' || props.prevRoute === 'HomeScreen') {
               navigateStack('AccountScreenTab', 'MyHolds', {});
          } else {
               navigate('MyHolds', {});
          }
     };

     return (
          <Button size="md" variant="solid" onPress={handleNavigation} style={{ width: '100%', marginBottom: 4, backgroundColor: theme.tokens.colors.primary['500'] }}>
               <ButtonText style={{ textAlign: 'center', color: theme.tokens.colors.primary['500-text'] }}>
                    {props.title}
               </ButtonText>
          </Button>
     );
};
