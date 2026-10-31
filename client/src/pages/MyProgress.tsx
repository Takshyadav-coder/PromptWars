import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useProblems } from '../hooks/useProblems';
import { useToast } from '../components/Toast';
import { TOPICS, DIFFICULTIES, Problem, Topic, Difficulty } from '@leetquest/shared';
import { ExternalLink, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyProgress: React.FC = () => {
  const { problems, loading, deleteProblem, updateProblem } = useProblems();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // Edit State
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>('Easy');
  const [editTopic, setEditTopic] = useState<Topic>('Arrays');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter logic
  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === 'All' || p.topic === selectedTopic;
    const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    return matchesSearch && matchesTopic && matchesDiff;
  });

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const res = await deleteProblem(id);
      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast(`Problem "${title}" deleted.`);
      }
    }
  };

  const openEditModal = (problem: Problem) => {
    setEditingProblem(problem);
    setEditNotes(problem.notes || '');
    setEditDifficulty(problem.difficulty);
    setEditTopic(problem.topic);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblem) return;
    setIsUpdating(true);
    const res = await updateProblem(editingProblem.id, {
      notes: editNotes,
      difficulty: editDifficulty,
      topic: editTopic,
    });
    setIsUpdating(false);

    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast('Problem updated successfully!');
      setEditingProblem(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My DSA Progress</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {problems.length} solved algorithmic challenges logged
          </p>
        </div>
        <Link to="/add" className="btn btn-primary">
          + Add Problem
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search problem title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2rem' }}
              aria-label="Search problems by title"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              aria-label="Filter by Topic"
            >
              <option value="All">All Topics</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              className="form-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              aria-label="Filter by Difficulty"
            >
              <option value="All">All Difficulties</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Problems Table / List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading problems...</div>
      ) : filteredProblems.length === 0 ? (
        <Card>
          <EmptyState
            title={problems.length === 0 ? 'No Problems Logged' : 'No Matching Problems'}
            description={
              problems.length === 0
                ? 'Your solved problem bank is empty. Start recording your LeetCode progress to earn XP!'
                : 'Try adjusting your search query or filters.'
            }
            actionText={problems.length === 0 ? '+ Log Problem' : undefined}
            onAction={problems.length === 0 ? () => (window.location.href = '/add') : undefined}
          />
        </Card>
      ) : (
        <Card style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table" aria-label="Solved Problems Table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Topic</th>
                <th>Solved Date</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((prob) => (
                <tr key={prob.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{prob.title}</span>
                      {prob.url && (
                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open on LeetCode"
                          style={{ color: 'var(--secondary)', display: 'inline-flex' }}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        prob.difficulty === 'Easy'
                          ? 'badge-easy'
                          : prob.difficulty === 'Medium'
                          ? 'badge-medium'
                          : 'badge-hard'
                      }
                    >
                      {prob.difficulty}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-muted)' }}>{prob.topic}</span>
                  </td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    {prob.solvedDate}
                  </td>
                  <td style={{ maxWidth: '220px', color: 'var(--text-muted)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {prob.notes || '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <Button
                        variant="secondary"
                        onClick={() => openEditModal(prob)}
                        aria-label={`Edit ${prob.title}`}
                        style={{ padding: '0.35rem 0.5rem' }}
                      >
                        <Edit2 size={13} />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(prob.id, prob.title)}
                        aria-label={`Delete ${prob.title}`}
                        style={{ padding: '0.35rem 0.5rem' }}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingProblem)}
        onClose={() => setEditingProblem(null)}
        title={`Edit: ${editingProblem?.title}`}
      >
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-diff">Difficulty</label>
            <select
              id="edit-diff"
              className="form-select"
              value={editDifficulty}
              onChange={(e) => setEditDifficulty(e.target.value as Difficulty)}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-top">Topic</label>
            <select
              id="edit-top"
              className="form-select"
              value={editTopic}
              onChange={(e) => setEditTopic(e.target.value as Topic)}
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-notes">Notes</label>
            <textarea
              id="edit-notes"
              className="form-textarea"
              rows={3}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Key insights, time & space complexity..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" type="button" onClick={() => setEditingProblem(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
