// services/youtubeService.ts

export interface YouTubeVideo {
    id: string;
    title: string;
    channelName: string;
    description: string;
    thumbnailUrl: string;
    duration: string;
    viewCount: number;
}

export class YouTubeService {
    // private static readonly API_KEY = process.env.YOUTUBE_API_KEY;
    private static readonly API_KEY = "XXXXXX";
    private static readonly BASE_URL = 'https://www.googleapis.com/youtube/v3';

    /**
     * Search YouTube for videos and return top results
     */
    static async searchVideos(
        query: string,
        maxResults: number = 8
    ): Promise<YouTubeVideo[]> {
        try {
            console.log(`🔍 Searching YouTube for: "${query}"`);

            // Step 1: Search for videos
            const searchUrl = `${this.BASE_URL}/search?` +
                `part=snippet&type=video&maxResults=${maxResults}&` +
                `q=${encodeURIComponent(query)}&` +
                `order=relevance&` +
                `key=${this.API_KEY}`;

            const searchResponse = await fetch(searchUrl);

            if (!searchResponse.ok) {
                throw new Error(`YouTube API error: ${searchResponse.status}`);
            }

            const searchData = await searchResponse.json();

            if (!searchData.items || searchData.items.length === 0) {
                return [];
            }

            // Step 2: Get video statistics
            const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
            const statsUrl = `${this.BASE_URL}/videos?` +
                `part=statistics,contentDetails&` +
                `id=${videoIds}&` +
                `key=${this.API_KEY}`;

            const statsResponse = await fetch(statsUrl);
            const statsData = await statsResponse.json();

            // Step 3: Combine data
            const videos: YouTubeVideo[] = searchData.items.map((item: any) => {
                const videoId = item.id.videoId;
                const stats = statsData.items?.find((stat: any) => stat.id === videoId);

                return {
                    id: videoId,
                    title: item.snippet.title,
                    channelName: item.snippet.channelTitle,
                    description: item.snippet.description,
                    thumbnailUrl: item.snippet.thumbnails.medium?.url || '',
                    duration: this.parseDuration(stats?.contentDetails?.duration || 'PT0S'),
                    viewCount: parseInt(stats?.statistics?.viewCount || '0')
                };
            });

            console.log(`✅ Found ${videos.length} YouTube videos`);
            return videos;

        } catch (error) {
            console.error('❌ YouTube search error:', error);
            return [];
        }
    }

    /**
     * Parse YouTube duration (PT4M13S) to readable format (4:13)
     */
    private static parseDuration(duration: string): string {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return '0:00';

        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}