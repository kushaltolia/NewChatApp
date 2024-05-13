import axios from 'axios'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './Register';
import Chat from './Chat';
function App() {
  axios.defaults.withCredentials = true;
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/register" element = {<Register/>}></Route>
        <Route path = "/" element = {<Register/>}></Route>
        <Route path = "/user" element = {<Chat/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
