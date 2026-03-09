const winners = [
  { board: 'Gaming Setup Giveaway', handle: '@lucky_player_42', xp: '+500 XP', prestige: 'Prestige I' },
  { board: 'Weekend Escape', handle: '@travelqueen', xp: '+300 XP', prestige: 'Bronze' }
];

export default function WinnersPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Winner Screen Data</h1>
      <div className="rounded-lg bg-white p-4 shadow">
        <ul className="space-y-2">
          {winners.map((winner) => (
            <li key={`${winner.board}-${winner.handle}`} className="rounded border p-3">
              <p className="font-semibold">{winner.board}</p>
              <p className="text-sm text-slate-600">{winner.handle} • {winner.xp} • {winner.prestige}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
