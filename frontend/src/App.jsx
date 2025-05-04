import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TaskList from './pages/TaskList.jsx';
import ProjectItemPage from './pages/ProjectItemPage.jsx';
import ProjectEdit from './pages/ProjectEdit.jsx';
import LoginPage from './pages/LoginPage.jsx';
import IndexPage from './pages/IndexPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import AppNavbar from './components/AppNavbar.jsx';

function NavbarWrapper({ currentUser, project, onLogout }) {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/login', '/register', '/forgot-password'];
  
  return !hideNavbarPaths.includes(location.pathname) ? (
    <AppNavbar currentUser={currentUser} project={project} onLogout={onLogout} />
  ) : null;
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [project, setProject] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/user/me/', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setCurrentUser(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    fetchCurrentUser();
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <Router>
      <NavbarWrapper currentUser={currentUser} project={project} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<IndexPage onLoginSuccess={fetchCurrentUser} />} />
        <Route path="/tasks" element={<TaskList onUserUpdate={fetchCurrentUser} />} />
        <Route 
          path="/project/:pk" 
          element={
            <ProjectItemPage 
              onUserUpdate={fetchCurrentUser} 
              onProjectLoaded={setProject} 
            />
          } 
        />
        <Route path="/project" element={<ProjectItemPage onUserUpdate={fetchCurrentUser} />} />
        <Route path="/projects/edit/:pk" element={<ProjectEdit />} />
        <Route 
          path="/login" 
          element={<LoginPage onLoginSuccess={fetchCurrentUser} />} 
        />
        <Route 
          path="/register" 
          element={<RegisterPage onRegisterSuccess={fetchCurrentUser} />} 
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;