import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Flame, Shield, LogOut, Swords } from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo" aria-label="LEETQUEST Home">
          <span style={{ fontSize: '1.5rem' }}>⚔️</span>
          <span className="nav-logo-badge">LEETQUEST</span>
        </Link>

        {user && (
          <ul className="nav-links">
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/progress" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Progress
              </NavLink>
            </li>
            <li>
              <NavLink to="/add" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                + Problem
              </NavLink>
            </li>
            <li>
              <NavLink to="/topics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Topics
              </NavLink>
            </li>
            <li>
              <NavLink to="/missions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Swords size={15} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
                Missions
              </NavLink>
            </li>
            <li>
              <NavLink to="/report" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Weekly
              </NavLink>
            </li>
            <li>
              <NavLink to="/leaderboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Leaderboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Profile
              </NavLink>
            </li>
          </ul>
        )}

        <div className="nav-user-stats">
          {user && profile && (
            <>
              <div className="streak-pill" title={`${profile.currentStreak} day streak`}>
                <Flame size={15} />
                <span>{profile.currentStreak}d</span>
              </div>
              <div className="level-badge" title={`Level ${profile.level} - ${profile.xp} XP`}>
                <Shield size={14} />
                <span>Lvl {profile.level}</span>
              </div>
              <Button
                variant="secondary"
                onClick={logout}
                aria-label="Log out"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
              >
                <LogOut size={14} />
              </Button>
            </>
          )}

          {!user && (
            <Link to="/auth" className="btn btn-primary">
              Enter Arena
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
