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