import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import PlayerProfile from './PlayerProfile';

const App = () => {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchStats, setMatchStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedMatch, setExpandedMatch] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // ── Fetch all data ──────────────────────────────────────────
  useEffect(() => {
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

    fetchAll();
  }, []);

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

  // Stats for a specific match, keyed by player_id
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
      <div className="bg-gradient-to-br from-red-700 to-red-900 text-white py-6 text-center shadow-md">
        <h1 className="text-2xl font-bold mb-1">West Bridgford Colts U10 Rosario</h1>
        <div className="text-sm opacity-90">Season 2025/26 Results & Stats</div>
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
                { label: 'Appearances', key: 'appearances', cls: 'stat-appearances' },
                { label: 'Goals',       key: 'goals',       cls: 'stat-goals'       },
                { label: 'Assists',     key: 'assists',     cls: 'stat-assists'     },
                { label: 'GK Apps',     key: 'gkAppearances', cls: 'stat-gk'        },
                { label: "Player's Player", key: 'pom',     cls: 'highlight'        },
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
    </div>
  );
};

export default App;
