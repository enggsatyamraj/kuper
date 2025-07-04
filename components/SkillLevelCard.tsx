import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SkillLevel } from '../types';

interface SkillLevelCardProps {
    level: SkillLevel;
    isSelected: boolean;
    onPress: (level: SkillLevel) => void;
    description: string;
}

export const SkillLevelCard: React.FC<SkillLevelCardProps> = ({
    level,
    isSelected,
    onPress,
    description
}) => {
    return (
        <TouchableOpacity
            style={[styles.card, isSelected && styles.selectedCard]}
            onPress={() => onPress(level)}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <Text style={[styles.title, isSelected && styles.selectedTitle]}>
                    {level}
                </Text>
                <Text style={[styles.description, isSelected && styles.selectedDescription]}>
                    {description}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4caf50',
    },
    cardContent: {
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    selectedTitle: {
        color: '#2e7d32',
    },
    description: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 16,
    },
    selectedDescription: {
        color: '#2e7d32',
    },
});