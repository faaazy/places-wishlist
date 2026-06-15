import { PlaceContextProvider } from "@/entities/place/model/PlaceContext";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./styles/index.css";
import { MapPage } from "@/pages/map/MapPage";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Layout } from "@/widgets/layout";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { UserContextProvider } from "@/entities/user/model/UserContext";
import { AuthContextProvider } from "@/entities/auth/model/AuthContext";
import { AuthGate } from "./ui/AuthGate";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <MapPage /> },
        { path: "/profile", element: <ProfilePage /> },
      ],
    },
  ]);

  return (
    <AuthContextProvider>
      <AuthGate>
        <UserContextProvider>
          <PlaceContextProvider>
            <RouterProvider router={router} />
          </PlaceContextProvider>
        </UserContextProvider>
      </AuthGate>
    </AuthContextProvider>
  );
}

export default App;
