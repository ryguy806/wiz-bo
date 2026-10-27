import { useState } from "react"
import type { GameState, Player } from "../helpers/types"
import { createDeck } from "../helpers/gameStateHelper"

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState>({
        players: [],
        currentPlayer: 0,
        drawPile: [],
        buildingPiles: [],
        gameStarted: false,
        winner: null
    })

    const startGame = (playerNames: string[]) => {
        const deck = createDeck()
        const players: Player[] = playerNames.map((name, i) => ({
            id: `player-${i}`,
            name,
            stockPile: deck.splice(0, 30),
            hand: [],
            discardPiles: [[], [], [], []]
        }))

        setGameState({
            players,
            currentPlayer: 0,
            drawPile: deck,
            buildingPiles: [[], [], [], []],
            gameStarted: true,
            winner: null
        })
    }

     return { gameState, startGame }
}