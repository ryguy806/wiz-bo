import "./App.css"
import { useGameState } from "./hooks/useGameState"
import SetupScreen from "./components/SetupScreen/SetupScreen"
import GameBoard from "./components/GameBoard/GameBoard"
import MagicBackground from "./components/MagicEffects/MagicBackgorund"
import MistBackground from "./components/MagicEffects/MistBackground"

const App = () => {
    const { gameState, startGame, playCard, discardCard, passTurn, resetGame } = useGameState()

    if (!gameState.gameStarted) {
        return <SetupScreen onStart={startGame} />
    }

    return (
        <>
            <MistBackground/>
            <MagicBackground/>
            <GameBoard
                gameState={gameState}
                onPlayCard={playCard}
                onDiscard={discardCard}
                onPassTurn={passTurn}
                onNewGame={resetGame}
            />
        </>
    )
}

export default App