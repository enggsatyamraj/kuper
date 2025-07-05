// components/VideoSearch.tsx
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { CuratedVideo } from '../types';

interface VideoSearchProps {
    curatedVideos: CuratedVideo[];
    techniqueTitle: string;
    hobby: string;
}

export const VideoSearch: React.FC<VideoSearchProps> = ({
    curatedVideos,
    techniqueTitle,
    hobby
}) => {
    const [selectedVideo, setSelectedVideo] = useState<CuratedVideo | null>(null);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState(false);

    const handleVideoPress = (video: CuratedVideo) => {
        setSelectedVideo(video);
        setShowVideoPlayer(true);
        setVideoError(false);
        setIsVideoLoading(true);
    };

    const handleCloseVideo = () => {
        setShowVideoPlayer(false);
        setSelectedVideo(null);
        setVideoError(false);
        setIsVideoLoading(false);
    };

    const handleWatchOnYouTube = async () => {
        if (!selectedVideo) return;

        try {
            const youtubeUrl = `https://www.youtube.com/watch?v=${selectedVideo.videoId || 'dQw4w9WgXcQ'}`;
            const canOpen = await Linking.canOpenURL(youtubeUrl);
            if (canOpen) {
                await Linking.openURL(youtubeUrl);
                handleCloseVideo();
            } else {
                Alert.alert('Error', 'Cannot open YouTube app');
            }
        } catch (error) {
            console.error('Error opening YouTube:', error);
            Alert.alert('Error', 'Failed to open YouTube');
        }
    };

    const handleSearchMore = async () => {
        try {
            const searchQuery = `${hobby} ${techniqueTitle} tutorial guide`;
            const encodedQuery = encodeURIComponent(searchQuery);
            const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;

            const canOpen = await Linking.canOpenURL(youtubeSearchUrl);
            if (canOpen) {
                await Linking.openURL(youtubeSearchUrl);
            } else {
                Alert.alert('Error', 'Cannot open YouTube. Please search manually.');
            }
        } catch (error) {
            console.error('Error opening YouTube search:', error);
            Alert.alert('Error', 'Failed to search for videos. Please try again.');
        }
    };

    // Create embeddable URL with better parameters
    const getEmbedUrl = (video: CuratedVideo): string => {
        const videoId = video.videoId || 'dQw4w9WgXcQ';
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&fs=1&controls=1&enablejsapi=1&origin=*`;
    };

    const handleVideoLoad = () => {
        setIsVideoLoading(false);
        setVideoError(false);
    };

    const handleVideoError = () => {
        setIsVideoLoading(false);
        setVideoError(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Learning Videos</Text>
            <Text style={styles.subtitle}>
                Watch curated tutorials to master this technique
            </Text>

            {curatedVideos.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videosContainer}>
                    {curatedVideos.map((video) => (
                        <TouchableOpacity
                            key={video.id}
                            style={styles.videoCard}
                            onPress={() => handleVideoPress(video)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.thumbnailContainer}>
                                <View style={styles.thumbnailPlaceholder}>
                                    <Text style={styles.playIcon}>▶️</Text>
                                    <Text style={styles.watchText}>Watch</Text>
                                </View>
                                <View style={styles.durationBadge}>
                                    <Text style={styles.durationText}>{video.duration}</Text>
                                </View>
                                {video.isRecommended && (
                                    <View style={styles.recommendedBadge}>
                                        <Text style={styles.recommendedText}>⭐</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.videoInfo}>
                                <Text style={styles.videoTitle} numberOfLines={2}>
                                    {video.title}
                                </Text>
                                <Text style={styles.channelName} numberOfLines={1}>
                                    {video.channelName}
                                </Text>
                                <View style={styles.qualityContainer}>
                                    <Text style={[
                                        styles.qualityBadge,
                                        { backgroundColor: getQualityColor(video.quality) }
                                    ]}>
                                        {video.quality}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.noVideosContainer}>
                    <Text style={styles.noVideosText}>No videos available yet</Text>
                    <Text style={styles.noVideosSubtext}>Search YouTube for tutorials</Text>
                </View>
            )}

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearchMore}
                >
                    <Text style={styles.searchButtonText}>
                        🔍 Search YouTube
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.tip}>
                💡 Tip: Starred (⭐) videos are specifically recommended for your level
            </Text>

            {/* Video Player Modal */}
            <Modal
                visible={showVideoPlayer}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCloseVideo}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={handleCloseVideo} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕ Close</Text>
                        </TouchableOpacity>
                        <View style={styles.modalHeaderContent}>
                            <Text style={styles.modalTitle} numberOfLines={1}>
                                {selectedVideo?.title}
                            </Text>
                            <Text style={styles.modalSubtitle}>
                                {selectedVideo?.channelName}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleWatchOnYouTube} style={styles.youtubeButton}>
                            <Text style={styles.youtubeButtonText}>YouTube</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.videoPlayerContainer}>
                        {isVideoLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#ff0000" />
                                <Text style={styles.loadingText}>Loading video...</Text>
                            </View>
                        )}

                        {videoError ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorIcon}>📹</Text>
                                <Text style={styles.errorTitle}>Video Unavailable</Text>
                                <Text style={styles.errorMessage}>
                                    This video cannot be played in the app.
                                </Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={handleWatchOnYouTube}
                                >
                                    <Text style={styles.retryButtonText}>Watch on YouTube</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            selectedVideo && (
                                <WebView
                                    source={{ uri: getEmbedUrl(selectedVideo) }}
                                    style={styles.webview}
                                    allowsInlineMediaPlayback={true}
                                    mediaPlaybackRequiresUserAction={false}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    startInLoadingState={false}
                                    scalesPageToFit={true}
                                    mixedContentMode="compatibility"
                                    onLoad={handleVideoLoad}
                                    onError={handleVideoError}
                                    userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1"
                                />
                            )
                        )}
                    </View>

                    <View style={styles.videoDetailsContainer}>
                        <Text style={styles.videoDetailsTitle}>About this tutorial:</Text>
                        <Text style={styles.videoDetailsText}>
                            {selectedVideo?.description}
                        </Text>
                        <View style={styles.videoMetaContainer}>
                            <View style={styles.videoMetaItem}>
                                <Text style={styles.videoMetaLabel}>Duration:</Text>
                                <Text style={styles.videoMetaValue}>{selectedVideo?.duration}</Text>
                            </View>
                            <View style={styles.videoMetaItem}>
                                <Text style={styles.videoMetaLabel}>Level:</Text>
                                <Text style={[
                                    styles.videoMetaValue,
                                    { color: getQualityColor(selectedVideo?.quality || 'Medium') }
                                ]}>
                                    {selectedVideo?.quality}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.alternativeButton}
                            onPress={handleWatchOnYouTube}
                        >
                            <Text style={styles.alternativeButtonText}>
                                🎥 Open in YouTube App
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const getQualityColor = (quality: string): string => {
    switch (quality) {
        case 'Beginner': return '#4CAF50';
        case 'Advanced': return '#F44336';
        default: return '#FF9800';
    }
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    videosContainer: {
        marginBottom: 20,
    },
    videoCard: {
        width: 200,
        marginRight: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    thumbnailContainer: {
        position: 'relative',
        height: 112,
        backgroundColor: '#2196f3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnailPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        fontSize: 28,
        color: '#fff',
        marginBottom: 4,
    },
    watchText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    recommendedBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FFD700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    recommendedText: {
        fontSize: 12,
    },
    videoInfo: {
        padding: 12,
    },
    videoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
        lineHeight: 18,
    },
    channelName: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    qualityContainer: {
        alignItems: 'flex-start',
    },
    qualityBadge: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    noVideosContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    noVideosText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    noVideosSubtext: {
        fontSize: 14,
        color: '#999',
    },
    actionContainer: {
        marginBottom: 16,
    },
    searchButton: {
        backgroundColor: '#ff0000',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    tip: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    modalHeaderContent: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
        textAlign: 'center',
    },
    youtubeButton: {
        backgroundColor: '#ff0000',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    youtubeButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    videoPlayerContainer: {
        flex: 1,
        backgroundColor: '#000',
        position: 'relative',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        zIndex: 1000,
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 40,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    retryButton: {
        backgroundColor: '#ff0000',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    webview: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoDetailsContainer: {
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        maxHeight: 250,
    },
    videoDetailsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    videoDetailsText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    videoMetaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    videoMetaItem: {
        flex: 1,
    },
    videoMetaLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    videoMetaValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    alternativeButton: {
        backgroundColor: '#ff0000',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    alternativeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});