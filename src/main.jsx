import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// 전역 Kakao 타입 경고 회피
/* eslint-disable no-undef */
window.Kakao = window.Kakao || undefined;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
