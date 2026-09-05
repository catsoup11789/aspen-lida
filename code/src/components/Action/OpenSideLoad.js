import React from 'react';
import { ThemedButton as Button, ThemedButtonSpinner as ButtonSpinner, ThemedButtonText as ButtonText } from '../themed/ThemedButton';
import { openSideLoad } from '../../util/api/userHelper';
import { useTheme } from '../../themes/theme';

/**
 * OpenSideLoad component for displaying a button that opens a side load URL.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const OpenSideLoad = (props) => {
     const [loading, setLoading] = React.useState(false);
     const { runtimeColors } = useTheme();

     return (
          <Button
               size="md"
               variant="solid"
               colorScheme="primary" className="w-full"
               onPress={async () => {
                   setLoading(true);
                   await openSideLoad(props.url).then((r) => setLoading(false));
               }}>
               {loading ? <ButtonSpinner style={{ color: runtimeColors.primary['500-text'] }} /> : <ButtonText>{props.title}</ButtonText>}
          </Button>
     );
};
