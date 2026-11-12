import { useDraggable } from "@dnd-kit/core";
import type {Card} from '../../helpers/types'
import CardItem from './CardItem'

type DraggableCardProps = {
    card: Card
    faceUp: boolean
    selected?: boolean
    onClick?: () => void
    disabled?: boolean
}

const DraggableCard = ({card, faceUp, selected = false, onClick, disabled = false}: DraggableCardProps) => {
    const {setNodeRef, listeners, isDragging} = useDraggable({id: card.id, disabled})


    return (
        <div ref={setNodeRef} {...listeners} className={`touch-none ${isDragging ? "opacity-30" : ""}`}>
            <CardItem card={card} faceUp={faceUp} selected={selected} onClick={onClick}/>
        </div>
    )
}

export default DraggableCard