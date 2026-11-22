export type CardValue = number | "WIZ-BO"

export type Card = {
    id: string
    value: CardValue
}

export type Player = {
    id: string
    name: string
    stockPile: Card[]
    hand: Card[]
    discardPiles: Card[][]
    isComputer: boolean
}

export type GameState = {
    players: Player[]
    currentPlayer: number
    pendingDraws: number
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

export type ServerToClientEvents = {
    gameUpdate: (state: GameState) => void
    playerJoined: (player: Player) => void
    error: (message: string) => void
}

export type ClientToServerEvents = {
    joinRoom: (roomId: string, playerName: string) => void
    leaveRoom: () => void
}