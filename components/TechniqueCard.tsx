import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Technique } from '../types';

interface TechniqueCardProps {
    technique: Technique;
    index: number;
    onPress: () => void;
    onToggleComplete: () => void;
    onToggleStrike: () => void;
}

export const TechniqueCard: React.FC<TechniqueCardProps> = ({
    technique,
    index,
    onPress,
    onToggleComplete,
    onToggleStrike
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

    const getStatusColor = () => {
        if (technique.isCompleted) return '#4caf50';
        if (technique.isStrikedOut) return '#999';
        return '#2196f3';
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
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={onToggleComplete}
                >
                    <Text style={styles.completeButtonText}>
                        {technique.isCompleted ? 'Undo' : 'Complete'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.strikeButton]}
                    onPress={onToggleStrike}
                >
                    <Text style={styles.strikeButtonText}>
                        {technique.isStrikedOut ? 'Restore' : 'Skip'}
                    </Text>
                </TouchableOpacity>
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
        marginBottom: 16,
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
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    completeButton: {
        backgroundColor: '#e8f5e8',
        borderWidth: 1,
        borderColor: '#4caf50',
    },
    strikeButton: {
        backgroundColor: '#fff3e0',
        borderWidth: 1,
        borderColor: '#ff9800',
    },
    completeButtonText: {
        color: '#4caf50',
        fontSize: 14,
        fontWeight: '600',
    },
    strikeButtonText: {
        color: '#ff9800',
        fontSize: 14,
        fontWeight: '600',
    },
});