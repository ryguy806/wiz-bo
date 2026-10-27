import type { Card } from "../../helpers/types"
import CardItem from "../Card/CardItem"

type HandProps = {
    faceUp: boolean
    cards: Card[]
}

const Hand = ({faceUp, cards}: HandProps) => {
  return (
    <div hidden={!faceUp} className="flex flex-row">
        {
            cards.map((card) => (
                <CardItem card={card} key={card.id} faceUp={faceUp} />
            ))
        }
    </div>
  )
}

export default Hand