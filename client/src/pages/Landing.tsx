import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Swords, Flame, Target, Trophy, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', marginTop: '1.5rem' }}>
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid var(--border-glow)',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          color: '#c084fc',
          fontWeight: 600
        }}>
          <span>⚡ Season 1: Grind to Grandmaster</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
          Turn your <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LeetCode Grind</span> into an Epic RPG.
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '620px' }}>
          Self-report solved DSA problems, conquer personalized quests tailored to your weakest topics, and earn server-verified XP and streaks.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to={user ? '/dashboard' : '/auth'} className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
            <span>{user ? 'Open Dashboard' : 'Start Your Quest'}</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/leaderboard" className="btn btn-secondary" style={{ padding: '0.85rem 1.5rem', fontSize: '1.05rem' }}>
            View Leaderboard
          </Link>
        </div>
      </section>

      <section className="grid-cols-4">
        <Card>
          <div style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}><Swords size={28} /></div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Targeted Missions</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Automatically detect your weakest DSA categories and generate targeted bounties to level up.
          </p>
        </Card>

        <Card>
          <div style={{ color: 'var(--accent-gold)', marginBottom: '0.75rem' }}><Flame size={28} /></div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Daily Streaks</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Local timezone aware streak counter to keep you consistent without accidental streak resets.
          </p>
        </Card>

        <Card>
          <div style={{ color: 'var(--secondary)', marginBottom: '0.75rem' }}><Target size={28} /></div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Verified XP</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Zero cheating. All quest completions and XP events are verified and awarded on the server.
          </p>
        </Card>

        <Card>
          <div style={{ color: '#ec4899', marginBottom: '0.75rem' }}><Trophy size={28} /></div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Opt-in Leaderboard</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Compete with fellow DSA warriors globally or keep your study journey fully private.
          </p>
        </Card>
      </section>
    </div>
  );
};
