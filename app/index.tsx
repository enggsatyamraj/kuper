import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StorageService } from '../utils/storage';

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        checkUserData();
    }, []);

    const checkUserData = async () => {
        try {
            const user = await StorageService.getUser();

            if (user && user.selectedHobby && user.selectedLevel) {
                // User has completed onboarding, check if they have a learning plan
                const learningPlan = await StorageService.getLearningPlan();

                if (learningPlan) {
                    router.replace('/learning-plan');
                } else {
                    router.replace('/learning-plan');
                }
            } else {
                // First time user, show onboarding
                router.replace('/onboarding');
            }
        } catch (error) {
            console.error('Error checking user data:', error);
            router.replace('/onboarding');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2196f3" />
        </View>
    );
}