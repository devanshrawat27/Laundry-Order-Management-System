import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Bell, ShoppingBag, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('laundry_auth');
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-surface-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-10">
            <Link to="/" className="text-2xl font-bold italic text-brand-600 tracking-tight font-display">
              Launderly
            </Link>
            <nav className="hidden md:flex space-x-8">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `px-1 py-2 text-sm font-semibold transition-colors ${isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/orders" 
                className={({ isActive }) => 
                  `px-1 py-2 text-sm font-semibold transition-colors ${isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'}`
                }
              >
                Orders
              </NavLink>
              <NavLink 
                to="/customers" 
                className={({ isActive }) => 
                  `px-1 py-2 text-sm font-semibold transition-colors ${isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'}`
                }
              >
                Customers
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-5">
            <button 
              onClick={() => toast('No new notifications', { icon: '🔔' })}
              className="text-gray-500 hover:text-gray-900 transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
            </button>
            <button 
              onClick={() => navigate('/orders/new')}
              className="text-gray-500 hover:text-brand-600 transition-colors"
              title="Quick Add Order"
            >
              <ShoppingBag size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
            
            <div 
              onClick={() => toast('Profile page coming soon!', { icon: '👤'})}
              className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden ml-2 border border-surface-300 hover:ring-2 hover:ring-brand-500 hover:ring-offset-2 transition-all cursor-pointer"
              title="Profile"
            >
              <img src="https://ui-avatars.com/api/?name=Admin&background=f07575&color=fff" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
