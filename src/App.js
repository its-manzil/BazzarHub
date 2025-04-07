import React, { useEffect, useState } from "react";
import Nav from "./pages/Customers/Nav";

import "./App.css";
function App() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("http://localhost:8085/api")
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  });
  return (
    <>
      <Nav />
    </>
  );
}
export default App;
