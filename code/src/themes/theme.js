import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Uniwind } from 'uniwind';
import { Box } from '@/components/ui/box';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../components/themed/ThemedButton';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { ThemedText as Text } from '@/src/components/themed/ThemedText';
import { GLOBALS } from '../util/globals';
import {
     useThemeState,
     useUpdateThemeColorMode,
     useUpdateThemeColors,
     useUpdateThemeColorMode as usePersistThemeColorMode,
     useResetThemeState,
     useAvailableThemes,
} from '../hooks/useThemeData';
import { useLibraryLocation } from '../hooks/useLibraryBranchData';
import { logDebugMessage } from '../util/logging.js';
import { getThemeInfo } from '../util/api/system';
import { loadThemeCatalog } from '../util/db';
import { buildSwatchFromThemeTokens } from '../helpers/helpers';

function buildThemeVars(themeColors) {
     const palette = themeColors?.primary && themeColors?.secondary && themeColors?.tertiary
          ? themeColors
          : buildFallbackPalette();

     return {
          '--color-primary-50': palette.primary[50],
          '--color-primary-100': palette.primary[100],
          '--color-primary-200': palette.primary[200],
          '--color-primary-300': palette.primary[300],
          '--color-primary-400': palette.primary[400],
          '--color-primary-500': palette.primary[500],
          '--color-primary-600': palette.primary[600],
          '--color-primary-700': palette.primary[700],
          '--color-primary-800': palette.primary[800],
          '--color-primary-900': palette.primary[900],
          '--color-primary-500-text': palette.primary['500-text'],
          '--color-primary-base': palette.primary.base,
          '--color-primary-base-contrast': palette.primary.baseContrast,
          '--color-secondary-50': palette.secondary[50],
          '--color-secondary-100': palette.secondary[100],
          '--color-secondary-200': palette.secondary[200],
          '--color-secondary-300': palette.secondary[300],
          '--color-secondary-400': palette.secondary[400],
          '--color-secondary-500': palette.secondary[500],
          '--color-secondary-600': palette.secondary[600],
          '--color-secondary-700': palette.secondary[700],
          '--color-secondary-800': palette.secondary[800],
          '--color-secondary-900': palette.secondary[900],
          '--color-secondary-500-text': palette.secondary['500-text'],
          '--color-secondary-base': palette.secondary.base,
          '--color-secondary-base-contrast': palette.secondary.baseContrast,
          '--color-tertiary-50': palette.tertiary[50],
          '--color-tertiary-100': palette.tertiary[100],
          '--color-tertiary-200': palette.tertiary[200],
          '--color-tertiary-300': palette.tertiary[300],
          '--color-tertiary-400': palette.tertiary[400],
          '--color-tertiary-500': palette.tertiary[500],
          '--color-tertiary-600': palette.tertiary[600],
          '--color-tertiary-700': palette.tertiary[700],
          '--color-tertiary-800': palette.tertiary[800],
          '--color-tertiary-900': palette.tertiary[900],
          '--color-tertiary-500-text': palette.tertiary['500-text'],
          '--color-tertiary-base': palette.tertiary.base,
          '--color-tertiary-base-contrast': palette.tertiary.baseContrast,
     };
}

const DEFAULT_COLOR_SCALE = {
     50: '#f9fafb',
     100: '#f3f4f6',
     200: '#e5e7eb',
     300: '#d1d5db',
     400: '#9ca3af',
     500: '#6b7280',
     600: '#4b5563',
     700: '#374151',
     800: '#1f2937',
     900: '#111827',
     '500-text': '#ffffff',
     base: '#6b7280',
     baseContrast: '#ffffff',
};

const UI_NEUTRAL_COLORS = {
     surface: {
          light: '#e7e5e4',
          dark: '#111827',
     },
     text: {
          light: '#1f2937',
          dark: '#e5e7eb',
     },
     border: {
          light: '#6b7280',
          dark: '#d6d3d1',
     },
     icon: {
          light: '#57534e',
          dark: '#e5e7eb',
     },
     iconMuted: {
          light: '#6b7280',
          dark: '#9ca3af',
     },
     card: {
          light: '#f9fafb',
          dark: '#1f2937',
     },
     white: '#ffffff',
     black: '#000000',
     danger: '#ef4444',
};

// Hardcoded fallback for code that renders before ThemeProvider context is available
// (e.g. pre-login Auth screens). Kept as a reference to UI_NEUTRAL_COLORS so the two
// can never drift out of sync — change UI_NEUTRAL_COLORS and this updates automatically.
export const UI_COLOR_FALLBACKS = UI_NEUTRAL_COLORS;

function buildFallbackPalette() {
     return {
          primary: { ...DEFAULT_COLOR_SCALE },
          secondary: { ...DEFAULT_COLOR_SCALE, base: '#9ca3af', 500: '#9ca3af', '500-text': '#000000', baseContrast: '#000000' },
          tertiary: { ...DEFAULT_COLOR_SCALE, base: '#c08428', 500: '#c08428' },
     };
}

function buildThemeRuntime(themeColors) {
     const palette = themeColors?.primary && themeColors?.secondary && themeColors?.tertiary
          ? themeColors
          : buildFallbackPalette();

     return {
          colors: palette,
          ui: UI_NEUTRAL_COLORS,
          // updateTheme() only ever reads tokens.colors.{primary,secondary,tertiary} -- this shape
          // exists solely as its input contract, not a general theme surface, so it carries the
          // palette only (no ui, no top-level duplication).
          tokens: {
               colors: palette,
          },
     };
}

function buildUiColorMap() {
     return UI_NEUTRAL_COLORS;
}

// Every uiColors entry is either a {light, dark} pair (surface, text, border, icon, card, ...) or
// a mode-independent flat value (white, black, danger). Resolving the whole map once per colorMode
// replaces the `colorMode === 'light' ? uiColors.x.light : uiColors.x.dark` ternary that had been
// hand-written at ~175 call sites across the app with a single `resolvedUiColors.x` lookup.
export function resolveUiColorMap(uiColors, colorMode) {
     return Object.fromEntries(
          Object.entries(uiColors).map(([key, value]) => {
               const isModePair = value && typeof value === 'object' && ('light' in value || 'dark' in value);
               return [key, isModePair ? value[colorMode === 'light' ? 'light' : 'dark'] : value];
          })
     );
}

function buildRuntimeColorMap(themeColors) {
     const palette = themeColors?.primary && themeColors?.secondary && themeColors?.tertiary
          ? themeColors
          : buildFallbackPalette();

     return {
          primary: {
               50: palette.primary[50],
               100: palette.primary[100],
               200: palette.primary[200],
               300: palette.primary[300],
               400: palette.primary[400],
               500: palette.primary[500],
               600: palette.primary[600],
               700: palette.primary[700],
               800: palette.primary[800],
               900: palette.primary[900],
               '500-text': palette.primary['500-text'],
               base: palette.primary.base,
               baseContrast: palette.primary.baseContrast,
               raw: palette.primary,
          },
          secondary: {
               50: palette.secondary[50],
               100: palette.secondary[100],
               200: palette.secondary[200],
               300: palette.secondary[300],
               400: palette.secondary[400],
               500: palette.secondary[500],
               600: palette.secondary[600],
               700: palette.secondary[700],
               800: palette.secondary[800],
               900: palette.secondary[900],
               '500-text': palette.secondary['500-text'],
               base: palette.secondary.base,
               baseContrast: palette.secondary.baseContrast,
               raw: palette.secondary,
          },
          tertiary: {
               50: palette.tertiary[50],
               100: palette.tertiary[100],
               200: palette.tertiary[200],
               300: palette.tertiary[300],
               400: palette.tertiary[400],
               500: palette.tertiary[500],
               600: palette.tertiary[600],
               700: palette.tertiary[700],
               800: palette.tertiary[800],
               900: palette.tertiary[900],
               '500-text': palette.tertiary['500-text'],
               base: palette.tertiary.base,
               baseContrast: palette.tertiary.baseContrast,
               raw: palette.tertiary,
          },
     };
}

export function useColorModeValue(lightValue, darkValue) {
     const { colorMode } = useThemeState();
     return colorMode === 'dark' ? darkValue : lightValue;
}

export const BackIcon = (props) => {
     const { runtimeColors } = useThemeForDisplay();
     return <MaterialIcons name="chevron-left" size={24} className="ml-[1px]" {...props} color={runtimeColors.primary.baseContrast} />;
};

function normalizeThemeColors(response = []) {
     return {
          primary: response?.[0] ?? null,
          secondary: response?.[1] ?? null,
          tertiary: response?.[2] ?? null,
     };
}

// App.js, Splash.js, and Loading.js each independently read the current theme_state/location,
// decide whether a refetch is needed, and (if so) persist a freshly-resolved theme, with no
// coordination between them -- Splash's own fetch-and-save isn't even cancelled on unmount, so it
// can still be mid-flight when Loading's runs right after. If two of these cycles overlap, one can
// read theme_state before the other's write has landed, see a locationId that looks stale/
// mismatched, and (via getThemeInfo's own themes[0] fallback) overwrite a just-saved correct theme
// with whichever theme happens to be first in the catalog. Funneling every read-decide-persist
// cycle through this queue makes them run strictly one at a time, so each one's initial read
// always reflects the previous one's completed write instead of a stale mid-flight snapshot.
let themeInitQueue = Promise.resolve();

export function runExclusiveThemeInit(fn) {
     const run = themeInitQueue.then(fn);
     themeInitQueue = run.catch(() => {});
     return run;
}

export async function buildThemeForLibrary(url = null, locationId = null) {
     const response = await getThemeInfo(url, locationId);
     const themeColors = normalizeThemeColors(response?.palettes);
     const theme = buildThemeRuntime(themeColors);
     return {
          theme,
          themeColors,
          themeId: response?.themeId ?? Number(GLOBALS.themeId ?? 1),
          locationId: response?.locationId ?? null,
          header: response?.header ?? null,
     };
}

/**
 * Build a themeColors + gluestack config pair from a single theme_catalog entry
 * ({id, themeId, name, baseMode, logo, header, primary, secondary, tertiary}). Goes through
 * buildConfigFromColors so Alert/Badge/etc. component theming stays consistent with the
 * single-theme flow.
 * @param themeEntry
 * @returns {{id, themeId, name, baseMode, logo, header, themeColors, theme}}
 */
export function buildThemeConfigFromCatalogEntry(themeEntry = {}) {
     const themeColors = {
          primary: buildSwatchFromThemeTokens(themeEntry?.primary),
          secondary: buildSwatchFromThemeTokens(themeEntry?.secondary),
          tertiary: buildSwatchFromThemeTokens(themeEntry?.tertiary),
     };

     return {
          id: themeEntry?.id ?? null,
          themeId: themeEntry?.themeId ?? themeEntry?.id ?? null,
          name: themeEntry?.name ?? null,
          baseMode: themeEntry?.baseMode ?? null,
          logo: themeEntry?.logo ?? null,
          header: themeEntry?.header ?? null,
          themeColors,
          theme: buildThemeRuntime(themeColors),
     };
}

/**
 * Build a ready-to-apply gluestack config for every theme available at a location (from the
 * locally stored theme catalog), so the app can switch between them without a network round trip.
 * @param locationId
 * @returns {Promise<Array>}
 */
export async function loadThemeConfigsForLocation(locationId) {
     const themes = await loadThemeCatalog(locationId);
     return themes.map(buildThemeConfigFromCatalogEntry);
}

export function useThemeForDisplay() {
     const { themeColors, colorMode, textColor, themeId, header } = useThemeState();
     const theme = React.useMemo(() => buildThemeRuntime(themeColors), [themeColors]);
     const themeVars = React.useMemo(() => buildThemeVars(themeColors), [themeColors]);
     const runtimeColors = React.useMemo(() => buildRuntimeColorMap(themeColors), [themeColors]);
     const uiColors = React.useMemo(() => buildUiColorMap(), []);
     const resolvedUiColors = React.useMemo(() => resolveUiColorMap(uiColors, colorMode), [uiColors, colorMode]);

     return {
          theme,
          themeVars,
          runtimeColors,
          uiColors,
          resolvedUiColors,
          themeColors,
          themeId,
          colorMode,
          textColor,
          header,
     };
}

export function useTheme() {
     const { theme, themeVars, runtimeColors, uiColors, resolvedUiColors, themeColors, themeId, colorMode, textColor, header } = useThemeForDisplay();
     const updateThemeColors = useUpdateThemeColors();
     const updateColorModeValue = useUpdateThemeColorMode();
     const resetThemeState = useResetThemeState();

     const updateTheme = React.useCallback(async (data, themeId, locationId, header) => {
          const primary = data?.tokens?.colors?.primary;
          const secondary = data?.tokens?.colors?.secondary;
          const tertiary = data?.tokens?.colors?.tertiary;
          if (!primary || !secondary || !tertiary) {
               return;
          }
          // themeId/locationId/header are optional: omit them to preserve whatever is already
          // stored (e.g. when the caller already persisted the correct values itself, or is just
          // re-applying cached colors) rather than stamping a static fallback over real values.
          await updateThemeColors(
               { primary, secondary, tertiary },
               themeId,
               locationId,
               header
          );
     }, [updateThemeColors]);

     const updateColorMode = React.useCallback(async (mode) => {
          Uniwind.setTheme(mode);
          await updateColorModeValue(mode);
     }, [updateColorModeValue]);

     const resetTheme = React.useCallback(async () => {
          await resetThemeState();
     }, [resetThemeState]);

     const forceRefreshTheme = React.useCallback(async (url = null, locationId = null) => {
          return runExclusiveThemeInit(async () => {
               const builtTheme = await buildThemeForLibrary(url, locationId);
               await updateTheme(builtTheme.theme, builtTheme.themeId, builtTheme.locationId, builtTheme.header);
               return builtTheme;
          });
     }, [updateTheme]);

     return {
          theme,
          themeVars,
          runtimeColors,
          uiColors,
          resolvedUiColors,
          themeColors,
          themeId,
          colorMode,
          textColor,
          header,
          updateTheme,
          updateColorMode,
          resetTheme,
          forceRefreshTheme,
     };
}

export function UseColorMode(props) {
     const { showText } = props;
     const { colorMode, runtimeColors, uiColors } = useThemeForDisplay();
     const location = useLibraryLocation();
     const themes = useAvailableThemes(location?.locationId);
     const persistThemeColorMode = usePersistThemeColorMode();
     const currentMode = colorMode === 'dark' ? 'wb-sunny' : 'nightlight-round';
     const currentColorMode = colorMode === 'dark' ? 'Dark' : 'Light';
     const currentModeB = colorMode === 'dark' ? 'nightlight-round' : 'wb-sunny';
     const iconColor = colorMode === 'dark' ? uiColors.text.dark : uiColors.icon.light;

     // If Aspen LiDA Themes are present and 2 or more exist, then display ThemeSwitcher
     if (Array.isArray(themes) && themes.length > 1) {
          return <ThemeSwitcher showText={showText} />;
     }

     // if Aspen LiDA Themes are present, but only 1 exists, we display nothing.
     if (Array.isArray(themes) && themes.length === 1) {
          return null;
     }

     const switchColorMode = async () => {
          let newColorMode;
          if (colorMode === 'light') {
               newColorMode = 'dark';
          }else{
               newColorMode = 'light';
          }

          logDebugMessage("Switching color mode to: " + newColorMode);
          Uniwind.setTheme(newColorMode);
         await persistThemeColorMode(newColorMode);
     };

     if (showText) {
          return (
               <HStack alignItems="center">
                    <Button onPress={switchColorMode} size="sm" style={{ backgroundColor: 'transparent', borderRadius: 9999 }}>
                         <MaterialIcons name={currentModeB} size={18} color={runtimeColors.primary[500]} />
                         <ButtonText style={{ fontSize: 14, color: iconColor }}> {currentColorMode}</ButtonText>
                    </Button>
               </HStack>
          );
     }

     return (
          <Box alignItems="center">
               <Button onPress={switchColorMode} size="sm" style={{ backgroundColor: 'transparent', borderRadius: 9999 }}>
                   <MaterialIcons name={currentMode} size={18} color={runtimeColors.primary[500]} />
               </Button>
          </Box>
     );
}

/**
 * Lets the user switch between the themes available at their location (from the locally
 * stored theme catalog), applying the selected theme's colors and baseMode immediately.
 * Mirrors LanguageSwitcher's menu + switching-overlay pattern.
 * @param showText whether to show the active theme's name next to the trigger icon, mirroring UseColorMode's prop
 */
export const ThemeSwitcher = ({ showText = true } = {}) => {
     const { runtimeColors, uiColors, resolvedUiColors, themeId, colorMode, textColor } = useTheme();
     const location = useLibraryLocation();
     const themes = useAvailableThemes(location?.locationId);
     const updateThemeColors = useUpdateThemeColors();
     const updateColorMode = useUpdateThemeColorMode();

     const [isThemeMenuOpen, setIsThemeMenuOpen] = React.useState(false);
     const [isSwitchingTheme, setIsSwitchingTheme] = React.useState(false);

     const activeTheme = themes.find((entry) => entry.id === themeId);
     const activeThemeName = activeTheme?.name ?? '';

     const changeTheme = async (themeEntry) => {
          if (isSwitchingTheme) return;
          setIsSwitchingTheme(true);
          try {
               logDebugMessage('Switching theme to ' + themeEntry?.id);
               const builtTheme = buildThemeConfigFromCatalogEntry(themeEntry);
               await updateThemeColors(builtTheme.themeColors, builtTheme.themeId, location?.locationId, builtTheme.header);
               if (builtTheme.baseMode === 'dark' || builtTheme.baseMode === 'light') {
                    await updateColorMode(builtTheme.baseMode);
               }
          } catch (error) {
               logDebugMessage('Theme switch failed');
               logDebugMessage(error);
          } finally {
               setIsSwitchingTheme(false);
          }
     };

     if (!Array.isArray(themes) || themes.length === 0) {
          return null;
     }

     return (
          <>
               <Box alignItems="center">
                    <Button
                         size="sm"
                         variant="ghost"
                         colorScheme="primary"
                         isDisabled={isSwitchingTheme}
                         onPress={() => {
                              setIsThemeMenuOpen(true);
                         }}
                         className="rounded-full">
                         <MaterialIcons name="palette" size={18} color={runtimeColors.primary[500]} />
                         {showText ? <ButtonText> {activeThemeName}</ButtonText> : null}
                    </Button>
               </Box>
               <Modal transparent animationType="fade" visible={isThemeMenuOpen || isSwitchingTheme}>
                    {isSwitchingTheme ? (
                         <View style={[themeSwitcherStyles.overlay, colorMode === 'dark' ? themeSwitcherStyles.overlayDark : themeSwitcherStyles.overlayLight]}>
                              <Box
                                   style={{
                                        backgroundColor: colorMode === 'dark' ? uiColors.card.dark : uiColors.surface.light,
                                        borderRadius: 16,
                                        paddingHorizontal: 24,
                                        paddingVertical: 20,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                   }}>
                                   <Spinner size="large" color={runtimeColors.primary[500]} />
                                   <Text className="mt-3">
                                        Switching theme...
                                   </Text>
                              </Box>
                         </View>
                    ) : (
                         <View
                              className="flex-1"
                              onTouchEnd={() => setIsThemeMenuOpen(false)}>
                              <Box className="flex-1 justify-end items-start pb-12 pl-10">
                                   <Box
                                        style={{
                                             backgroundColor: resolvedUiColors.surface,
                                             borderRadius: 6,
                                             padding: 4,
                                             height: themes.length > 4 ? 150 : undefined,
                                             width: 200,
                                        }}>
                                        <ScrollView nestedScrollEnabled={true} scrollEnabled={true}>
                                             {themes.map((themeEntry) => {
                                                  const isActive = themeEntry.id === themeId;
                                                  return (
                                                       <Box
                                                            key={themeEntry.id}
                                                            className="px-4 py-3"
                                                            onTouchEnd={() => {
                                                                 setIsThemeMenuOpen(false);
                                                                 changeTheme(themeEntry);
                                                            }}>
                                                            <HStack space="md" alignItems="center">
                                                                 <Text>{themeEntry.name}</Text>
                                                                 {isActive ? <MaterialIcons name="check" size={18} color={textColor} /> : null}
                                                            </HStack>
                                                       </Box>
                                                  );
                                             })}
                                        </ScrollView>
                                   </Box>
                              </Box>
                         </View>
                    )}
               </Modal>
          </>
     );
};

const themeSwitcherStyles = StyleSheet.create({
     overlay: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
     },
     overlayLight: {
          backgroundColor: 'rgba(15, 23, 42, 0.35)',
     },
     overlayDark: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
     },
});

export const THEME_STALE_MS = 12 * 60 * 60 * 1000;
