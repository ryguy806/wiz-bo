import type { Card } from "../../helpers/types"
import CardItem from "../Card/CardItem"
import { useDroppable } from "@dnd-kit/core"
import DraggableCard from "../Card/DraggableCard"

type DeckProps = {
    draggable?: boolean
    name: string
    dropId?: string
    deck: Card[]
    faceUp: boolean
    selected?: boolean
    onClick?: () => void
    highlight?: boolean
}

// Shows a pile as its top card plus a count badge, or an empty slot with the pile's name
const Deck = ({draggable = false, name, dropId, deck, faceUp, selected = false, onClick, highlight = false}: DeckProps) => {
  const interactive = onClick !== undefined
  const topCard = deck[deck.length - 1]
  const {setNodeRef, isOver} = useDroppable({id: dropId ?? name, disabled: dropId === undefined})

  return (
    <div id={name} ref={setNodeRef} className={`relative h-24 w-18 rounded transition-shadow ${isOver ? "ring-4 ring-yellow-500" : ""}`}>
        {
            !topCard ? (
                <div
                    onClick={onClick}
                    className={`flex size-full items-center justify-center rounded border-2 border-dashed p-1 text-center text-sm
                        ${highlight ? "border-yellow-400 bg-yellow-400/20 text-yellow-300" : "border-white/40 text-white/60"}
                        ${interactive ? "cursor-pointer" : ""}`}
                >
                    {name}
                </div>
            ) : (
                <div className={`rounded ${highlight ? "ring-4 ring-yellow-400/70" : ""}`}>
                    {
                        draggable ? (
                            <DraggableCard card={topCard} faceUp={faceUp} selected={selected} onClick={onClick} />
                        ) : (
                            <CardItem card={topCard} faceUp={faceUp} selected={selected} onClick={onClick} />
                        )
                    }
                </div>
            )
        }
        {deck.length > 0 && (
            <span className="pointer-events-none absolute -bottom-2 -right-2 rounded-full bg-black px-2 text-sm font-bold text-white">
                {deck.length}
            </span>
        )}
    </div>
  )
}

export default Deck