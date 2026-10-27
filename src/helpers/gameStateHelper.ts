import type { Card } from "./types"

export const createDeck = (): Card[] => {
    const deck: Card[] = []
    let idCounter = 0

    // Adds in cards 1-12, 12 times
    for (let i = 1; i <= 12; i++) {
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