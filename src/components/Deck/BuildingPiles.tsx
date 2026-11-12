import type { Card } from "../../helpers/types"
import { getNextNeeded } from "../../helpers/gameStateHelper"
import Deck from "./Deck"

type BuildingPilesType = {
    cards: Card[]
    name: string
    dropId?: string
    onClick?: () => void
    highlight?: boolean
}

const BuildingPiles = ({cards, name, dropId, onClick, highlight = false}: BuildingPilesType) => {

  return (
    <div className="flex flex-col items-center gap-3">
        <Deck name={name} deck={cards} dropId={dropId} faceUp={true} onClick={onClick} highlight={highlight} />
        <span className="text-xs text-white/70">
            {cards.length === 0 ? "Needs 1" : `Needs ${getNextNeeded(cards)}`}
        </span>
    </div>
  )
}

export default BuildingPiles