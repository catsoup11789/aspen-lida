import { useColorModeValue, useTheme } from '../../themes/theme';
import { Button, ButtonText } from '@/components/ui/button';
import { useUserState } from '../../hooks/useUserData';
import React from 'react';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import {passUserToDiscovery} from '../../util/api/user';

/**
 * MoreInfo component for displaying a button that navigates to the Aspen Discovery grouped work page.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const MoreInfo = (props) => {
    const { theme } = useTheme();
    const { data: userState } = useUserState();
    const user = userState?.user ?? {};
    const library = useLibrary();

    const backgroundColor = useColorModeValue(theme.tokens.colors.ui.surface.light, theme.tokens.colors.ui.surface.dark);
    const textColor = useColorModeValue(theme.tokens.colors.ui.text.light, theme.tokens.colors.ui.text.dark);

    return (
        <Button
            size="xs"
            variant="link"
            style={{ width: '100%', backgroundColor }}
            onPress={async () => {
                passUserToDiscovery(library?.baseUrl ?? '', props.module, user.id, backgroundColor, textColor, props.recordId)
            }}>
            <ButtonText style={{ color: textColor }}>{props.title}</ButtonText>
        </Button>
    );
};
