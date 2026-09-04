import React from 'react';
import { ThemedButtonSpinner as ButtonSpinner, ThemedButton as Button, ThemedButtonText as ButtonText } from '../themed/ThemedButton';
import { useUserState } from '../../hooks/useUserData';
import { completeAction } from '../../util/api/userHelper';
import {logDebugMessage} from "../../util/logging";
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { useTheme } from '../../themes/theme';

/**
 * LoadOverDriveSample component for displaying a button that loads an OverDrive sample.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const LoadOverDriveSample = (props) => {
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const library = useLibrary();
     const [loading, setLoading] = React.useState(false);
     const { runtimeColors } = useTheme();

     logDebugMessage("Showing overdrive sample, properties are");
     logDebugMessage(props);

     return (
          <Button
               size="xs"
               variant="link"
               style={{ width: '100%', marginBottom: 4, borderWidth: 1, borderColor: runtimeColors.primary[500] }}
               onPress={() => {
                   setLoading(true);
                   completeAction(props.id, props.type, user.id, props.formatId, props.sampleNumber, '', '', '', library?.baseUrl ?? '', '', '', '', '').then((r) => {
                        setLoading(false);
                   });
               }}>
               {loading ? <ButtonSpinner style={{ color: runtimeColors.primary[500] }} /> : <ButtonText style={{ color: runtimeColors.primary[500] }}>{props.title}</ButtonText>}
          </Button>
     );
};
