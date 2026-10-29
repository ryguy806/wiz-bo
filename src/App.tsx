import './App.css'
import BuildingPiles from './components/Deck/BuildingPiles'
import Deck from './components/Deck/Deck'
import Hand from './components/Hand/Hand'
import { createDeck } from "./helpers/gameStateHelper"

function App() {

  const deck = createDeck()

  return (
    <div className='relative h-screen w-screen overflow-hidden'>
      <div id="hands" className="size-full">
        {/* Opponents Hands */}
        <div id="opponent-1" className="flex flex-row gap-10 absolute -left-30 bottom-100">
          <div className='rotate-90'>
            <Hand faceUp={false} cards={deck.splice(0, 5)} />
          </div>
        </div>
        <div id="opponent-2" className="flex flex-row gap-10 absolute top-10 left-70">
          <Hand faceUp={false} cards={deck.splice(0, 5)} />
        </div>
        <div id="opponent-3" className="flex flex-row gap-10 absolute right-140 bottom-100">
          <div className='-rotate-90'>
            <Hand faceUp={false} cards={deck.splice(0, 5)} />
          </div>
        </div>

        {/* Player's Hand */}
        <div id="player" className="flex flex-row gap-10 absolute left-70 bottom-10">
          <Hand faceUp={true} cards={deck.splice(0, 5)} />
        </div>
      </div>
      <div id="building-piles" className='flex absolute top-50 bottom-50 left-100'>
        <div className='relative'>
          <div className='absolute right-20 left-20 w-24 h-32 border border-dashed flex items-center justify-center'>
            <BuildingPiles name="#1" cards={[]}/>
          </div>
          <div className='absolute left-60 top-44 w-24 h-32 border border-dashed flex items-center justify-center '>
            <BuildingPiles name="#2" cards={[]}/>
          </div>
          <div className='absolute right-20 left-20 bottom-10 w-24 h-32 border border-dashed flex items-center justify-center'>
            <BuildingPiles name="#3" cards={[]}/>
          </div>
          <div className='absolute -right-5 top-44 w-24 h-32 border border-dashed flex items-center justify-center'>
            <BuildingPiles name="#4" cards={[]}/>
          </div>
        </div>
      </div>
      <div id="deck" className="flex self-center absolute top-45 bottom-45 left-100">
        <Deck name="Draw Pile" deck={deck} faceUp={false} />
      </div>
    </div>
  )
}

export default App
