import type { Card } from "../../helpers/types"
import wizardCardBack from "../../assets/images/wizard-card-back.jpg"

const CardFrontItem = ({id}: Card) => {

    return (
            <img src={wizardCardBack} alt={`card back ${id}`} className="size-full"/>
    )
}

export default CardFrontItem