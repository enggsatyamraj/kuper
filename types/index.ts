// types/index.ts
export interface Technique {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    isStrikedOut: boolean;
    videoUrl?: string;
    estimatedTime?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    priority?: 'High' | 'Medium' | 'Low';
    prerequisites?: string;
    practiceHints?: string;
    // Pre-curated video data
    curatedVideos?: CuratedVideo[];
}

export interface CuratedVideo {
    id: string;
    title: string;
    url: string;
    thumbnailUrl: string;
    duration: string;
    channelName: string;
    description: string;
    quality: 'Beginner' | 'Intermediate' | 'Advanced';
    isRecommended?: boolean;
    videoId?: string; // YouTube video ID for embedding
}

export interface LearningPlan {
    id: string;
    hobby: string; // Changed from HobbyType to string to support any hobby
    level: string;
    techniques: Technique[];
    createdAt: string;
    updatedAt: string;
}

export interface User {
    selectedHobby?: string; // Changed from HobbyType to string
    selectedLevel?: string;
    currentPlan?: LearningPlan;
}

// Keep these for backwards compatibility and popular hobbies
export type HobbyType = 'Chess' | 'Poker' | 'Guitar';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';