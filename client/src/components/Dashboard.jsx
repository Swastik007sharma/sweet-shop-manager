import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchSweets = async () => {
      try {
        const res = await axios.get('/api/sweets', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSweets(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch sweets', err);
        setLoading(false);
      }
    };

    if (token) {
      fetchSweets();
    }
  }, [token]);

  if (loading) return <div className="text-center mt-10">Loading tasty sweets...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Available Sweets
      </h1>
      
      {sweets.length === 0 ? (
        <p className="text-center text-gray-500">No sweets available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sweets.map((sweet) => (
            <div key={sweet._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {sweet.name}
                  </h3>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    ${sweet.price}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 h-12 overflow-hidden">
                  {sweet.description}
                </p>
                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;