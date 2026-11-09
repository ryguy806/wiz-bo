import { useEffect, useState } from "react"
import type { CardSource, GameState } from "../helpers/types"
import {
    createInitialState,
    createNewGame,
    discardCard as discardCardLogic,
    passTurn as passTurnLogic,
    playCard as playCardLogic,
} from "../helpers/gameStateHelper"
import { getComputerMove } from "../helpers/computerPlayer"

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState>(createInitialState)

    useEffect(() => {
    if (!gameState.gameStarted || gameState.winner) return
    if (!gameState.players[gameState.currentPlayer].isComputer) return

    const timer = setTimeout(() => {
        const move = getComputerMove(gameState)
        if (move.type === "play") playCard(move.source, move.buildingIndex)
        else if (move.type === "discard") discardCard(move.cardId, move.discardIndex)
        else passTurn()
    }, 800)

    return () => clearTimeout(timer)
}, [gameState])

    const startGame = (playerNames: string[], computerCount = 0) => {
        setGameState(createNewGame(playerNames, computerCount))
    }

    // Play a card (stock top, hand card, or discard top) onto a building pile
    const playCard = (source: CardSource, buildingIndex: number) => {
        setGameState((prev) => playCardLogic(prev, source, buildingIndex))
    }

    // Discard a hand card onto one of the current player's discard piles; this ends the turn
    const discardCard = (cardId: string, discardIndex: number) => {
        setGameState((prev) => discardCardLogic(prev, cardId, discardIndex))
    }

    const passTurn = () => {
        setGameState((prev) => passTurnLogic(prev))
    }

    const resetGame = () => {
        setGameState(createInitialState())
    }

    return { gameState, startGame, playCard, discardCard, passTurn, resetGame }
}