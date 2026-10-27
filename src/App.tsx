import magicBubble from "./assets/images/magic-bubble.png"
import './App.css'
import Card from './components/Card'

function App() {

  return (
    <div className="flex gap-2">
      <Card value={magicBubble} faceDown={false}/>
    </div>
  )
}

export default App
