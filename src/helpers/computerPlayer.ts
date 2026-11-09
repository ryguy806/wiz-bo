import type { Card, CardSource, GameState, Player } from "./types"
import { DISCARD_PILE_COUNT, validatePlay } from "./gameStateHelper"

/*
 * Computer player logic for Wiz-bo.
 *
 * getComputerMove(state) is a pure function: it looks at the current state and returns ONE move.
 * Call it repeatedly (with a short delay between calls) until the turn passes to the next player.
 *
 * Strategy, in priority order:
 *  1. Play the stock card whenever it is legal (it is how you win).
 *  2. Play a card that moves a building pile closer to the stock card's value.
 *  3. Play any other legal number card, but never leave a pile needing exactly an opponent's stock card.
 *  4. Hold Wiz-Bo cards unless they unlock the stock card (or the hand is nothing but Wiz-Bos).
 *  5. Otherwise discard: keep cards we will need soon, and build tidy descending discard piles.
 */

export type ComputerMove =
    | { type: "play"; source: CardSource; buildingIndex: number }
    | { type: "discard"; cardId: string; discardIndex: number }
    | { type: "pass" }

interface PlayOption {
    source: CardSource
    card: Card
    buildingIndex: number
}

const isWild = (card: Card): boolean => card.value === "WIZ-BO"

// What a building pile needs after `card` is played on it (a completed pile of 12 resets to needing a 1)
const neededAfterPlay = (pile: Card[]): number => (pile.length + 1 === 12 ? 1 : pile.length + 2)

// Every legal play the current player could make right now
const getPlayOptions = (state: GameState, player: Player): PlayOption[] => {
    const candidates: { source: CardSource; card: Card }[] = []

    const stockTop = player.stockPile[player.stockPile.length - 1]
    if (stockTop) candidates.push({ source: { from: "stock" }, card: stockTop })

    player.hand.forEach((card) => candidates.push({ source: { from: "hand", cardId: card.id }, card }))

    player.discardPiles.forEach((pile, i) => {
        const top = pile[pile.length - 1]
        if (top) candidates.push({ source: { from: "discard", pile: i }, card: top })
    })

    const options: PlayOption[] = []
    for (const { source, card } of candidates) {
        state.buildingPiles.forEach((pile, buildingIndex) => {
            if (validatePlay(card, pile)) options.push({ source, card, buildingIndex })
        })
    }
    return options
}

// The stock cards of everyone else: leaving a pile that needs one of these hands them a free play
const getOpponentStockValues = (state: GameState): Set<number> => {
    const values = new Set<number>()
    state.players.forEach((p, i) => {
        if (i === state.currentPlayer) return
        const top = p.stockPile[p.stockPile.length - 1]
        if (top && typeof top.value === "number") values.add(top.value)
    })
    return values
}

export const getComputerMove = (state: GameState): ComputerMove => {
    const player = state.players[state.currentPlayer]
    const options = getPlayOptions(state, player)
    const opponentStock = getOpponentStockValues(state)

    const stockTop = player.stockPile[player.stockPile.length - 1]
    const stockValue = stockTop && typeof stockTop.value === "number" ? stockTop.value : null

    const helpsOpponent = (o: PlayOption) => opponentStock.has(neededAfterPlay(state.buildingPiles[o.buildingIndex]))
    const toMove = (o: PlayOption): ComputerMove => ({
        type: "play",
        source: o.source,
        buildingIndex: o.buildingIndex,
    })
    // Prefer plays that don't hand an opponent their stock card, then lower pile index for stability
    const pickBest = (list: PlayOption[]): PlayOption =>
        [...list].sort(
            (a, b) =>
                Number(helpsOpponent(a)) - Number(helpsOpponent(b)) || a.buildingIndex - b.buildingIndex
        )[0]

    // 1. Stock card: always play it if we can
    const stockPlays = options.filter((o) => o.source.from === "stock")
    if (stockPlays.length > 0) return toMove(pickBest(stockPlays))

    // 2. Plays that move a building pile toward our stock card
    if (stockValue !== null) {
        const helpful = options.filter((o) => {
            const needed = state.buildingPiles[o.buildingIndex].length + 1
            if (isWild(o.card)) return needed + 1 === stockValue // a Wiz-Bo that unlocks the stock card right now
            return (o.card.value as number) < stockValue
        })
        if (helpful.length > 0) {
            // Numbers before Wiz-Bos; then the card that gets closest to the stock value; discard piles first
            helpful.sort((a, b) => {
                const wildDiff = Number(isWild(a.card)) - Number(isWild(b.card))
                if (wildDiff) return wildDiff
                const valDiff = (Number(b.card.value) || 0) - (Number(a.card.value) || 0)
                if (valDiff) return valDiff
                return Number(b.source.from === "discard") - Number(a.source.from === "discard")
            })
            return toMove(helpful[0])
        }
    }

    // 3. Any other number card that is safe to play (frees up hand/discard cards and cycles the hand)
    const safeNumbers = options.filter((o) => !isWild(o.card) && !helpsOpponent(o))
    if (safeNumbers.length > 0) {
        safeNumbers.sort((a, b) => Number(b.source.from === "discard") - Number(a.source.from === "discard"))
        return toMove(safeNumbers[0])
    }

    // 4. A hand of only Wiz-Bos can't discard anything useful, so play one instead of burying it
    const handIsAllWild = player.hand.length > 0 && player.hand.every(isWild)
    if (handIsAllWild) {
        const wildPlays = options.filter((o) => o.source.from === "hand")
        if (wildPlays.length > 0) return toMove(pickBest(wildPlays))
    }

    // 5. Nothing left to play: discard (ends the turn), or pass if there's nothing in hand
    if (player.hand.length === 0) return { type: "pass" }
    return chooseDiscard(state, player, stockValue)
}

// How much we want to hold on to a card (higher = keep)
const keepScore = (card: Card, state: GameState, stockValue: number | null): number => {
    if (isWild(card)) return 1000
    const v = card.value as number

    let score = 0
    if (stockValue === v) score += 100
    for (const pile of state.buildingPiles) {
        const needed = pile.length + 1
        if (v >= needed) score = Math.max(score, 50 - (v - needed) * 4) // the sooner it's playable, the better
    }
    return score
}

// How good a discard pile is for a card: stack on top of (value + 1) to build tidy descending runs
const pileScore = (card: Card, pile: Card[]): number => {
    const top = pile[pile.length - 1]
    if (!top) return 2
    if (isWild(card) || isWild(top)) return 0

    const v = card.value as number
    const t = top.value as number
    if (t === v + 1) return 10 // perfect descending run
    if (t === v) return 6 // duplicates stack together
    if (t > v) return Math.max(5 - (t - v), 0) // buried under a larger card later is fine
    return -10 - (v - t) // covers a smaller card, which makes it harder to reach
}

const chooseDiscard = (state: GameState, player: Player, stockValue: number | null): ComputerMove => {
    // Discard the card we need least
    const card = [...player.hand].sort(
        (a, b) => keepScore(a, state, stockValue) - keepScore(b, state, stockValue)
    )[0]

    // ...onto the best discard pile (small penalty for tall piles keeps them balanced)
    let bestIndex = 0
    let bestScore = -Infinity
    for (let i = 0; i < DISCARD_PILE_COUNT; i++) {
        const pile = player.discardPiles[i]
        const score = pileScore(card, pile) - pile.length * 0.1
        if (score > bestScore) {
            bestScore = score
            bestIndex = i
        }
    }

    return { type: "discard", cardId: card.id, discardIndex: bestIndex }
}