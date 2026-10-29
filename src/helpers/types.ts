export type CardValue = number | "WIZ-BO"

export interface Card {
    id: string
    value: CardValue
}

export interface Player {
    id: string
    name: string
    stockPile: Card[]
    hand: Card[]
    discardPiles: Card[][]
}

export interface GameState {
    players: Player[]
    currentPlayer: number
    drawPile: Card[]
    buildingPiles: Card[][]
    // Finished (1-12) building piles, reshuffled into the draw pile when it runs out
    completedPile: Card[]
    gameStarted: boolean
    winner: string | null
}

// Where a card being played comes from. The top card of a pile is always the last element.
export type CardSource =
    | { from: "stock" }
    | { from: "hand"; cardId: string }
    | { from: "discard"; pile: number }