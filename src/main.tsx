import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

import { MyListsPage } from "./pages/MainPage";
import { ShoppingListPage } from "./pages/ShoppingListPage";
import { _Page } from "./pages/_Page";

const router = createRouter();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <RouterProvider router={router} />
  </React.StrictMode>
);

function createRouter() {
  return createBrowserRouter([
    {
      path: "/",
      element: <_Page />,
      children: [
        {
          path: "/",
          element: <MyListsPage />,
        },
        {
          path: "/lists/:listId",
          element: <ShoppingListPage />,
          loader: (_) => _.params.listId,
        },
      ],
    },
  ]);
}
