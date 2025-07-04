import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { HobbyCard } from '../components/HobbyCard';
import { SkillLevelCard } from '../components/SkillLevelCard';
import { HobbyType, SkillLevel } from '../types';
import { StorageService } from '../utils/storage';

const HOBBIES = [
    {
        type: 'Chess' as HobbyType,
        icon: '♟️',
        description: 'Master strategic thinking and tactical patterns'
    },
    {
        type: 'Poker' as HobbyType,
        icon: '🃏',
        description: 'Learn probability, psychology and game theory'
    },
    {
        type: 'Guitar' as HobbyType,
        icon: '🎸',
        description: 'Play chords, scales and your favorite songs'
    }
];

const SKILL_LEVELS = [
    {
        level: 'Beginner' as SkillLevel,
        description: 'Just starting out, need basics'
    },
    {
        level: 'Intermediate' as SkillLevel,
        description: 'Know basics, want to improve'
    },
    {
        level: 'Advanced' as SkillLevel,
        description: 'Experienced, seeking mastery'
    }
];

export default function OnboardingScreen() {
    const [selectedHobby, setSelectedHobby] = useState<HobbyType | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);
    const [currentStep, setCurrentStep] = useState<'hobby' | 'level'>('hobby');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleHobbySelect = (hobby: HobbyType) => {
        setSelectedHobby(hobby);
    };

    const handleLevelSelect = (level: SkillLevel) => {
        setSelectedLevel(level);
    };

    const handleContinue = async () => {
        if (currentStep === 'hobby' && selectedHobby) {
            setCurrentStep('level');
            return;
        }

        if (currentStep === 'level' && selectedLevel && selectedHobby) {
            setIsLoading(true);
            try {
                // Save user preferences
                await StorageService.saveUser({
                    selectedHobby,
                    selectedLevel,
                });

                // Navigate to learning plan generation
                router.push('/learning-plan');
            } catch (error) {
                console.error('Error saving user data:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep === 'level') {
            setCurrentStep('hobby');
            setSelectedLevel(null);
        }
    };

    const canContinue = currentStep === 'hobby' ? selectedHobby : selectedLevel;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.header}>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressDot, styles.activeDot]} />
                    <View style={[styles.progressDot, currentStep === 'level' && styles.activeDot]} />
                </View>

                {currentStep === 'level' && (
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {currentStep === 'hobby' ? (
                    <View style={styles.section}>
                        <Text style={styles.title}>What would you like to learn?</Text>
                        <Text style={styles.subtitle}>
                            Choose a hobby you want to master efficiently
                        </Text>

                        <View style={styles.cardsContainer}>
                            {HOBBIES.map((hobby) => (
                                <HobbyCard
                                    key={hobby.type}
                                    hobby={hobby.type}
                                    icon={hobby.icon}
                                    description={hobby.description}
                                    isSelected={selectedHobby === hobby.type}
                                    onPress={handleHobbySelect}
                                />
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.section}>
                        <Text style={styles.title}>What's your {selectedHobby} level?</Text>
                        <Text style={styles.subtitle}>
                            We'll create a personalized learning plan for you
                        </Text>

                        <View style={styles.cardsContainer}>
                            {SKILL_LEVELS.map((skillLevel) => (
                                <SkillLevelCard
                                    key={skillLevel.level}
                                    level={skillLevel.level}
                                    description={skillLevel.description}
                                    isSelected={selectedLevel === skillLevel.level}
                                    onPress={handleLevelSelect}
                                />
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, !canContinue && styles.disabledButton]}
                    onPress={handleContinue}
                    disabled={!canContinue || isLoading}
                >
                    <Text style={[styles.continueButtonText, !canContinue && styles.disabledButtonText]}>
                        {isLoading ? 'Loading...' : currentStep === 'hobby' ? 'Continue' : 'Create My Plan'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? 40 : 0
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        marginRight: 8,
    },
    activeDot: {
        backgroundColor: '#2196f3',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#2196f3',
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        paddingVertical: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    cardsContainer: {
        paddingBottom: 20,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    continueButton: {
        backgroundColor: '#2196f3',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#e0e0e0',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButtonText: {
        color: '#999',
    },
});