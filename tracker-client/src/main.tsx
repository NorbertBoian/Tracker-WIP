import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "./components/App/App";
import { store } from "./store";
import "../index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    // <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>,
    // </React.StrictMode>
  );
}
