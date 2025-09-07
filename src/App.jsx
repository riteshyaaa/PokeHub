
import { Link } from "react-router-dom";
import "./App.css";

import CustomRoutes from "./routes/CustomRoutes";

function App() {
  return (
    <>
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <Link to="/">
    <h1 className="text-4xl font-bold text-center mt-10 tracking-widest justify-center ">
        Pokedex
      </h1>
      </Link>
      <CustomRoutes />
      </div>
    </>
  );
}

export default App;
