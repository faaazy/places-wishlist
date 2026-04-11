import { PlaceContextProvider } from "@/entities/place/model/PlaceContext";
import "./styles/index.css";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapWidget } from "@/widgets/map/ui/MapWidget";

function App() {
  const [ai, setAi] = useState(0);

  return (
    <PlaceContextProvider>
      <h1>Hello, World!</h1>
      <p>Amount of AI Slop generated: {ai}</p>
      <button onClick={() => setAi(ai + 1)}>Add AI Slop</button>

      <MapWidget />
    </PlaceContextProvider>
  );
}

export default App;
