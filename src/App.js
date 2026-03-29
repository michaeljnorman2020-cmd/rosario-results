import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import PlayerProfile from './PlayerProfile';

const ADMIN_PASSWORD = 'Adm!n3ntry';

// ── Admin Login ─────────────────────────────────────────────────────────────
const AdminLogin = ({ onSuccess, onCancel }) => {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const attempt = () => {
    if (pw === ADMIN_PASSWORD) { onSuccess(); }
    else { setError(true); setPw(''); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-red-700 to-red-900 p-5 text-white text-center">
          <div className="text-2xl mb-1">🔒</div>
          <h2 className="text-lg font-bold">Admin Access</h2>
        </div>
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false); }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-1"
            placeholder="Enter admin password"
            autoFocus
          />
          {error && <p className="text-xs text-red-600 mb-3">Incorrect password. Try again.</p>}
          {!error && <div className="mb-3" />}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={attempt}
              className="flex-1 px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Admin Screen ─────────────────────────────────────────────────────────────
const AdminScreen = ({ players, onClose, onMatchSaved }) => {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [opponent, setOpponent] = useState('');
  const [location, setLocation] = useState('');
  const [isHome, setIsHome] = useState(true);
  const [scoreFor, setScoreFor] = useState('');
  const [scoreAgainst, setScoreAgainst] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Per-player stats rows
  const emptyStats = () =>
    Object.fromEntries(
      players.map(p => [p.id, { mins: '', goals: '', assists: '', gk: false, sub: false, pom: false }])
    );
  const [playerRows, setPlayerRows] = useState(emptyStats);

  const totalMins = Object.values(playerRows).reduce((sum, r) => sum + (Number(r.mins) || 0), 0);

  const updatePlayerField = (playerId, field, value) => {
    setPlayerRows(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaveError(null);
    if (!date || !opponent || !location || scoreFor === '' || scoreAgainst === '') {
      setSaveError('Please fill in all match details (date, opponent, location, score).');
      return;
    }

    setSaving(true);
    try {
      // Insert match
      const { data: matchData, error: matchErr } = await supabase
        .from('matches')
        .insert([{
          date,
          opponent,
          location,
          home: isHome,
          score_for: Number(scoreFor),
          score_against: Number(scoreAgainst),
        }])
        .select()
        .single();

      if (matchErr) throw matchErr;

      // Build match_stats rows — only include players with mins entered
      const statsRows = players
        .map(p => {
          const row = playerRows[p.id];
          const mins = Number(row.mins) || 0;
          return {
            match_id: matchData.id,
            player_id: p.id,
            mins,
            goals: Number(row.goals) || 0,
            assists: Number(row.assists) || 0,
            gk: row.gk,
            sub: row.sub,
            pom: row.pom,
          };
        })
        .filter(r => r.mins > 0 || r.goals > 0 || r.assists > 0 || r.gk || r.sub || r.pom);

      if (statsRows.length > 0) {
        const { error: statsErr } = await supabase.from('match_stats').insert(statsRows);
        if (statsErr) throw statsErr;
      }

      setSaveSuccess(true);
      onMatchSaved();
      setTimeout(() => { setSaveSuccess(false); onClose(); }, 1500);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-6 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-red-700 to-red-900 p-5 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Add Match</h2>
            <p className="text-sm opacity-75 mt-0.5">Enter match details and player stats</p>
          </div>
          <button onClick={onClose} className="text-white opacity-70 hover:opacity-100 text-3xl leading-none">×</button>
        </div>

        <div className="p-6">
          {/* Match Details */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Match Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Opposition</label>
              <input
                type="text"
                value={opponent}
                onChange={e => setOpponent(e.target.value)}
                placeholder="e.g. Clifton All Whites"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Brian Clough Way"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Home / Away</label>
              <select
                value={isHome ? 'home' : 'away'}
                onChange={e => setIsHome(e.target.value === 'home')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="home">Home</option>
                <option value="away">Away</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Rosario Score</label>
              <input
                type="number"
                min="0"
                value={scoreFor}
                onChange={e => setScoreFor(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Opposition Score</label>
              <input
                type="number"
                min="0"
                value={scoreAgainst}
                onChange={e => setScoreAgainst(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Player Stats Table */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Player Statistics</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 border-b-2 border-red-700 font-semibold text-gray-700 min-w-[140px]">Player</th>
                  <th className="text-center px-3 py-2 border-b-2 border-red-700 font-semibold text-gray-700 min-w-[70px]">Mins</th>
                  <th className="text-center px-3 py-2 border-b-2 border-red-700 font-semibold text-gray-700 min-w-[70px]">Goals</th>
                  <th className="text-center px-3 py-2 border-b-2 border-red-700 font-semibold text-gray-700 min-w-[70px]">Assists</th>
                  <th className="text-center px-3 py-2 border-b-2 border-red-700 font-semibold text-gray-700 min-w-[50px]">GK 🧤</th>
                  <th className="text-center px-3 py-2 border-b-2 border-red-700 font-semibold text-gray-700 min-w-[50px]">Sub 🔄</th>
                  <th className="text-center px-3 py-2 border-b-2 border-red-700 font-semibold text-gray-700 min-w-[80px]">Player's Player ⭐</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => {
                  const row = playerRows[player.id];
                  return (
                    <tr key={player.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 font-semibold text-gray-800 border-b border-gray-100">
                        {player.name}
                        {player.squad_number && (
                          <span className="ml-1 text-xs text-gray-400">#{player.squad_number}</span>
                        )}
                      </td>
                      {/* Mins */}
                      <td className="px-2 py-1.5 border-b border-gray-100">
                        <input
                          type="number"
                          min="0"
                          max="999"
                          value={row.mins}
                          onChange={e => updatePlayerField(player.id, 'mins', e.target.value)}
                          placeholder="0"
                          className="w-full text-center border border-gray-200 rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-400"
                        />
                      </td>
                      {/* Goals */}
                      <td className="px-2 py-1.5 border-b border-gray-100">
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={row.goals}
                          onChange={e => updatePlayerField(player.id, 'goals', e.target.value)}
                          placeholder="0"
                          className="w-full text-center border border-gray-200 rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-400"
                        />
                      </td>
                      {/* Assists */}
                      <td className="px-2 py-1.5 border-b border-gray-100">
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={row.assists}
                          onChange={e => updatePlayerField(player.id, 'assists', e.target.value)}
                          placeholder="0"
                          className="w-full text-center border border-gray-200 rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-400"
                        />
                      </td>
                      {/* GK */}
                      <td className="px-2 py-1.5 border-b border-gray-100 text-center">
                        <input
                          type="checkbox"
                          checked={row.gk}
                          onChange={e => updatePlayerField(player.id, 'gk', e.target.checked)}
                          className="w-4 h-4 accent-red-600 cursor-pointer"
                        />
                      </td>
                      {/* Sub */}
                      <td className="px-2 py-1.5 border-b border-gray-100 text-center">
                        <input
                          type="checkbox"
                          checked={row.sub}
                          onChange={e => updatePlayerField(player.id, 'sub', e.target.checked)}
                          className="w-4 h-4 accent-red-600 cursor-pointer"
                        />
                      </td>
                      {/* Player's Player */}
                      <td className="px-2 py-1.5 border-b border-gray-100 text-center">
                        <input
                          type="checkbox"
                          checked={row.pom}
                          onChange={e => updatePlayerField(player.id, 'pom', e.target.checked)}
                          className="w-4 h-4 accent-red-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total Minutes Counter */}
          <div className="mt-3 flex items-center justify-end gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total minutes entered:</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              totalMins === 0
                ? 'bg-gray-100 text-gray-500'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              ⏱ {totalMins} mins
            </span>
          </div>

          {/* Errors / Success */}
          {saveError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              ⚠️ {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              ✅ Match saved successfully!
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saveSuccess}
              className="px-6 py-2.5 rounded-lg bg-red-700 text-white text-sm font-bold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? '💾 Saving…' : saveSuccess ? '✅ Saved!' : '💾 Save Match'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main App ─────────────────────────────────────────────────────────────────
const App = () => {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchStats, setMatchStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedMatch, setExpandedMatch] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [showAdminScreen, setShowAdminScreen] = useState(false);

  // ── Fetch all data ──────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [playersRes, matchesRes, statsRes] = await Promise.all([
        supabase.from('players').select('*').order('name'),
        supabase.from('matches').select('*').order('date', { ascending: false }),
        supabase.from('match_stats').select('*'),
      ]);

      if (playersRes.error) throw playersRes.error;
      if (matchesRes.error) throw matchesRes.error;
      if (statsRes.error) throw statsRes.error;

      setPlayers(playersRes.data);
      setMatches(matchesRes.data);
      setMatchStats(statsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Admin button handler ────────────────────────────────────
  const handleAdminClick = () => {
    if (isAdminAuthed) {
      setShowAdminScreen(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthed(true);
    setShowLoginModal(false);
    setShowAdminScreen(true);
  };

  // ── Derived stats ───────────────────────────────────────────
  const seasonStats = useMemo(() => {
    return matches.reduce((acc, m) => {
      acc.played++;
      acc.goalsFor += m.score_for;
      acc.goalsAgainst += m.score_against;
      if (m.score_for > m.score_against) acc.won++;
      else if (m.score_for === m.score_against) acc.drawn++;
      else acc.lost++;
      return acc;
    }, { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 });
  }, [matches]);

  const playerStats = useMemo(() => {
    const map = {};
    players.forEach(p => {
      map[p.id] = { appearances: 0, goals: 0, assists: 0, gkAppearances: 0, pom: 0 };
    });
    matchStats.forEach(s => {
      if (!map[s.player_id]) return;
      if (s.mins > 0) {
        map[s.player_id].appearances++;
        map[s.player_id].goals += s.goals;
        map[s.player_id].assists += s.assists;
        if (s.gk) map[s.player_id].gkAppearances++;
        if (s.pom) map[s.player_id].pom++;
      }
    });
    return map;
  }, [players, matchStats]);

  const statsForMatch = (matchId) => {
    const map = {};
    matchStats
      .filter(s => s.match_id === matchId)
      .forEach(s => { map[s.player_id] = s; });
    return map;
  };

  const getResult = (m) => {
    if (m.score_for > m.score_against) return 'win';
    if (m.score_for < m.score_against) return 'loss';
    return 'draw';
  };

  const topScorers = useMemo(() =>
    Object.entries(playerStats)
      .filter(([, s]) => s.goals > 0)
      .sort((a, b) => b[1].goals - a[1].goals)
      .slice(0, 3)
      .map(([id, s]) => ({ player: players.find(p => p.id === id), stats: s })),
    [playerStats, players]);

  const topAssisters = useMemo(() =>
    Object.entries(playerStats)
      .filter(([, s]) => s.assists > 0)
      .sort((a, b) => b[1].assists - a[1].assists)
      .slice(0, 3)
      .map(([id, s]) => ({ player: players.find(p => p.id === id), stats: s })),
    [playerStats, players]);

  // ── Loading / error states ──────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm max-w-md">
          <strong>Error loading data:</strong> {error}
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .stat-appearances { color: #2196F3; font-weight: 600; }
        .stat-goals       { color: #4CAF50; font-weight: 600; }
        .stat-assists     { color: #FF9800; font-weight: 600; }
        .stat-gk          { color: #9C27B0; font-weight: 600; }
        .highlight        { color: #DC143C; font-weight: 600; }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-br from-red-700 to-red-900 text-white py-6 text-center shadow-md relative">
        <h1 className="text-2xl font-bold mb-1">West Bridgford Colts U10 Rosario</h1>
        <div className="text-sm opacity-90">Season 2025/26 Results &amp; Stats</div>
        {/* Admin button */}
        <button
          onClick={handleAdminClick}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white opacity-40 hover:opacity-80 transition-opacity text-xs px-2 py-1 rounded border border-white border-opacity-30"
          title="Admin"
        >
          ⚙️
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-5">

        {/* Season Summary */}
        <div className="bg-white rounded-lg p-5 mb-5 shadow">
          <h2 className="text-xl font-bold mb-4">Season Summary</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Played', value: seasonStats.played, colour: 'text-gray-800' },
              { label: 'Won',    value: seasonStats.won,    colour: 'text-green-700' },
              { label: 'Drawn',  value: seasonStats.drawn,  colour: 'text-amber-700' },
              { label: 'Lost',   value: seasonStats.lost,   colour: 'text-red-700'   },
            ].map(({ label, value, colour }) => (
              <div key={label} className="text-center p-3 bg-gray-50 rounded">
                <div className={`text-3xl font-bold ${colour}`}>{value}</div>
                <div className="text-xs uppercase text-gray-600 mt-1">{label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-3xl font-bold text-green-700">{seasonStats.goalsFor}</div>
              <div className="text-xs uppercase text-gray-600 mt-1">Goals For</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-3xl font-bold text-red-700">{seasonStats.goalsAgainst}</div>
              <div className="text-xs uppercase text-gray-600 mt-1">Goals Against</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className={`text-3xl font-bold ${seasonStats.goalsFor - seasonStats.goalsAgainst >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {seasonStats.goalsFor - seasonStats.goalsAgainst > 0 ? '+' : ''}{seasonStats.goalsFor - seasonStats.goalsAgainst}
              </div>
              <div className="text-xs uppercase text-gray-600 mt-1">Goal Diff</div>
            </div>
          </div>
        </div>

        {/* Leaderboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {[
            { title: '⚽ Top Scorers',  data: topScorers,   key: 'goals',   label: 'Goals'   },
            { title: '🎯 Top Assists',  data: topAssisters, key: 'assists', label: 'Assists' },
          ].map(({ title, data, key, label }) => (
            <div key={title} className="bg-white rounded-lg p-4 shadow">
              <h3 className="text-sm font-bold text-center mb-3">{title}</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-red-700">
                    <th className="text-left text-xs uppercase text-gray-600 py-2">Player</th>
                    <th className="text-center text-xs uppercase text-gray-600 py-2">{label}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(({ player, stats }) => player && (
                    <tr key={player.id} className="border-b border-gray-100">
                      <td className="py-2 text-sm">{player.name}</td>
                      <td className="py-2 text-sm text-center font-bold text-red-700">{stats[key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Player Cards */}
        <div className="bg-white rounded-lg p-5 mb-5 shadow">
          <h2 className="text-lg font-bold mb-4">Squad</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {players.map(player => {
              const s = playerStats[player.id] ?? {};
              return (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className="bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-lg p-3 text-center transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    {player.photo_url
                      ? <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                      : <span className="text-2xl">👤</span>
                    }
                  </div>
                  <div className="text-xs text-gray-400">#{player.squad_number ?? '—'}</div>
                  <div className="font-semibold text-sm text-gray-800">{player.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {s.goals ?? 0}G · {s.assists ?? 0}A
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Season Player Stats Table */}
        <div className="bg-white rounded-lg p-5 mb-5 shadow overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Season Player Statistics</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 border-b-2 border-red-700"></th>
                {players.map(p => (
                  <th key={p.id} className="text-center p-2 border-b-2 border-red-700 font-semibold">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Appearances',       key: 'appearances',   cls: 'stat-appearances' },
                { label: 'Goals',             key: 'goals',         cls: 'stat-goals'       },
                { label: 'Assists',           key: 'assists',       cls: 'stat-assists'     },
                { label: 'GK Apps',           key: 'gkAppearances', cls: 'stat-gk'          },
                { label: "Player's Player",   key: 'pom',           cls: 'highlight'        },
              ].map(({ label, key, cls }) => (
                <tr key={label} className="border-b">
                  <td className="p-2 font-semibold text-gray-600 whitespace-nowrap">{label}</td>
                  {players.map(p => {
                    const val = playerStats[p.id]?.[key] ?? 0;
                    return (
                      <td key={p.id} className="text-center p-2">
                        {val > 0 ? <span className={cls}>{val}</span> : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Match Cards */}
        {matches.map(match => {
          const result = getResult(match);
          const mStats = statsForMatch(match.id);
          const isExpanded = expandedMatch === match.id;

          return (
            <div key={match.id} className="bg-white rounded-lg mb-4 shadow overflow-hidden">
              <div
                className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
              >
                <div className="text-xs text-gray-600 mb-2">
                  {new Date(match.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="text-lg font-semibold">
                    {match.home ? 'Rosario' : match.opponent} vs {match.home ? match.opponent : 'Rosario'}
                  </div>
                  <div className={`text-2xl font-bold px-4 py-1 rounded text-white
                    ${result === 'win' ? 'bg-green-500' : result === 'loss' ? 'bg-red-500' : 'bg-orange-500'}`}>
                    {match.score_for} – {match.score_against}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2">📍 {match.location}</div>
              </div>

              {isExpanded && (
                <div className="p-5 border-t-2 border-red-700">
                  <h3 className="text-base font-bold mb-4">Player Statistics</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 border-b-2 border-red-700"></th>
                          {players.map(p => (
                            <th key={p.id} className="text-center p-2 border-b-2 border-red-700 font-semibold">{p.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Minutes', render: s => s?.mins ?? 0 },
                          { label: 'Goals',   render: s => s?.goals > 0 ? <span className="highlight">{s.goals}</span> : '-' },
                          { label: 'Assists', render: s => s?.assists > 0 ? <span className="highlight">{s.assists}</span> : '-' },
                          { label: 'GK',      render: s => s?.gk ? '🧤' : '-' },
                          { label: "Player's Player", render: s => s?.pom ? '⭐' : '-' },
                          { label: 'Sub',     render: s => s?.sub ? '🔄' : '-' },
                        ].map(({ label, render }) => (
                          <tr key={label} className="border-b">
                            <td className="p-2 font-semibold text-gray-600 whitespace-nowrap">{label}</td>
                            {players.map(p => (
                              <td key={p.id} className="text-center p-2">{render(mStats[p.id])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Player Profile Modal */}
      {selectedPlayer && (
        <PlayerProfile
          player={selectedPlayer}
          stats={playerStats[selectedPlayer.id]}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {/* Admin Login Modal */}
      {showLoginModal && (
        <AdminLogin
          onSuccess={handleLoginSuccess}
          onCancel={() => setShowLoginModal(false)}
        />
      )}

      {/* Admin Screen */}
      {showAdminScreen && (
        <AdminScreen
          players={players}
          onClose={() => setShowAdminScreen(false)}
          onMatchSaved={fetchAll}
        />
      )}
    </div>
  );
};

export default App;
