import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningPlan, User } from '../types';

const STORAGE_KEYS = {
    USER: 'user_data',
    LEARNING_PLAN: 'learning_plan',
} as const;

export const StorageService = {
    // User data
    async saveUser(user: User): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        } catch (error) {
            console.error('Error saving user:', error);
        }
    },

    async getUser(): Promise<User | null> {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },

    // Learning plan
    async saveLearningPlan(plan: LearningPlan): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.LEARNING_PLAN, JSON.stringify(plan));
        } catch (error) {
            console.error('Error saving learning plan:', error);
        }
    },

    async getLearningPlan(): Promise<LearningPlan | null> {
        try {
            const planData = await AsyncStorage.getItem(STORAGE_KEYS.LEARNING_PLAN);
            return planData ? JSON.parse(planData) : null;
        } catch (error) {
            console.error('Error getting learning plan:', error);
            return null;
        }
    },

    async clearAll(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
};