import type { Card } from "../../helpers/types"
import wizardCardBack from "../../assets/images/wizard-card-back.jpg"

const CardFrontItem = ({id}: Card) => {

    return (
        <div id={id} className="border border-black size-full flex items-center justify-center">
            <img src={wizardCardBack} alt={`card back ${id}`} />
        </div>
    )
}

export default CardFrontItem