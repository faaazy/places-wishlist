import { PlaceContextProvider } from "@/entities/place/model/PlaceContext";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./styles/index.css";
import { MapPage } from "@/pages/map/MapPage";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router";
import { Layout } from "@/widgets/layout";
import {
  ProfilePage,
  AuthPage,
  GroupsPage,
  GroupDetailPage,
  JoinGroupPage,
  SharedPlacePage,
  SharedListPage,
} from "@/pages";
import { UserContextProvider } from "@/entities/user/model/UserContext";
import { AuthContextProvider } from "@/entities/auth/model/AuthContext";
import { GroupContextProvider } from "@/entities/group";
import { AuthGate } from "./ui/AuthGate";
import { useAuth } from "@/entities/auth/model/AuthContext";

function RequireAuth() {
  const { authUser } = useAuth();

  if (authUser === null) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <MapPage /> },
        { path: "/profile", element: <ProfilePage /> },
        { path: "/auth", element: <AuthPage /> },
        {
          element: <RequireAuth />,
          children: [
            { path: "/groups", element: <GroupsPage /> },
            { path: "/groups/:id", element: <GroupDetailPage /> },
            { path: "/groups/join", element: <JoinGroupPage /> },
          ],
        },
      ],
    },
    { path: "/share/place/:token", element: <SharedPlacePage /> },
    { path: "/share/list/:token", element: <SharedListPage /> },
  ]);

  return (
    <AuthContextProvider>
      <AuthGate>
        <UserContextProvider>
          <PlaceContextProvider>
            <GroupContextProvider>
              <RouterProvider router={router} />
            </GroupContextProvider>
          </PlaceContextProvider>
        </UserContextProvider>
      </AuthGate>
    </AuthContextProvider>
  );
}

export default App;