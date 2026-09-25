import { ArmedScreen } from './components/ArmedScreen'
import { CooldownScreen } from './components/CooldownScreen'
import { IdleScreen } from './components/IdleScreen'
import { RacingScreen } from './components/RacingScreen'
import { ResolvedScreen } from './components/ResolvedScreen'
import { useRace } from './hooks/useRace'

export default function App() {
  const { state, dispatch, getPlayerElapsed, getAgentElapsed } = useRace()

  return (
    <div className="app">
      <div className="app__glow" aria-hidden />
      <main className="app__main">
        {state.phase === 'idle' && (
          <IdleScreen onStart={() => dispatch({ type: 'ARM' })} />
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

        {(state.phase === 'racing' || state.phase === 'paused') && (
          <RacingScreen
            state={state}
            getPlayerElapsed={getPlayerElapsed}
            getAgentElapsed={getAgentElapsed}
            onTap={(row, col) => dispatch({ type: 'TAP', row, col })}
            onAgentDone={() => dispatch({ type: 'AGENT_DONE' })}
            onPause={() => dispatch({ type: 'PAUSE' })}
            onResume={() => dispatch({ type: 'RESUME' })}
            onExit={() => dispatch({ type: 'EXIT' })}
          />
        )}

        {state.phase === 'resolved' && (
          <ResolvedScreen
            state={state}
            onRematch={() => dispatch({ type: 'REMATCH' })}
            onDone={() => dispatch({ type: 'DONE' })}
          />
        )}

        {state.phase === 'cooldown' && (
          <CooldownScreen endsAt={state.cooldownEndsAt} />
        )}
      </main>
      <footer className="app__footer">Stack Rush V1 · localStorage only</footer>
    </div>
  )
}
