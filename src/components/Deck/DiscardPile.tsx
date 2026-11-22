import type { Card, CardSource, Player } from "../../helpers/types"
import CardItem from "../Card/CardItem"
import Deck from "./Deck"

const PEEK = 24   // px of each buried card that stays visible
const MAX_VISIBLE = 3

type DiscardPileProps = {
    active: Player
    pile: Card[]
    isComputerTurn: boolean
    winner: string | null
    pileNumber: number
    color: string
    selected: CardSource | null
    isSelected: (source: CardSource) => boolean
    setSelected: (selected: CardSource | null) => void
    onDiscard: (cardId: string, discardIndex: number) => void
    toggleSelect: (source: CardSource) => void
}

const DiscardPile = ({active, pile, isComputerTurn, winner, pileNumber, color, selected, isSelected, onDiscard, setSelected, toggleSelect}: DiscardPileProps) => {
    const buried = pile.slice(-MAX_VISIBLE, -1)

    const handleDiscardClick = (index: number) => {
        if (winner || isComputerTurn) return
        if (selected?.from === "hand") {
            onDiscard(selected.cardId, index)
            setSelected(null)
        } else if (active.discardPiles[index].length > 0) {
            toggleSelect({from: "discard", pile: index})
        }
    }

    return (
         <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{paddingTop: (MAX_VISIBLE - 1) * PEEK}}>
                {buried.map((card, j) => (
                    <div
                        key={card.id}
                        className="pointer-events-none absolute left-0"
                        style={{
                            // Align the buried cards so the newest one sits just above the top card
                            top: (MAX_VISIBLE - 1 - buried.length + j) * PEEK,
                            zIndex: j,
                        }}
                    >
                        <CardItem card={card} faceUp={true} />
                    </div>
                ))}
                {/* Top card: the only draggable/selectable one. It needs its own positioning and z-index to paint above the absolute cards */}
                <div className="relative" style={{zIndex: MAX_VISIBLE}}>
                    <Deck
                        name={`Discard ${pileNumber + 1}`}
                        dropId={`discard-${pileNumber}`}
                        draggable={!isComputerTurn && !winner}
                        deck={pile}
                        faceUp={true}
                        selected={isSelected({from: "discard", pile: pileNumber})}
                        highlight={!isComputerTurn && selected?.from === "hand"}
                        onClick={() => handleDiscardClick(pileNumber)}
                        color={color}
                    />
                </div>
            </div>
        </div>
    )
}

export default DiscardPile