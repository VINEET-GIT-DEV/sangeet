import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import PlayerBar from './components/PlayerBar';
import './App.css';
import { songs } from './data';
import { getTrendingMusic, searchYouTube } from './services/youtube';

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const [displayedSongs, setDisplayedSongs] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([{ id: 1, name: 'My Playlist #1', songs: [] }]);
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [viewMode, setViewMode] = useState('trending');
  const [queue, setQueue] = useState([]);

  // Spacebar Play/Pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch Trending Music on Mount
  useEffect(() => {
    const fetchTrending = async () => {
      setIsSearching(true);
      const trending = await getTrendingMusic();
      if (trending && trending.length > 0) {
        setTrendingSongs(trending);
        setDisplayedSongs(trending);
        if (!currentSong) {
          setCurrentSong(trending[0]);
        }
      }
      setIsSearching(false);
    };
    fetchTrending();
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSongSelect = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handleToggleLike = (song) => {
    setLikedSongs(prev => {
      const isLiked = prev.some(s => s.id === song.id);
      if (isLiked) {
        return prev.filter(s => s.id !== song.id);
      }
      return [song, ...prev];
    });
  };

  const handlePlaylistSelect = async (playlist) => {
    setSearchTerm('');
    setIsSearching(true);
    const searchQuery = playlist.searchQuery || playlist.title;
    const searchResults = await searchYouTube(searchQuery);
    setDisplayedSongs(searchResults);
    setIsSearching(false);
  };

  const handleShowLiked = () => {
    setSearchTerm('');
    setDisplayedSongs(likedSongs);
    setIsSearching(false);
    setViewMode('liked');
  };

  const handleShowPlaylist = (id) => {
    const p = playlists.find(p => p.id === id);
    if (p) {
      setSearchTerm('');
      setDisplayedSongs(p.songs);
      setIsSearching(false);
      setViewMode('playlist');
      setActivePlaylistId(id);
    }
  };

  const handleAddSongToPlaylist = (song, playlistId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId && !p.songs.some(s => s.id === song.id)) {
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    }));
  };

  const handleCreatePlaylist = () => {
    setPlaylists(prev => [...prev, { id: Date.now(), name: `My Playlist #${prev.length + 1}`, songs: [] }]);
  };

  const handleRenamePlaylist = (id, newName) => {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const handleDeletePlaylist = (id) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (activePlaylistId === id) {
      resetSearch();
    }
  };

  const handleAddToQueue = (song) => {
    setQueue(prev => [...prev, song]);
  };

  const focusSearch = () => {
    const searchInput = document.getElementById('main-search-input');
    if (searchInput) {
      searchInput.focus();
    }
  };

  const resetSearch = () => {
    setSearchTerm('');
    setDisplayedSongs(trendingSongs);
    setIsSearching(false);
    setViewMode('trending');
  };

  let viewTitle = 'Trending Now';
  if (viewMode === 'liked') viewTitle = 'Liked Songs';
  if (viewMode === 'playlist') {
    const p = playlists.find(p => p.id === activePlaylistId);
    if (p) viewTitle = p.name;
  }

  return (
    <div className="app-container">
      <div className="main-layout">
        <Sidebar
          onHomeClick={resetSearch}
          onLikedClick={handleShowLiked}
          onSearchClick={focusSearch}
          playlists={playlists}
          onShowPlaylist={handleShowPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
          onRenamePlaylist={handleRenamePlaylist}
          onDeletePlaylist={handleDeletePlaylist}
        />
        <MainContent
          onSongSelect={handleSongSelect}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          displayedSongs={displayedSongs}
          setDisplayedSongs={setDisplayedSongs}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          likedSongs={likedSongs}
          onToggleLike={handleToggleLike}
          onPlaylistSelect={handlePlaylistSelect}
          recommendations={recommendations}
          setRecommendations={setRecommendations}
          lastSearchTerm={lastSearchTerm}
          setLastSearchTerm={setLastSearchTerm}
          playlists={playlists}
          onAddSongToPlaylist={handleAddSongToPlaylist}
          onAddToQueue={handleAddToQueue}
          viewTitle={viewTitle}
          viewMode={viewMode}
          currentSong={currentSong}
        />
      </div>
      <PlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        likedSongs={likedSongs}
        onToggleLike={handleToggleLike}
        displayedSongs={displayedSongs}
        onSongSelect={handleSongSelect}
        queue={queue}
        setQueue={setQueue}
        viewMode={viewMode}
      />
    </div>
  );
}

export default App;
