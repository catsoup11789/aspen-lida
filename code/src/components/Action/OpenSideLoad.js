import React from 'react';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';

import { openSideLoad } from '../../util/api/userHelper';
import { useTheme } from '../../themes/theme';

// custom components and helper files

export const OpenSideLoad = (props) => {
     const [loading, setLoading] = React.useState(false);
     const { theme } = useTheme();

     return (
          <Button
               size="md"
               variant="solid"
               style={{ width: '100%', backgroundColor: theme.tokens.colors.primary['500'] }}
               onPress={async () => {
                   setLoading(true);
                   await openSideLoad(props.url).then((r) => setLoading(false));
               }}>
               {loading ? <ButtonSpinner style={{ color: theme.tokens.colors.primary['500-text'] }} /> : <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{props.title}</ButtonText>}
          </Button>
     );
};
