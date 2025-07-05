// test-youtube.js - Run this in terminal to test your API key

const YOUTUBE_API_KEY = 'AIzaSyCHZSC2icn0LcEhTELxapGMkOpSCksyE1w'; // Replace with your actual key
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function testYouTubeAPI() {
    try {
        const query = 'chess tutorial';
        const url = `${BASE_URL}/search?part=snippet&type=video&maxResults=3&q=${query}&key=${YOUTUBE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log('✅ YouTube API working!');
            console.log('Found videos:', data.items?.length || 0);
            data.items?.forEach((item, index) => {
                console.log(`${index + 1}. ${item.snippet.title}`);
            });
        } else {
            console.error('❌ API Error:', data.error?.message);
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testYouTubeAPI();