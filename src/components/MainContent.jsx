import React, { useState, useEffect } from 'react';
import './MainContent.css';
import { BiHeart, BiSolidHeart, BiDotsHorizontalRounded, BiSearch, BiPlus, BiListPlus, BiPlay, BiListUl } from 'react-icons/bi';
import { searchYouTube } from '../services/youtube';

const MainContent = ({
    onSongSelect,
    searchTerm,
    setSearchTerm,
    displayedSongs,
    setDisplayedSongs,
    isSearching,
    setIsSearching,
    likedSongs,
    onToggleLike,
    onPlaylistSelect,
    recommendations,
    setRecommendations,
    lastSearchTerm,
    setLastSearchTerm,
    onAddSongToPlaylist,
    onAddToQueue,
    playlists,
    viewTitle,
    viewMode,
    currentSong
}) => {
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        const h = () => setActiveMenuId(null);
        window.addEventListener('click', h);
        return () => window.removeEventListener('click', h);
    }, []);

    // Debounced Search Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim()) {
                setIsSearching(true);
                try {
                    const results = await searchYouTube(searchTerm);
                    setDisplayedSongs(results);
                    setLastSearchTerm(searchTerm);
                    const related = await searchYouTube(searchTerm + " remix");
                    setRecommendations(related);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                // Revert logic handled in App
            }
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, setDisplayedSongs, setIsSearching, setLastSearchTerm, setRecommendations]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="main-content" style={{ position: 'relative' }}>
            {currentSong && currentSong.image && (
                <div
                    className="ambient-bg"
                    style={{ backgroundImage: `url(${currentSong.image})` }}
                />
            )}
            <header className="top-bar" style={{ position: 'relative', zIndex: 2 }}>
                <div className="search-bar">
                    <BiSearch className="search-icon" />
                    <input
                        id="main-search-input"
                        type="text"
                        placeholder="Search for songs, artists, etc."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="auth-buttons">
                    {/* Auth features removed */}
                </div>
            </header>

            <div className="content-scroll fade-in" key={viewMode + viewTitle}>
                {viewMode === 'trending' && !searchTerm && (
                    <div className="greeting-section">
                        <h2>{getGreeting()}</h2>
                    </div>
                )}

                {viewMode === 'trending' && recommendations && recommendations.length > 0 && !searchTerm && (
                    <section className="category-section">
                        <div className="section-header">
                            <h2>Based on your last search: {lastSearchTerm}</h2>
                        </div>
                        <div className="track-list">
                            {recommendations.slice(0, 5).map((song, index) => (
                                <div key={song.id} className="track-row" onClick={() => onSongSelect(song)}>
                                    <span className="track-index">{index + 1}</span>
                                    <div className="track-title-col" style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ marginRight: '16px', display: 'flex' }}>
                                            {likedSongs.some(s => s.id === song.id) ? (
                                                <BiSolidHeart
                                                    className="action-icon active-like"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleLike(song);
                                                    }}
                                                />
                                            ) : (
                                                <BiHeart
                                                    className="action-icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleLike(song);
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <img src={song.image} alt={song.title} className="track-img" />
                                        <div className="track-info">
                                            <span className={`track-name ${likedSongs.some(s => s.id === song.id) ? 'liked' : ''}`}>{song.title}</span>
                                            <span className="track-artist">{song.artist}</span>
                                        </div>
                                    </div>
                                    <span className="track-album">{song.album || ''}</span>
                                    <span className="track-duration">{song.duration || ''}</span>
                                    <div className="track-actions">
                                        <BiListPlus
                                            className="action-icon tooltip"
                                            title="Add to queue"
                                            style={{ marginRight: '16px' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddToQueue(song);
                                            }}
                                        />
                                        <div style={{ position: 'relative' }}>
                                            <BiPlus
                                                className="action-icon tooltip"
                                                title="Add to Playlist"
                                                style={{ marginRight: '16px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === song.id ? null : song.id);
                                                }}
                                            />
                                            {activeMenuId === song.id && (
                                                <div className="playlist-menu" style={{ position: 'absolute', right: 0, bottom: '100%', backgroundColor: '#282828', padding: '8px', borderRadius: '4px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', minWidth: '150px' }}>
                                                    <div style={{ fontSize: '12px', color: '#b3b3b3', marginBottom: '8px', padding: '0 8px' }}>Add to playlist</div>
                                                    {playlists && playlists.map((p, pIdx) => (
                                                        <div
                                                            key={'p' + pIdx}
                                                            style={{ padding: '8px', color: '#fff', fontSize: '14px', cursor: 'pointer', borderRadius: '2px' }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3E3E3E'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onAddSongToPlaylist(song, p.id);
                                                                setActiveMenuId(null);
                                                            }}
                                                        >
                                                            {p.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {(viewMode === 'liked' || viewMode === 'playlist') && !searchTerm && (
                    <div className="playlist-header fade-in" style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="playlist-cover" style={{ width: '192px', height: '192px', minWidth: '192px', background: viewMode === 'liked' ? 'linear-gradient(135deg, #450af5, #c4efd9)' : '#282828', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '24px', boxShadow: '0 4px 60px rgba(0,0,0,0.5)' }}>
                            {viewMode === 'liked' ? <BiSolidHeart style={{ fontSize: '64px', color: '#fff' }} /> : <BiListUl style={{ fontSize: '64px', color: '#7f7f7f' }} />}
                        </div>
                        <div className="playlist-header-info" style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Playlist</span>
                            <h1 style={{ fontSize: '72px', fontWeight: '900', margin: '8px 0', lineHeight: '1', letterSpacing: '-2px', color: '#fff' }}>{viewTitle}</h1>
                            <span style={{ fontSize: '14px', color: '#b3b3b3', marginTop: '8px', fontWeight: 'bold' }}>
                                {displayedSongs.length} {displayedSongs.length === 1 ? 'song' : 'songs'}
                            </span>
                        </div>
                    </div>
                )}

                <section className="category-section fade-in">
                    {viewMode === 'trending' || searchTerm ? (
                        <div className="section-header">
                            <h2>{searchTerm ? `Search Results for "${searchTerm}"` : (viewTitle || 'Trending Now')}</h2>
                            {!searchTerm && <span className="see-all">See all</span>}
                        </div>
                    ) : (
                        <div className="playlist-controls" style={{ marginBottom: '24px' }}>
                            <button
                                style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#1db954', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.backgroundColor = '#1ed760'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = '#1db954'; }}
                                onClick={() => { if (displayedSongs.length > 0) onSongSelect(displayedSongs[0]); }}
                            >
                                <BiPlay style={{ fontSize: '32px', color: '#000', marginLeft: '4px' }} />
                            </button>
                        </div>
                    )}
                    {isSearching ? (
                        <div style={{ padding: '20px', color: '#fff' }}>Searching...</div>
                    ) : (
                        <div className="track-list">
                            <div className="track-list-header">
                                <span>#</span>
                                <span>Title</span>
                                <span>Album</span>
                                <span>Time</span>
                                <span></span>
                            </div>
                            {displayedSongs.map((song, index) => (
                                <div key={song.id} className="track-row" onClick={() => onSongSelect(song)}>
                                    <span className="track-index">{index + 1}</span>
                                    <div className="track-title-col" style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ marginRight: '16px', display: 'flex' }}>
                                            {likedSongs.some(s => s.id === song.id) ? (
                                                <BiSolidHeart
                                                    className="action-icon active-like"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleLike(song);
                                                    }}
                                                />
                                            ) : (
                                                <BiHeart
                                                    className="action-icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleLike(song);
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <img src={song.image} alt={song.title} className="track-img" />
                                        <div className="track-info">
                                            <span className={`track-name ${likedSongs.some(s => s.id === song.id) ? 'liked' : ''}`}>{song.title}</span>
                                            <span className="track-artist">{song.artist}</span>
                                        </div>
                                    </div>
                                    <span className="track-album">{song.album || ''}</span>
                                    <span className="track-duration">{song.duration || ''}</span>
                                    <div className="track-actions">
                                        <BiListPlus
                                            className="action-icon tooltip"
                                            title="Add to queue"
                                            style={{ marginRight: '16px' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddToQueue(song);
                                            }}
                                        />
                                        <div style={{ position: 'relative' }}>
                                            <BiPlus
                                                className="action-icon tooltip"
                                                title="Add to Playlist"
                                                style={{ marginRight: '16px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === song.id ? null : song.id);
                                                }}
                                            />
                                            {activeMenuId === song.id && (
                                                <div className="playlist-menu" style={{ position: 'absolute', right: 0, bottom: '100%', backgroundColor: '#282828', padding: '8px', borderRadius: '4px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', minWidth: '150px' }}>
                                                    <div style={{ fontSize: '12px', color: '#b3b3b3', marginBottom: '8px', padding: '0 8px' }}>Add to playlist</div>
                                                    {playlists && playlists.map((p, pIdx) => (
                                                        <div
                                                            key={'p2' + pIdx}
                                                            style={{ padding: '8px', color: '#fff', fontSize: '14px', cursor: 'pointer', borderRadius: '2px' }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3E3E3E'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onAddSongToPlaylist(song, p.id);
                                                                setActiveMenuId(null);
                                                            }}
                                                        >
                                                            {p.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Spacer for player bar */}
                <div style={{ height: '100px' }}></div>
            </div>
        </div>
    );

};

export default MainContent;
