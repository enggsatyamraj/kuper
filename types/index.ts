export interface Technique {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    isStrikedOut: boolean;
    videoUrl?: string;
    estimatedTime?: string;
}

export interface LearningPlan {
    id: string;
    hobby: string;
    level: string;
    techniques: Technique[];
    createdAt: string;
    updatedAt: string;
}

export interface User {
    selectedHobby?: string;
    selectedLevel?: string;
    currentPlan?: LearningPlan;
}

export type HobbyType = 'Chess' | 'Poker' | 'Guitar';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';