import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { useLibrary } from '../hooks/useLibrarySystemData';
import { Image } from '@/components/ui/image';
import { ThemedText as Text } from '@/src/components/themed/ThemedText';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { ThemedMaterialIcons as MaterialIcons } from './themed/ThemedMaterialIcons';
import { decodeHTML, isValidUrl } from '../helpers/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../themes/theme';

/**
 * HeaderLogoBar component for displaying the library's logo in the header.
 * @returns {React.JSX.Element|null}
 * @constructor
 */
const HeaderLogoBar = () => {
     const { header } = useTheme();
     const library = useLibrary();
     const { width } = useWindowDimensions();

     // Prefer the active theme's header data (logo/backgroundColor/alignment) when the
     // theme catalog actually provides a logo; otherwise fall back to the library's
     // headerLogo* app settings for backwards compatibility.
     if (header?.logo) {
          const localBrandingLogoUri = isValidUrl(header.logo) ? header.logo : library.baseUrl + '/files/original/' + header.logo;
          const backgroundColor = header.backgroundColor ?? '#FFFFFF';
          let headerLogoAlignment = 'center';
          if (header.alignment == 1) {
               headerLogoAlignment = 'flex-start';
          } else if (header.alignment == 3) {
               headerLogoAlignment = 'flex-end';
          }

          const originalHeight = library.headerLogoHeight ?? 200;
          const originalWidth = library.headerLogoWidth ?? 1536;

          const dims = logoSize(width, 50, originalWidth, originalHeight);

          return (
               <HStack style={{ backgroundColor, justifyContent: headerLogoAlignment, flexDirection: 'row', height: dims.height, paddingTop: 4, paddingBottom: 4 }}>
                         <Image source={{uri: localBrandingLogoUri}} alt={library.displayName ?? ''} resizeMode='contain' style={{ width: dims.width, height: dims.height }} />
               </HStack>
          );
     }

     if (library?.headerLogoApp){
          const localBrandingLogoUri = library.headerLogoApp;

          //Assume an image that is 1536 x 200
          let backgroundColor = '#FFFFFF';
          if (library.headerLogoBackgroundColorApp !== undefined) {
               backgroundColor = library.headerLogoBackgroundColorApp;
          }

          let headerLogoAlignment = 'center';
          if (library.headerLogoAlignmentApp !== undefined) {
               if (library.headerLogoAlignmentApp == 1) {
                    headerLogoAlignment = 'flex-start';
               }else if (library.headerLogoAlignmentApp == 2) {
                    headerLogoAlignment = 'center';
               }else if (library.headerLogoAlignmentApp == 3) {
                     headerLogoAlignment = 'flex-end';
               }
          }

          let originalHeight = library.headerLogoHeight ?? 200;
          let originalWidth = library.headerLogoWidth ?? 1536;

          var dims = logoSize(width, 50, originalWidth,originalHeight);
          var scaledImageWidth = dims.width;
          var scaledImageHeight = dims.height;

          return (
               <HStack style={{ backgroundColor, justifyContent: headerLogoAlignment, flexDirection: 'row', height: scaledImageHeight, paddingTop: 4, paddingBottom: 4 }}>
                         <Image source={{uri: localBrandingLogoUri}} alt={library.displayName ?? ''} resizeMode='contain' style={{ width: scaledImageWidth, height: scaledImageHeight }} />
               </HStack>
          );
     }else{
          return null;
     }
};

export default function TitleWithLogo(props) {
     const { runtimeColors } = useTheme();
     const textColor = runtimeColors.primary['500-text'];
     const bg = runtimeColors.primary[500];
     const navigation = useNavigation();
     const hideBack = props.hideBack ?? false;
     const insets = useSafeAreaInsets();

     return (
          <VStack style={{ paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }}>
               <HeaderLogoBar />
               <HStack style={{ paddingHorizontal: 4, paddingVertical: 8, alignItems: 'center', justifyContent: 'space-between', backgroundColor: bg }}>
                    {navigation.canGoBack() && !hideBack ? (
                       <Pressable onPress={() => navigation.goBack()} className="pl-1">
                            <MaterialIcons name="chevron-left" size={24} style={{ color: textColor }} />
                       </Pressable>
                    ) : (
                       <Box className="w-6" />
                    )}
                    <Text style={{ paddingLeft: 8, flex: 1, textAlign: 'left', color: textColor, fontWeight: 'bold' }} size="lg" numberOfLines={1} ellipsizeMode="tail">{decodeHTML(props.title)}</Text>
                    <Box className="w-6" />
               </HStack>
          </VStack>
     );
}

function logoSize(maxWidth, maxHeight, width, height) {
  if (width >= height) {
    const ratio = maxWidth / width;
    const scaledHeight = Math.ceil(ratio * height);

    if (scaledHeight > maxHeight) {
      const constrainedRatio = maxHeight / height;
      return {
        width: Math.ceil(constrainedRatio * width),
        height: maxHeight,
      };
    }

    return {
      width: maxWidth,
      height: scaledHeight,
    };
  }

  const ratio = maxHeight / height;
  const scaledWidth = Math.ceil(ratio * width);

  if (scaledWidth > maxWidth) {
    const constrainedRatio = maxWidth / width;
    return {
      width: maxWidth,
      height: Math.ceil(constrainedRatio * height),
    };
  }

  return {
    width: scaledWidth,
    height: maxHeight,
  };
}
