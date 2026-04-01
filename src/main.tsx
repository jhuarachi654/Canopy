
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

createRoot(document.getElementById("root")!).render(
  <div className="desktop-shell">
    <div className="iphone-frame">
      <div className="iphone-notch" />
      <div className="iphone-screen">
        <App />
      </div>
    </div>
  </div>
);
  