import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function RootLayout() {
    return (
        <>
            <StatusBar style="dark" backgroundColor="#fff" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        title: 'Home',
                    }}
                />
                <Stack.Screen
                    name="onboarding"
                    options={{
                        title: 'Get Started',
                        gestureEnabled: false, // Prevent going back during onboarding
                    }}
                />
                <Stack.Screen
                    name="learning-plan"
                    options={{
                        title: 'Learning Plan',
                    }}
                />
                <Stack.Screen
                    name="techniques"
                    options={{
                        title: 'Techniques',
                    }}
                />
                <Stack.Screen
                    name="technique-detail"
                    options={{
                        title: 'Technique Detail',
                        presentation: 'modal',
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="+not-found"
                    options={{
                        title: 'Not Found',
                    }}
                />
            </Stack>
        </>
    );
}