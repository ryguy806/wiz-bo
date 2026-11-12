import type { Card } from "../../helpers/types"
import DraggableCard from "../Card/DraggableCard"

type HandProps = {
    faceUp: boolean
    cards: Card[]
    selectedId?: string | null
    onSelect?: (card: Card) => void
    dragDisabled: boolean
}

const Hand = ({faceUp, cards, selectedId = null, onSelect, dragDisabled = false}: HandProps) => {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-2">
        {
            cards.map((card) => (
                <DraggableCard key={card.id} card={card} faceUp={faceUp} selected={card.id === selectedId} onClick={onSelect ? () => onSelect(card)  : undefined} disabled={dragDisabled} />
            ))
        }
    </div>
  )
}

export default Hand