import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { YouTubePlayer } from './YouTubePlayer';

interface VideoSearchProps {
    techniqueTitle: string;
    hobby: string;
}

export const VideoSearch: React.FC<VideoSearchProps> = ({ techniqueTitle, hobby }) => {
    const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearchVideos = () => {
        setShowYouTubePlayer(true);
    };

    const handleSearchExternal = async () => {
        try {
            setIsSearching(true);

            // Create search query for YouTube
            const searchQuery = `${hobby} ${techniqueTitle} tutorial beginner guide`;
            const encodedQuery = encodeURIComponent(searchQuery);
            const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;

            // Open YouTube search in external browser
            const canOpen = await Linking.canOpenURL(youtubeSearchUrl);
            if (canOpen) {
                await Linking.openURL(youtubeSearchUrl);
            } else {
                Alert.alert('Error', 'Cannot open YouTube. Please search manually.');
            }
        } catch (error) {
            console.error('Error opening YouTube search:', error);
            Alert.alert('Error', 'Failed to search for videos. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchAlternative = () => {
        Alert.alert(
            'Search Options',
            'Choose where to search for learning content:',
            [
                {
                    text: 'In-App YouTube',
                    onPress: handleSearchVideos
                },
                {
                    text: 'External Browser',
                    onPress: handleSearchExternal
                },
                {
                    text: 'Google Search',
                    onPress: () => {
                        const searchQuery = `${hobby} ${techniqueTitle} tutorial guide`;
                        const encodedQuery = encodeURIComponent(searchQuery);
                        const googleSearchUrl = `https://www.google.com/search?q=${encodedQuery}`;
                        Linking.openURL(googleSearchUrl);
                    }
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Find Learning Resources</Text>
            <Text style={styles.subtitle}>
                Search for tutorials and guides for this technique
            </Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSearchVideos}
                >
                    <Text style={styles.primaryButtonText}>
                        🎥 Watch Videos (In-App)
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleSearchAlternative}
                >
                    <Text style={styles.secondaryButtonText}>
                        🔍 More Options
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.tip}>
                💡 Tip: Look for videos with good ratings and clear explanations
            </Text>

            {/* YouTube Player Modal */}
            <YouTubePlayer
                techniqueTitle={techniqueTitle}
                hobby={hobby}
                visible={showYouTubePlayer}
                onClose={() => setShowYouTubePlayer(false)}
            />
        </View>
    );
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
    buttonContainer: {
        gap: 12,
        marginBottom: 16,
    },
    primaryButton: {
        backgroundColor: '#ff0000',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#f0f4f8',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e4e7',
    },
    secondaryButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    tip: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
    },
});