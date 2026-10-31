import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useProblems } from '../hooks/useProblems';
import { useToast } from '../components/Toast';
import { TOPICS, DIFFICULTIES, Difficulty, Topic } from '@leetquest/shared';
import { UploadCloud, PlusCircle, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

export const AddProblem: React.FC = () => {
  const [tab, setTab] = useState<'single' | 'csv'>('single');
  const navigate = useNavigate();
  const { addProblem, importCsv } = useProblems();
  const { showToast } = useToast();

  // Single Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [topic, setTopic] = useState<Topic>('Arrays');
  const [url, setUrl] = useState('');
  const [solvedDate, setSolvedDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // CSV State
  const [csvContent, setCsvContent] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState<string[][]>([]);
  const [csvImportResult, setCsvImportResult] = useState<{
    insertedCount?: number;
    skippedCount?: number;
    errors?: { line: number; message: string }[];
  } | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await addProblem({
        title,
        difficulty,
        topic,
        url: url.trim() || undefined,
        solvedDate,
        notes: notes.trim() || undefined,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        showToast(`Problem "${title}" logged successfully!`);
        navigate('/progress');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add problem';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      showToast('File exceeds 1 MB limit', 'error');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);

      // Parse first 5 preview rows
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const preview = lines.slice(0, 6).map((l) => l.split(','));
      setCsvPreviewRows(preview);
    };
    reader.readAsText(file);
  };

  const handleCsvImport = async () => {
    if (!csvContent) {
      showToast('Please select a valid CSV file first', 'error');
      return;
    }

    setCsvLoading(true);
    setCsvImportResult(null);

    const res = await importCsv(csvContent);
    setCsvLoading(false);

    if (res.error) {
      showToast(res.error, 'error');
    } else if (res.data) {
      setCsvImportResult(res.data);
      showToast(`Imported ${res.data.insertedCount} problems! (${res.data.skippedCount} skipped)`);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Log DSA Problem</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Record your self-solved algorithmic challenges or bulk import past records.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setTab('single')}
          className={`btn ${tab === 'single' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <PlusCircle size={16} />
          <span>Single Problem</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('csv')}
          className={`btn ${tab === 'csv' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <UploadCloud size={16} />
          <span>Batch CSV Import</span>
        </button>
      </div>

      {tab === 'single' ? (
        <Card>
          {errorMsg && (
            <div
              role="alert"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSingleSubmit}>
            <div className="form-group">
              <label htmlFor="prob-title" className="form-label">
                Problem Title *
              </label>
              <input
                id="prob-title"
                type="text"
                className="form-input"
                placeholder="e.g. Two Sum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="prob-difficulty" className="form-label">
                  Difficulty *
                </label>
                <select
                  id="prob-difficulty"
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="prob-topic" className="form-label">
                  DSA Topic *
                </label>
                <select
                  id="prob-topic"
                  className="form-select"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as Topic)}
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="prob-url" className="form-label">
                  LeetCode URL (Optional)
                </label>
                <input
                  id="prob-url"
                  type="url"
                  className="form-input"
                  placeholder="https://leetcode.com/problems/two-sum/"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prob-date" className="form-label">
                  Solved Date *
                </label>
                <input
                  id="prob-date"
                  type="date"
                  className="form-input"
                  max={todayStr}
                  value={solvedDate}
                  onChange={(e) => setSolvedDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prob-notes" className="form-label">
                Notes & Approaches (Optional)
              </label>
              <textarea
                id="prob-notes"
                className="form-textarea"
                rows={3}
                placeholder="Key intuition, time/space complexity, edge cases..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              Save Problem to Quest Log
            </Button>
          </form>
        </Card>
      ) : (
        <Card>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upload CSV Problem List</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Format requirement: header must be <code>Title,Difficulty,Topic,Link,SolvedDate,Notes</code>. Maximum 2,000 rows and 1 MB file size.
            </p>
          </div>

          <div
            style={{
              border: '2px dashed var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              marginBottom: '1.25rem',
            }}
            onClick={() => document.getElementById('csv-file-input')?.click()}
          >
            <UploadCloud size={36} color="var(--primary)" style={{ margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontWeight: 600 }}>{csvFile ? csvFile.name : 'Click to select .csv file'}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB` : 'CSV files up to 1 MB'}
            </div>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Client-side Preview Table */}
          {csvPreviewRows.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Preview (First {csvPreviewRows.length - 1} data rows)
              </h4>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      {csvPreviewRows[0].map((header, i) => (
                        <th key={i}>{header.trim()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreviewRows.slice(1).map((row, idx) => (
                      <tr key={idx}>
                        {row.map((cell, cidx) => (
                          <td key={cidx}>{cell.trim()}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Results & Validation Errors */}
          {csvImportResult && (
            <div
              style={{
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ color: 'var(--easy)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={16} />
                  <span>{csvImportResult.insertedCount} Inserted</span>
                </div>
                <div style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>{csvImportResult.skippedCount} Skipped (Duplicates)</span>
                </div>
              </div>

              {csvImportResult.errors && csvImportResult.errors.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ color: '#f87171', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    Validation Warnings ({csvImportResult.errors.length}):
                  </div>
                  <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '1.25rem' }}>
                    {csvImportResult.errors.map((err, i) => (
                      <li key={i}>
                        Line {err.line}: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              variant="primary"
              onClick={handleCsvImport}
              isLoading={csvLoading}
              disabled={!csvContent}
              style={{ flex: 1 }}
            >
              Start Batch Import
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const sample = `Title,Difficulty,Topic,Link,SolvedDate,Notes\nTwo Sum,Easy,Arrays,https://leetcode.com/problems/two-sum/,${todayStr},Hashmap approach\nReverse Linked List,Easy,Linked Lists,https://leetcode.com/problems/reverse-linked-list/,${todayStr},Iterative 3-pointer\nCoin Change,Medium,DP,https://leetcode.com/problems/coin-change/,${todayStr},Bottom-up DP table\n`;
                const blob = new Blob([sample], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'leetquest_sample.csv';
                a.click();
              }}
            >
              <FileText size={16} />
              <span>Download Template</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
