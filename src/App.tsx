import './App.css'
import CardFrontItem from './components/CardFrontItem'
import { createDeck } from "./helpers/gameStateHelper"

function App() {

  const deck = createDeck()

  return (
    <div className="flex gap-2">
      { deck.map((card) => (
        <div key={card.id}>
          <CardFrontItem value={card.value} id={card.id} />
        </div>
      )) }
    </div>
  )
}

export default App
