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
    View
} from 'react-native';
import { AIService } from '../services/aiService';
import { HobbyType, LearningPlan, SkillLevel, User } from '../types';
import { StorageService } from '../utils/storage';

export default function LearningPlanScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);

            // Load user data
            const userData = await StorageService.getUser();
            if (!userData || !userData.selectedHobby || !userData.selectedLevel) {
                router.replace('/onboarding');
                return;
            }

            setUser(userData);

            // Check if we already have a learning plan
            const existingPlan = await StorageService.getLearningPlan();

            if (existingPlan &&
                existingPlan.hobby === userData.selectedHobby &&
                existingPlan.level === userData.selectedLevel) {
                setLearningPlan(existingPlan);
            } else {
                // Generate new learning plan
                await generateNewPlan(userData.selectedHobby, userData.selectedLevel);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Error', 'Failed to load your learning plan. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const generateNewPlan = async (hobby: HobbyType, level: SkillLevel) => {
        try {
            setIsGenerating(true);

            const newPlan = await AIService.generateLearningPlan(hobby, level);

            await StorageService.saveLearningPlan(newPlan);
            setLearningPlan(newPlan);

        } catch (error) {
            console.error('Error generating plan:', error);
            Alert.alert('Error', 'Failed to generate your learning plan. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegeneratePlan = () => {
        Alert.alert(
            'Regenerate Learning Plan',
            'This will create a new learning plan and reset your progress. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Regenerate',
                    style: 'destructive',
                    onPress: () => {
                        if (user) {
                            generateNewPlan(user.selectedHobby!, user.selectedLevel!);
                        }
                    }
                }
            ]
        );
    };

    const handleStartLearning = () => {
        router.push('/techniques');
    };

    const handleChangePreferences = () => {
        Alert.alert(
            'Change Preferences',
            'This will reset your learning plan and progress. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Change',
                    style: 'destructive',
                    onPress: () => {
                        StorageService.clearAll();
                        router.replace('/onboarding');
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196f3" />
                    <Text style={styles.loadingText}>Loading your learning plan...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isGenerating) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196f3" />
                    <Text style={styles.loadingText}>🧠 AI is creating your personalized plan...</Text>
                    <Text style={styles.loadingSubtext}>This may take a moment</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!learningPlan || !user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Something went wrong</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const completedCount = learningPlan.techniques.filter(t => t.isCompleted).length;
    const activeCount = learningPlan.techniques.filter(t => !t.isCompleted && !t.isStrikedOut).length;
    const progressPercentage = Math.round((completedCount / learningPlan.techniques.length) * 100);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Your Learning Plan</Text>
                    <TouchableOpacity onPress={handleChangePreferences}>
                        <Text style={styles.changeButton}>Change</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.hobbyInfo}>
                    <Text style={styles.hobbyText}>{user.selectedHobby}</Text>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{user.selectedLevel}</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Progress Summary */}
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressTitle}>Progress Overview</Text>
                        <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
                    </View>

                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                    </View>

                    <View style={styles.progressStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{completedCount}</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{activeCount}</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{learningPlan.techniques.length}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                    </View>
                </View>

                {/* Techniques Overview */}
                <View style={styles.techniquesCard}>
                    <View style={styles.techniquesHeader}>
                        <Text style={styles.techniquesTitle}>Your Techniques</Text>
                        <TouchableOpacity onPress={handleRegeneratePlan}>
                            <Text style={styles.regenerateButton}>🔄 Regenerate</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.techniquesSubtitle}>
                        {learningPlan.techniques.length} carefully curated techniques for your level
                    </Text>

                    <View style={styles.techniquesList}>
                        {learningPlan.techniques.map((technique, index) => (
                            <View key={technique.id} style={styles.techniqueItem}>
                                <View style={styles.techniqueNumber}>
                                    <Text style={styles.techniqueNumberText}>{index + 1}</Text>
                                </View>
                                <View style={styles.techniqueContent}>
                                    <Text style={[
                                        styles.techniqueTitle,
                                        technique.isCompleted && styles.completedText,
                                        technique.isStrikedOut && styles.strikedText
                                    ]}>
                                        {technique.title}
                                    </Text>
                                    <Text style={styles.techniqueTime}>{technique.estimatedTime}</Text>
                                </View>
                                <View style={styles.techniqueStatus}>
                                    {technique.isCompleted && <Text style={styles.statusIcon}>✅</Text>}
                                    {technique.isStrikedOut && <Text style={styles.statusIcon}>❌</Text>}
                                    {!technique.isCompleted && !technique.isStrikedOut && (
                                        <Text style={styles.statusIcon}>⏳</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Action Card */}
                <View style={styles.actionCard}>
                    <Text style={styles.actionTitle}>Ready to start learning?</Text>
                    <Text style={styles.actionSubtitle}>
                        Dive into your techniques and track your progress
                    </Text>

                    <TouchableOpacity style={styles.startButton} onPress={handleStartLearning}>
                        <Text style={styles.startButtonText}>Start Learning</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: Platform.OS === 'android' ? 40 : 0,
        // paddingBottom: Platform.OS === 'android' ? 40 : 0
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        textAlign: 'center',
    },
    loadingSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
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
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
    },
    changeButton: {
        fontSize: 16,
        color: '#2196f3',
        fontWeight: '500',
    },
    hobbyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    hobbyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginRight: 12,
    },
    levelBadge: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    levelText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1976d2',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    progressCard: {
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
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    progressPercentage: {
        fontSize: 24,
        fontWeight: '700',
        color: '#4caf50',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginBottom: 16,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4caf50',
        borderRadius: 4,
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    techniquesCard: {
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
    techniquesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    techniquesTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    regenerateButton: {
        fontSize: 14,
        color: '#ff9800',
        fontWeight: '500',
    },
    techniquesSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    techniquesList: {
        gap: 12,
    },
    techniqueItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
    },
    techniqueNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2196f3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    techniqueNumberText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    techniqueContent: {
        flex: 1,
    },
    techniqueTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#4caf50',
    },
    strikedText: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    techniqueTime: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    techniqueStatus: {
        marginLeft: 8,
    },
    statusIcon: {
        fontSize: 16,
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    actionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    startButton: {
        backgroundColor: '#2196f3',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        minWidth: 200,
        marginBottom: 20
    },
    startButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});