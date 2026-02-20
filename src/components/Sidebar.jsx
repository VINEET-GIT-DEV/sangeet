import React, { useState } from 'react';
import './Sidebar.css';
import { BiHomeAlt, BiSearch, BiLibrary, BiPlus, BiSolidHeart, BiEditAlt, BiTrash } from 'react-icons/bi';
import { BsSoundwave } from 'react-icons/bs';

const Sidebar = ({ onHomeClick, onLikedClick, onSearchClick, playlists, onCreatePlaylist, onRenamePlaylist, onDeletePlaylist, onShowPlaylist }) => {
    const [editingId, setEditingId] = useState(null);
    const [tempName, setTempName] = useState('');
    return (
        <div className="sidebar">
            <div className="logo-container">
                <BsSoundwave className="logo-icon" />
                <span className="logo-text">SANGEET</span>
            </div>

            <nav className="nav-section">
                <ul>
                    <li className="nav-item active" onClick={onHomeClick}>
                        <BiHomeAlt className="nav-icon" />
                        <span>Home</span>
                    </li>
                    <li className="nav-item" onClick={onSearchClick} style={{ cursor: 'pointer' }}>
                        <BiSearch className="nav-icon" />
                        <span>Search</span>
                    </li>
                    <li className="nav-item">
                        <BiLibrary className="nav-icon" />
                        <span>Your Library</span>
                    </li>
                </ul>
            </nav>

            <div className="nav-section library-section">
                <div className="section-header">
                    <span className="section-title">PLAYLISTS</span>
                    <BiPlus className="add-icon" onClick={onCreatePlaylist} style={{ cursor: 'pointer' }} />
                </div>
                <ul>
                    <li className="nav-item" onClick={onLikedClick} style={{ cursor: 'pointer' }}>
                        <div className="playlist-icon-placeholder liked-icon-bg">
                            <BiSolidHeart style={{ color: '#fff' }} />
                        </div>
                        <div className="playlist-info">
                            <span className="playlist-name">Liked Songs</span>
                            <span className="playlist-sub">Auto Playlist</span>
                        </div>
                    </li>
                    {playlists.map(p => (
                        <li key={p.id} className="nav-item" onClick={() => onShowPlaylist(p.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {editingId === p.id ? (
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (tempName.trim()) onRenamePlaylist(p.id, tempName);
                                            setEditingId(null);
                                        }
                                    }}
                                    onBlur={() => {
                                        if (tempName.trim()) onRenamePlaylist(p.id, tempName);
                                        setEditingId(null);
                                    }}
                                    autoFocus
                                    style={{ background: 'transparent', color: 'white', border: '1px solid #333', padding: '4px', borderRadius: '4px', width: '90%' }}
                                />
                            ) : (
                                <>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.name}</span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <BiEditAlt
                                            className="edit-icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingId(p.id);
                                                setTempName(p.name);
                                            }}
                                        />
                                        <BiTrash
                                            className="edit-icon"
                                            style={{ color: '#ff4d4d' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Are you sure you want to delete this playlist?')) {
                                                    onDeletePlaylist(p.id);
                                                }
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
