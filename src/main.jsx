import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
window.Kakao = window.Kakao || undefined;
createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);

