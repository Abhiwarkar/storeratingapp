// frontend/src/components/common/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const location = useLocation();
  
  const adminLinks = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Manage Users', path: '/admin/users' },
    { name: 'Manage Stores', path: '/admin/stores' }
  ];
  
  const storeOwnerLinks = [
    { name: 'Dashboard', path: '/store-owner' }
  ];
  
  const links = role === 'admin' ? adminLinks : storeOwnerLinks;
  
  return (
    <div className="bg-white shadow-sm w-64 min-h-screen">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          {role === 'admin' ? 'Admin Panel' : 'Store Dashboard'}
        </h2>
      </div>
      
      <nav className="p-4">
        <ul>
          {links.map(link => (
            <li key={link.path} className="mb-1">
              <Link 
                to={link.path}
                className={`block px-4 py-2 rounded-md ${
                  location.pathname === link.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;