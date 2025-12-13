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

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Admin CRUD State
  const [showModal, setShowModal] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: ''
  });

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

  const handleSearch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = {};
      if (searchTerm) params.name = searchTerm;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.get('/sweets/search', {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSweets(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Search error:", err);
      setError('Search failed');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    fetchSweets();
  };

  // --- ADMIN CRUD HANDLERS ---
  const handleAddSweet = () => {
    setEditingSweet(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleEditSweet = (sweet) => {
    setEditingSweet(sweet);
    setFormData({
      name: sweet.name,
      price: sweet.price.toString(),
      stock: sweet.stock.toString(),
      category: sweet.category || '',
      description: sweet.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteSweet = async (sweetId) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/sweets/${sweetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSweets(sweets.filter(sweet => sweet._id !== sweetId));
      alert('Sweet deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete sweet');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      // Convert numeric fields to numbers
      const submitData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (editingSweet) {
        // Update existing sweet
        const res = await api.put(
          `/sweets/${editingSweet._id}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setSweets(sweets.map(sweet =>
            sweet._id === editingSweet._id ? res.data.data : sweet
          ));
          alert('Sweet updated successfully!');
        }
      } else {
        // Create new sweet
        const res = await api.post(
          '/sweets',
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setSweets([...sweets, res.data.data]);
          alert('Sweet added successfully!');
        }
      }

      setShowModal(false);
      setFormData({
        name: '',
        price: '',
        stock: '',
        category: '',
        description: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        <div className="h-16 flex items-center justify-center border-b border-indigo-800 bg-indigo-950">
          <h1 className="text-xl md:text-2xl font-bold tracking-wider">🍬 Sweet Shop</h1>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 w-full px-4 py-3 bg-indigo-800 rounded-md text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">All Sweets</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-indigo-800 rounded-md text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>My Orders</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-indigo-800 rounded-md text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profile</span>
          </button>
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{user?.email || 'User'}</p>
              <p className="text-xs text-indigo-300 capitalize">{user?.role || 'Customer'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* === 2. MAIN CONTENT === */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 z-10">
          <button
            className="md:hidden text-gray-500 focus:outline-none p-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center ml-auto space-x-2 md:space-x-4">
            <span className="text-gray-700 text-sm md:text-base font-medium hidden sm:block">
              Welcome, <span className="text-indigo-600 font-bold truncate max-w-11/12 inline-block">{user?.email || 'User'}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
            >
              Logout
            </button>
          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
          {/* Search & Filter Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="Search sweets by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  aria-label="Filter Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Bengali">Bengali</option>
                  <option value="South Indian">South Indian</option>
                  <option value="North Indian">North Indian</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Maharashtrian">Maharashtrian</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm md:text-base"
                >
                  Search
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm md:text-base"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  id="maxPrice"
                  type="number"
                  placeholder="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Page Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Available Sweets</h1>
            <div className="flex items-center gap-3">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {sweets.length} Items
              </span>
              {user?.role === 'admin' && (
                <button
                  onClick={handleAddSweet}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Sweet
                </button>
              )}
            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
              {sweets.map((sweet) => (
                <div key={sweet._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                  {/* Placeholder Image */}
                  <div className="h-40 md:h-48 bg-gradient-to-br from-indigo-100 to-purple-100 w-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16 text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                    </svg>
                  </div>

                  <div className="p-4 md:p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-1 flex-1">{sweet.name}</h3>
                      <span className="bg-green-100 text-green-800 text-xs md:text-sm font-bold px-2 py-1 rounded-full whitespace-nowrap">
                        ₹{sweet.price}
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
                      <span className={`text-xs md:text-sm font-medium ${sweet.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {sweet.stock > 0 ? `${sweet.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>

                    {/* Admin Actions */}
                    {user?.role === 'admin' && (
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => handleEditSweet(sweet)}
                          className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSweet(sweet._id)}
                          className="flex-1 py-2 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    {/* Purchase Button */}
                    <button
                      onClick={() => handlePurchase(sweet._id, sweet.stock)}
                      disabled={sweet.stock === 0}
                      className={`w-full mt-auto py-2 px-4 rounded-lg font-medium transition-colors text-sm md:text-base ${sweet.stock > 0
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
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

      {/* Add/Edit Sweet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingSweet ? 'Edit Sweet' : 'Add Sweet'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleFormChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="Bengali">Bengali</option>
                    <option value="South Indian">South Indian</option>
                    <option value="North Indian">North Indian</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Maharashtrian">Maharashtrian</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    {editingSweet ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;