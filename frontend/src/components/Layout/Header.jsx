import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, CheckSquare, LogOut, User, BarChart3, ListTodo } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-blue-600">
            <CheckSquare className="h-8 w-8" />
            <span>TodoApp</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-gray-700 px-3 py-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Welcome, {user?.username}</span>
                </div>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    location.pathname === '/dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/todos"
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    location.pathname === '/todos'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ListTodo className="h-4 w-4" />
                  <span>My Todos</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/login'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/register'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white absolute left-0 right-0 shadow-lg">
            <nav className="px-4 py-2 space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 text-gray-700 px-3 py-2 border-b">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Welcome, {user?.username}</span>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      location.pathname === '/dashboard'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/todos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      location.pathname === '/todos'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ListTodo className="h-4 w-4" />
                    <span>My Todos</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === '/login'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === '/register'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;