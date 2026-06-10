import React from "react";
import ReactDOM from "react-dom/client";
import { Providers } from "@/app/providers";
import { AppShell } from "@/app/AppShell";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <AppShell />
    </Providers>
  </React.StrictMode>
);
