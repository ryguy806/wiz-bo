import { useState } from "react"
import type { CardSource, GameState } from "../helpers/types"
import {
    createInitialState,
    createNewGame,
    discardCard as discardCardLogic,
    passTurn as passTurnLogic,
    playCard as playCardLogic,
} from "../helpers/gameStateHelper"

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState>(createInitialState)

    const startGame = (playerNames: string[]) => {
        setGameState(createNewGame(playerNames))
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