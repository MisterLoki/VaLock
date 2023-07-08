import { Route, Routes, BrowserRouter } from "react-router-dom";
import AllMap from "./AllMap";
import EachMap from "./EachMap";
import Home from "./Home";
import Profile from "./Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home/>
          }
        />
        <Route
          path="/all_map"
          element={
            <AllMap/>
          }
        />
        <Route
          path="/each_map"
          element={
            <EachMap/>
          }
        />
        <Route
          path="/profile"
          element={
            <Profile/>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
