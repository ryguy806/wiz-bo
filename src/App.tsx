import "./App.css"
import { useGameState } from "./hooks/useGameState"
import SetupScreen from "./components/SetupScreen/SetupScreen"
import GameBoard from "./components/GameBoard/GameBoard"
import MagicBackground from "./components/MagicEffects/MagicBackgorund"
import MistBackground from "./components/MagicEffects/MistBackground"
import { div } from "three/tsl"

const App = () => {
    const { gameState, startGame, playCard, discardCard, passTurn, resetGame } = useGameState()

    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    if (!gameState.gameStarted) {
        return (<div onContextMenu={handleContextMenu}><SetupScreen onStart={startGame} /></div>)
    }

    return (
        <div onContextMenu={handleContextMenu}>
            <MistBackground/>
            <MagicBackground/>
            <GameBoard
                gameState={gameState}
                onPlayCard={playCard}
                onDiscard={discardCard}
                onPassTurn={passTurn}
                onNewGame={resetGame}
            />
        </div>
    )
}

export default App