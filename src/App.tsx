import './App.css'
import CardFrontItem from './components/Card/CardFrontItem'
import { createDeck } from "./helpers/gameStateHelper"

function App() {

  const deck = createDeck()

  return (
    <div className="flex flex-row gap-10">
      { deck.map((card) => (
        <div key={card.id} className="size-full">
          <CardFrontItem value={card.value} id={card.id} />
        </div>
      )) }
    </div>
  )
}

export default App
