import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DrawerActions } from '@react-navigation/native';
import React from 'react';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { useSelfCheckEnabled, useSelfCheckSettings } from '../../hooks/useLibraryBranchData';
import { getTermFromDictionary } from '../../translations/TranslationService';

import AccountStackNavigator from '../stack/AccountStackNavigator';
import BrowseStackNavigator from '../stack/BrowseStackNavigator';
import LibraryCardStackNavigator from '../stack/LibraryCardStackNavigator';
import MoreStackNavigator from '../stack/MoreStackNavigator';
import SelfCheckOutStackNavigator from '../stack/SelfCheckOutStackNavigator';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';

const Tab = createBottomTabNavigator();
export default function TabNavigator() {
     const enableSelfCheck = useSelfCheckEnabled();
     const selfCheckSettings = useSelfCheckSettings();
     const { theme, colorMode } = useTheme();

     const settingsEnabledCandidates = [
          selfCheckSettings?.isEnabled,
          selfCheckSettings?.enableSelfCheck,
          selfCheckSettings?.selfCheckEnabled,
     ];
     const settingsEnableSelfCheck = settingsEnabledCandidates.some((value) =>
          value === true || value === 1 || value === '1' || (typeof value === 'string' && value.toLowerCase() === 'true')
     );
     const showSelfCheckTab = enableSelfCheck === true || settingsEnableSelfCheck;

     const activeIcon = colorMode === 'light' ? theme.tokens.colors.ui.surface.dark : theme.tokens.colors.ui.textStrong.dark;
     const inactiveIcon = colorMode === 'light' ? theme.tokens.colors.ui.iconMuted.light : theme.tokens.colors.ui.iconMuted.dark;
     const tabBarBackgroundColor = colorMode === 'light' ? theme.tokens.colors.ui.card.light : theme.tokens.colors.ui.card.dark;

     return (
          <Tab.Navigator
               tabBar={(props) => <TabItem {...props} />}
               initialRouteName="BrowseTab"
               screenOptions={{
                    headerShown: false,
                    backBehavior: 'none',
                    tabBarHideOnKeyboard: true,
                    tabBarActiveTintColor: activeIcon,
                    tabBarInactiveTintColor: inactiveIcon,
                    tabBarLabelStyle: { fontWeight: '400' },
                    tabBarStyle: { backgroundColor: tabBarBackgroundColor, elevation: 0 },
               }}>
               <Tab.Screen name="BrowseTab" component={BrowseStackNavigator} />
               <Tab.Screen name="LibraryCardTab" component={LibraryCardStackNavigator} />
               {showSelfCheckTab ? <Tab.Screen name="SelfCheckTab" component={SelfCheckOutStackNavigator} /> : null}
               <Tab.Screen
                    name="AccountTab"
                    component={AccountStackNavigator}
                    listeners={({ navigation }) => ({
                         tabPress: (e) => {
                              navigation.dispatch(DrawerActions.toggleDrawer());
                              e.preventDefault();
                         },
                    })}
               />
               <Tab.Screen name="AccountScreenTab" component={AccountStackNavigator} options={{ tabBarButton: () => null }} />
               <Tab.Screen
                    name="MoreTab"
                    component={MoreStackNavigator}
                    listeners={({ navigation }) => ({
                         tabPress: (e) => {
                              e.preventDefault();
                              navigation.navigate('MoreTab', { screen: 'MoreMenu' });
                         },
                    })}
               />
          </Tab.Navigator>
     );
}

export const TabItem = ({ state, descriptors, navigation }) => {
     const language = useActiveLanguage();
     const { colorMode } = useTheme();
     const activeIconColor = colorMode === 'light' ? LIGHT_ICON_COLOR : DARK_ICON_COLOR;
     const inactiveIconColor = colorMode === 'light' ? LIGHT_ICON_MUTED_COLOR : DARK_ICON_MUTED_COLOR;
     const tabBarBackgroundColor = colorMode === 'light' ? LIGHT_TAB_BACKGROUND : DARK_TAB_BACKGROUND;
     const insets = useSafeAreaInsets();

     const [browseTabLabel, setBrowseTabLabel] = React.useState(getTermFromDictionary(language, 'nav_discover'));
     const [cardTabLabel, setCardTabLabel] = React.useState(getTermFromDictionary(language, 'nav_card'));
     const [accountTabLabel, setAccountTabLabel] = React.useState(getTermFromDictionary(language, 'nav_account'));
     const [scoTabLabel, setScoTabLabel] = React.useState(getTermFromDictionary(language, 'nav_sco'));
     const [moreTabLabel, setMoreTabLabel] = React.useState(getTermFromDictionary(language, 'nav_more'));

     React.useEffect(() => {
          const timer = setTimeout(() => {
               setBrowseTabLabel(getTermFromDictionary(language, 'nav_discover'));
               setCardTabLabel(getTermFromDictionary(language, 'nav_card'));
               setAccountTabLabel(getTermFromDictionary(language, 'nav_account'));
               setScoTabLabel(getTermFromDictionary(language, 'nav_sco'));
               setMoreTabLabel(getTermFromDictionary(language, 'nav_more'));
          }, 1500);

          return () => clearTimeout(timer);
     }, [language]);

     return (
          <HStack
               space="lg"
               className="px-7 pt-2 items-center justify-between border-t"
               style={{
                    paddingBottom: insets.bottom,
                    backgroundColor: tabBarBackgroundColor,
                    borderColor: TAB_BORDER_COLOR,
               }}>
               {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    let iconName = 'ellipse-outline';
                    let label = route.name;

                    if (route.name === 'BrowseTab') {
                         iconName = isFocused ? 'library' : 'library-outline';
                         label = browseTabLabel;
                    } else if (route.name === 'LibraryCardTab') {
                         iconName = isFocused ? 'card' : 'card-outline';
                         label = cardTabLabel;
                    } else if (route.name === 'AccountTab') {
                         iconName = isFocused ? 'person' : 'person-outline';
                         label = accountTabLabel;
                    } else if (route.name === 'MoreTab') {
                         iconName = isFocused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
                         label = moreTabLabel;
                    } else if (route.name === 'SelfCheckTab') {
                         iconName = isFocused ? 'barcode' : 'barcode-outline';
                         label = scoTabLabel;
                    }

                    const iconColor = isFocused ? activeIconColor : inactiveIconColor;

                    const onPress = () => {
                         const event = navigation.emit({
                              type: 'tabPress',
                              target: route.key,
                              canPreventDefault: true,
                         });

                         if (!isFocused && !event.defaultPrevented) {
                              navigation.navigate(route.name, route.params);
                         }
                    };

                    const onLongPress = () => {
                         navigation.emit({
                              type: 'tabLongPress',
                              target: route.key,
                         });
                    };

                    if (route.name === 'AccountScreenTab') {
                         return null;
                    }

                    return (
                         <Pressable
                              key={route.key}
                              accessibilityRole="button"
                              accessibilityState={isFocused ? { selected: true } : {}}
                              accessibilityLabel={options.tabBarAccessibilityLabel}
                              testID={options.tabBarTestID}
                              onPress={onPress}
                              onLongPress={onLongPress}>
                              <VStack space="xs" className="items-center">
                                   <Ionicons name={iconName} size={22} color={iconColor} />
                                   <Text size="2xs" style={{ color: iconColor, fontWeight: '400' }}>
                                        {label}
                                   </Text>
                              </VStack>
                         </Pressable>
                    );
               })}
          </HStack>
     );
};
