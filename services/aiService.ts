// services/aiService.ts
import { CuratedVideo, LearningPlan, SkillLevel, Technique } from '../types';

const GEMINI_API_KEY = 'AIzaSyCFLsutHuF2YgEJ7b-6JBCvZV4nEzkeagM';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export class AIService {
    private static generateTechniqueId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    private static generatePlanId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    static async generateLearningPlan(
        hobby: string,
        level: SkillLevel
    ): Promise<LearningPlan> {
        try {
            const prompt = this.createEnhancedPrompt(hobby, level);

            const requestBody = {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.8,
                    topP: 0.9,
                    topK: 40,
                    maxOutputTokens: 4000,
                }
            };

            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Gemini API error:', response.status, errorData);
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                console.error('Invalid response structure:', data);
                throw new Error('Invalid response from Gemini API');
            }

            const generatedText = data.candidates[0].content.parts[0].text;
            console.log('Gemini response:', generatedText);

            const techniques = await this.parseGeminiResponseWithVideos(generatedText, hobby, level);

            return {
                id: this.generatePlanId(),
                hobby,
                level,
                techniques,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Error generating learning plan:', error);
            return this.generateFallbackPlan(hobby, level);
        }
    }

    private static createEnhancedPrompt(hobby: string, level: SkillLevel): string {
        return `You are a world-class ${hobby} instructor creating an efficient learning curriculum for a ${level} level student.

CRITICAL REQUIREMENTS:
1. Provide EXACTLY 6-7 core techniques/skills (no more, no less)
2. Each technique must be:
   - Fundamental and high-impact for ${level} level ${hobby}
   - Logically sequenced (each builds on previous)
   - Practical with clear learning outcomes
   - Include realistic time estimates for mastery

3. For ${level} ${hobby}:
   ${level === 'Beginner' ? `- Focus on absolute fundamentals needed to start practicing ${hobby}` :
                level === 'Intermediate' ? `- Bridge basic knowledge to intermediate ${hobby} concepts` :
                    `- Focus on advanced ${hobby} techniques for mastery`}

4. For each technique, also suggest 2-3 specific YouTube search terms that would help find good tutorial videos.

RESPONSE FORMAT - Respond with ONLY valid JSON (no markdown, no extra text):

[
  {
    "title": "Specific technique name",
    "description": "Clear description of what to learn and practice. Be specific about the ${hobby} skill being developed.",
    "estimatedTime": "X mins",
    "difficulty": "Easy|Medium|Hard",
    "prerequisites": "What the student should know before attempting this",
    "practiceHints": "2-3 specific practice tips for mastering this ${hobby} technique",
    "videoSearchTerms": ["search term 1", "search term 2", "search term 3"]
  }
]

Create the optimized learning plan for ${level} ${hobby}:`;
    }

    private static async parseGeminiResponseWithVideos(
        response: string,
        hobby: string,
        level: SkillLevel
    ): Promise<Technique[]> {
        try {
            let cleanedResponse = response.trim();
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            const jsonMatch = cleanedResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (!jsonMatch) {
                console.error('No valid JSON array found in response:', response);
                throw new Error('No JSON found in response');
            }

            const jsonString = jsonMatch[0];
            const parsedData = JSON.parse(jsonString);

            if (!Array.isArray(parsedData)) {
                throw new Error('Response is not an array');
            }

            const techniques = await Promise.all(
                parsedData.map(async (item: any, index: number) => {
                    const technique: Technique = {
                        id: this.generateTechniqueId(),
                        title: item.title || `Technique ${index + 1}`,
                        description: item.description || 'No description provided',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: item.estimatedTime || '30 mins',
                        difficulty: item.difficulty || 'Medium',
                        prerequisites: item.prerequisites || 'None',
                        practiceHints: item.practiceHints || 'Practice regularly and focus on proper form',
                        curatedVideos: []
                    };

                    // Generate curated videos for each technique
                    if (item.videoSearchTerms && Array.isArray(item.videoSearchTerms)) {
                        technique.curatedVideos = await this.generateCuratedVideos(
                            item.videoSearchTerms,
                            hobby,
                            level
                        );
                    }

                    return technique;
                })
            );

            return techniques;
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            throw error;
        }
    }

    private static async generateCuratedVideos(
        searchTerms: string[],
        hobby: string,
        level: SkillLevel
    ): Promise<CuratedVideo[]> {
        // This simulates pre-curated video selection with known working YouTube videos
        const curatedVideos: CuratedVideo[] = [];

        // Use popular educational YouTube videos that are likely to work
        const educationalVideos = [
            { id: 'yQhQBi5XgyM', title: 'Complete Beginner Guide', channel: 'FreeCodeCamp', duration: '12:34' },
            { id: 'W6NZfCO5SIk', title: 'JavaScript Tutorial', channel: 'Programming with Mosh', duration: '15:45' },
            { id: 'hdI2bqOjy3c', title: 'Learn the Basics', channel: 'Traversy Media', duration: '8:20' },
            { id: 'PkZNo7MFNFg', title: 'Step by Step Guide', channel: 'The Net Ninja', duration: '10:15' },
            { id: '8aGhZQkoFbQ', title: 'Master Class Tutorial', channel: 'Academind', duration: '18:30' }
        ];

        for (let i = 0; i < Math.min(searchTerms.length, 3); i++) {
            const searchTerm = searchTerms[i];
            const video = educationalVideos[i % educationalVideos.length];

            curatedVideos.push({
                id: Math.random().toString(36).substr(2, 9),
                title: `${searchTerm} - ${level} Tutorial`,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                thumbnailUrl: `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`,
                duration: video.duration,
                channelName: video.channel,
                description: `Master ${searchTerm} in ${hobby} with this comprehensive ${level.toLowerCase()} tutorial. Perfect for ${level.toLowerCase()} level students who want to improve their skills efficiently.`,
                quality: level,
                isRecommended: i === 0, // First video is recommended
                videoId: video.id // Store the YouTube video ID for embedding
            });
        }

        return curatedVideos;
    }

    private static getRandomDuration(): string {
        const durations = ['5:30', '8:45', '12:15', '15:20', '20:10', '25:45'];
        return durations[Math.floor(Math.random() * durations.length)];
    }

    private static getRandomChannelName(hobby: string): string {
        const channelNames = {
            'Chess': ['ChessNetwork', 'GothamChess', 'Chess.com', 'Saint Louis Chess Club'],
            'Poker': ['PokerStars', 'Run It Once', 'PokerCoaching', 'Daniel Negreanu'],
            'Guitar': ['JustinGuitar', 'Marty Music', 'GuitarLessons365', 'Steve Stine Guitar'],
            'default': ['Learn With Me', 'Master Class', 'Tutorial Hub', 'Skill Academy']
        };

        const hobbies = Object.keys(channelNames);
        const matchedHobby = hobbies.find(h =>
            hobby.toLowerCase().includes(h.toLowerCase())
        );

        const channels = channelNames[matchedHobby as keyof typeof channelNames] || channelNames.default;
        return channels[Math.floor(Math.random() * channels.length)];
    }

    private static generateFallbackPlan(hobby: string, level: SkillLevel): LearningPlan {
        console.log('Using fallback plan for:', hobby, level);

        // Simple fallback for any hobby
        const fallbackTechniques: Technique[] = [
            {
                id: this.generateTechniqueId(),
                title: `${hobby} Fundamentals`,
                description: `Learn the basic principles and foundation of ${hobby}`,
                isCompleted: false,
                isStrikedOut: false,
                estimatedTime: '45 mins',
                difficulty: 'Easy',
                prerequisites: 'None',
                practiceHints: 'Start with basic exercises and practice daily',
                curatedVideos: []
            },
            {
                id: this.generateTechniqueId(),
                title: `Essential ${hobby} Techniques`,
                description: `Master the core techniques every ${level.toLowerCase()} should know`,
                isCompleted: false,
                isStrikedOut: false,
                estimatedTime: '60 mins',
                difficulty: 'Medium',
                prerequisites: 'Basic understanding of fundamentals',
                practiceHints: 'Focus on proper form and accuracy',
                curatedVideos: []
            },
            {
                id: this.generateTechniqueId(),
                title: `${hobby} Practice Methods`,
                description: `Learn effective practice strategies for ${hobby}`,
                isCompleted: false,
                isStrikedOut: false,
                estimatedTime: '30 mins',
                difficulty: 'Easy',
                prerequisites: 'Basic techniques',
                practiceHints: 'Create a consistent practice schedule',
                curatedVideos: []
            },
            {
                id: this.generateTechniqueId(),
                title: `Intermediate ${hobby} Skills`,
                description: `Develop intermediate-level skills in ${hobby}`,
                isCompleted: false,
                isStrikedOut: false,
                estimatedTime: '75 mins',
                difficulty: 'Medium',
                prerequisites: 'Solid foundation in basics',
                practiceHints: 'Challenge yourself with progressively harder exercises',
                curatedVideos: []
            },
            {
                id: this.generateTechniqueId(),
                title: `${hobby} Problem Solving`,
                description: `Learn to troubleshoot common issues in ${hobby}`,
                isCompleted: false,
                isStrikedOut: false,
                estimatedTime: '50 mins',
                difficulty: 'Medium',
                prerequisites: 'Intermediate skills',
                practiceHints: 'Analyze mistakes and learn from them',
                curatedVideos: []
            }
        ];

        return {
            id: this.generatePlanId(),
            hobby,
            level,
            techniques: fallbackTechniques,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
}