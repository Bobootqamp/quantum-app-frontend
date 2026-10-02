import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./App.css";

const root = document.getElementById("app");
if (!root) throw new Error("#app element not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
