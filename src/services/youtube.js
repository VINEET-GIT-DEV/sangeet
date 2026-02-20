const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Cache for results to avoid hitting quota too hard
const cache = {};

export const searchYouTube = async (query) => {
    if (!query) return [];
    if (cache[query]) return cache[query];

    try {
        const response = await fetch(`${BASE_URL}/search?part=snippet&maxResults=20&q=${query}&type=video&videoCategoryId=10&key=${API_KEY}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        const results = data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            image: item.snippet.thumbnails.high.url,
            duration: "", // Requires separate API call, can implement if needed
            album: item.snippet.channelTitle,
            youtubeId: item.id.videoId
        }));

        cache[query] = results;
        return results;
    } catch (error) {
        console.error("Error fetching from YouTube", error);
        return [];
    }
};

export const getTrendingMusic = async () => {
    const cacheKey = 'trending';
    if (cache[cacheKey]) return cache[cacheKey];

    try {
        // videoCategoryId=10 is Music
        const response = await fetch(`${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=IN&videoCategoryId=10&maxResults=50&key=${API_KEY}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        const results = data.items.map(item => ({
            id: item.id,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            image: item.snippet.thumbnails.high.url,
            duration: parseDuration(item.contentDetails.duration),
            album: item.snippet.channelTitle,
            youtubeId: item.id
        }));

        cache[cacheKey] = results;
        return results;
    } catch (error) {
        console.error("Error fetching trending music", error);
        return [];
    }
};

export const getRecommendations = async (seedQuery) => {
    // Basic recommendation by searching for related
    return searchYouTube(seedQuery + " mix");
};

// Helper to parse YouTube duration (PT3M20S -> 3:20)
function parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);

    if (hours > 0) {
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
