import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Kakao 전역 (없어도 무방, 오류 회피용)
window.Kakao = window.Kakao || undefined;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

