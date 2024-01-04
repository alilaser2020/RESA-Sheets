import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import UserAccountPage from "./pages/UserAccountPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import DocumentPage from "./pages/DocumentPage";
import HistoryPage from "./pages/HistoryPage";
import {Routes, Route} from "react-router-dom";

function App() {

  return (
      <div className = "App">
          <Routes>
            <Route path = '/' element = {<HomePage/>}/>
            <Route path = '/register/:mode' element = {<RegisterPage/>}/>
            <Route path = '/user-account' element = {<UserAccountPage/>}/>
            <Route path = '/admin-account/:role' element = {<AdminPanelPage/>}/>
            <Route path = '/document/:docID' element = {<DocumentPage/>}/>
            <Route path = '/history/:docID' element = {<HistoryPage/>}/>
          </Routes>
      </div>
  );
}

export default App;