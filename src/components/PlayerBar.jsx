import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import './PlayerBar.css';
import { BiPlay, BiPause, BiSkipNext, BiSkipPrevious, BiShuffle, BiRepeat, BiVolumeFull, BiListUl, BiExpandAlt, BiHeart, BiSolidHeart } from 'react-icons/bi';

const PlayerBar = ({ currentSong, isPlaying, onPlayPause, likedSongs, onToggleLike, displayedSongs, onSongSelect, queue, setQueue, viewMode }) => {
    const audioRef = useRef(null);
    const youtubePlayerRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isShuffled, setIsShuffled] = useState(false);
    const [isRepeated, setIsRepeated] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const youtubeContainerRef = useRef(null);

    const isYoutube = Boolean(currentSong?.youtubeId);

    useEffect(() => {
        if (isYoutube) {
            if (youtubePlayerRef.current) {
                // Ensure internal player state matches prop state
                const playerState = youtubePlayerRef.current.getPlayerState();
                if (isPlaying && playerState !== 1 && playerState !== 3) { // 1=winning, 3=buffering
                    youtubePlayerRef.current.playVideo();
                } else if (!isPlaying && playerState === 1) {
                    youtubePlayerRef.current.pauseVideo();
                }
            }
        } else {
            if (audioRef.current) {
                if (isPlaying) {
                    audioRef.current.play().catch(e => console.log("Audio play failed:", e));
                } else {
                    audioRef.current.pause();
                }
            }
        }
    }, [isPlaying, currentSong, isYoutube]);

    useEffect(() => {
        if (isYoutube && youtubePlayerRef.current && typeof youtubePlayerRef.current.setVolume === 'function') {
            youtubePlayerRef.current.setVolume(volume * 100);
        } else if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume, currentSong, isYoutube]);

    // Sync progress for YouTube
    useEffect(() => {
        let interval;
        if (isYoutube && isPlaying) {
            interval = setInterval(() => {
                if (youtubePlayerRef.current && typeof youtubePlayerRef.current.getCurrentTime === 'function') {
                    const time = youtubePlayerRef.current.getCurrentTime();
                    const dur = youtubePlayerRef.current.getDuration();
                    setCurrentTime(time);
                    setDuration(dur);
                }
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isYoutube, isPlaying]);

    const handleTimeUpdate = () => {
        if (audioRef.current && !isYoutube) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current && !isYoutube) {
            setDuration(audioRef.current.duration);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSeek = (e) => {
        // Implement seeking capability
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = offsetX / width;
        const navigateTime = percentage * duration;

        if (isYoutube && youtubePlayerRef.current) {
            youtubePlayerRef.current.seekTo(navigateTime, true);
            setCurrentTime(navigateTime);
        } else if (audioRef.current) {
            audioRef.current.currentTime = navigateTime;
            setCurrentTime(navigateTime);
        }
    };

    const handleVolumeChange = (e) => {
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const width = rect.width;
        let newVolume = offsetX / width;
        if (newVolume < 0) newVolume = 0;
        if (newVolume > 1) newVolume = 1;
        setVolume(newVolume);
    };

    const handleNext = () => {
        if (queue && queue.length > 0) {
            const nextSong = queue[0];
            if (setQueue) setQueue(queue.slice(1));
            if (onSongSelect) onSongSelect(nextSong);
            return;
        }

        if (!displayedSongs || displayedSongs.length === 0) return;

        if (isShuffled || viewMode === 'trending') {
            const randomIndex = Math.floor(Math.random() * displayedSongs.length);
            if (onSongSelect) onSongSelect(displayedSongs[randomIndex]);
            return;
        }

        const currentIndex = displayedSongs.findIndex(s => s.id === currentSong?.id);
        if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % displayedSongs.length;
            if (onSongSelect) onSongSelect(displayedSongs[nextIndex]);
        }
    };

    const handlePrev = () => {
        if (!displayedSongs || displayedSongs.length === 0) return;

        if (currentTime > 3) {
            if (isYoutube && youtubePlayerRef.current) {
                youtubePlayerRef.current.seekTo(0, true);
            } else if (audioRef.current) {
                audioRef.current.currentTime = 0;
            }
            setCurrentTime(0);
            return;
        }

        const currentIndex = displayedSongs.findIndex(s => s.id === currentSong?.id);
        if (currentIndex !== -1) {
            const prevIndex = (currentIndex - 1 + displayedSongs.length) % displayedSongs.length;
            if (onSongSelect) onSongSelect(displayedSongs[prevIndex]);
        }
    };

    const handleSongEnd = () => {
        if (isRepeated) {
            if (isYoutube && youtubePlayerRef.current) {
                youtubePlayerRef.current.seekTo(0, true);
                youtubePlayerRef.current.playVideo();
            } else if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.log(e));
            }
            setCurrentTime(0);
        } else {
            handleNext();
        }
    };

    const onPlayerReady = (event) => {
        youtubePlayerRef.current = event.target;
        if (isPlaying) {
            event.target.playVideo();
        }
    };

    const onPlayerStateChange = (event) => {
        // 0: ended, 1: playing, 2: paused, 3: buffering, 5: video cued
        if (event.data === 0) {
            handleSongEnd();
        }
    };

    const handleFullscreen = () => {
        if (!isYoutube || !youtubeContainerRef.current) return;

        if (!document.fullscreenElement) {
            youtubeContainerRef.current.requestFullscreen().catch(err => {
                console.error("Error attempting to enable fullscreen:", err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const youtubeOpts = {
        height: '56',
        width: '56',
        playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: 0, // Hide YouTube controls
            modestbranding: 1,
            fs: 0,
        },
    };

    const isLiked = likedSongs?.some(s => s.id === currentSong?.id);

    return (
        <div className="player-bar">
            {/* Standard Audio Player */}
            {!isYoutube && (
                <audio
                    src={currentSong ? currentSong.audio : ''}
                    ref={audioRef}
                    onEnded={handleSongEnd}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                />
            )}

            <div className="player-left">
                {currentSong && (
                    <>
                        {isYoutube ? (
                            <div className="youtube-container" ref={youtubeContainerRef}>
                                <YouTube
                                    videoId={currentSong.youtubeId}
                                    opts={youtubeOpts}
                                    onReady={onPlayerReady}
                                    onStateChange={onPlayerStateChange}
                                    className="youtube-player"
                                />
                            </div>
                        ) : (
                            <img src={currentSong.image} alt={currentSong.title} className="current-song-img" />
                        )}

                        <div className="current-song-info">
                            <span className="current-song-title">{currentSong.title}</span>
                            <span className="current-song-artist">{currentSong.artist}</span>
                        </div>
                        {isLiked ? (
                            <BiSolidHeart
                                className="like-icon active-like"
                                onClick={() => onToggleLike && onToggleLike(currentSong)}
                            />
                        ) : (
                            <BiHeart
                                className="like-icon"
                                onClick={() => onToggleLike && onToggleLike(currentSong)}
                            />
                        )}
                    </>
                )}
            </div>

            <div className="player-center">
                <div className="player-controls">
                    <BiShuffle
                        className={`control-icon shuffle ${isShuffled ? 'active' : ''}`}
                        style={isShuffled ? { color: '#1db954' } : {}}
                        onClick={() => setIsShuffled(!isShuffled)}
                    />
                    <BiSkipPrevious className="control-icon prev" onClick={handlePrev} />
                    <button className="play-pause-btn" onClick={onPlayPause}>
                        {isPlaying ? <BiPause /> : <BiPlay />}
                    </button>
                    <BiSkipNext className="control-icon next" onClick={handleNext} />
                    <BiRepeat
                        className={`control-icon repeat ${isRepeated ? 'active' : ''}`}
                        style={isRepeated ? { color: '#1db954' } : {}}
                        onClick={() => setIsRepeated(!isRepeated)}
                    />
                </div>
                <div className="progress-bar-container">
                    <span className="time-current">{formatTime(currentTime)}</span>
                    <div className="progress-bar-bg" onClick={handleSeek}>
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${(duration > 0 ? (currentTime / duration) : 0) * 100}%` }}
                        ></div>
                    </div>
                    <span className="time-total">{formatTime(duration || 0)}</span>
                </div>
            </div>

            <div className="player-right" style={{ position: 'relative' }}>
                <BiListUl
                    className={`control-icon ${showQueue ? 'active' : ''}`}
                    style={{ color: showQueue ? '#1db954' : '', cursor: 'pointer' }}
                    onClick={() => setShowQueue(!showQueue)}
                />

                {showQueue && (
                    <div className="queue-overlay" style={{ position: 'absolute', bottom: '100%', right: '0', backgroundColor: '#282828', padding: '15px', borderRadius: '8px 8px 0 0', width: '300px', maxHeight: '400px', overflowY: 'auto', zIndex: 100, boxShadow: '0 -4px 15px rgba(0,0,0,0.7)', border: '1px solid #333' }}>
                        <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 15px 0', paddingBottom: '10px', borderBottom: '1px solid #333' }}>Play Queue</h3>
                        {queue && queue.length > 0 ? (
                            <div className="queue-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {queue.map((song, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '5px', borderRadius: '4px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => {
                                        if (onSongSelect) onSongSelect(song);
                                        if (setQueue) {
                                            const newQueue = [...queue];
                                            newQueue.splice(i, 1);
                                            setQueue(newQueue);
                                        }
                                    }}>
                                        <img src={song.image} alt={song.title} style={{ width: '40px', height: '40px', borderRadius: '4px', marginRight: '10px' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                            <span style={{ color: '#fff', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</span>
                                            <span style={{ color: '#b3b3b3', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#b3b3b3', fontSize: '14px', margin: 0 }}>Queue is empty.</p>
                        )}
                    </div>
                )}

                <div className="volume-control" style={{ cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BiVolumeFull className="control-icon" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="spotify-slider"
                        style={{ '--val': `${volume * 100}%` }}
                    />
                </div>
                <BiExpandAlt className="control-icon" onClick={handleFullscreen} style={{ cursor: 'pointer' }} />
            </div>
        </div>
    );
};

export default PlayerBar;

