// services/resourceService.ts (COMPLETE CODE)
import { LearningResource } from '../types';

export class ResourceService {

    /**
     * Get comprehensive learning resources for a technique (excluding videos for now)
     */
    static async getComprehensiveResources(
        techniqueTitle: string,
        hobby: string,
        level: string
    ): Promise<{
        articles: LearningResource[];
        tools: LearningResource[];
        courses: LearningResource[];
        tutorials: LearningResource[];
    }> {
        console.log(`🔍 ResourceService.getComprehensiveResources called:`);
        console.log(`  - Technique: "${techniqueTitle}"`);
        console.log(`  - Hobby: "${hobby}"`);
        console.log(`  - Level: "${level}"`);

        try {
            const [articles, tools, courses, tutorials] = await Promise.all([
                this.getArticleResources(techniqueTitle, hobby, level),
                this.getToolResources(hobby, level),
                this.getCourseResources(hobby, level),
                this.getTutorialResources(techniqueTitle, hobby, level)
            ]);

            console.log(`✅ ResourceService results:`);
            console.log(`  - Articles: ${articles.length}`);
            console.log(`  - Tools: ${tools.length}`);
            console.log(`  - Courses: ${courses.length}`);
            console.log(`  - Tutorials: ${tutorials.length}`);

            return {
                articles,
                tools,
                courses,
                tutorials
            };
        } catch (error) {
            console.error('❌ Error in ResourceService.getComprehensiveResources:', error);

            const fallbackResults = {
                articles: this.getFallbackArticles(techniqueTitle, hobby, level),
                tools: this.getFallbackTools(hobby, level),
                courses: this.getFallbackCourses(hobby, level),
                tutorials: this.getFallbackTutorials(techniqueTitle, hobby, level)
            };

            console.log(`🔄 Using fallback resources:`);
            console.log(`  - Fallback Articles: ${fallbackResults.articles.length}`);
            console.log(`  - Fallback Tools: ${fallbackResults.tools.length}`);
            console.log(`  - Fallback Courses: ${fallbackResults.courses.length}`);
            console.log(`  - Fallback Tutorials: ${fallbackResults.tutorials.length}`);

            return fallbackResults;
        }
    }

    /**
     * Get high-quality article resources for a technique
     */
    private static async getArticleResources(
        techniqueTitle: string,
        hobby: string,
        level: string
    ): Promise<LearningResource[]> {
        console.log(`📄 Getting article resources for ${hobby} - ${techniqueTitle}`);

        const hobbySpecificResources = this.getHobbySpecificArticles(hobby, techniqueTitle, level);
        const genericResources = this.getGenericArticles(techniqueTitle, hobby, level);

        console.log(`📄 Article resources found:`);
        console.log(`  - Hobby-specific: ${hobbySpecificResources.length}`);
        console.log(`  - Generic: ${genericResources.length}`);

        return [...hobbySpecificResources, ...genericResources];
    }

    /**
     * Get hobby-specific high-quality articles
     */
    private static getHobbySpecificArticles(
        hobby: string,
        techniqueTitle: string,
        level: string
    ): LearningResource[] {
        console.log(`🎯 Getting hobby-specific articles for: ${hobby}`);

        const resourceMap: { [key: string]: LearningResource[] } = {
            'Chess': [
                {
                    id: `chess-article-${Date.now()}-1`,
                    type: 'article',
                    title: `${techniqueTitle} - Chess.com Guide`,
                    url: `https://www.chess.com/learn`,
                    description: `Master ${techniqueTitle} with detailed explanations, diagrams, and practice positions from Chess.com's comprehensive learning center.`,
                    source: 'Chess.com',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    author: 'Chess.com Coaches',
                    isRecommended: true,
                    rating: 4.8
                },
                {
                    id: `chess-article-${Date.now()}-2`,
                    type: 'article',
                    title: `${techniqueTitle} Strategy - Lichess Study`,
                    url: `https://lichess.org/learn`,
                    description: `Interactive lessons and practice exercises for ${techniqueTitle}. Free, ad-free learning with immediate feedback.`,
                    source: 'Lichess',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    author: 'Lichess Community',
                    rating: 4.7
                },
                {
                    id: `chess-article-${Date.now()}-3`,
                    type: 'article',
                    title: `${techniqueTitle} - ChessNetwork Analysis`,
                    url: `https://www.thechesswebsite.com`,
                    description: `In-depth analysis of ${techniqueTitle} with master game examples and common patterns to recognize.`,
                    source: 'The Chess Website',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    author: 'Kevin Spraggett',
                    rating: 4.5
                }
            ],
            'Guitar': [
                {
                    id: `guitar-article-${Date.now()}-1`,
                    type: 'article',
                    title: `${techniqueTitle} - JustinGuitar Lesson`,
                    url: `https://www.justinguitar.com`,
                    description: `Step-by-step guitar lesson for ${techniqueTitle}. Includes chord diagrams, tab notation, and practice tips from Justin Sandercoe.`,
                    source: 'JustinGuitar',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    author: 'Justin Sandercoe',
                    isRecommended: true,
                    rating: 4.9
                },
                {
                    id: `guitar-article-${Date.now()}-2`,
                    type: 'article',
                    title: `${techniqueTitle} - Ultimate Guitar Guide`,
                    url: `https://www.ultimate-guitar.com`,
                    description: `Guitar tabs, chords, and community-driven tutorials for ${techniqueTitle}. Includes user ratings and multiple versions.`,
                    source: 'Ultimate Guitar',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    author: 'UG Community',
                    rating: 4.4
                },
                {
                    id: `guitar-article-${Date.now()}-3`,
                    type: 'article',
                    title: `${techniqueTitle} - Fender Play Method`,
                    url: `https://www.fender.com/play`,
                    description: `Professional guitar instruction for ${techniqueTitle} with structured learning path and quality video content.`,
                    source: 'Fender Play',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    author: 'Fender Instructors',
                    rating: 4.6
                }
            ],
            'Poker': [
                {
                    id: `poker-article-${Date.now()}-1`,
                    type: 'article',
                    title: `${techniqueTitle} - PokerStrategy Guide`,
                    url: `https://www.pokerstrategy.com`,
                    description: `Advanced poker strategy guide for ${techniqueTitle} with mathematical analysis and professional insights.`,
                    source: 'PokerStrategy',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    author: 'PokerStrategy Coaches',
                    isRecommended: true,
                    rating: 4.7
                },
                {
                    id: `poker-article-${Date.now()}-2`,
                    type: 'article',
                    title: `${techniqueTitle} - 2+2 Forum Discussion`,
                    url: `https://forumserver.twoplustwo.com`,
                    description: `Professional poker discussion about ${techniqueTitle} with insights from experienced players and coaches.`,
                    source: 'Two Plus Two',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    author: 'Poker Community',
                    rating: 4.3
                },
                {
                    id: `poker-article-${Date.now()}-3`,
                    type: 'article',
                    title: `${techniqueTitle} - PokerNews Strategy`,
                    url: `https://www.pokernews.com/strategy`,
                    description: `Professional poker strategy articles about ${techniqueTitle} written by tournament pros and cash game specialists.`,
                    source: 'PokerNews',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    author: 'Poker Professionals',
                    rating: 4.4
                }
            ]
        };

        const result = resourceMap[hobby] || [];
        console.log(`🎯 Found ${result.length} hobby-specific articles for ${hobby}`);
        return result;
    }

    /**
     * Get generic high-quality articles for any hobby
     */
    private static getGenericArticles(
        techniqueTitle: string,
        hobby: string,
        level: string
    ): LearningResource[] {
        console.log(`📋 Getting generic articles for ${hobby} - ${techniqueTitle}`);

        const genericResources = [
            {
                id: `generic-article-${Date.now()}-1`,
                type: 'article' as const,
                title: `${hobby}: ${techniqueTitle} Complete Guide`,
                url: `https://www.wikihow.com/wikiHowTo?search=${encodeURIComponent(hobby + ' ' + techniqueTitle)}`,
                description: `Comprehensive step-by-step guide for ${techniqueTitle} in ${hobby}. Includes illustrations, tips, and common mistakes to avoid.`,
                source: 'WikiHow',
                difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                author: 'WikiHow Experts',
                rating: 4.2
            },
            {
                id: `generic-article-${Date.now()}-2`,
                type: 'article' as const,
                title: `${techniqueTitle} - Reddit ${hobby} Community`,
                url: `https://www.reddit.com/r/${hobby.toLowerCase()}/search/?q=${encodeURIComponent(techniqueTitle)}`,
                description: `Community discussions, tips, and experiences about ${techniqueTitle} from ${hobby} enthusiasts worldwide.`,
                source: 'Reddit',
                difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                author: `r/${hobby} Community`,
                rating: 4.1
            }
        ];

        console.log(`📋 Created ${genericResources.length} generic articles`);
        return genericResources;
    }

    /**
     * Get relevant tools for each hobby
     */
    private static async getToolResources(hobby: string, level: string): Promise<LearningResource[]> {
        console.log(`🛠️ Getting tool resources for ${hobby}`);

        const toolMap: { [key: string]: LearningResource[] } = {
            'Chess': [
                {
                    id: `chess-tool-${Date.now()}-1`,
                    type: 'tool',
                    title: 'Chess.com Analysis Board',
                    url: 'https://www.chess.com/analysis',
                    description: 'Powerful analysis board to study positions, analyze games, and practice tactics. Includes engine analysis and opening explorer.',
                    source: 'Chess.com',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    isRecommended: true,
                    rating: 4.8
                },
                {
                    id: `chess-tool-${Date.now()}-2`,
                    type: 'tool',
                    title: 'Lichess Study Builder',
                    url: 'https://lichess.org/study',
                    description: 'Create and share chess studies. Perfect for analyzing games, creating lesson plans, and collaborative learning.',
                    source: 'Lichess',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    rating: 4.7
                },
                {
                    id: `chess-tool-${Date.now()}-3`,
                    type: 'tool',
                    title: 'Chess Tempo Tactics Trainer',
                    url: 'https://chesstempo.com',
                    description: 'Advanced tactics training with spaced repetition system. Track your progress and identify weak areas.',
                    source: 'Chess Tempo',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    rating: 4.6
                }
            ],
            'Guitar': [
                {
                    id: `guitar-tool-${Date.now()}-1`,
                    type: 'tool',
                    title: 'Guitar Tuner & Metronome',
                    url: 'https://www.fender.com/online-guitar-tuner',
                    description: 'Professional-grade online guitar tuner with multiple tuning options. Essential for keeping your guitar in perfect pitch.',
                    source: 'Fender',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    isRecommended: true,
                    rating: 4.8
                },
                {
                    id: `guitar-tool-${Date.now()}-2`,
                    type: 'tool',
                    title: 'Chord Chart Generator',
                    url: 'https://www.oolimo.com/guitarchords/analyze',
                    description: 'Generate chord charts, analyze chord progressions, and discover new chord voicings for your playing style.',
                    source: 'Oolimo',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    rating: 4.5
                },
                {
                    id: `guitar-tool-${Date.now()}-3`,
                    type: 'tool',
                    title: 'Interactive Fretboard',
                    url: 'https://www.scales-chords.com/fretboard.php',
                    description: 'Visual fretboard tool to learn scales, modes, and chord patterns. Perfect for understanding guitar theory.',
                    source: 'Scales & Chords',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    rating: 4.4
                }
            ],
            'Poker': [
                {
                    id: `poker-tool-${Date.now()}-1`,
                    type: 'tool',
                    title: 'PokerStove Equity Calculator',
                    url: 'https://www.pokerstove.com',
                    description: 'Calculate hand equity, odds, and ranges. Essential tool for understanding poker mathematics and decision making.',
                    source: 'PokerStove',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    isRecommended: true,
                    rating: 4.7
                },
                {
                    id: `poker-tool-${Date.now()}-2`,
                    type: 'tool',
                    title: 'Poker Hand Range Visualizer',
                    url: 'https://www.equilab.com',
                    description: 'Visualize and analyze poker hand ranges. Perfect for studying opponent tendencies and improving your range construction.',
                    source: 'EquiLab',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    rating: 4.6
                },
                {
                    id: `poker-tool-${Date.now()}-3`,
                    type: 'tool',
                    title: 'Poker Tracker',
                    url: 'https://www.pokertracker.com',
                    description: 'Track your poker results, analyze your play, and identify leaks in your game. Essential for serious poker improvement.',
                    source: 'PokerTracker',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    rating: 4.5
                }
            ]
        };

        const result = toolMap[hobby] || this.getGenericTools(hobby, level);
        console.log(`🛠️ Found ${result.length} tool resources for ${hobby}`);
        return result;
    }

    /**
     * Get relevant courses for structured learning
     */
    private static async getCourseResources(hobby: string, level: string): Promise<LearningResource[]> {
        console.log(`🎓 Getting course resources for ${hobby}`);

        const courseMap: { [key: string]: LearningResource[] } = {
            'Chess': [
                {
                    id: `chess-course-${Date.now()}-1`,
                    type: 'course',
                    title: 'Chess.com Complete Course',
                    url: 'https://www.chess.com/lessons',
                    description: 'Structured chess learning path from beginner to advanced. Includes interactive lessons, puzzles, and progress tracking.',
                    source: 'Chess.com',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    duration: '20+ hours',
                    isRecommended: true,
                    rating: 4.8
                },
                {
                    id: `chess-course-${Date.now()}-2`,
                    type: 'course',
                    title: 'ChessKid Academy',
                    url: 'https://www.chesskid.com',
                    description: 'Family-friendly chess education with animated lessons, safety features, and age-appropriate content.',
                    source: 'ChessKid',
                    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
                    duration: '15+ hours',
                    rating: 4.7
                }
            ],
            'Guitar': [
                {
                    id: `guitar-course-${Date.now()}-1`,
                    type: 'course',
                    title: 'JustinGuitar Beginner Course',
                    url: 'https://www.justinguitar.com/categories/beginner-guitar-course',
                    description: 'World-renowned free guitar course. Structured lessons from absolute beginner to confident player.',
                    source: 'JustinGuitar',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    duration: '30+ hours',
                    isRecommended: true,
                    rating: 4.9
                },
                {
                    id: `guitar-course-${Date.now()}-2`,
                    type: 'course',
                    title: 'Fender Play Course',
                    url: 'https://www.fender.com/play',
                    description: 'Professional guitar instruction with song-based learning. Learn to play your favorite songs while building skills.',
                    source: 'Fender Play',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    duration: '25+ hours',
                    rating: 4.6
                }
            ],
            'Poker': [
                {
                    id: `poker-course-${Date.now()}-1`,
                    type: 'course',
                    title: 'PokerCoaching.com Course',
                    url: 'https://www.pokercoaching.com',
                    description: 'Professional poker training with Jonathan Little. Advanced strategies for tournament and cash game success.',
                    source: 'PokerCoaching',
                    difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                    duration: '40+ hours',
                    isRecommended: true,
                    rating: 4.8
                },
                {
                    id: `poker-course-${Date.now()}-2`,
                    type: 'course',
                    title: 'Run It Once Training',
                    url: 'https://www.runitonce.com',
                    description: 'Elite poker training site founded by Phil Galfond. High-level strategy content for serious players.',
                    source: 'Run It Once',
                    difficulty: 'Advanced' as 'Beginner' | 'Intermediate' | 'Advanced',
                    duration: '50+ hours',
                    rating: 4.7
                }
            ]
        };

        const result = courseMap[hobby] || this.getGenericCourses(hobby, level);
        console.log(`🎓 Found ${result.length} course resources for ${hobby}`);
        return result;
    }

    /**
     * Get tutorial resources with step-by-step instructions
     */
    private static async getTutorialResources(
        techniqueTitle: string,
        hobby: string,
        level: string
    ): Promise<LearningResource[]> {
        console.log(`📖 Getting tutorial resources for ${hobby} - ${techniqueTitle}`);

        const tutorials = [
            {
                id: `tutorial-${Date.now()}-1`,
                type: 'tutorial' as const,
                title: `${techniqueTitle} - Step by Step Tutorial`,
                url: `https://www.instructables.com/howto/${encodeURIComponent(hobby)}`,
                description: `Detailed step-by-step tutorial for ${techniqueTitle}. Includes photos, diagrams, and troubleshooting tips.`,
                source: 'Instructables',
                difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                author: 'Community Contributors',
                rating: 4.3
            },
            {
                id: `tutorial-${Date.now()}-2`,
                type: 'tutorial' as const,
                title: `${techniqueTitle} - Interactive Tutorial`,
                url: `https://www.codecademy.com/search?query=${encodeURIComponent(hobby + ' ' + techniqueTitle)}`,
                description: `Interactive learning experience for ${techniqueTitle}. Practice while you learn with immediate feedback.`,
                source: 'Codecademy',
                difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                author: 'Educational Team',
                rating: 4.5
            }
        ];

        console.log(`📖 Created ${tutorials.length} tutorial resources`);
        return tutorials;
    }

    // Fallback methods for when specific hobby resources aren't available
    private static getFallbackArticles(techniqueTitle: string, hobby: string, level: string): LearningResource[] {
        console.log(`🔄 Creating fallback articles for ${hobby} - ${techniqueTitle}`);

        return [
            {
                id: `fallback-article-${Date.now()}`,
                type: 'article',
                title: `${hobby}: ${techniqueTitle} Guide`,
                url: `https://www.google.com/search?q=${encodeURIComponent(hobby + ' ' + techniqueTitle + ' guide tutorial')}`,
                description: `Search for comprehensive guides about ${techniqueTitle} in ${hobby}`,
                source: 'Web Search',
                difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                author: 'Various Authors'
            }
        ];
    }

    private static getFallbackTools(hobby: string, level: string): LearningResource[] {
        console.log(`🔄 Creating fallback tools for ${hobby}`);

        return [
            {
                id: `fallback-tool-${Date.now()}`,
                type: 'tool',
                title: `${hobby} Practice Tools`,
                url: `https://www.google.com/search?q=${encodeURIComponent(hobby + ' online tools practice')}`,
                description: `Find online tools and utilities for practicing ${hobby}`,
                source: 'Web Search',
                difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced'
            }
        ];
    }

    private static getFallbackCourses(hobby: string, level: string): LearningResource[] {
        console.log(`🔄 Creating fallback courses for ${hobby}`);

        return [
            {
                id: `fallback-course-${Date.now()}`,
                type: 'course',
                title: `${hobby} Online Courses`,
                url: `https://www.coursera.org/search?query=${encodeURIComponent(hobby)}`,
                description: `Structured online courses for learning ${hobby}`,
                source: 'Coursera',
                difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                duration: 'Varies'
            }
        ];
    }

    private static getFallbackTutorials(techniqueTitle: string, hobby: string, level: string): LearningResource[] {
        console.log(`🔄 Creating fallback tutorials for ${hobby} - ${techniqueTitle}`);

        return [
            {
                id: `fallback-tutorial-${Date.now()}`,
                type: 'tutorial',
                title: `${techniqueTitle} Tutorial`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(hobby + ' ' + techniqueTitle + ' tutorial')}`,
                description: `Video tutorials for ${techniqueTitle} in ${hobby}`,
                source: 'YouTube',
                difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                author: 'Various Creators'
            }
        ];
    }

    private static getGenericTools(hobby: string, level: string): LearningResource[] {
        console.log(`🔄 Creating generic tools for ${hobby}`);

        return [
            {
                id: `generic-tool-${Date.now()}`,
                type: 'tool',
                title: `${hobby} Learning Tools`,
                url: `https://www.google.com/search?q=${encodeURIComponent(hobby + ' learning tools online')}`,
                description: `Collection of online tools to help you learn and practice ${hobby}`,
                source: 'Various',
                difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced'
            }
        ];
    }

    private static getGenericCourses(hobby: string, level: string): LearningResource[] {
        console.log(`🔄 Creating generic courses for ${hobby}`);

        return [
            {
                id: `generic-course-${Date.now()}`,
                type: 'course',
                title: `${hobby} Structured Learning`,
                url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(hobby)}`,
                description: `Professional courses for learning ${hobby} at your own pace`,
                source: 'Udemy',
                difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
                duration: 'Varies'
            }
        ];
    }
}