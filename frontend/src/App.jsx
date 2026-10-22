import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import Profile from './pages/profile';
import Saved from './pages/saved';
import AddItem from './pages/additem';
import Browse from './pages/browse';
import HowItWorks from './pages/howitworks';
import ItemDetail from './pages/itemdetail';
import Community from './pages/community';
import NotFound from './pages/notfound';
import Chat from './pages/chat';
import Admin from './pages/admin';
import Navbar from './components/navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/wishlist" element={<Saved />} />
            <Route path="/additem" element={<AddItem />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/community" element={<Community />} />
            <Route path="/itemdetail/:id" element={<ItemDetail />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/negotiation" element={<Chat />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/notfound" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
}

  export default App;