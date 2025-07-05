// components/LearningResourcesSection.tsx
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LearningResource } from '../types';

interface LearningResourcesSectionProps {
    resources: LearningResource[];
    techniqueTitle: string;
}

export const LearningResourcesSection: React.FC<LearningResourcesSectionProps> = ({
    resources,
    techniqueTitle
}) => {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'article' | 'tool' | 'course' | 'tutorial'>('all');

    const handleResourcePress = async (resource: LearningResource) => {
        try {
            const canOpen = await Linking.canOpenURL(resource.url);
            if (canOpen) {
                await Linking.openURL(resource.url);
            } else {
                Alert.alert('Error', 'Cannot open this link');
            }
        } catch (error) {
            console.error('Error opening resource:', error);
            Alert.alert('Error', 'Failed to open resource');
        }
    };

    const getFilteredResources = (): LearningResource[] => {
        if (selectedCategory === 'all') {
            return resources;
        }
        return resources.filter(resource => resource.type === selectedCategory);
    };

    const getResourceIcon = (type: string): string => {
        switch (type) {
            case 'article': return '📄';
            case 'tutorial': return '📖';
            case 'tool': return '🛠️';
            case 'course': return '🎓';
            default: return '📚';
        }
    };

    const getResourceTypeColor = (type: string): string => {
        switch (type) {
            case 'article': return '#4CAF50';
            case 'tutorial': return '#2196F3';
            case 'tool': return '#FF9800';
            case 'course': return '#9C27B0';
            default: return '#666';
        }
    };

    const getDifficultyColor = (difficulty: string): string => {
        switch (difficulty) {
            case 'Beginner': return '#4CAF50';
            case 'Advanced': return '#F44336';
            default: return '#FF9800';
        }
    };

    const resourceCategories = [
        { key: 'all', label: 'All', count: resources.length },
        { key: 'article', label: 'Articles', count: resources.filter(r => r.type === 'article').length },
        { key: 'tutorial', label: 'Tutorials', count: resources.filter(r => r.type === 'tutorial').length },
        { key: 'tool', label: 'Tools', count: resources.filter(r => r.type === 'tool').length },
        { key: 'course', label: 'Courses', count: resources.filter(r => r.type === 'course').length },
    ].filter(category => category.count > 0);

    const filteredResources = getFilteredResources();

    if (resources.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Learning Resources</Text>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📚</Text>
                    <Text style={styles.emptyText}>No additional resources available</Text>
                    <Text style={styles.emptySubtext}>Check back later for more learning materials</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Learning Resources</Text>
            <Text style={styles.subtitle}>
                Curated articles, tutorials, tools, and courses for {techniqueTitle}
            </Text>

            {/* Category Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
                contentContainerStyle={styles.categoryContent}
            >
                {resourceCategories.map((category) => (
                    <TouchableOpacity
                        key={category.key}
                        style={[
                            styles.categoryTab,
                            selectedCategory === category.key && styles.activeCategoryTab
                        ]}
                        onPress={() => setSelectedCategory(category.key as any)}
                    >
                        <Text style={[
                            styles.categoryTabText,
                            selectedCategory === category.key && styles.activeCategoryTabText
                        ]}>
                            {category.label} ({category.count})
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Resources List */}
            <View style={styles.resourcesList}>
                {filteredResources.length === 0 ? (
                    <View style={styles.emptyFilterContainer}>
                        <Text style={styles.emptyFilterText}>No {selectedCategory} resources found</Text>
                    </View>
                ) : (
                    filteredResources.map((resource) => (
                        <TouchableOpacity
                            key={resource.id}
                            style={styles.resourceCard}
                            onPress={() => handleResourcePress(resource)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.resourceHeader}>
                                <View style={styles.resourceTypeContainer}>
                                    <Text style={styles.resourceIcon}>{getResourceIcon(resource.type)}</Text>
                                    <View style={[
                                        styles.resourceTypeBadge,
                                        { backgroundColor: getResourceTypeColor(resource.type) + '20' }
                                    ]}>
                                        <Text style={[
                                            styles.resourceTypeText,
                                            { color: getResourceTypeColor(resource.type) }
                                        ]}>
                                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.resourceMeta}>
                                    {resource.isRecommended && (
                                        <View style={styles.recommendedBadge}>
                                            <Text style={styles.recommendedText}>⭐ Recommended</Text>
                                        </View>
                                    )}
                                    <View style={[
                                        styles.difficultyBadge,
                                        { backgroundColor: getDifficultyColor(resource.difficulty) + '20' }
                                    ]}>
                                        <Text style={[
                                            styles.difficultyText,
                                            { color: getDifficultyColor(resource.difficulty) }
                                        ]}>
                                            {resource.difficulty}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.resourceTitle} numberOfLines={2}>
                                {resource.title}
                            </Text>

                            <Text style={styles.resourceDescription} numberOfLines={3}>
                                {resource.description}
                            </Text>

                            <View style={styles.resourceFooter}>
                                <View style={styles.resourceSourceContainer}>
                                    <Text style={styles.resourceSource}>{resource.source}</Text>
                                    {resource.author && (
                                        <Text style={styles.resourceAuthor}>by {resource.author}</Text>
                                    )}
                                </View>

                                <View style={styles.resourceActions}>
                                    {resource.duration && (
                                        <Text style={styles.resourceDuration}>{resource.duration}</Text>
                                    )}
                                    {resource.rating && (
                                        <Text style={styles.resourceRating}>⭐ {resource.rating}</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.tapHint}>
                                <Text style={styles.tapHintText}>Tap to open →</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </View>
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
    categoryContainer: {
        marginBottom: 20,
    },
    categoryContent: {
        paddingRight: 20,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeCategoryTab: {
        backgroundColor: '#2196f3',
    },
    categoryTabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    activeCategoryTabText: {
        color: '#fff',
    },
    resourcesList: {
        gap: 16,
    },
    resourceCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#2196f3',
    },
    resourceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    resourceTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    resourceIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    resourceTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    resourceTypeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    resourceMeta: {
        alignItems: 'flex-end',
        gap: 4,
    },
    recommendedBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    recommendedText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#B8860B',
    },
    difficultyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    difficultyText: {
        fontSize: 10,
        fontWeight: '600',
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        lineHeight: 22,
    },
    resourceDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    resourceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    resourceSourceContainer: {
        flex: 1,
    },
    resourceSource: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    resourceAuthor: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    resourceActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    resourceDuration: {
        fontSize: 11,
        color: '#666',
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    resourceRating: {
        fontSize: 11,
        color: '#666',
    },
    tapHint: {
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    tapHintText: {
        fontSize: 12,
        color: '#2196f3',
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    emptyFilterContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyFilterText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
});