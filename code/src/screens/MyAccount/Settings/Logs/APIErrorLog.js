import React from 'react';
import { FlatList } from 'react-native';
import { clearApiErrorLogs, getApiErrorLogsPage } from '../../../../util/db';

import { useActiveLanguage } from '../../../../hooks/useLanguageData';
import { getTermFromDictionary } from '../../../../translations/TranslationService';
import { useTheme } from '../../../../themes/theme';
import { Accordion, AccordionContent, AccordionContentText, AccordionHeader, AccordionIcon, AccordionItem, AccordionTitleText, AccordionTrigger } from '@/components/ui/accordion';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

/* move this to the helpers.js */
function formatDate(ms) {
     try {
          return new Date(ms).toLocaleString();
     } catch {
          return String(ms);
     }
}

export const APIErrorLog = ({ theme: themeProp, colorMode: colorModeProp, textColor: textColorProp } = {}) => {
     const [loading, setLoading] = React.useState(false);
     const [page, setPage] = React.useState(1);
     const [rows, setRows] = React.useState([]);
     const [meta, setMeta] = React.useState({
          total: 0,
          totalPages: 1,
          hasMore: false,
          hasPrevious: false });

     const language = useActiveLanguage();

     const themeCtx = useTheme() ?? {};
     const theme = themeProp ?? themeCtx.theme ?? {};
     const colorMode = colorModeProp ?? themeCtx.colorMode ?? 'light';
     const textColor = textColorProp ?? themeCtx.textColor ?? '#111827';
     const surfaceBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;
     const panelBg = colorMode === 'light' ? theme.tokens.colors.ui.surfaceMuted.light : theme.tokens.colors.ui.surfaceMuted.dark;
     const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;

     const loadPage = React.useCallback(async (nextPage = 1) => {
          setLoading(true);
          try {
               const result = await getApiErrorLogsPage({
                    page: nextPage,
                    pageSize: 25,
                    last24HoursOnly: true });

               setRows(result.items);
               setPage(result.page);
               setMeta({
                    total: result.total,
                    totalPages: result.totalPages,
                    hasMore: result.hasMore,
                    hasPrevious: result.hasPrevious });
          } finally {
               setLoading(false);
          }
     }, []);

     React.useEffect(() => {
          loadPage(1);
     }, [loadPage]);

     const onClear = async () => {
          setLoading(true);
          try {
               await clearApiErrorLogs();
               await loadPage(1);
          } finally {
               setLoading(false);
          }
     };

     const renderEntry = ({ item }) => (
          <Box style={{ borderBottomWidth: 1, borderColor, paddingHorizontal: 12, paddingVertical: 12 }}>
               <VStack space="xs">
                    <Text size="xs" style={{ color: textColor }}>
                         {formatDate(item.created_at)}
                    </Text>
                    <Text bold size="sm" style={{ color: textColor }}>
                         {(item.method ?? 'UNKNOWN') + ' ' + (item.endpoint ?? '-')}
                    </Text>
                    <Text size="xs" style={{ color: textColor }}>
                         {'status=' + (item.status ?? 'n/a') + '  problem=' + (item.problem ?? 'n/a')}
                    </Text>
                    <Text style={{ color: textColor }}>{item.requestParams}</Text>
                    {item.message ? (
                         <>
                              <Text size="xs" style={{ color: textColor }}>
                                   {item.message ?? ''}
                              </Text>
                         </>
                    ) : null}

                    {item.response_body ? (
                         <Accordion>
                             <AccordionItem value="response_body" style={{ backgroundColor: panelBg }}>
                                  <AccordionHeader style={{ backgroundColor: panelBg }}>
                                        <AccordionTrigger>
                                             {({ isExpanded }) => {
                                                  return (
                                                       <>
                                                            <AccordionTitleText style={{ color: textColor }}>Response</AccordionTitleText>
                                                            {isExpanded ? <AccordionIcon as={ChevronUpIcon} style={{ marginLeft: 12, color: textColor }} /> : <AccordionIcon as={ChevronDownIcon} style={{ marginLeft: 12, color: textColor }} />}
                                                       </>
                                                  );
                                             }}
                                        </AccordionTrigger>
                                   </AccordionHeader>
                                   <AccordionContent style={{ backgroundColor: panelBg }}>
                                        <AccordionContentText>
                                             <Text
                                                  style={{
                                                       fontFamily: 'Courier New, monospace',
                                                       fontSize: 12,
                                                       whiteSpace: 'pre-wrap',
                                                       color: textColor }}>
                                                  {(() => {
                                                       try {
                                                            const parsed = JSON.parse(item.response_body);
                                                            return JSON.stringify(parsed, null, 2);
                                                       } catch (error) {
                                                            return JSON.stringify(item.response_body, null, 2);
                                                       }
                                                  })()}
                                             </Text>
                                        </AccordionContentText>
                                   </AccordionContent>
                              </AccordionItem>
                         </Accordion>
                    ) : null}
               </VStack>
          </Box>
     );

     return (
          <Box style={{ flex: 1 }}>
               <Box style={{ paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor }}>
                   <Heading size="sm" style={{ color: textColor }}>
                         {getTermFromDictionary(language, 'api_error_log')}
                    </Heading>
                    <Text size="xs" style={{ color: textColor }}>
                         {getTermFromDictionary(language, 'total') + ': ' + meta.total}
                    </Text>
               </Box>

               {loading && rows.length === 0 ? (
                    <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                         <Spinner color={textColor} />
                    </Box>
               ) : (
                    <FlatList
                         data={rows}
                         keyExtractor={(item) => String(item.id)}
                         renderItem={renderEntry}
                         ListEmptyComponent={
                              <Box style={{ paddingHorizontal: 12, paddingVertical: 24, alignItems: 'center' }}>
                                   <Text>{getTermFromDictionary(language, 'api_error_log_empty')}</Text>
                              </Box>
                         }
                    />
               )}

               <HStack style={{ paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor }}>
                    <Button style={{ backgroundColor: theme['tokens']['colors']['secondary']['500'] }} onPress={() => loadPage(page - 1)} isDisabled={loading || !meta.hasPrevious}>
                         <ButtonText style={{ color: theme['tokens']['colors']['secondary']['500-text'] }}>{getTermFromDictionary(language, 'previous')}</ButtonText>
                    </Button>

                    <Text size="xs" style={{ color: textColor }}>{`Page ${page} / ${meta.totalPages}`}</Text>

                    <Button style={{ backgroundColor: theme['tokens']['colors']['secondary']['500'] }} onPress={() => loadPage(page + 1)} isDisabled={loading || !meta.hasMore}>
                         <ButtonText style={{ color: theme['tokens']['colors']['secondary']['500-text'] }}>{getTermFromDictionary(language, 'next')}</ButtonText>
                    </Button>
               </HStack>

               <Box style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                    <Button variant="outline" style={{ borderColor: theme['tokens']['colors']['tertiary']['500'] }} onPress={onClear} isDisabled={loading}>
                         <ButtonText style={{ color: theme['tokens']['colors']['tertiary']['500'] }}>{getTermFromDictionary(language, 'clear_api_error_log')}</ButtonText>
                    </Button>
               </Box>
          </Box>
     );
};

/**
 * Generate a preview string for a value, truncating if it exceeds the specified max length.
 * @param value
 * @param max
 * @returns {string|string|string}
 */
function preview(value, max = 200) {
     if (value == null) return '';
     const s = typeof value === 'string' ? value : JSON.stringify(value);
     return s.length > max ? `${s.slice(0, max)}...` : s;
}
