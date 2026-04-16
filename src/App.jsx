import { Routes, Route } from "react-router-dom"

import HomePage from "./home"
import FilterPage from "./filter"
import VenuePage from "./venue"


import "./App.css"

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/filters" element={<FilterPage />} />
            <Route path="/venue/:id" element={<VenuePage />} />
        </Routes>
    )
}

export default App