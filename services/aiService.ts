import { HobbyType, LearningPlan, SkillLevel, Technique } from '../types';

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
        hobby: HobbyType,
        level: SkillLevel
    ): Promise<LearningPlan> {
        try {
            const prompt = this.createPrompt(hobby, level);

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
                    maxOutputTokens: 2048,
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

            // Parse the response and create techniques
            const techniques = this.parseGeminiResponse(generatedText);

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
            // Fallback to mock data if API fails
            return this.generateFallbackPlan(hobby, level);
        }
    }

    private static createPrompt(hobby: HobbyType, level: SkillLevel): string {
        return `You are an expert ${hobby} instructor creating a focused learning curriculum for a ${level} level student.

IMPORTANT: The student wants to avoid information overload and learn efficiently. Create a curated list of ONLY the most essential techniques.

Requirements:
- Provide exactly 5-7 core techniques/skills (no more, no less)
- Each technique should be fundamental and actionable for ${level} level
- Focus on techniques that build upon each other logically
- Include realistic time estimates for mastering each technique
- Make descriptions practical and specific, not generic

For ${level} level ${hobby} learning:
- Beginner: Focus on absolute fundamentals needed to start playing/practicing
- Intermediate: Focus on techniques that bridge basic to advanced concepts  
- Advanced: Focus on mastery-level techniques and professional skills

Respond ONLY with valid JSON in this exact format (no additional text):
[
  {
    "title": "Specific Technique Name",
    "description": "Clear, actionable description of what to learn and practice",
    "estimatedTime": "X mins"
  }
]

Create the learning plan for ${level} ${hobby}:`;
    }

    private static parseGeminiResponse(response: string): Technique[] {
        try {
            // Clean the response - remove any markdown formatting or extra text
            let cleanedResponse = response.trim();

            // Remove markdown code block formatting if present
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            // Extract JSON array from the response
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

            return parsedData.map((item: any, index: number) => ({
                id: this.generateTechniqueId(),
                title: item.title || `Technique ${index + 1}`,
                description: item.description || 'No description provided',
                isCompleted: false,
                isStrikedOut: false,
                estimatedTime: item.estimatedTime || '30 mins',
                videoUrl: undefined,
            }));
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            console.error('Raw response:', response);
            throw error;
        }
    }

    private static generateFallbackPlan(hobby: HobbyType, level: SkillLevel): LearningPlan {
        console.log('Using fallback plan for:', hobby, level);

        // Simplified fallback data
        const fallbackTechniques: Record<HobbyType, Record<SkillLevel, Omit<Technique, 'id'>[]>> = {
            Chess: {
                Beginner: [
                    {
                        title: 'Piece Movement & Rules',
                        description: 'Learn how each chess piece moves, captures, and basic game rules',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '45 mins'
                    },
                    {
                        title: 'Check & Checkmate',
                        description: 'Understand check, checkmate, and basic mating patterns',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '60 mins'
                    },
                    {
                        title: 'Opening Principles',
                        description: 'Control center, develop pieces quickly, castle for safety',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '50 mins'
                    },
                    {
                        title: 'Basic Tactics',
                        description: 'Learn pins, forks, skewers, and simple tactical patterns',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '70 mins'
                    },
                    {
                        title: 'Simple Endgames',
                        description: 'Basic checkmate with queen and rook vs lone king',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '40 mins'
                    }
                ],
                Intermediate: [
                    {
                        title: 'Advanced Tactics',
                        description: 'Discovered attacks, deflection, decoy, and combination play',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '80 mins'
                    },
                    {
                        title: 'Positional Understanding',
                        description: 'Weak squares, pawn structure, piece activity evaluation',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '90 mins'
                    },
                    {
                        title: 'Opening Repertoire',
                        description: 'Build consistent opening system for white and black',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '120 mins'
                    },
                    {
                        title: 'Essential Endgames',
                        description: 'King & pawn endings, basic rook and minor piece endgames',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '100 mins'
                    },
                    {
                        title: 'Time Management',
                        description: 'Clock handling, thinking process, and move decision making',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '60 mins'
                    }
                ],
                Advanced: [
                    {
                        title: 'Deep Calculation',
                        description: 'Advanced tactical calculation and visualization techniques',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '120 mins'
                    },
                    {
                        title: 'Strategic Planning',
                        description: 'Long-term planning, prophylactic thinking, and positional play',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '100 mins'
                    },
                    {
                        title: 'Complex Endgames',
                        description: 'Advanced endgame theory and practical technique',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '140 mins'
                    },
                    {
                        title: 'Opening Preparation',
                        description: 'Deep theoretical preparation and novelty finding',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '150 mins'
                    }
                ]
            },
            Poker: {
                Beginner: [
                    {
                        title: 'Hand Rankings & Rules',
                        description: 'Master all poker hand rankings and basic game mechanics',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '30 mins'
                    },
                    {
                        title: 'Starting Hand Selection',
                        description: 'Learn which hands to play from each position pre-flop',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '50 mins'
                    },
                    {
                        title: 'Position & Table Dynamics',
                        description: 'Understand the critical importance of position in poker',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '60 mins'
                    },
                    {
                        title: 'Basic Pot Odds',
                        description: 'Calculate simple pot odds for calling decisions',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '45 mins'
                    },
                    {
                        title: 'Betting Fundamentals',
                        description: 'Value betting, bluffing basics, and bet sizing',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '70 mins'
                    }
                ],
                Intermediate: [
                    {
                        title: 'Advanced Mathematics',
                        description: 'Implied odds, reverse implied odds, and equity calculations',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '80 mins'
                    },
                    {
                        title: 'Reading Opponents',
                        description: 'Physical tells, betting patterns, and player profiling',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '90 mins'
                    },
                    {
                        title: 'Bluffing Strategy',
                        description: 'When, how, and against whom to bluff effectively',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '75 mins'
                    },
                    {
                        title: 'Bankroll Management',
                        description: 'Proper bankroll size and game selection strategy',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '40 mins'
                    },
                    {
                        title: 'Tournament Fundamentals',
                        description: 'ICM basics and tournament-specific strategy adjustments',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '85 mins'
                    }
                ],
                Advanced: [
                    {
                        title: 'GTO Strategy',
                        description: 'Game theory optimal play and solver-based strategies',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '120 mins'
                    },
                    {
                        title: 'Advanced Bluffing',
                        description: 'Multi-street bluffs, range balancing, and meta-game',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '100 mins'
                    },
                    {
                        title: 'Exploitative Play',
                        description: 'Identifying and exploiting opponent weaknesses',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '90 mins'
                    },
                    {
                        title: 'Mental Game Mastery',
                        description: 'Tilt control, emotional regulation, and peak performance',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '80 mins'
                    }
                ]
            },
            Guitar: {
                Beginner: [
                    {
                        title: 'Essential Open Chords',
                        description: 'Master G, C, D, Em, Am - the foundation chords for hundreds of songs',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '60 mins'
                    },
                    {
                        title: 'Basic Strumming Patterns',
                        description: 'Down-up strumming patterns and rhythm fundamentals',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '45 mins'
                    },
                    {
                        title: 'Smooth Chord Changes',
                        description: 'Techniques for quick, clean transitions between chords',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '50 mins'
                    },
                    {
                        title: 'First Song Mastery',
                        description: 'Play your first complete song from start to finish',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '70 mins'
                    },
                    {
                        title: 'Basic Fingerpicking',
                        description: 'Simple fingerpicking patterns using thumb and fingers',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '55 mins'
                    }
                ],
                Intermediate: [
                    {
                        title: 'Barre Chords',
                        description: 'Master F chord and moveable barre chord shapes',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '90 mins'
                    },
                    {
                        title: 'Pentatonic Scale & Solos',
                        description: 'Learn pentatonic scale patterns and basic lead guitar',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '85 mins'
                    },
                    {
                        title: 'Advanced Rhythm',
                        description: 'Complex strumming patterns and percussive techniques',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '70 mins'
                    },
                    {
                        title: 'Song Structure',
                        description: 'Understanding intro, verse, chorus, bridge arrangements',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '60 mins'
                    },
                    {
                        title: 'Capo Techniques',
                        description: 'Using capo for key changes and chord voicing variations',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '40 mins'
                    }
                ],
                Advanced: [
                    {
                        title: 'Advanced Fingerpicking',
                        description: 'Travis picking and complex fingerstyle patterns',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '120 mins'
                    },
                    {
                        title: 'Jazz Chord Extensions',
                        description: '7th, 9th, 11th chords and sophisticated harmony',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '100 mins'
                    },
                    {
                        title: 'Advanced Soloing',
                        description: 'Modal scales, improvisation, and advanced lead techniques',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '110 mins'
                    },
                    {
                        title: 'Alternate Tunings',
                        description: 'DADGAD, Drop D, and creative tuning applications',
                        isCompleted: false,
                        isStrikedOut: false,
                        estimatedTime: '90 mins'
                    }
                ]
            }
        };

        const techniques = fallbackTechniques[hobby][level].map(tech => ({
            ...tech,
            id: this.generateTechniqueId(),
        }));

        return {
            id: this.generatePlanId(),
            hobby,
            level,
            techniques,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
}