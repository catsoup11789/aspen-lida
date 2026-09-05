import React, { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchCampaigns, unenrollCampaign, enrollCampaign, optIntoCampaignEmails, optUserOutOfCampaignLeaderboard, optUserInToCampaignLeaderboard, addActivityProgress } from '@/src/util/api/user';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { FlatList } from 'react-native';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper, ActionsheetItem, ActionsheetItemText } from '@/components/ui/actionsheet';
import { Box } from '@/components/ui/box';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../../components/themed/ThemedButton';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { ThemedScrollView as ScrollView } from '@/src/components/themed/ThemedScrollView';
import { ThemedSelect as Select, ThemedSelectBackdrop as SelectBackdrop, ThemedSelectContent as SelectContent, ThemedSelectDragIndicator as SelectDragIndicator, ThemedSelectDragIndicatorWrapper as SelectDragIndicatorWrapper, ThemedSelectInput as SelectInput, ThemedSelectItem as SelectItem, ThemedSelectPortal as SelectPortal, ThemedSelectScrollView as SelectScrollView, ThemedSelectTrigger as SelectTrigger } from '../../../components/themed/ThemedSelect';
import { ThemedText as Text } from '@/src/components/themed/ThemedText';
import { VStack } from '@/components/ui/vstack';
import PlaceholderImg from '../../../assets/digital-reward-placeholder.png';
import { logDebugMessage, logErrorMessage } from '@/src/util/logging';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';

// Constants
const PAGE_SIZE = 20;
const FILTER_OPTIONS = [
  { value: 'enrolled', labelKey: 'enrolled_campaigns' },
  { value: 'linkedUserCampaigns', labelKey: 'linked_user_campaigns' },
  { value: 'active', labelKey: 'active_campaigns' },
  { value: 'upcoming', labelKey: 'upcoming_campaigns' },
  { value: 'past', labelKey: 'past_campaigns' },
  { value: 'pastEnrolled', labelKey: 'past_enrolled_campaigns' }
];

const EMPTY_MESSAGES = {
  active: 'no_active_campaigns',
  enrolled: 'no_enrolled_campaigns',
  past: 'no_past_campaigns',
  upcoming: 'no_upcoming_campaigns',
  pastEnrolled: 'no_past_enrolled_campaigns',
  linkedUserCampaigns: 'no_linked_user_campaigns',
  default: 'no_campaigns'
};

/**
 * MyCampaigns component that displays a list of campaigns based on the selected filter. It allows users to enroll/unenroll in campaigns, opt in/out of email notifications and leaderboards, and add progress to activities. The component fetches campaign data from the API and handles user interactions with the campaigns.
 * @returns {React.JSX.Element}
 * @constructor
 */
export const MyCampaigns = () => {
	const navigation = useNavigation();
	const queryClient = useQueryClient();
	const library = useLibrary();
	const language = useActiveLanguage();
	const { uiColors, textColor, colorMode } = useTheme();
	const panelBg = colorMode === 'light' ? uiColors.surfaceMuted.light : uiColors.surfaceMuted.dark;
	const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
	const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;

	React.useEffect(() => {
		queryClient.invalidateQueries(['all_campaigns']);
	}, [filterBy]);


	const [filterBy, setFilterBy] = React.useState('enrolled');
	const [page] = React.useState(1);
	const [campaigns, updateCampaigns] = React.useState([]);
	const [expandedCampaigns, setExpandedCampaigns] = React.useState({});
	const [selectedCampaign, setSelectedCampaign] = React.useState(null);
	const [showActionSheet, setShowActionSheet] = React.useState(false);
	const [selectedLinkedUserId, setSelectedLinkedUserId] = React.useState(null);



	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerLeft: () => <Box /> });
	}, [navigation]);

	//Utility Functions
	const buildImageUrl = (imagePath) => {
		if (!imagePath || !library.baseUrl) return '';
		return `${library.baseUrl}${imagePath}?v=${Date.now()}`;
	};

	const formatDate = (dateString) => {
		return dateString ? new Date(dateString).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: '2-digit'
		}) : 'N/A';
	};

	const handleShareOnSocial = async (imageUrl) => {
		if (!imageUrl) return;

		const fileUri = FileSystem.documentDirectory + 'shared.jpg';

		try {
			const download = await FileSystem.downloadAsync(imageUrl, fileUri);

			if (!(await Sharing.isAvailableAsync())) {
			  console.error('Sharing is not available on this device');
			  return;
			}

			await Sharing.shareAsync(download.uri);
		} catch (err) {
			console.error('Sharing failed:', err);
		}
	};

	const groupByLinkedUser = (campaigns) => {
		if (!Array.isArray(campaigns)) return {};

		return campaigns.reduce((acc, campaign) => {
			if (!campaign) return acc;

			const userName = campaign.linkedUserName || 'UnknownUser';
			const userId = campaign.linkedUserId;

			if (!acc[userName]) {
				acc[userName] = { userId: userId, campaigns: [] };
			}

			acc[userName].campaigns.push({
				...campaign,
				linkedUserId: userId });
			return acc;
		}, {});
	};

	// Data fetching
	const { status, data, isFetching, refetch} = useQuery(
		['all_campaigns', library.baseUrl, language, filterBy, page],
		() => fetchCampaigns(page, PAGE_SIZE, filterBy, library.baseUrl),
		{
			placeholderData: () => ({ campaigns: campaigns}),
			keepPreviousData: true,
			staleTime: 1000,
			onSuccess: (data) => {
				if (data && data.campaigns) {
					updateCampaigns(data.campaigns);
				}
			},
               onError: (error) => {
                    logDebugMessage("Error searching for saved search");
                    logErrorMessage(error);
               }
		}
	);

	// Action handlers
	const handleEnrollUnenroll = async () => {
		if (!selectedCampaign) return;

		try {
			const linkedUserId = selectedLinkedUserId;

			if (selectedCampaign.enrolled) {
				await unenrollCampaign(selectedCampaign.id, linkedUserId, filterBy, library.baseUrl);
			} else {
				await enrollCampaign(selectedCampaign.id, linkedUserId, filterBy, library.baseUrl);
			}

			await refetch();
			handleCloseActions();
		} catch (error) {
			console.error("Error in enroll / unenroll: ", error);
		}
	};

	const handleEmailNotificationOptions = async () => {
		if (!selectedCampaign) return;

		try {
			const linkedUserId = selectedLinkedUserId;
			const optIn = selectedCampaign.optInToCampaignEmailNotifications ? 0 : 1;

			await optIntoCampaignEmails(selectedCampaign.id, linkedUserId, filterBy, optIn, library.baseUrl);

			await refetch();
			handleCloseActions();
		} catch (error) {
			console.error("Error in opt in / out of email notifications: ", error);
		}
	};

	const handleLeaderboardOptions = async () => {
		if (!selectedCampaign) return;

		try {
			const linkedUserId = selectedLinkedUserId;

			if (selectedCampaign.optInToCampaignLeaderboard) {
				await optUserOutOfCampaignLeaderboard(selectedCampaign.id, linkedUserId, filterBy, library.baseUrl);
			} else {
				await optUserInToCampaignLeaderboard(selectedCampaign.id, linkedUserId, filterBy, library.baseUrl);
			}

			await refetch();
			handleCloseActions();
		} catch (error) {
			console.error("Error in opt in / out of leaderboard: ", error);
		}
	};

	const toggleExpanded = (id) => {
		setExpandedCampaigns((prev) => ({
			...prev,
			[id]: !prev[id] }));
	};

	const handleOpenActions = (item, linkedUserId) => {
		setSelectedCampaign(item);
		setSelectedLinkedUserId(linkedUserId);
		setShowActionSheet(true);
	};

	const handleCloseActions = () => {
		setSelectedCampaign(null);
		setSelectedLinkedUserId(null);
		setShowActionSheet(false);
	};

	const RewardImage = ({ imageUrl, canShare, onShare }) => {
		if (!imageUrl) return null;

		return (
			<VStack space="sm">
				<Image
					source={{ uri: imageUrl }}
					style={{ width: 100, height: 100 }}
				/>
					{canShare && onShare ? (
					<Pressable onPress={() => onShare(imageUrl)}>
						<Text>{getTermFromDictionary(language, 'share_on_social_media')}</Text>
					</Pressable>
				) : null}
			</VStack>
		);
	};

	const RewardDisplay = ({ item, imageUrl, type = 'campaign'}) => {
		const displayName = item.displayName === 1;
		let hasImage;
		let actualImageUrl = imageUrl;
		const isDigitalReward = item.rewardType === 1;

		// Check if we should show placeholder
		if (isDigitalReward) {
			if (item.isPlaceholderImage) {
				if (item.useTplPlaceholder) {
					return (
					<VStack space="sm">
					<Image
						source={PlaceholderImg}
						style={{ width: 100, height: 100 }}
					/>
				</VStack>
					);
				}
				// Use the placeholder image URL instead
				actualImageUrl = buildImageUrl(item.badgeImage);
				hasImage = true;
			} else {
				if (type === 'campaign') {
					hasImage = item.rewardExists && item.badgeImage;
				} else {
					hasImage = item.rewardExists && item.rewardImage;
				}
			}
		}

		const rewardName = item.rewardName || 'No Reward';
		const canShare = type === 'campaign'
			? (item.campaignRewardGiven || (item.awardAutomatically && item.campaignIsComplete))
			: type === 'milestone'
			? (item.milestoneRewardGiven || (item.awardAutomatically && item.milestoneIsComplete))
			: (item.rewardGiven || (item.awardAutomatically && item.isComplete));

		return (
			<Box style={{ flex: type === 'campaign' ? 3 : 1 }}>
				{displayName && rewardName && (
					<Text>
						{rewardName}
					</Text>
				)}
				{hasImage && actualImageUrl && (
					<>
						<RewardImage
							imageUrl={actualImageUrl}
							canShare={canShare && !item.isPlaceholderImage}
							onShare={handleShareOnSocial}
						/>
					</>
				)}
			</Box>
		);
	};


	const ActivityTable = ({ items, title, type, campaignId, linkedUserId, isEnrolled, campaignIsPast, campaignIsUpcoming }) => {

		if (!Array.isArray(items) || items.length === 0) {
			return null;
		}

		const handleAddProgress = async (item) => {
			try {
				const activityType = type === 'milestone' ? 'milestone' : 'extraCredit';

				await addActivityProgress(item.id, linkedUserId, activityType, filterBy, library.baseUrl, language, campaignId);

				await refetch()
			} catch (error) {
				console.error("Error adding progress: ", error);
			}
		}

		const shouldShowButton = (item) => {
			if (!isEnrolled || campaignIsPast || campaignIsUpcoming) {
				return false;
			}

			return !!item.allowPatronProgressInput;
		};


		const shouldDisableButton = (item) =>{
			if (type === 'milestone') {
				return item.isComplete && !item.progressBeyondOneHundredPercent;
			} else if (type === 'activity') {
				return item.isComplete;
			}
			return false;
		}

		return (
			<Box style={{ marginTop: 16 }}>
				<Text bold size="md" style={{ marginBottom: 8 }}>
					{title}
				</Text>
				<VStack space="md">
     <HStack style={{ justifyContent: 'space-between', paddingBottom: 4, borderBottomWidth: 1, borderColor }}>
						<Text bold style={{ flex: 3 }}>{getTermFromDictionary(language, 'activity_name')}</Text>
						<Text bold style={{ flex: 2 }}>{getTermFromDictionary(language, 'activity_goal')}</Text>
						<Text bold style={{ flex: 2 }}>{getTermFromDictionary(language, 'activity_reward')}</Text>
						<Text bold style={{ flex: 2 }}>{getTermFromDictionary(language, 'progress')}</Text>
					</HStack>

					{items.map((item, i) => {
						if (!item) return null;

						const imageUrl = buildImageUrl(item.rewardImage);
						const showButton = shouldShowButton(item);
						const isDisabled = shouldDisableButton(item);

						return(
							<HStack
								key={i}
								space="md"
								style={{ justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: borderColor, paddingLeft: 16, paddingRight: 20, paddingVertical: 8 }}
							>
								<Text style={{ flex: 2 }}>
									{String(item.name || '')}
								</Text>
								<Text style={{ flex: 1 }}>
									{String(item.completedGoals || 0)} / {String(item.totalGoals || 0)}
								</Text>
								<Box style={{ width: 120 }}>
									<RewardDisplay
										item={item}
										imageUrl={imageUrl}
										type={type}
									/>
								</Box>
								<Box style={{ flex: 1, alignItems: 'center' }}>
									{!!showButton && (
										<Button
											size="sm"
											onPress={() => handleAddProgress(item)}
											isDisabled={isDisabled}
											style={{ opacity: isDisabled ? 0.5 : 1, width: '100%', paddingHorizontal: 8 }}
										>
											<ButtonText size="xs" style={{ textAlign: 'center' }}>
												{getTermFromDictionary(language, 'add_progress')}
											</ButtonText>
										</Button>
									)}
								</Box>
							</HStack>
						);
					})}
				</VStack>
			</Box>
		);
	};

	const renderCampaignItem = ({ item, onOpenActions, onToggle, expanded }) => {

		 if (!item) {
    		return null;
  		}

		const startDate = formatDate(item.startDate);
		const endDate = formatDate(item.endDate);
		const campaignImageUrl = buildImageUrl(item.badgeImage);
		const linkedUserIdForActivities = filterBy === 'linkedUserCampaigns' ? item.linkedUserId : null;
		const isUserEnrolled = item.enrolled || false;

		return (
			<VStack space="md" style={{ paddingHorizontal: 16, paddingVertical: 12 }} key={item.id}>
    <HStack style={{ justifyContent: 'space-between', borderBottomWidth: 1, borderColor, paddingBottom: 8 }}>
					<Text bold style={{ flex: 2 }}>{getTermFromDictionary(language, 'campaign_name_header')}</Text>
					<Text bold style={{ flex: 3 }}>{getTermFromDictionary(language, 'campaign_reward')}</Text>
					<Text bold style={{ flex: 2 }}>{getTermFromDictionary(language, 'campaign_dates')}</Text>
					<Text bold style={{ flex: 1 }}> </Text>
					<Text bold style={{ flex: 1 }}> </Text>
				</HStack>

				<HStack
					style={{ justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderColor }}
				>
					<Text style={{ flex: 2 }}>
						{String(item.name || '')}
					</Text>
					<RewardDisplay
						item={item}
						imageUrl={campaignImageUrl}
						type="campaign"
					/>
					<Text style={{ flex: 2 }}>
						{startDate} {'\n'} - {'\n'}{endDate}
					</Text>
					<Button
						onPress={onToggle}
						variant="link"
						style={{ flex: 1 }}
						accessibilityLabel={expanded ? "Collapse campaign details" : "Expand campaign details"}
					>
						<ButtonText>
							{expanded ? "▲" : "▼"}
						</ButtonText>
					</Button>
					<Button
						size="sm"
						onPress={() => onOpenActions(item, filterBy === 'linkedUserCampaigns' ? item.linkedUserId : null)}
						accessibilityLabel={`Open actions menu for ${item.name || 'campaign'}`}
					>
						<ButtonText>{getTermFromDictionary(language, 'campaign_action_button')}</ButtonText>
					</Button>
				</HStack>

				{expanded && (
					<Box style={{ paddingHorizontal: 8, paddingVertical: 8, backgroundColor: panelBg, borderRadius: 12 }}>
						{(!Array.isArray(item.milestones) || item.milestones.length === 0) && (!Array.isArray(item.extraCreditActivities) || item.extraCreditActivities.length === 0) ? (
							<Text italic>
								{getTermFromDictionary(language, 'no_activities_available')}
							</Text>
						) : (
							<>
								<ActivityTable
									items={item.milestones}
									title="Milestones"
									type="milestone"
									campaignId={item.id}
									linkedUserId={linkedUserIdForActivities}
									isEnrolled={isUserEnrolled}
									campaignIsPast={item.isPast}
									campaignIsUpcoming={item.isUpcoming}
								/>
								<ActivityTable
									items={item.extraCreditActivities}
									title="Extra Credit Activities"
									type="activity"
									campaignId={item.id}
									linkedUserId={linkedUserIdForActivities}
									isEnrolled={isUserEnrolled}
									campaignIsPast={item.isPast}
									campaignIsUpcoming={item.isUpcoming}
								/>
							</>
						)}
					</Box>
				)}
			</VStack>
		);
	};

	const renderActionSheet = () => {
		if (!selectedCampaign) return null;

		return (
			<Actionsheet isOpen={showActionSheet} onClose={handleCloseActions}>
				<ActionsheetBackdrop />
				<ActionsheetContent style={{ backgroundColor: surfaceBg }}>
					<ActionsheetDragIndicatorWrapper>
						<ActionsheetDragIndicator />
					</ActionsheetDragIndicatorWrapper>

					{(selectedCampaign?.canEnroll || selectedCampaign?.enrolled) && (
						<ActionsheetItem onPress={handleEnrollUnenroll}>
							<ActionsheetItemText style={{ color: textColor }}>
								{selectedCampaign?.enrolled ? 'Unenroll' : 'Enroll'}
							</ActionsheetItemText>
						</ActionsheetItem>
					)}
					{filterBy !== 'linkedUserCampaigns' && selectedCampaign?.enrolled && (
						<React.Fragment>
							<ActionsheetItem onPress={handleEmailNotificationOptions}>
								<ActionsheetItemText style={{ color: textColor }}>
									{selectedCampaign?.optInToCampaignEmailNotifications ? 'Opt Out of Notifications' : 'Opt in to Notifications'}
								</ActionsheetItemText>
							</ActionsheetItem>
							{library?.displayCampaignLeaderboard && library?.campaignLeaderboardDisplay === 'displayUser' && (
								<ActionsheetItem onPress={handleLeaderboardOptions}>
									<ActionsheetItemText style={{ color: textColor }}>
										{selectedCampaign?.optInToCampaignLeaderboard ? 'Opt Out of Leaderboard' : 'Opt in to Leaderboard'}
									</ActionsheetItemText>
								</ActionsheetItem>
							)}
						</React.Fragment>
					)}
					<ActionsheetItem onPress={handleCloseActions}>
						<ActionsheetItemText style={{ color: textColor }}>{getTermFromDictionary(language, 'cancel')}</ActionsheetItemText>
					</ActionsheetItem>
				</ActionsheetContent>
			</Actionsheet>
		);
	};

	const EmptyComponent = () => (
		<Center style={{ marginTop: 20, marginBottom: 20 }}>
			<Text bold size="lg">
				{getTermFromDictionary(language, EMPTY_MESSAGES[filterBy] || EMPTY_MESSAGES.default)}
			</Text>
		</Center>
	);

	const campaignsData = useMemo(() => data?.campaigns || [], [data]);
	const groupedCampaigns = useMemo(() =>
		filterBy === 'linkedUserCampaigns' ? groupByLinkedUser(campaignsData) : {},
		[filterBy, campaignsData]
	);

	const getFilterLabel = (value) => {
		const option = FILTER_OPTIONS.find(opt => opt.value === value);
		return option ? getTermFromDictionary(language, option.labelKey) : 'Select Filter';
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<Box style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: panelBg, borderBottomWidth: 1, borderColor }}>
				<Select
					onValueChange={(itemValue) => setFilterBy(itemValue)}
				>
					<SelectTrigger variant="outline" size="md" style={{ width: 256 }}>
						<SelectInput
                            style={{ paddingVertical: 0, color: textColor }}
							placeholder="Select Filter"
							value={getFilterLabel(filterBy)}
						/>
					</SelectTrigger>
					<SelectPortal>
						<SelectBackdrop />
						<SelectContent style={{ backgroundColor: surfaceBg }}>
							<SelectDragIndicatorWrapper>
								<SelectDragIndicator />
							</SelectDragIndicatorWrapper>
							<SelectScrollView>
								{FILTER_OPTIONS.map(option => (
									<SelectItem
										key={option.value}
										label={getTermFromDictionary(language, option.labelKey)}
										value={option.value}
									/>
								))}
							</SelectScrollView>
						</SelectContent>
					</SelectPortal>
				</Select>
			</Box>

			{status === 'loading' || isFetching ? (
				<Center style={{ flex: 1 }}>
					<Text>{getTermFromDictionary(language, 'loading')}</Text>
				</Center>
			) : status === 'error' ? (
				<Center style={{ flex: 1 }}>
					<Text>{getTermFromDictionary(language, 'campaign_loading_error')}</Text>
				</Center>
			) : campaignsData.length === 0 ? (
				<EmptyComponent />
			) : filterBy === 'linkedUserCampaigns' ? (
				<ScrollView>
					{Object.entries(groupedCampaigns).map(([userName, { userId, campaigns: groupedCampaignsList}]) => (
						<Box key={String(userId)} style={{ marginBottom: 24 }}>
							<Box style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: panelBg }}>
								<Text size="lg" bold>
									{getTermFromDictionary(language, 'campaigns_for_linked_user')}: {String(userName)}
								</Text>
							</Box>

							{Array.isArray(groupedCampaignsList) && groupedCampaignsList.map((item) => {
								if (!item || !item.id) return null;

								return (
									<Box key={String(item.id)}>
										{renderCampaignItem({
											item,
											expanded: expandedCampaigns[item.id],
											onToggle: () => toggleExpanded(item.id),
											onOpenActions: () => handleOpenActions(item, userId) })}
									</Box>
								);
							})}
						</Box>
					))}
				</ScrollView>
			) : (
				<FlatList
					data={campaignsData}
					ListEmptyComponent={EmptyComponent}
					renderItem={({ item }) => {

						 if (!item) {
								return null;
							}

						if (!item) return null;

						return renderCampaignItem({
							item,
							expanded: expandedCampaigns[item.id],
							onToggle: () => toggleExpanded(item.id),
							onOpenActions: () => handleOpenActions(item, filterBy === 'linkedUserCampaigns' ? item.linkedUserId : null) });
					}}

					keyExtractor={(item, index) => item?.id ? String(item.id) : String(index)}
					contentContainerStyle={{ paddingBottom: 30 }}
				/>
			)}

			{renderActionSheet()}
		</SafeAreaView>
	);
}
