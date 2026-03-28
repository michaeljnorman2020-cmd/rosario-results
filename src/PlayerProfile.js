import React from 'react';

const POSITION_COLOURS = {
  'Defender':        'bg-blue-100 text-blue-800',
  'Central Midfield':'bg-green-100 text-green-800',
  'Left Midfield':   'bg-purple-100 text-purple-800',
  'Right Midfield':  'bg-orange-100 text-orange-800',
  'Striker':         'bg-red-100 text-red-800',
};

const PlayerProfile = ({ player, stats, onClose }) => {
  if (!player) return null;

  const age = player.date_of_birth
    ? Math.floor((new Date() - new Date(player.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header strip */}
        <div className="bg-gradient-to-br from-red-700 to-red-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-white opacity-70 hover:opacity-100 text-2xl leading-none"
          >
            ×
          </button>

          <div className="flex items-center gap-4">
            {/* Photo or placeholder */}
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white border-opacity-50">
              {player.photo_url
                ? <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                : <span className="text-4xl">👤</span>
              }
            </div>

            <div>
              <div className="text-sm opacity-75 font-medium">
                #{player.squad_number ?? '—'}
              </div>
              <h2 className="text-2xl font-bold">{player.name}</h2>
              {age !== null && (
                <div className="text-sm opacity-80 mt-0.5">Age {age}</div>
              )}
            </div>
          </div>

          {/* Positions */}
          {player.positions?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {player.positions.map(pos => (
                <span
                  key={pos}
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${POSITION_COLOURS[pos] ?? 'bg-gray-100 text-gray-800'}`}
                >
                  {pos}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Season Stats
          </h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats?.appearances ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Apps</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats?.goals ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Goals</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">{stats?.assists ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Assists</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats?.gkAppearances ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">GK</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">{stats?.pom ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">⭐ Player's Player</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {stats?.appearances > 0
                  ? ((stats.goals + stats.assists) / stats.appearances).toFixed(1)
                  : '—'}
              </div>
              <div className="text-xs text-gray-500 mt-1">G+A per game</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
