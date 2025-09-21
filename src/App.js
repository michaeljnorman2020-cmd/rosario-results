import React, { useState } from 'react';

const App = () => {
  // Player names in alphabetical order
  const players = ['Chester', 'Ethan', 'George', 'Jimmy', 'Leo', 'Noah', 'Oliver', 'Salar', 'Seb'];
  
  // Match data - ADD NEW MATCHES HERE
  const [matches] = useState([
    {
      date: 'Sunday, 7th September 2025',
      sortDate: '2025-09-07',
      opponent: 'Eastwood Athletic Atalanta',
      home: true,
      score: { for: 5, against: 2 },
      location: 'Gresham Grass',
      stats: {
        Chester: { mins: 37.5, goals: 1, assists: 1, gk: true, sub: false, gkMins: 12.5, pom: false},
        Ethan: { mins: 37.5, goals: 0, assists: 0, gk: false, sub: false, gkMins: 0, pom: false},
        George: { mins: 37.5, goals: 1, assists: 0, gk: false, sub: false, gkMins: 0, pom: false},
        Jimmy: { mins: 50, goals: 0, assists: 3, gk: true, sub: false, gkMins: 25, pom: false},
        Leo: { mins: 37.5, goals: 0, assists: 0, gk: false, sub: false, gkMins: 0, pom: false},
        Noah: { mins: 37.5, goals: 0, assists: 0, gk: false, sub: false, gkMins: 0, pom: false},
        Oliver: { mins: 37.5, goals: 3, assists: 0, gk: false, sub: true, gkMins: 0, pom: true},
        Salar: { mins: 37.5, goals: 0, assists: 0, gk: true, sub: false, gkMins: 12.5, pom: false},
        Seb: { mins: 37.5, goals: 0, assists: 0, gk: false, sub: true, gkMins: 0, pom: false}
      }
    },
    {
      date: 'Sunday, 14th September 2025',
      sortDate: '2025-09-14',
      opponent: 'Cotgrave White',
      home: false,
      score: { for: 10, against: 0 },
      location: 'Cotgrave Grass',
      stats: {
        Chester: { mins: 50, goals: 3, assists: 2, gk: true, sub: false, gkMins: 12.5, pom: true},
        Ethan: { mins: 50, goals: 0, assists: 2, gk: false, sub: false, gkMins: 0, pom: false},
        George: { mins: 0, goals: 0, assists: 0, gk: false, sub: false, gkMins: 0, pom: false},
        Jimmy: { mins: 50, goals: 1, assists: 1, gk: true, sub: false, gkMins: 25, pom: false},
        Leo: { mins: 50, goals: 2, assists: 1, gk: true, sub: false, gkMins: 12.5, pom: false},
        Noah: { mins: 50, goals: 1, assists: 2, gk: false, sub: false, gkMins: 0, pom: false},
        Oliver: { mins: 50, goals: 2, assists: 0, gk: false, sub: false, gkMins: 0, pom: false},
        Salar: { mins: 0, goals: 0, assists: 0, gk: false, sub: false, gkMins: 0, pom: false},
        Seb: { mins: 50, goals: 0, assists: 1, gk: false, sub: false, gkMins: 0, pom: false}
      }
    },
    {
      date: 'Sunday, 21st September 2025',
      sortDate: '2025-09-21',
      opponent: 'Coalville Town Ravenettes',
      home: true,
      score: { for: 2, against: 1 },
      location: 'Regatta Way Grass',
      stats: {
        Chester: { mins: 37.5, goals: 0, assists: 0, gk: true, sub: false, gkMins: 0, pom: false},
        Ethan: { mins: 37.5, goals: 0, assists: 0, gk: false, sub: false, gkMins: 0, pom: false},
        George: { mins: 37.5, goals: 0, assists: 0, gk: false, sub: false, gkMins: 0, pom: false},
        Jimmy: { mins: 50, goals: 1, assists: 1, gk: true, sub: false, gkMins: 25, pom: true},
        Leo: { mins: 37.5, goals: 0, assists: 0, gk: true, sub: false, gkMins: 12.5, pom: false},
        Noah: { mins: 37.5, goals: 1, assists: 1, gk: false, sub: false, gkMins: 0, pom: false},
        Oliver: { mins: 37.5, goals: 0, assists: 0, gk: false, sub: false, gkMins: 0, pom: false},
        Salar: { mins: 37.5, goals: 0, assists: 0, gk: false, sub: false, gkMins: 12.5, pom: false},
        Seb: { mins: 37.5, goals: 0, assists: 0, gk: false, sub: false, gkMins: 0, pom: false}
      }
    }
    // ADD NEW MATCHES HERE - just copy the format above
  ]);
  
  const [expandedMatch, setExpandedMatch] = useState(null);
  
  // Calculate season stats
  const calculateSeasonStats = () => {
    let stats = {
      played: matches.length,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0
    };
    
    matches.forEach(match => {
      stats.goalsFor += match.score.for;
      stats.goalsAgainst += match.score.against;
      
      if (match.score.for > match.score.against) stats.won++;
      else if (match.score.for === match.score.against) stats.drawn++;
      else stats.lost++;
    });
    
    return stats;
  };
  
  // Calculate player stats
  const calculatePlayerStats = () => {
    let playerStats = {};
    
    players.forEach(player => {
      playerStats[player] = {
        appearances: 0,
        goals: 0,
        assists: 0,
        gkAppearances: 0
      };
    });
    
    matches.forEach(match => {
      Object.keys(match.stats).forEach(player => {
        const stats = match.stats[player];
        if (stats.mins > 0) {
          playerStats[player].appearances++;
          playerStats[player].goals += stats.goals;
          playerStats[player].assists += stats.assists;
          if (stats.gk) playerStats[player].gkAppearances++;
        }
      });
    });
    
    return playerStats;
  };
  
  // Calculate goalkeeper games with fractions
  const calculateGkGames = () => {
    let gkStats = {};
    
    matches.forEach(match => {
      Object.keys(match.stats).forEach(player => {
        const stats = match.stats[player];
        if (stats.gk && stats.gkMins > 0) {
          if (!gkStats[player]) {
            gkStats[player] = { occurrences: 0, totalTime: 0 };
          }
          gkStats[player].occurrences++;
          gkStats[player].totalTime += stats.gkMins / 50; // gkMins divided by 50 mins per game
        }
      });
    });
    
    return gkStats;
  };
  
  const seasonStats = calculateSeasonStats();
  const playerStats = calculatePlayerStats();
  const gkGames = calculateGkGames();
  
  // Get top scorers/assisters
  const getTopScorers = () => {
    return Object.entries(playerStats)
      .filter(([_, stats]) => stats.goals > 0)
      .sort((a, b) => b[1].goals - a[1].goals)
      .slice(0, 3);
  };
  
  const getTopAssisters = () => {
    return Object.entries(playerStats)
      .filter(([_, stats]) => stats.assists > 0)
      .sort((a, b) => b[1].assists - a[1].assists)
      .slice(0, 3);
  };
  
  const getTopGk = () => {
    return Object.entries(gkGames)
      .sort((a, b) => b[1].occurrences - a[1].occurrences || b[1].totalTime - a[1].totalTime)
      .slice(0, 3);
  };
  
  const getMatchResult = (match) => {
    if (match.score.for > match.score.against) return 'win';
    if (match.score.for < match.score.against) return 'loss';
    return 'draw';
  };
  
  const toggleMatch = (index) => {
    setExpandedMatch(expandedMatch === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .stat-appearances { color: #2196F3; font-weight: 600; }
        .stat-goals { color: #4CAF50; font-weight: 600; }
        .stat-assists { color: #FF9800; font-weight: 600; }
        .stat-gk { color: #9C27B0; font-weight: 600; }
        .highlight { color: #DC143C; font-weight: 600; }
      `}</style>
      
      {/* Header */}
      <div className="bg-gradient-to-br from-red-700 to-red-900 text-white py-6 text-center shadow-md">
        <h1 className="text-2xl font-bold mb-1">West Bridgford Colts U10 Rosario</h1>
        <div className="text-sm opacity-90">Season 2024/25 Results & Stats</div>
      </div>
      
      <div className="max-w-6xl mx-auto p-5">
        {/* Season Summary */}
        <div className="bg-white rounded-lg p-5 mb-5 shadow">
          <h2 className="text-xl font-bold mb-4">Season Summary</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-3xl font-bold text-red-700">{seasonStats.played}</div>
              <div className="text-xs uppercase text-gray-600 mt-1">Played</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-3xl font-bold text-red-700">{seasonStats.won}</div>
              <div className="text-xs uppercase text-gray-600 mt-1">Won</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-3xl font-bold text-red-700">{seasonStats.drawn}</div>
              <div className="text-xs uppercase text-gray-600 mt-1">Drawn</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-3xl font-bold text-red-700">{seasonStats.lost}</div>
              <div className="text-xs uppercase text-gray-600 mt-1">Lost</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-3xl font-bold text-red-700">{seasonStats.goalsFor}</div>
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
              <div className="text-xs uppercase text-gray-600 mt-1">Goal Difference</div>
            </div>
          </div>
        </div>
        
        {/* Leaderboards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-sm font-bold text-center mb-3">⚽ Top Scorers</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-red-700">
                  <th className="text-left text-xs uppercase text-gray-600 py-2">Player</th>
                  <th className="text-center text-xs uppercase text-gray-600 py-2">Goals</th>
                </tr>
              </thead>
              <tbody>
                {getTopScorers().map(([player, stats]) => (
                  <tr key={player} className="border-b border-gray-100">
                    <td className="py-2 text-sm">{player}</td>
                    <td className="py-2 text-sm text-center font-bold text-red-700">{stats.goals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-sm font-bold text-center mb-3">🎯 Top Assists</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-red-700">
                  <th className="text-left text-xs uppercase text-gray-600 py-2">Player</th>
                  <th className="text-center text-xs uppercase text-gray-600 py-2">Assists</th>
                </tr>
              </thead>
              <tbody>
                {getTopAssisters().map(([player, stats]) => (
                  <tr key={player} className="border-b border-gray-100">
                    <td className="py-2 text-sm">{player}</td>
                    <td className="py-2 text-sm text-center font-bold text-red-700">{stats.assists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-sm font-bold text-center mb-3">🧤 Goalkeeper Games</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-red-700">
                  <th className="text-left text-xs uppercase text-gray-600 py-2">Player</th>
                  <th className="text-center text-xs uppercase text-gray-600 py-2">Games</th>
                </tr>
              </thead>
              <tbody>
                {getTopGk().map(([player, stats]) => (
                  <tr key={player} className="border-b border-gray-100">
                    <td className="py-2 text-sm">{player}</td>
                    <td className="py-2 text-sm text-center font-bold text-red-700">
                      {stats.occurrences} ({stats.totalTime.toFixed(2)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Season Player Statistics */}
        <div className="bg-white rounded-lg p-5 mb-5 shadow overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Season Player Statistics</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 border-b-2 border-red-700"></th>
                {players.map(player => (
                  <th key={player} className="text-center p-2 border-b-2 border-red-700 font-semibold">
                    {player}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-semibold text-gray-600">Appearances</td>
                {players.map(player => (
                  <td key={player} className="text-center p-2">
                    {playerStats[player].appearances > 0 && (
                      <span className="stat-appearances">{playerStats[player].appearances}</span>
                    )}
                    {playerStats[player].appearances === 0 && '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-2 font-semibold text-gray-600">Goals</td>
                {players.map(player => (
                  <td key={player} className="text-center p-2">
                    {playerStats[player].goals > 0 && (
                      <span className="stat-goals">{playerStats[player].goals}</span>
                    )}
                    {playerStats[player].goals === 0 && '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-2 font-semibold text-gray-600">Assists</td>
                {players.map(player => (
                  <td key={player} className="text-center p-2">
                    {playerStats[player].assists > 0 && (
                      <span className="stat-assists">{playerStats[player].assists}</span>
                    )}
                    {playerStats[player].assists === 0 && '-'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-semibold text-gray-600">GK Appearances</td>
                {players.map(player => (
                  <td key={player} className="text-center p-2">
                    {playerStats[player].gkAppearances > 0 && (
                      <span className="stat-gk">{playerStats[player].gkAppearances}</span>
                    )}
                    {playerStats[player].gkAppearances === 0 && '-'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Match Cards */}
        {matches
          .map((match, index) => ({ ...match, originalIndex: index }))
          .sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate))
          .map((match, displayIndex) => (
            <div key={match.originalIndex} className="bg-white rounded-lg mb-4 shadow overflow-hidden">
              <div 
                className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleMatch(match.originalIndex)}
              >
                <div className="text-xs text-gray-600 mb-2">{match.date}</div>
                <div className="flex justify-between items-center flex-wrap">
                  <div className="text-lg font-semibold">
                    {match.home ? 'Rosario' : match.opponent} vs {match.home ? match.opponent : 'Rosario'}
                  </div>
                  <div className={`text-2xl font-bold px-4 py-1 rounded text-white
                    ${getMatchResult(match) === 'win' ? 'bg-green-500' : 
                      getMatchResult(match) === 'loss' ? 'bg-red-500' : 'bg-orange-500'}`}>
                    {match.score.for} - {match.score.against}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2">📍 {match.location}</div>
              </div>
              
              {expandedMatch === match.originalIndex && (
                <div className="p-5 border-t-2 border-red-700">
                  <h3 className="text-base font-bold mb-4">Player Statistics</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 border-b-2 border-red-700"></th>
                          {players.map(player => (
                            <th key={player} className="text-center p-2 border-b-2 border-red-700 font-semibold">
                              {player}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-semibold text-gray-600">Minutes</td>
                          {players.map(player => (
                            <td key={player} className="text-center p-2">{match.stats[player].mins}</td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold text-gray-600">Goals</td>
                          {players.map(player => (
                            <td key={player} className="text-center p-2">
                              {match.stats[player].goals > 0 ? (
                                <span className="highlight">{match.stats[player].goals}</span>
                              ) : '-'}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold text-gray-600">Assists</td>
                          {players.map(player => (
                            <td key={player} className="text-center p-2">
                              {match.stats[player].assists > 0 ? (
                                <span className="highlight">{match.stats[player].assists}</span>
                              ) : '-'}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-semibold text-gray-600">GK</td>
                          {players.map(player => (
                            <td key={player} className="text-center p-2">
                              {match.stats[player].gk ? '🧤' : '-'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold text-gray-600">Player's Player</td>
                          {players.map(player => (
                            <td key={player} className="text-center p-2">
                              {match.stats[player].pom ? '⭐' : '-'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold text-gray-600">Sub</td>
                          {players.map(player => (
                            <td key={player} className="text-center p-2">
                              {match.stats[player].sub ? '🔄' : '-'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default App;
