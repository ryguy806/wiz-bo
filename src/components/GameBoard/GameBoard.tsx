import { useEffect, useState } from "react"
import type { Card, CardSource, GameState, Player } from "../../helpers/types"
import { getSourceCard, validatePlay } from "../../helpers/gameStateHelper"
import Deck from "../Deck/Deck"
import BuildingPiles from "../Deck/BuildingPiles"
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    pointerWithin,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent
} from '@dnd-kit/core'
import CardItem from "../Card/CardItem"
import Menu from "../Layout/Menu"
import EdgeSeat from "./EdgeSeat"
import { DEFAULT_COLORS } from "../MagicEffects/MagicWand"
import GameWin from "./GameWin"
import PlayerArea from "../Players/PlayerArea"

type GameBoardProps = {
    gameState: GameState
    onPlayCard: (source: CardSource, buildingIndex: number) => void
    onDiscard: (cardId: string, discardIndex: number) => void
    onPassTurn: () => void
    onNewGame: () => void
}

const GameBoard = ({gameState, onPlayCard, onDiscard, onNewGame}: GameBoardProps) => {
    const {players, currentPlayer, drawPile, buildingPiles, winner} = gameState
    const [selected, setSelected] = useState<CardSource | null>(null)
    const [draggingCard, setDraggingCard] = useState<Card | null>(null)
    const [color, setColor] = useState(DEFAULT_COLORS[currentPlayer])

    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 8}}))

    const active = players[currentPlayer]
    const isComputerTurn = active.isComputer
    const selectedCard: Card | undefined = selected ? getSourceCard(active, selected) : undefined

    useEffect(()=> {setColor(DEFAULT_COLORS[currentPlayer])}, [currentPlayer])

    // "Me" is the human player, so my area stays on screen during computer turns
    const me: Player = isComputerTurn ? (players.find((p) => !p.isComputer) ?? active) : active
    const myIndex = players.findIndex((p) => p.id === me.id)

    // Opponents in turn order, starting with whoever plays right after me
    const opponents = [...players.slice(myIndex + 1), ...players.slice(0, myIndex)]

    const seats: {left?: Player, top?: Player, right?: Player} =
        opponents.length === 1 ? {top: opponents[0]}
        : opponents.length === 2 ? {left: opponents[0], right: opponents[1]}
        : {left: opponents[0], top: opponents[1], right: opponents[2]}

    

    const handleBuildingClick = (index: number) => {
        if (!selected || winner || isComputerTurn) return
        onPlayCard(selected, index)
        setSelected(null)
    }

    const findDragSource = (cardId: string): CardSource | null => {
        if (active.hand.some((c) => c.id === cardId)) return {from: "hand", cardId}
        const pile = active.discardPiles.findIndex((p) => p[p.length - 1]?.id === cardId)
        if (pile >= 0) return {from: "discard", pile}
        const stockTop = active.stockPile[active.stockPile.length - 1]
        return stockTop?.id === cardId ? {from: "stock"} : null
    }

    const handleDragStart = (event: DragStartEvent) => {
        if (winner || isComputerTurn) return
        const source = findDragSource(String(event.active.id))
        const card = source ? getSourceCard(active, source) : undefined
        if (!source || !card) return

        setSelected(source)
        setDraggingCard(card)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const cardId = String(event.active.id)
        const overId = event.over ? String(event.over.id) : null

        setSelected(null)
        setDraggingCard(null)

        if (!overId || winner || isComputerTurn) return
        const source = findDragSource(cardId)

        if (!source) return
        if (overId.startsWith("build-")) {
            onPlayCard(source, Number(overId.slice("build-".length)))
        } else if (overId.startsWith("discard-") && source.from === "hand") {
            onDiscard(cardId, Number(overId.slice("discard-".length)))
        }
    }

    const handleDragCancel = () => {
        setDraggingCard(null)
        setSelected(null)
    }

    let instruction = "Select a card to play or discard."
    if (selectedCard) {
        instruction = selected?.from === "hand"
            ? "Click a building pile to play it, or one of your discard piles to discard it and end your turn."
            : "Click a building pile to play it."
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
        {/* Fixed to the viewport so nothing ever scrolls */}
        <div className="relative grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] gap-2 overflow-hidden p-2 text-white">
            <header className="absolute top-3 right-3 z-10">
                <Menu onNewGame={onNewGame}/>
            </header>

            {/* Top edge */}
            <div className="flex justify-center">
                {seats.top && <EdgeSeat player={seats.top} side="top" isTurn={seats.top.id === active.id} color={color} />}
            </div>

            {/* Left edge | table | right edge */}
            <div className="grid min-h-0 grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-1 gap-2">
                {seats.left
                    ? <EdgeSeat player={seats.left} side="left" isTurn={seats.left.id === active.id} color={color} />
                    : <div />}

                <section className="flex flex-wrap content-center items-start justify-center gap-5">
                    <div className="flex flex-col items-center gap-1 pr-10">
                        <Deck name="Draw Pile" deck={drawPile} faceUp={false} />
                        <span className="text-xs text-white/70">Draw Pile</span>
                    </div>
                    <div className="flex flex-wrap items-start justify-center gap-6">
                        {buildingPiles.map((pile, i) => (
                            <BuildingPiles
                                key={i}
                                name={`Build ${i + 1}`}
                                dropId={`build-${i}`}
                                cards={pile}
                                onClick={() => handleBuildingClick(i)}
                                highlight={!isComputerTurn && !!selectedCard && validatePlay(selectedCard, pile)}
                                color={color}
                            />
                        ))}
                    </div>
                </section>

                {seats.right
                    ? <EdgeSeat player={seats.right} side="right" isTurn={seats.right.id === active.id} color={color} />
                    : <div />}
            </div>

            <section className="flex flex-col items-center gap-1 rounded-lg bg-black/30 p-1">
                <PlayerArea 
                    active={active} 
                    me={me}
                    isComputerTurn={isComputerTurn}
                    instruction={instruction}
                    winner={winner} color={color}
                    selected={selected}
                    setSelected={setSelected}
                    onDiscard={onDiscard}
                />
            </section>

            {winner && (
                <GameWin winner={winner} onNewGame={onNewGame} />
            )}

            <DragOverlay>
                {draggingCard && (
                    <div className="rotate-3 cursor-grabbing">
                        <CardItem card={{...draggingCard, id: `${draggingCard.id}-drag`}} faceUp={true} />
                    </div>
                )}
            </DragOverlay>
        </div>
        </DndContext>
    )
}

export default GameBoard