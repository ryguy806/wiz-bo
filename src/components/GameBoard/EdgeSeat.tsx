import type { Player } from "../../helpers/types"
import Deck from "../Deck/Deck"
import Hand from "../Hand/Hand"

type Side = "top" | "left" | "right"

// Opponent seats are laid out at normal size, then shrunk and rotated to hug an edge.
// SEAT_SCALE shrinks the cards; SEAT_THICKNESS is how far the seat reaches in from the edge.
const SEAT_SCALE = 0.6
const SEAT_THICKNESS = "9rem"
const SEAT_ROTATION: Record<Side, number> = {top: 0, left: 90, right: -90}

const noop = () => {}

type EdgeSeatProps = {
    player: Player
    side: Side
    isTurn: boolean
    color: string
}

const EdgeSeat = ({player, side, isTurn, color}: EdgeSeatProps) => {
    const vertical = side !== "top"

    const wrapperStyle: React.CSSProperties = vertical
        ? {containerType: "size", width: SEAT_THICKNESS, height: "100%"}
        : {containerType: "size", height: SEAT_THICKNESS, width: "min(100%, 48rem)"}

    const innerStyle: React.CSSProperties & { "--player-color"?: string } = {
        width: `calc(${vertical ? "100cqh" : "100cqw"} / ${SEAT_SCALE})`,
        height: `calc(${vertical ? "100cqw" : "100cqh"} / ${SEAT_SCALE})`,
        transform: `translate(-50%, -50%) rotate(${SEAT_ROTATION[side]}deg) scale(${SEAT_SCALE})`,
        "--player-color": color,
        paddingBottom: vertical ? "36px" : ""
    }

    return (
        <div className="relative" style={wrapperStyle}>
            <div
                className={`absolute top-1/2 left-1/2 flex flex-col items-center justify-center rounded-lg ${
                    isTurn ? "bg-black/40 ring-4 ring-[color:var(--player-color)]" : "bg-black/20"
                }`}
                style={innerStyle}
            >
                <span className="text-base font-semibold pt-1">
                    {player.name}
                </span>
                <div className="flex items-start justify-center gap-2">
                    <div className="flex flex-col items-center pr-10">
                        <Deck name="Stock" deck={player.stockPile} faceUp={true} draggable={false} />
                        <p>Stock</p>
                    </div>
                    {player.discardPiles.map((pile, i) => (
                        <Deck key={i} name={`Discard ${i + 1}`} deck={pile} faceUp={true} draggable={false} />
                    ))}  
                </div>
                <Hand
                    faceUp={false}
                    cards={player.hand}
                    selectedId={null}
                    onSelect={noop}
                    dragDisabled
                />
            </div>
        </div>
    )
}

export default EdgeSeat