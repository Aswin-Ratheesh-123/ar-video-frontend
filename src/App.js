import { BrowserRouter, Routes, Route } from "react-router-dom";
import ARViewer from "./ARViewer";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ARViewer />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
