import type { Card, CardSource, GameState, Player } from "./types"

export const HAND_SIZE = 5
export const BUILDING_PILE_COUNT = 4
export const DISCARD_PILE_COUNT = 4
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6

// Official Skip-Bo rules: 30 stock cards for 2-4 players, 20 for 5-6 players
export const getStockSize = (playerCount: number): number => (playerCount <= 4 ? 30 : 20)

// Fisher-Yates shuffle (the sort(() => Math.random() - 0.5) trick is biased)
export const shuffle = <T,>(items: T[]): T[] => {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

export const createDeck = (): Card[] => {
    const deck: Card[] = []
    let idCounter = 0

    // Adds in cards 1-12, 12 times
    for (let i = 1; i <= 12; i++) {
        for (let j = 0; j < 12; j++) {
            deck.push({ id: `card-${idCounter++}`, value: i })
        }
    }

    // Adds in 18 "Wiz-Bo" cards
    for (let j = 0; j < 18; j++) {
        deck.push({ id: `card-${idCounter++}`, value: "WIZ-BO" })
    }

    // returns the shuffled deck
    return shuffle(deck)
}

// Checks if a card can be played legally on a pile.
export const validatePlay = (card: Card, target: Card[]): boolean => {
    // "Wiz-Bo" cards are always accepted
    if (card.value === "WIZ-BO") return true

    // Playing on an empty pile
    if (target.length === 0) return card.value === 1

    const topCard = target[target.length - 1]
    const expectedValue = topCard.value === "WIZ-BO" ? target.length + 1 : (topCard.value as number) + 1

    return card.value === expectedValue
}

// The number a building pile needs next (its top card may be a Wiz-Bo standing in for a number)
export const getNextNeeded = (pile: Card[]): number => pile.length + 1

export const getTextColor = (number: number): string => {
    switch (number) {
        case 1:
        case 2:
        case 3:
            return "text-red-500"
        case 4:
        case 5:
        case 6:
            return "text-blue-500"
        case 7:
        case 8:
        case 9:
            return "text-purple-500"
        case 10:
        case 11:
        case 12:
            return "text-green-500"
        default:
            return "text-black"
    }
}

const drawCards = (drawPile: Card[], completedPile: Card[], count: number) => {
    let draw = [...drawPile]
    let completed = [...completedPile]
    const drawn: Card[] = []

    while (drawn.length < count) {
        if (draw.length === 0) {
            if (completed.length === 0) break
            draw = shuffle(completed)
            completed = []
        }
        drawn.push(draw.shift() as Card)
    }

    return { drawPile: draw, completedPile: completed, drawn }
}

const updateCurrentPlayer = (state: GameState, update: (player: Player) => Player): Player[] =>
    state.players.map((player, idx) => (idx === state.currentPlayer ? update(player) : player))

// Fills the current player's hand back up to 5 cards
export const refillHand = (state: GameState): GameState => {
    const player = state.players[state.currentPlayer]
    const needed = HAND_SIZE - player.hand.length
    if (needed <= 0) return state

    const { drawPile, completedPile, drawn } = drawCards(state.drawPile, state.completedPile, needed)

    return {
        ...state,
        drawPile,
        completedPile,
        players: updateCurrentPlayer(state, (p) => ({ ...p, hand: [...p.hand, ...drawn] })),
    }
}

export const createInitialState = (): GameState => ({
    players: [],
    currentPlayer: 0,
    drawPile: [],
    buildingPiles: [],
    completedPile: [],
    gameStarted: false,
    winner: null,
})

export const createNewGame = (humanNames: string[], computerCount: number = 0): GameState => {
    const computerNames = Array.from({ length: computerCount }, (_, i) =>
        computerCount === 1 ? "Computer" : `Computer ${i + 1}`
    )
    const playerNames = [...humanNames, ...computerNames]

    const deck = createDeck()
    const stockSize = getStockSize(playerNames.length)

    const players: Player[] = playerNames.map((name, i) => ({
        id: `player-${i}`,
        name,
        stockPile: deck.splice(0, stockSize),
        hand: [],
        discardPiles: Array.from({ length: DISCARD_PILE_COUNT }, () => [] as Card[]),
        isComputer: i >= humanNames.length,
    }))

    return refillHand({
        players,
        currentPlayer: 0,
        drawPile: deck,
        buildingPiles: Array.from({ length: BUILDING_PILE_COUNT }, () => [] as Card[]),
        completedPile: [],
        gameStarted: true,
        winner: null,
    })
}

// Finds the card a source points at (the top card for stock and discard piles)
export const getSourceCard = (player: Player, source: CardSource): Card | undefined => {
    switch (source.from) {
        case "stock":
            return player.stockPile[player.stockPile.length - 1]
        case "hand":
            return player.hand.find((c) => c.id === source.cardId)
        case "discard": {
            const pile = player.discardPiles[source.pile]
            return pile?.[pile.length - 1]
        }
    }
}

// Plays a card from the stock pile, hand, or a discard pile onto a building pile
export const playCard = (state: GameState, source: CardSource, buildingIndex: number): GameState => {
    if (state.winner || !state.gameStarted) return state

    const player = state.players[state.currentPlayer]
    const card = getSourceCard(player, source)
    const target = state.buildingPiles[buildingIndex]
    if (!card || !target || !validatePlay(card, target)) return state

    // Remove the card from where it came from
    const updatedPlayer: Player = { ...player }
    if (source.from === "stock") {
        updatedPlayer.stockPile = player.stockPile.slice(0, -1)
    } else if (source.from === "hand") {
        updatedPlayer.hand = player.hand.filter((c) => c.id !== card.id)
    } else {
        updatedPlayer.discardPiles = player.discardPiles.map((pile, i) =>
            i === source.pile ? pile.slice(0, -1) : pile
        )
    }

    // Add it to the building pile. A pile that reaches 12 is cleared away for reshuffling later
    const newPile = [...target, card]
    const pileComplete = newPile.length === 12
    const buildingPiles = state.buildingPiles.map((pile, i) =>
        i === buildingIndex ? (pileComplete ? [] : newPile) : pile
    )
    const completedPile = pileComplete ? [...state.completedPile, ...newPile] : state.completedPile

    let next: GameState = {
        ...state,
        buildingPiles,
        completedPile,
        players: updateCurrentPlayer(state, () => updatedPlayer),
    }

    // Emptying the stock pile wins the game
    if (updatedPlayer.stockPile.length === 0) {
        return { ...next, winner: updatedPlayer.name }
    }

    // Played all 5 cards from the hand: draw 5 more and keep going
    if (updatedPlayer.hand.length === 0) {
        next = refillHand(next)
    }

    return next
}

// Moves play to the next player, who draws back up to 5 cards
const advanceTurn = (state: GameState): GameState =>
    refillHand({ ...state, currentPlayer: (state.currentPlayer + 1) % state.players.length })

// Discarding a card from the hand ends the turn
export const discardCard = (state: GameState, cardId: string, discardIndex: number): GameState => {
    if (state.winner || !state.gameStarted) return state

    const player = state.players[state.currentPlayer]
    const card = player.hand.find((c) => c.id === cardId)
    if (!card || discardIndex < 0 || discardIndex >= DISCARD_PILE_COUNT) return state

    const updated: GameState = {
        ...state,
        players: updateCurrentPlayer(state, (p) => ({
            ...p,
            hand: p.hand.filter((c) => c.id !== cardId),
            discardPiles: p.discardPiles.map((pile, i) => (i === discardIndex ? [...pile, card] : pile)),
        })),
    }

    return advanceTurn(updated)
}

// Rare fallback: the draw pile is exhausted and the hand is empty, so there is nothing to discard
export const canPassTurn = (state: GameState): boolean => {
    if (state.winner || !state.gameStarted) return false
    return state.players[state.currentPlayer].hand.length === 0
}

export const passTurn = (state: GameState): GameState => (canPassTurn(state) ? advanceTurn(state) : state)