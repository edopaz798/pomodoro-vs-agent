import { useState } from 'react'
import { ArmedScreen } from './components/ArmedScreen'
import { CooldownScreen } from './components/CooldownScreen'
import { IdleScreen } from './components/IdleScreen'
import { RacingScreen } from './components/RacingScreen'
import { ResolvedScreen } from './components/ResolvedScreen'
import { TopBar } from './components/TopBar'
import { isStorageAvailable } from './game/storage'
import { useRace } from './hooks/useRace'

export default function App() {
  const { state, dispatch, getPlayerElapsed, getAgentElapsed, stats, resetStats, restored } =
    useRace()
  const [storageOk] = useState(isStorageAvailable)
  const racing = state.phase === 'racing' || state.phase === 'paused'

  return (
    <div className={`app${racing ? ' app--wide' : ''}`}>
      <div className="app__glow" aria-hidden />
      <TopBar phase={state.phase} />
      <main className="app__main">
        {state.phase === 'idle' && (
          <IdleScreen
            stats={stats}
            onResetStats={resetStats}
            onStart={() => dispatch({ type: 'ARM' })}
          />
        )}

        {state.phase === 'armed' && (
          <ArmedScreen
            packId={state.packId}
            taskLabel={state.taskLabel}
            onPack={(packId) => dispatch({ type: 'SET_PACK', packId })}
            onTask={(taskLabel) => dispatch({ type: 'SET_TASK', taskLabel })}
            onGo={() => dispatch({ type: 'GO' })}
            onBack={() => dispatch({ type: 'IDLE' })}
          />
        )}

        {racing && (
          <RacingScreen
            state={state}
            restored={restored}
            getPlayerElapsed={getPlayerElapsed}
            getAgentElapsed={getAgentElapsed}
            onTap={(row, col) => dispatch({ type: 'TAP', row, col })}
            onPlayerCleared={() => dispatch({ type: 'PLAYER_CLEARED' })}
            onAgentDone={() => dispatch({ type: 'AGENT_DONE' })}
            onPause={() => dispatch({ type: 'PAUSE' })}
            onResume={() => dispatch({ type: 'RESUME' })}
            onExit={() => dispatch({ type: 'EXIT' })}
          />
        )}

        {state.phase === 'resolved' && (
          <ResolvedScreen
            state={state}
            stats={stats}
            onRematch={() => dispatch({ type: 'REMATCH' })}
            onDone={() => dispatch({ type: 'DONE' })}
          />
        )}

        {state.phase === 'cooldown' && (
          <CooldownScreen
            endsAt={state.cooldownEndsAt}
            onSkip={() => dispatch({ type: 'IDLE' })}
          />
        )}
      </main>
      <footer className="app__footer">
        {storageOk ? (
          <span>Honor-system V1 · saved only in this browser</span>
        ) : (
          <span className="app__footer-warn" role="status">
            Browser storage is blocked — a refresh will reset the race.
          </span>
        )}
      </footer>
    </div>
  )
}
