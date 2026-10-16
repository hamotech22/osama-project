
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "aos/dist/aos.css";
import "./index.css";
import App from "./App.jsx";
import LangProvider from "./context/LangProvider";
import { StrapiStatusProvider } from "./context/StrapiStatusContext";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LangProvider>
      <StrapiStatusProvider>
        <App />
      </StrapiStatusProvider>
    </LangProvider>
  </BrowserRouter>
);
