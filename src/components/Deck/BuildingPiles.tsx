import type { Card } from "../../helpers/types"
import Deck from "./Deck"

type BuildingPilesType = {
    cards: Card[]
    name: string;
}
const BuildingPiles = ({cards, name}: BuildingPilesType) => {

  return (
    <>
        {
            
            cards.length === 0 ? (<>{name}</>) : (<Deck name={name} deck={cards} faceUp={true}/>)
        }
    </>
  )
}

export default BuildingPiles