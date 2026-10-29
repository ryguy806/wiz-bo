import type { Card } from "../../helpers/types"
import CardItem from "../Card/CardItem"

type HandProps = {
    faceUp: boolean
    cards: Card[]
    selectedId?: string | null
    onSelect?: (card: Card) => void
}

const Hand = ({faceUp, cards, selectedId = null, onSelect}: HandProps) => {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-2">
        {
            cards.map((card) => (
                <CardItem
                    card={card}
                    key={card.id}
                    faceUp={faceUp}
                    selected={card.id === selectedId}
                    onClick={onSelect ? () => onSelect(card) : undefined}
                />
            ))
        }
    </div>
  )
}

export default Hand