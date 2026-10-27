import type { Card } from "./types"

export const createDeck = (): Card[] => {
    const deck: Card[] = []
    let idCounter = 0

    // Adds in cards 1-12, 12 times
    for (let i = 0; i <= 12; i++) {
        for (let j = 0; j < 12; j++) {
            deck.push({id: `card-${idCounter++}`, value: i})
        }
    }

    // Adds in 18 "Wiz-Bo" cards
    for (let j = 0; j < 18; j++) {
        deck.push({id: `card-${idCounter++}`, value: "WIZ-BO"})
    }

    // retruns the shuffled deck
    return deck.sort(() => Math.random() - 0.5)
}