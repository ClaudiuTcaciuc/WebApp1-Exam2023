import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import My_Header from './Components/My_Header'
import My_Login from './Components/My_Login'
import My_Footer from './Components/My_Footer'
import My_Main from './Components/My_Main'
import My_Page from './Components/My_Page'
import My_Edit_Page from './Components/My_Edit_Page'
import My_Add_Page from './Components/My_Add_Page'
import API from './API';

function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [app_name, setApp_name] = useState('My App');

  // useEffect to check if the user is logged in
  useEffect(() => {
    API.getUserInfo().then((user) => {
      setUser(user);
      setLoggedIn(true);
    }).catch((err) => {
      // do nothing the user is not logged in yet
    });
  }, []);

  // useEffect to get the app name
  useEffect(() => {
    API.getAppName()
      .then((name) => { setApp_name(name) })
      .catch((err) => { 
        console.log(err) });
  }, [app_name]);

  // function to handle the login
  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
  }

  // props for the login and header components
  const userProps = {
    user: user,
    loggedIn: loggedIn,
    setUser: setUser,
    setLoggedIn: setLoggedIn,
  }

  return (
    <BrowserRouter>
      <div style={{ height: "100vh" }}>
        <My_Header {...userProps} app_name={app_name} setApp_name={setApp_name} />
        <Routes>
          <Route path='/' element={<My_Main {...userProps} />} />
          <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <My_Login loginSuccessful={loginSuccessful} />} />
          <Route path='/:filter?' element={<My_Main {...userProps} />} />
          <Route path='/page/:id?' element={<My_Page {...userProps} />} />
          <Route path='/edit_page/:id?' element={<My_Edit_Page {...userProps} />} />
          <Route path='/add_page' element={<My_Add_Page {...userProps} />} />
          <Route path='*' element={<Navigate replace to='/' />} />
        </Routes>
        <My_Footer loggedIn={loggedIn} />
      </div>
    </BrowserRouter>
  )
}

export default App
