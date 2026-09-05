import React from 'react';
import {
     Modal,
     ModalBackdrop,
     ModalBody,
     ModalCloseButton,
     ModalContent,
     ModalFooter,
     ModalHeader,
} from '@/components/ui/modal';
import { useTheme } from '../../themes/theme';

export const ThemedModalBackdrop = ModalBackdrop;
export const ThemedModalHeader = ModalHeader;
export const ThemedModalBody = ModalBody;
export const ThemedModalFooter = ModalFooter;

// avoidKeyboard was inconsistently forgotten at many call sites (leaving inputs covered by the
// keyboard in some modals but not others) -- defaulted on here, still overridable by an explicit
// avoidKeyboard prop.
export const ThemedModal = React.forwardRef(({ avoidKeyboard = true, ...props }, ref) => {
     return <Modal ref={ref} avoidKeyboard={avoidKeyboard} {...props} />;
});

ThemedModal.displayName = 'ThemedModal';

// maxWidth: '90%' and backgroundColor: surfaceBg (matching the app's theme surface, since the
// primitive's own className background -- bg-background -- is the same unreliable className-driven
// color every other Themed* component already works around) were already being passed manually at
// nearly every call site -- baked in here as defaults, overridable via the caller's own style prop.
//
// padding: 16 overrides the primitive's own base className (p-6, i.e. 24px all around) -- new in
// the v5 primitive; gluestack v1's ModalContent (packages/config/src/theme/ModalContent.ts) had no
// outer padding at all, relying on Header/Body/Footer's own spacing instead, which is why this read
// as noticeably excessive padding after the v5 upgrade. 16 keeps some breathing room for call sites
// that don't add their own horizontal padding around header/body content.
export const ThemedModalContent = React.forwardRef(({ style, ...props }, ref) => {
     const { resolvedUiColors } = useTheme();
     const surfaceBg = resolvedUiColors.surface;

     return <ModalContent ref={ref} style={[{ maxWidth: '90%', backgroundColor: surfaceBg, padding: 16 }, style]} {...props} />;
});

ThemedModalContent.displayName = 'ThemedModalContent';

// padding: 12 was already being passed manually at nearly every call site -- baked in here as a
// default, overridable via the caller's own style prop.
export const ThemedModalCloseButton = React.forwardRef(({ style, ...props }, ref) => {
     return <ModalCloseButton ref={ref} style={[{ padding: 12 }, style]} {...props} />;
});

ThemedModalCloseButton.displayName = 'ThemedModalCloseButton';
