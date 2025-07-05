// components/HobbyCard.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HobbyCardProps {
    hobby: string; // Changed from HobbyType to string
    isSelected: boolean;
    onPress: (hobby: string) => void;
    icon: string;
    description: string;
}

export const HobbyCard: React.FC<HobbyCardProps> = ({
    hobby,
    isSelected,
    onPress,
    icon,
    description
}) => {
    return (
        <TouchableOpacity
            style={[styles.card, isSelected && styles.selectedCard]}
            onPress={() => onPress(hobby)}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <Text style={styles.icon}>{icon}</Text>
                <Text style={[styles.title, isSelected && styles.selectedTitle]}>
                    {hobby}
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
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        backgroundColor: '#e3f2fd',
        borderColor: '#2196f3',
    },
    cardContent: {
        alignItems: 'center',
    },
    icon: {
        fontSize: 32,
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    selectedTitle: {
        color: '#1976d2',
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    selectedDescription: {
        color: '#1976d2',
    },
});