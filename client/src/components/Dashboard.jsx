import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios'; // 1. Importing centralized axios instance
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  // --- STATE ---
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile menu

  // --- HOOKS ---
  const { user, logout } = useAuth(); // We don't need 'token' here anymore if axios interceptors handle it, but keeping logic simple for now
  const navigate = useNavigate();

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await api.get('/sweets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSweets(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Failed to fetch sweets');
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePurchase = async (sweetId, currentStock) => {
    if (currentStock <= 0) return;

    try {
      const token = localStorage.getItem('token');
      const res = await api.post(
        `/sweets/${sweetId}/purchase`,
        { quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        // Update the sweets list with new stock
        setSweets(sweets.map(sweet => 
          sweet._id === sweetId 
            ? { ...sweet, stock: res.data.data.stock }
            : sweet
        ));
        alert('Purchase successful!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Purchase failed');
    }
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-gray-100">

      {/* === 1. SIDEBAR === */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-indigo-900 text-white flex flex-col shadow-xl`}>
        <div className="h-16 flex items-center justify-center border-b border-indigo-800 bg-indigo-900">
          <h1 className="text-2xl font-bold tracking-wider">Sweet Shop</h1>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 bg-indigo-800 rounded-md text-white transition-colors">
            <span className="font-medium">All Sweets</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 hover:bg-indigo-800 rounded-md text-gray-300 hover:text-white transition-colors">
            <span>My Orders</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 hover:bg-indigo-800 rounded-md text-gray-300 hover:text-white transition-colors">
            <span>Profile</span>
          </a>
        </nav>
      </div>

      {/* === 2. MAIN CONTENT === */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <button
            className="md:hidden text-gray-500 focus:outline-none p-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center ml-auto space-x-4">
            <span className="text-gray-700 font-medium hidden sm:block">
              Welcome, <span className="text-indigo-600 font-bold">{user?.email || 'User'}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
            >
              Logout
            </button>
          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Available Sweets</h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {sweets.length} Items
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          ) : sweets.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <p className="text-gray-500">No sweets available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sweets.map((sweet) => (
                <div key={sweet._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                  {/* Placeholder Image */}
                  <div className="h-40 bg-gray-200 w-full flex items-center justify-center text-gray-400">
                    <span>Sweet Image</span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{sweet.name}</h3>
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                        ${sweet.price}
                      </span>
                    </div>
                    {sweet.category && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2 w-fit">
                        {sweet.category}
                      </span>
                    )}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {sweet.description || 'No description available'}
                    </p>
                    
                    {/* Stock Display */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-sm font-medium ${sweet.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {sweet.stock > 0 ? `${sweet.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>

                    {/* Purchase Button */}
                    <button
                      onClick={() => handlePurchase(sweet._id, sweet.stock)}
                      disabled={sweet.stock === 0}
                      className={`w-full mt-auto py-2 px-4 rounded-lg font-medium transition-colors ${
                        sweet.stock > 0
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {sweet.stock > 0 ? 'Purchase' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;