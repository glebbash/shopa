import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";

import { SessionGuard } from "./components/SessionGuard";
import { LoginPage } from "./pages/LoginPage";
import { MyListsPage } from "./pages/MainPage";
import { SpecificListPage } from "./pages/ListPage";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { _Page } from "./pages/_Page";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <SessionGuard value={() => <_Page />} fallback={() => <LoginPage />} />
    ),
    children: [
      {
        path: "/",
        element: <MyListsPage />,
      },
      {
        path: "/lists/:listId",
        element: <SpecificListPage />,
        loader: (_) => _.params.listId,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <RouterProvider router={router} />
  </React.StrictMode>
);
