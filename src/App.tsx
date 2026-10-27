import './App.css'
import CardItem from './components/CardItem'
import { createDeck } from "./helpers/gameStateHelper"

function App() {

  const deck = createDeck()

  return (
    <div className="flex gap-2">
      { deck.map((card) => (
        <div key={card.id}>
          <CardItem value={card.value} id={card.id} />
        </div>
      )) }
    </div>
  )
}

export default App
