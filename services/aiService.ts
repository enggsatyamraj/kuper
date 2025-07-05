// services/aiService.ts (FIXED WITH DEBUG LOGGING)
import { CuratedVideo, LearningPlan, LearningResource, SkillLevel, Technique } from '../types';
import { ResourceService } from './resourceService';

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
        console.log('🎯 Starting plan generation for:', hobby, level);

        try {
            const prompt = this.createImprovedPrompt(hobby, level);

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
                    temperature: 0.7,
                    topP: 0.8,
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
                console.error('❌ Gemini API error:', response.status, errorData);
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                console.error('❌ Invalid response structure:', data);
                throw new Error('Invalid response from Gemini API');
            }

            const generatedText = data.candidates[0].content.parts[0].text;
            console.log('✅ Gemini response received, length:', generatedText.length);

            // Parse techniques and add comprehensive resources
            const techniques = await this.parseGeminiResponseWithResources(generatedText, hobby, level);
            console.log('✅ Generated', techniques.length, 'techniques with resources');

            return {
                id: this.generatePlanId(),
                hobby,
                level,
                techniques,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error('❌ Error generating learning plan:', error);
            console.log('🔄 Using enhanced fallback plan...');
            return this.generateEnhancedFallbackPlan(hobby, level);
        }
    }

    /**
     * Improved prompt with better structure and clearer instructions
     */
    private static createImprovedPrompt(hobby: string, level: SkillLevel): string {
        const levelGuidance = {
            'Beginner': 'absolute fundamentals, basic concepts, getting started safely, building foundation',
            'Intermediate': 'building on basics, developing consistency, learning key strategies, improving technique',
            'Advanced': 'mastering complex techniques, developing personal style, competitive strategies, refinement'
        };

        return `You are a world-class ${hobby} instructor with 20+ years of teaching experience. Create a focused, practical learning curriculum for a ${level} student.

CONTEXT:
- Student Level: ${level}
- Focus Area: ${levelGuidance[level]}
- Hobby: ${hobby}

CRITICAL REQUIREMENTS:
1. Provide EXACTLY 6-7 techniques (no more, no less)
2. Each technique should be:
   - Essential for ${level} level ${hobby}
   - Logically sequenced (builds on previous techniques)
   - Practically achievable within the estimated time
   - Specific and actionable (not vague concepts)

3. Time estimates should be realistic:
   - Beginner: 15-45 minutes per technique
   - Intermediate: 30-60 minutes per technique  
   - Advanced: 45-90 minutes per technique

4. Difficulty levels:
   - Easy: Can be learned quickly with basic practice
   - Medium: Requires focused practice and repetition
   - Hard: Challenging technique requiring significant effort

STRICT JSON FORMAT (no markdown, no extra text):
[
  {
    "title": "Specific, actionable technique name",
    "description": "Clear, detailed description of what to learn and why it's important for ${level} ${hobby} players. Be specific about the skill being developed.",
    "estimatedTime": "X mins",
    "difficulty": "Easy|Medium|Hard",
    "prerequisites": "What the student should know/master before attempting this technique",
    "practiceHints": "2-3 specific, actionable practice tips for mastering this ${hobby} technique. Include common mistakes to avoid.",
    "searchKeywords": ["primary keyword", "alternative keyword", "specific technique term"]
  }
]

Generate the optimized ${level} ${hobby} learning plan now:`;
    }

    /**
     * Parse Gemini response with improved error handling and add comprehensive resources
     */
    private static async parseGeminiResponseWithResources(
        response: string,
        hobby: string,
        level: SkillLevel
    ): Promise<Technique[]> {
        console.log('🔍 Parsing Gemini response...');

        try {
            // Clean the response more thoroughly
            let cleanedResponse = response.trim();

            // Remove markdown code blocks
            cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');

            // Remove any text before the JSON array
            const jsonStart = cleanedResponse.indexOf('[');
            const jsonEnd = cleanedResponse.lastIndexOf(']') + 1;

            if (jsonStart === -1 || jsonEnd === 0) {
                console.error('❌ No JSON array found in response');
                throw new Error('No valid JSON array found');
            }

            const jsonString = cleanedResponse.substring(jsonStart, jsonEnd);
            console.log('📋 Extracted JSON length:', jsonString.length);

            const parsedData = JSON.parse(jsonString);

            if (!Array.isArray(parsedData)) {
                throw new Error('Parsed data is not an array');
            }

            if (parsedData.length === 0) {
                throw new Error('Empty techniques array');
            }

            console.log(`✅ Parsed ${parsedData.length} techniques from AI response`);

            // Process each technique and add comprehensive resources
            const techniques = await Promise.all(
                parsedData.map(async (item: any, index: number) => {
                    console.log(`🔧 Processing technique ${index + 1}: ${item.title}`);

                    // Validate required fields
                    if (!item.title || !item.description) {
                        console.warn(`⚠️ Technique ${index + 1} missing required fields:`, item);
                    }

                    const technique: Technique = {
                        id: this.generateTechniqueId(),
                        title: item.title || `Technique ${index + 1}`,
                        description: item.description || 'No description provided',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: this.validateEstimatedTime(item.estimatedTime) || '30 mins',
                        difficulty: this.validateDifficulty(item.difficulty) || 'Medium',
                        prerequisites: item.prerequisites || 'None',
                        practiceHints: item.practiceHints || 'Practice regularly and focus on proper form',
                        curatedVideos: [], // Keep existing YouTube videos as is
                        learningResources: [] // Initialize empty, will be populated below
                    };

                    // Add comprehensive learning resources
                    console.log(`📚 Fetching resources for: ${technique.title}`);
                    await this.addComprehensiveResources(technique, item.searchKeywords || [item.title], hobby, level);

                    console.log(`✅ Added ${technique.learningResources?.length || 0} resources to: ${technique.title}`);
                    return technique;
                })
            );

            return techniques;
        } catch (error) {
            console.error('❌ Error parsing Gemini response:', error);
            console.error('📄 Original response:', response.substring(0, 500) + '...');
            throw error;
        }
    }

    /**
     * Add comprehensive learning resources to a technique
     */
    private static async addComprehensiveResources(
        technique: Technique,
        searchKeywords: string[],
        hobby: string,
        level: SkillLevel
    ): Promise<void> {
        try {
            // Use the first search keyword as primary search term
            const primarySearchTerm = searchKeywords[0] || technique.title;
            console.log(`🔍 Searching resources for: "${primarySearchTerm}" in ${hobby} (${level})`);

            // Get comprehensive resources (excluding videos for now)
            const resources = await ResourceService.getComprehensiveResources(
                primarySearchTerm,
                hobby,
                level
            );

            // Combine all non-video resources
            technique.learningResources = [
                ...resources.articles,
                ...resources.tutorials,
                ...resources.tools,
                ...resources.courses
            ];

            // Add some existing videos (keep unchanged for now)
            technique.curatedVideos = await this.generateCuratedVideos(searchKeywords, hobby, level);

            console.log(`✅ Successfully added ${technique.learningResources?.length} learning resources`);
            console.log(`📹 Successfully added ${technique.curatedVideos?.length} video resources`);

        } catch (error) {
            console.error(`❌ Error adding resources to technique: ${technique.title}`, error);

            // Fallback to basic resources
            console.log('🔄 Using fallback resources...');
            technique.learningResources = this.getFallbackResources(technique.title, hobby, level);
            technique.curatedVideos = this.getFallbackVideos(technique.title, hobby, level);

            console.log(`🔄 Fallback: ${technique.learningResources?.length} resources, ${technique.curatedVideos?.length} videos`);
        }
    }

    /**
     * Validate and normalize estimated time
     */
    private static validateEstimatedTime(time: string): string | null {
        if (!time) return null;

        // Ensure it ends with 'mins' or similar
        const cleanTime = time.trim();
        if (/^\d+\s*(min|mins|minutes?)$/i.test(cleanTime)) {
            return cleanTime.toLowerCase().replace(/minutes?/, 'mins');
        }

        // Try to extract number and add 'mins'
        const match = cleanTime.match(/(\d+)/);
        if (match) {
            return `${match[1]} mins`;
        }

        return null;
    }

    /**
     * Validate and normalize difficulty
     */
    private static validateDifficulty(difficulty: string): 'Easy' | 'Medium' | 'Hard' | null {
        if (!difficulty) return null;

        const normalized = difficulty.toLowerCase().trim();
        if (['easy', 'simple', 'basic'].includes(normalized)) return 'Easy';
        if (['medium', 'moderate', 'intermediate'].includes(normalized)) return 'Medium';
        if (['hard', 'difficult', 'advanced', 'challenging'].includes(normalized)) return 'Hard';

        return null;
    }

    /**
     * Generate enhanced fallback plan with comprehensive resources
     */
    private static async generateEnhancedFallbackPlan(hobby: string, level: SkillLevel): Promise<LearningPlan> {
        console.log('🔄 Generating enhanced fallback plan for:', hobby, level);

        const fallbackTechniques = this.getFallbackTechniques(hobby, level);
        console.log(`📋 Created ${fallbackTechniques.length} fallback techniques`);

        // Add comprehensive resources to each fallback technique
        for (let i = 0; i < fallbackTechniques.length; i++) {
            const technique = fallbackTechniques[i];
            console.log(`🔧 Adding resources to fallback technique ${i + 1}: ${technique.title}`);

            await this.addComprehensiveResources(
                technique,
                [technique.title, `${hobby} ${technique.title}`, `learn ${hobby}`],
                hobby,
                level
            );
        }

        console.log('✅ Enhanced fallback plan ready');

        return {
            id: this.generatePlanId(),
            hobby,
            level,
            techniques: fallbackTechniques,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    /**
     * Get hobby-specific fallback techniques
     */
    private static getFallbackTechniques(hobby: string, level: SkillLevel): Technique[] {
        console.log(`🎯 Creating fallback techniques for ${hobby} - ${level}`);

        const fallbackPlans: { [key: string]: { [key in SkillLevel]: Technique[] } } = {
            'Chess': {
                'Beginner': [
                    {
                        id: this.generateTechniqueId(),
                        title: 'Basic Piece Movement',
                        description: 'Learn how each chess piece moves and captures. Master the fundamental rules of chess.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '30 mins',
                        difficulty: 'Easy',
                        prerequisites: 'None',
                        practiceHints: 'Practice moving each piece on an empty board. Focus on legal moves and capture rules.',
                        curatedVideos: [],
                        learningResources: []
                    },
                    {
                        id: this.generateTechniqueId(),
                        title: 'Basic Checkmate Patterns',
                        description: 'Learn essential checkmate patterns like back rank mate and ladder mate.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '45 mins',
                        difficulty: 'Medium',
                        prerequisites: 'Basic piece movement',
                        practiceHints: 'Practice each pattern until you can execute it quickly. Recognize the key piece coordination.',
                        curatedVideos: [],
                        learningResources: []
                    },
                    {
                        id: this.generateTechniqueId(),
                        title: 'Opening Principles',
                        description: 'Master the three fundamental opening principles: control the center, develop pieces, and castle early.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '40 mins',
                        difficulty: 'Medium',
                        prerequisites: 'Basic piece movement and rules',
                        practiceHints: 'Focus on principles over memorizing specific moves. Practice with different openings.',
                        curatedVideos: [],
                        learningResources: []
                    }
                ],
                'Intermediate': [
                    {
                        id: this.generateTechniqueId(),
                        title: 'Tactical Patterns',
                        description: 'Master common tactical motifs: pins, forks, skewers, discovered attacks, and double attacks.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '60 mins',
                        difficulty: 'Medium',
                        prerequisites: 'Basic chess rules and opening principles',
                        practiceHints: 'Solve tactical puzzles daily. Practice pattern recognition and calculation.',
                        curatedVideos: [],
                        learningResources: []
                    },
                    {
                        id: this.generateTechniqueId(),
                        title: 'Basic Endgame Technique',
                        description: 'Learn fundamental endgames: King and Pawn vs King, basic piece checkmates, and opposition.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '50 mins',
                        difficulty: 'Medium',
                        prerequisites: 'Basic tactics and piece coordination',
                        practiceHints: 'Practice endgames against computer. Master the key principles and typical positions.',
                        curatedVideos: [],
                        learningResources: []
                    }
                ],
                'Advanced': [
                    {
                        id: this.generateTechniqueId(),
                        title: 'Advanced Positional Understanding',
                        description: 'Develop deep understanding of pawn structures, weak squares, and long-term planning.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '90 mins',
                        difficulty: 'Hard',
                        prerequisites: 'Solid tactical and basic positional knowledge',
                        practiceHints: 'Study master games. Practice identifying positional themes and creating long-term plans.',
                        curatedVideos: [],
                        learningResources: []
                    }
                ]
            },
            'Guitar': {
                'Beginner': [
                    {
                        id: this.generateTechniqueId(),
                        title: 'Proper Guitar Holding and Posture',
                        description: 'Learn the correct way to hold a guitar and maintain proper posture while playing.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '20 mins',
                        difficulty: 'Easy',
                        prerequisites: 'None',
                        practiceHints: 'Practice sitting and standing positions. Keep shoulders relaxed and back straight.',
                        curatedVideos: [],
                        learningResources: []
                    },
                    {
                        id: this.generateTechniqueId(),
                        title: 'Basic Open Chords',
                        description: 'Master fundamental open chords: G, C, D, Em, Am. These form the foundation of thousands of songs.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '45 mins',
                        difficulty: 'Medium',
                        prerequisites: 'Proper guitar holding',
                        practiceHints: 'Practice chord transitions slowly. Focus on clean finger placement before speed.',
                        curatedVideos: [],
                        learningResources: []
                    },
                    {
                        id: this.generateTechniqueId(),
                        title: 'Basic Strumming Patterns',
                        description: 'Learn fundamental strumming patterns and rhythm techniques for accompanying songs.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '35 mins',
                        difficulty: 'Medium',
                        prerequisites: 'Basic open chords',
                        practiceHints: 'Practice with metronome. Start slow and focus on consistent rhythm.',
                        curatedVideos: [],
                        learningResources: []
                    }
                ],
                'Intermediate': [
                    {
                        id: this.generateTechniqueId(),
                        title: 'Barre Chords',
                        description: 'Learn to play barre chords, enabling you to play in any key and access more advanced chord progressions.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '60 mins',
                        difficulty: 'Hard',
                        prerequisites: 'Basic open chords and finger strength',
                        practiceHints: 'Build finger strength gradually. Start with partial barres before full barre chords.',
                        curatedVideos: [],
                        learningResources: []
                    }
                ],
                'Advanced': [
                    {
                        id: this.generateTechniqueId(),
                        title: 'Advanced Fingerpicking Patterns',
                        description: 'Master complex fingerpicking techniques for classical and contemporary guitar styles.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '90 mins',
                        difficulty: 'Hard',
                        prerequisites: 'Basic fingerpicking and chord knowledge',
                        practiceHints: 'Practice with metronome. Focus on independence between thumb and fingers.',
                        curatedVideos: [],
                        learningResources: []
                    }
                ]
            },
            'Poker': {
                'Beginner': [
                    {
                        id: this.generateTechniqueId(),
                        title: 'Hand Rankings and Basic Rules',
                        description: 'Master poker hand rankings from high card to royal flush and understand basic game flow.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '25 mins',
                        difficulty: 'Easy',
                        prerequisites: 'None',
                        practiceHints: 'Memorize hand rankings completely. Practice identifying winning hands quickly.',
                        curatedVideos: [],
                        learningResources: []
                    },
                    {
                        id: this.generateTechniqueId(),
                        title: 'Position and Starting Hands',
                        description: 'Understand the importance of position and learn which hands to play from different positions.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '40 mins',
                        difficulty: 'Medium',
                        prerequisites: 'Basic rules and hand rankings',
                        practiceHints: 'Study starting hand charts. Practice tight-aggressive play from early positions.',
                        curatedVideos: [],
                        learningResources: []
                    }
                ],
                'Intermediate': [
                    {
                        id: this.generateTechniqueId(),
                        title: 'Pot Odds and Basic Math',
                        description: 'Learn to calculate pot odds, understand implied odds, and make mathematically correct decisions.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '55 mins',
                        difficulty: 'Medium',
                        prerequisites: 'Basic poker knowledge and position awareness',
                        practiceHints: 'Practice quick pot odds calculations. Use poker calculators to verify your math.',
                        curatedVideos: [],
                        learningResources: []
                    }
                ],
                'Advanced': [
                    {
                        id: this.generateTechniqueId(),
                        title: 'Advanced Bluffing and Psychology',
                        description: 'Master advanced bluffing concepts, hand reading, and psychological warfare at the poker table.',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '80 mins',
                        difficulty: 'Hard',
                        prerequisites: 'Solid fundamentals and mathematical understanding',
                        practiceHints: 'Study opponent tendencies. Practice balanced bluffing ranges and hand reading.',
                        curatedVideos: [],
                        learningResources: []
                    }
                ]
            }
        };

        const hobbyPlan = fallbackPlans[hobby];
        if (hobbyPlan && hobbyPlan[level]) {
            console.log(`✅ Found specific fallback for ${hobby} - ${level}: ${hobbyPlan[level].length} techniques`);
            return hobbyPlan[level];
        }

        // Generic fallback
        console.log(`⚠️ Using generic fallback for ${hobby} - ${level}`);
        return [
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
                curatedVideos: [],
                learningResources: []
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
                curatedVideos: [],
                learningResources: []
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
                curatedVideos: [],
                learningResources: []
            }
        ];
    }

    /**
     * Keep existing video generation (unchanged for now)
     */
    private static async generateCuratedVideos(
        searchTerms: string[],
        hobby: string,
        level: SkillLevel
    ): Promise<CuratedVideo[]> {
        try {
            // Import YouTube service
            const { YouTubeService } = await import('./youtubeService');

            const curatedVideos: CuratedVideo[] = [];

            // Search for videos using the first search term
            const searchQuery = `${hobby} ${searchTerms[0]} ${level} tutorial`;
            const youtubeVideos = await YouTubeService.searchVideos(searchQuery, 5);

            // Convert YouTube videos to CuratedVideo format
            youtubeVideos.forEach((video, index) => {
                curatedVideos.push({
                    id: this.generateTechniqueId(),
                    title: video.title,
                    url: `https://www.youtube.com/watch?v=${video.id}`,
                    thumbnailUrl: video.thumbnailUrl,
                    duration: video.duration,
                    channelName: video.channelName,
                    description: video.description.substring(0, 150) + '...',
                    quality: level,
                    isRecommended: index === 0,
                    videoId: video.id
                });
            });

            console.log(`✅ Generated ${curatedVideos.length} real YouTube videos`);
            return curatedVideos;

        } catch (error) {
            console.error('❌ Error generating YouTube videos:', error);
            return this.getFallbackVideos(searchTerms[0], hobby, level);
        }
    }

    /**
     * Fallback resources when ResourceService fails
     */
    private static getFallbackResources(techniqueTitle: string, hobby: string, level: SkillLevel): LearningResource[] {
        console.log(`🔄 Creating fallback resources for: ${techniqueTitle}`);

        return [
            {
                id: Math.random().toString(36).substr(2, 9),
                type: 'article',
                title: `${techniqueTitle} - Complete Guide`,
                url: `https://www.google.com/search?q=${encodeURIComponent(hobby + ' ' + techniqueTitle + ' guide tutorial')}`,
                description: `Comprehensive guide for mastering ${techniqueTitle} in ${hobby}. Includes step-by-step instructions and practice tips.`,
                source: 'Web Search',
                difficulty: level,
                author: 'Various Authors',
                isRecommended: true
            },
            {
                id: Math.random().toString(36).substr(2, 9),
                type: 'tutorial',
                title: `${techniqueTitle} - Interactive Tutorial`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(hobby + ' ' + techniqueTitle + ' tutorial ' + level)}`,
                description: `Video tutorials and interactive lessons for ${techniqueTitle}. Perfect for visual learners.`,
                source: 'YouTube',
                difficulty: level,
                author: 'Community Creators'
            },
            {
                id: Math.random().toString(36).substr(2, 9),
                type: 'tool',
                title: `${hobby} Practice Tools`,
                url: `https://www.google.com/search?q=${encodeURIComponent(hobby + ' online practice tools ' + techniqueTitle)}`,
                description: `Online tools and resources to practice ${techniqueTitle} and improve your ${hobby} skills.`,
                source: 'Various Tools',
                difficulty: level,
                author: 'Tool Developers'
            }
        ];
    }

    /**
     * Fallback videos when generation fails
     */
    private static getFallbackVideos(techniqueTitle: string, hobby: string, level: SkillLevel): CuratedVideo[] {
        return [
            {
                id: Math.random().toString(36).substr(2, 9),
                title: `${techniqueTitle} Tutorial`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(hobby + ' ' + techniqueTitle)}`,
                thumbnailUrl: 'https://via.placeholder.com/320x180?text=Video+Tutorial',
                duration: '10:00',
                channelName: 'Educational Channel',
                description: `Learn ${techniqueTitle} in ${hobby}`,
                quality: level,
                isRecommended: true,
                videoId: ''
            }
        ];
    }
}