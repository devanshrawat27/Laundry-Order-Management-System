import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      return toast.error('Please enter both username and password');
    }

    // Since it's basic auth, we just encode the credentials and save them
    const token = btoa(`${username}:${password}`);
    localStorage.setItem('laundry_auth', token);
    
    toast.success('Logged in successfully');
    // For simplicity, redirecting to home, client interceptor will validate it on the next write action
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="bg-white p-8 rounded-[24px] shadow-sm max-w-sm w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold italic text-brand-600 tracking-tight font-display">Launderly</h1>
          <p className="text-gray-500 mt-2 text-sm">Please log in to manage orders.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input 
            label="Username" 
            type="text" 
            placeholder="e.g. admin" 
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full !mt-8 shadow-md shadow-brand-500/20">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
