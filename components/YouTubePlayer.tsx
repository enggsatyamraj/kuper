import React, { useState } from 'react';
import { ActivityIndicator, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface YouTubePlayerProps {
    techniqueTitle: string;
    hobby: string;
    visible: boolean;
    onClose: () => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
    techniqueTitle,
    hobby,
    visible,
    onClose
}) => {
    const [isLoading, setIsLoading] = useState(true);

    // Create YouTube search URL that opens directly in mobile-friendly format
    const getYouTubeSearchUrl = () => {
        const searchQuery = `${hobby} ${techniqueTitle} tutorial beginner guide`;
        const encodedQuery = encodeURIComponent(searchQuery);
        return `https://m.youtube.com/results?search_query=${encodedQuery}`;
    };

    const handleLoadStart = () => {
        setIsLoading(true);
    };

    const handleLoadEnd = () => {
        setIsLoading(false);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕ Close</Text>
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Find Videos</Text>
                        <Text style={styles.headerSubtitle}>{techniqueTitle}</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {/* Loading indicator */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff0000" />
                        <Text style={styles.loadingText}>Loading YouTube...</Text>
                    </View>
                )}

                {/* WebView */}
                <WebView
                    source={{ uri: getYouTubeSearchUrl() }}
                    style={styles.webview}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={false}
                    scalesPageToFit={true}
                    mixedContentMode="compatibility"
                    thirdPartyCookiesEnabled={true}
                    userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1"
                />

                {/* Tips */}
                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsText}>
                        💡 Tap on any video to watch. Look for recent uploads with good ratings!
                    </Text>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
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
        color: '#ff0000',
        fontSize: 16,
        fontWeight: '600',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
        textAlign: 'center',
    },
    placeholder: {
        width: 60, // Same width as close button for centering
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    webview: {
        flex: 1,
    },
    tipsContainer: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    tipsText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 16,
    },
});