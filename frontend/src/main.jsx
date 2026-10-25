
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "aos/dist/aos.css";
import "./index.css";
import App from "./App.jsx";
import LangProvider from "./context/LangProvider";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LangProvider>
      <App />
    </LangProvider>
  </BrowserRouter>
);
