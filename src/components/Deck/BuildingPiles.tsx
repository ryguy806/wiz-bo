import type { Card } from "../../helpers/types"
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
    </div>
  )
}

export default BuildingPiles