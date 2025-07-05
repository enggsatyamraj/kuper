// components/TechniqueCard.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Technique } from '../types';

interface TechniqueCardProps {
    technique: Technique;
    index: number;
    onPress: () => void;
}

export const TechniqueCard: React.FC<TechniqueCardProps> = ({
    technique,
    index,
    onPress
}) => {
    const getCardStyle = () => {
        if (technique.isCompleted) {
            return [styles.card, styles.completedCard];
        }
        if (technique.isStrikedOut) {
            return [styles.card, styles.strikedCard];
        }
        return styles.card;
    };

    const getStatusIcon = () => {
        if (technique.isCompleted) return '✅';
        if (technique.isStrikedOut) return '❌';
        return '⏳';
    };

    const getDifficultyColor = () => {
        switch (technique.difficulty) {
            case 'Easy': return '#4CAF50';
            case 'Hard': return '#F44336';
            default: return '#FF9800';
        }
    };

    return (
        <TouchableOpacity style={getCardStyle()} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
                <View style={styles.indexContainer}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={[
                    styles.title,
                    technique.isCompleted && styles.completedTitle,
                    technique.isStrikedOut && styles.strikedTitle
                ]}>
                    {technique.title}
                </Text>

                <Text style={[
                    styles.description,
                    technique.isCompleted && styles.completedDescription,
                    technique.isStrikedOut && styles.strikedDescription
                ]}>
                    {technique.description}
                </Text>

                <View style={styles.metaInfo}>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeIcon}>⏱️</Text>
                        <Text style={styles.timeText}>{technique.estimatedTime}</Text>
                    </View>

                    {technique.difficulty && (
                        <View style={[styles.difficultyContainer, { backgroundColor: getDifficultyColor() + '20' }]}>
                            <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
                                {technique.difficulty}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>Tap to view details →</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#2196f3',
    },
    completedCard: {
        backgroundColor: '#f8fff8',
        borderLeftColor: '#4caf50',
    },
    strikedCard: {
        backgroundColor: '#f5f5f5',
        borderLeftColor: '#999',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    indexContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#2196f3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indexText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    statusContainer: {
        padding: 4,
    },
    statusIcon: {
        fontSize: 20,
    },
    cardContent: {
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    completedTitle: {
        color: '#4caf50',
    },
    strikedTitle: {
        color: '#999',
        textDecorationLine: 'line-through',
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    completedDescription: {
        color: '#4caf50',
    },
    strikedDescription: {
        color: '#999',
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    timeIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    timeText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    difficultyContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: '600',
    },
    tapHint: {
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    tapHintText: {
        fontSize: 12,
        color: '#2196f3',
        fontWeight: '500',
    },
});