import { PlaceContextProvider } from "@/entities/place/model/PlaceContext";
import "leaflet/dist/leaflet.css";
import "./styles/index.css";
import { MapPage } from "@/pages/map/MapPage";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Layout } from "@/widgets/layout";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [{ path: "/", element: <MapPage /> }],
    },
  ]);

  return (
    <PlaceContextProvider>
      <RouterProvider router={router} />
    </PlaceContextProvider>
  );
}

export default App;
