import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { TechniqueCard } from '../components/TechniqueCard';
import { LearningPlan, Technique } from '../types';
import { StorageService } from '../utils/storage';

export default function TechniquesScreen() {
    const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'skipped'>('all');
    const router = useRouter();

    useEffect(() => {
        loadLearningPlan();
    }, []);

    const loadLearningPlan = async () => {
        try {
            setIsLoading(true);
            const plan = await StorageService.getLearningPlan();

            if (!plan) {
                Alert.alert('No Learning Plan', 'Please create a learning plan first.', [
                    { text: 'OK', onPress: () => router.replace('/onboarding') }
                ]);
                return;
            }

            setLearningPlan(plan);
        } catch (error) {
            console.error('Error loading learning plan:', error);
            Alert.alert('Error', 'Failed to load your techniques. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateTechnique = async (techniqueId: string, updates: Partial<Technique>) => {
        if (!learningPlan) return;

        try {
            const updatedTechniques = learningPlan.techniques.map(tech =>
                tech.id === techniqueId ? { ...tech, ...updates } : tech
            );

            const updatedPlan = {
                ...learningPlan,
                techniques: updatedTechniques,
                updatedAt: new Date().toISOString(),
            };

            await StorageService.saveLearningPlan(updatedPlan);
            setLearningPlan(updatedPlan);
        } catch (error) {
            console.error('Error updating technique:', error);
            Alert.alert('Error', 'Failed to update technique. Please try again.');
        }
    };

    const handleTechniquePress = (technique: Technique) => {
        // Navigate to technique detail (we'll create this next)
        router.push(`/technique-detail?id=${technique.id}`);
    };

    const handleToggleComplete = (technique: Technique) => {
        const newCompleted = !technique.isCompleted;
        updateTechnique(technique.id, {
            isCompleted: newCompleted,
            isStrikedOut: newCompleted ? false : technique.isStrikedOut, // If completing, remove strike
        });
    };

    const handleToggleStrike = (technique: Technique) => {
        const newStriked = !technique.isStrikedOut;
        updateTechnique(technique.id, {
            isStrikedOut: newStriked,
            isCompleted: newStriked ? false : technique.isCompleted, // If striking, remove completion
        });
    };

    const getFilteredTechniques = () => {
        if (!learningPlan) return [];

        switch (filter) {
            case 'active':
                return learningPlan.techniques.filter(t => !t.isCompleted && !t.isStrikedOut);
            case 'completed':
                return learningPlan.techniques.filter(t => t.isCompleted);
            case 'skipped':
                return learningPlan.techniques.filter(t => t.isStrikedOut);
            default:
                return learningPlan.techniques;
        }
    };

    const getProgressStats = () => {
        if (!learningPlan) return { completed: 0, active: 0, skipped: 0, total: 0 };

        const completed = learningPlan.techniques.filter(t => t.isCompleted).length;
        const skipped = learningPlan.techniques.filter(t => t.isStrikedOut).length;
        const active = learningPlan.techniques.filter(t => !t.isCompleted && !t.isStrikedOut).length;
        const total = learningPlan.techniques.length;

        return { completed, active, skipped, total };
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196f3" />
                    <Text style={styles.loadingText}>Loading your techniques...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!learningPlan) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No learning plan found</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => router.replace('/onboarding')}>
                        <Text style={styles.retryButtonText}>Create Plan</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const filteredTechniques = getFilteredTechniques();
    const stats = getProgressStats();
    const progressPercentage = Math.round((stats.completed / stats.total) * 100);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{learningPlan.hobby} Techniques</Text>
                    <Text style={styles.headerSubtitle}>{learningPlan.level} Level</Text>
                </View>

                <View style={styles.progressCircle}>
                    <Text style={styles.progressText}>{progressPercentage}%</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {[
                        { key: 'all', label: `All (${stats.total})` },
                        { key: 'active', label: `Active (${stats.active})` },
                        { key: 'completed', label: `Completed (${stats.completed})` },
                        { key: 'skipped', label: `Skipped (${stats.skipped})` },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.filterTab, filter === tab.key && styles.activeFilterTab]}
                            onPress={() => setFilter(tab.key as any)}
                        >
                            <Text style={[styles.filterTabText, filter === tab.key && styles.activeFilterTabText]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Techniques List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {filteredTechniques.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No techniques in this category</Text>
                        <Text style={styles.emptySubtext}>
                            {filter === 'active' && 'All techniques are either completed or skipped'}
                            {filter === 'completed' && 'Complete some techniques to see them here'}
                            {filter === 'skipped' && 'Skip techniques you find difficult or uninteresting'}
                        </Text>
                    </View>
                ) : (
                    filteredTechniques.map((technique, index) => (
                        <TechniqueCard
                            key={technique.id}
                            technique={technique}
                            index={learningPlan.techniques.findIndex(t => t.id === technique.id)}
                            onPress={() => handleTechniquePress(technique)}
                            onToggleComplete={() => handleToggleComplete(technique)}
                            onToggleStrike={() => handleToggleStrike(technique)}
                        />
                    ))
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: Platform.OS === 'android' ? 40 : 0
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#2196f3',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#2196f3',
        fontSize: 16,
        fontWeight: '500',
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
        fontSize: 14,
        color: '#666',
    },
    progressCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1976d2',
    },
    filterContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filterScroll: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeFilterTab: {
        backgroundColor: '#2196f3',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    activeFilterTabText: {
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    bottomPadding: {
        height: 20,
    },
});