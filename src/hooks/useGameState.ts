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

    const startTurn = () => {
    setGameState((prev) => {
      const activePlayer = prev.players[prev.currentPlayer];
      const neededCards = 5 - activePlayer.hand.length;
      if (neededCards <= 0) return prev;

      const newDrawPile = [...prev.drawPile];
      const drawnCards = newDrawPile.splice(0, neededCards);
      
      return {
        ...prev,
        drawPile: newDrawPile,
        players: prev.players.map((player, idx) => 
          idx === prev.currentPlayer 
            ? { ...player, hand: [...player.hand, ...drawnCards] } 
            : player
        ),
      };
    });
  };

     return { gameState, startGame, startTurn }
}