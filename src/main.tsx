import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";

import { MyListsPage } from "./pages/MainPage";
import { ShoppingListPage } from "./pages/ShoppingListPage";
import { _Page } from "./pages/_Page";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { amber } from "@mui/material/colors";

const router = createRouter();

const theme = createTheme({
  palette: {
    primary: {
      main: "#00695c",
    },
    secondary: amber,
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
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
