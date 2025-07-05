// app/technique-detail.tsx
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { VideoSearch } from '../components/VideoSearch';
import { LearningPlan, Technique } from '../types';
import { StorageService } from '../utils/storage';

export default function TechniqueDetailScreen() {
    const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
    const [technique, setTechnique] = useState<Technique | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCelebration, setShowCelebration] = useState(false);

    const router = useRouter();
    const { id } = useLocalSearchParams();

    useEffect(() => {
        loadTechniqueData();
    }, [id]);

    const loadTechniqueData = async () => {
        try {
            setIsLoading(true);

            const plan = await StorageService.getLearningPlan();
            if (!plan) {
                Alert.alert('Error', 'No learning plan found', [
                    { text: 'OK', onPress: () => router.replace('/onboarding') }
                ]);
                return;
            }

            const foundTechnique = plan.techniques.find(t => t.id === id);
            if (!foundTechnique) {
                Alert.alert('Error', 'Technique not found', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
                return;
            }

            setLearningPlan(plan);
            setTechnique(foundTechnique);

        } catch (error) {
            console.error('Error loading technique data:', error);
            Alert.alert('Error', 'Failed to load technique details');
        } finally {
            setIsLoading(false);
        }
    };

    const updateTechnique = async (updates: Partial<Technique>) => {
        if (!learningPlan || !technique) return;

        try {
            const updatedTechniques = learningPlan.techniques.map(tech =>
                tech.id === technique.id ? { ...tech, ...updates } : tech
            );

            const updatedPlan = {
                ...learningPlan,
                techniques: updatedTechniques,
                updatedAt: new Date().toISOString(),
            };

            await StorageService.saveLearningPlan(updatedPlan);
            setLearningPlan(updatedPlan);
            setTechnique({ ...technique, ...updates });
        } catch (error) {
            console.error('Error updating technique:', error);
            Alert.alert('Error', 'Failed to update technique');
        }
    };

    const handleToggleComplete = () => {
        if (!technique) return;

        const newCompleted = !technique.isCompleted;

        if (newCompleted) {
            setShowCelebration(true);
        }

        updateTechnique({
            isCompleted: newCompleted,
            isStrikedOut: newCompleted ? false : technique.isStrikedOut,
        });

        if (!newCompleted) {
            Alert.alert('✅ Marked as Incomplete', 'You can always come back to complete this technique later.');
        }
    };

    const handleCelebrationComplete = () => {
        setShowCelebration(false);

        const nextTech = getNextTechnique();
        const completedCount = learningPlan!.techniques.filter(t => t.isCompleted).length;
        const totalCount = learningPlan!.techniques.length;
        const progressPercentage = Math.round((completedCount / totalCount) * 100);

        if (nextTech) {
            Alert.alert(
                'What\'s Next?',
                `You've completed ${completedCount} of ${totalCount} techniques (${progressPercentage}%).\n\nReady for the next challenge?`,
                [
                    {
                        text: 'Next Technique',
                        onPress: () => router.replace(`/technique-detail?id=${nextTech.id}`)
                    },
                    {
                        text: 'Back to List',
                        onPress: () => router.back()
                    }
                ]
            );
        } else {
            Alert.alert(
                '🎊 Course Complete!',
                `Amazing! You've completed ALL techniques in your ${learningPlan!.hobby} learning plan! You're well on your way to mastery.`,
                [
                    {
                        text: 'View Progress',
                        onPress: () => router.navigate('/learning-plan')
                    },
                    {
                        text: 'Start New Journey',
                        onPress: () => router.navigate('/onboarding')
                    }
                ]
            );
        }
    };

    const handleToggleStrike = () => {
        if (!technique) return;

        const newStriked = !technique.isStrikedOut;

        if (newStriked) {
            Alert.alert(
                'Skip Technique',
                'Are you sure you want to skip this technique? You can always come back to it later.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Skip',
                        style: 'destructive',
                        onPress: () => {
                            updateTechnique({
                                isStrikedOut: true,
                                isCompleted: false,
                            });
                        }
                    }
                ]
            );
        } else {
            updateTechnique({
                isStrikedOut: false,
            });
        }
    };

    const getNextTechnique = () => {
        if (!learningPlan || !technique) return null;

        const currentIndex = learningPlan.techniques.findIndex(t => t.id === technique.id);
        const nextActiveTechnique = learningPlan.techniques
            .slice(currentIndex + 1)
            .find(t => !t.isCompleted && !t.isStrikedOut);

        return nextActiveTechnique;
    };

    const handleNextTechnique = () => {
        const nextTech = getNextTechnique();
        if (nextTech) {
            router.replace(`/technique-detail?id=${nextTech.id}`);
        } else {
            Alert.alert(
                'All Done!',
                'You\'ve completed or skipped all available techniques. Great job!',
                [
                    { text: 'Back to List', onPress: () => router.back() }
                ]
            );
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196f3" />
                    <Text style={styles.loadingText}>Loading technique...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!technique || !learningPlan) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Technique not found</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const techniqueIndex = learningPlan.techniques.findIndex(t => t.id === technique.id);
    const nextTechnique = getNextTechnique();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Technique {techniqueIndex + 1}</Text>
                    <Text style={styles.headerSubtitle}>{learningPlan.hobby} • {learningPlan.level}</Text>
                </View>

                <View style={styles.statusContainer}>
                    {technique.isCompleted && <Text style={styles.statusIcon}>✅</Text>}
                    {technique.isStrikedOut && <Text style={styles.statusIcon}>❌</Text>}
                    {!technique.isCompleted && !technique.isStrikedOut && (
                        <Text style={styles.statusIcon}>⏳</Text>
                    )}
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Technique Info */}
                <View style={styles.techniqueCard}>
                    <Text style={[
                        styles.techniqueTitle,
                        technique.isCompleted && styles.completedText,
                        technique.isStrikedOut && styles.strikedText
                    ]}>
                        {technique.title}
                    </Text>

                    <View style={styles.metaRow}>
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeIcon}>⏱️</Text>
                            <Text style={styles.timeText}>Estimated: {technique.estimatedTime}</Text>
                        </View>

                        {technique.difficulty && (
                            <View style={[styles.difficultyContainer, { backgroundColor: getDifficultyColor(technique.difficulty) + '20' }]}>
                                <Text style={[styles.difficultyText, { color: getDifficultyColor(technique.difficulty) }]}>
                                    {technique.difficulty}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={[
                        styles.description,
                        technique.isCompleted && styles.completedDescription,
                        technique.isStrikedOut && styles.strikedDescription
                    ]}>
                        {technique.description}
                    </Text>

                    {technique.prerequisites && technique.prerequisites !== 'None' && (
                        <View style={styles.prerequisitesContainer}>
                            <Text style={styles.prerequisitesTitle}>📋 Prerequisites:</Text>
                            <Text style={styles.prerequisitesText}>{technique.prerequisites}</Text>
                        </View>
                    )}
                </View>

                {/* Learning Resources */}
                {!technique.isStrikedOut && (
                    <VideoSearch
                        curatedVideos={technique.curatedVideos || []}
                        techniqueTitle={technique.title}
                        hobby={learningPlan.hobby}
                    />
                )}

                {/* Practice Tips */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>💡 Practice Tips</Text>
                    <Text style={styles.practiceHints}>
                        {technique.practiceHints || 'Practice regularly and focus on proper form. Take breaks when you feel frustrated. Track your progress and celebrate small wins.'}
                    </Text>
                    <View style={styles.tipsList}>
                        <Text style={styles.tipItem}>• Start slowly and focus on proper form</Text>
                        <Text style={styles.tipItem}>• Practice regularly in short sessions</Text>
                        <Text style={styles.tipItem}>• Don't rush - quality over quantity</Text>
                        <Text style={styles.tipItem}>• Take breaks when you feel frustrated</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    <View style={styles.primaryActions}>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.completeButton,
                                technique.isCompleted && styles.completedButton
                            ]}
                            onPress={handleToggleComplete}
                        >
                            <Text style={[
                                styles.actionButtonText,
                                technique.isCompleted && styles.completedButtonText
                            ]}>
                                {technique.isCompleted ? '✅ Completed' : 'Mark Complete'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.skipButton,
                                technique.isStrikedOut && styles.skippedButton
                            ]}
                            onPress={handleToggleStrike}
                        >
                            <Text style={[
                                styles.actionButtonText,
                                styles.skipButtonText,
                                technique.isStrikedOut && styles.skippedButtonText
                            ]}>
                                {technique.isStrikedOut ? '↩️ Restore' : 'Skip for Now'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Next Technique */}
                    {nextTechnique && (
                        <TouchableOpacity style={styles.nextButton} onPress={handleNextTechnique}>
                            <Text style={styles.nextButtonText}>
                                Next: {nextTechnique.title} →
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            <CompletionCelebration
                visible={showCelebration}
                onComplete={handleCelebrationComplete}
            />
        </SafeAreaView>
    );
}

const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
        case 'Easy': return '#4CAF50';
        case 'Hard': return '#F44336';
        default: return '#FF9800';
    }
};

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
    statusContainer: {
        width: 32,
        alignItems: 'center',
    },
    statusIcon: {
        fontSize: 20,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    techniqueCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    techniqueTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    completedText: {
        color: '#4caf50',
    },
    strikedText: {
        color: '#999',
        textDecorationLine: 'line-through',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    timeIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    timeText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    difficultyContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    difficultyText: {
        fontSize: 14,
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        marginBottom: 16,
    },
    completedDescription: {
        color: '#4caf50',
    },
    strikedDescription: {
        color: '#999',
    },
    prerequisitesContainer: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2196f3',
    },
    prerequisitesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    prerequisitesText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    tipsCard: {
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
    tipsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    practiceHints: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
        fontStyle: 'italic',
    },
    tipsList: {
        gap: 8,
    },
    tipItem: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    actionSection: {
        marginBottom: 20,
    },
    primaryActions: {
        gap: 12,
        marginBottom: 16,
    },
    actionButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    completeButton: {
        backgroundColor: '#4caf50',
    },
    completedButton: {
        backgroundColor: '#e8f5e8',
        borderWidth: 2,
        borderColor: '#4caf50',
    },
    skipButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ff9800',
    },
    skippedButton: {
        backgroundColor: '#fff3e0',
        borderColor: '#ff9800',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    completedButtonText: {
        color: '#4caf50',
    },
    skipButtonText: {
        color: '#ff9800',
    },
    skippedButtonText: {
        color: '#ff9800',
    },
    nextButton: {
        backgroundColor: '#2196f3',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    bottomPadding: {
        height: 40,
    },
});