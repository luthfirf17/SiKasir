/**
 * ModuleDemo.tsx
 * 
 * File demo untuk menunjukkan penggunaan struktur modul baru
 * Contoh implementasi routing dan penggunaan komponen dari setiap modul
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import dari modul admin
import { 
  AdminDashboard, 
  AdminLayout, 
  ModernAdminNavigation 
} from './modules/admin';

// Import dari modul kasir
import { 
  KasirDashboard, 
  KasirLayout, 
  KasirNavigation 
} from './modules/kasir';

// Import dari modul owner
import { 
  OwnerDashboard, 
  OwnerNavigation 
} from './modules/owner';

// Import dari modul kitchen
import { 
  KitchenDashboard, 
  KitchenNavigation 
} from './modules/kitchen';

// Import dari modul customer
import { 
  CustomerApp, 
  CustomerNavigation 
} from './modules/customer';

// Demo component untuk menunjukkan penggunaan
const ModuleDemo: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" />} />
          </Routes>
        } />

        {/* Kasir Routes */}
        <Route path="/kasir/*" element={
          <Routes>
            <Route path="dashboard" element={<KasirDashboard />} />
            <Route path="*" element={<Navigate to="/kasir/dashboard" />} />
          </Routes>
        } />

        {/* Owner Routes */}
        <Route path="/owner/*" element={
          <Routes>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="*" element={<Navigate to="/owner/dashboard" />} />
          </Routes>
        } />

        {/* Kitchen Routes */}
        <Route path="/kitchen/*" element={
          <Routes>
            <Route path="dashboard" element={<KitchenDashboard />} />
            <Route path="*" element={<Navigate to="/kitchen/dashboard" />} />
          </Routes>
        } />

        {/* Customer Routes */}
        <Route path="/customer/*" element={
          <Routes>
            <Route path="app" element={<CustomerApp />} />
            <Route path="*" element={<Navigate to="/customer/app" />} />
          </Routes>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    </Router>
  );
};

// Contoh penggunaan Layout tanpa routing
const LayoutExamples: React.FC = () => {
  const handleNavigation = (path: string) => {
    console.log('Navigate to:', path);
  };

  return (
    <div>
      {/* Example: Admin Layout - Using ModernAdminNavigation */}
      <div style={{ display: 'flex' }}>
        <ModernAdminNavigation
          open={true}
          onItemClick={handleNavigation}
          onToggle={() => {}}
          currentPath="/admin/dashboard"
        />
        <div style={{ flex: 1, padding: '20px' }}>
          <h2>User Management</h2>
          <p>Admin content goes here...</p>
        </div>
      </div>

      {/* Example: Kasir Layout - Now works with React Router */}
      <div style={{ border: '2px solid #10b981', borderRadius: '8px', padding: '20px', margin: '20px 0' }}>
        <h3 style={{ color: '#10b981', marginBottom: '10px' }}>Kasir Layout (React Router Integration)</h3>
        <p>KasirLayout sekarang bekerja dengan React Router menggunakan &lt;Outlet /&gt;.</p>
        <p>Untuk melihat demo, gunakan routing: <code>/kasir/dashboard</code></p>
        <div style={{ backgroundColor: '#f0f9ff', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
          <strong>Contoh penggunaan dalam routing:</strong>
          <pre style={{ margin: '5px 0', fontSize: '12px' }}>
{`<Route path="/kasir" element={<KasirLayout />}>
  <Route path="dashboard" element={<KasirDashboard />} />
</Route>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Contoh penggunaan Navigation standalone
const NavigationExamples: React.FC = () => {
  const handleNavigation = (path: string) => {
    console.log('Navigate to:', path);
  };

  return (
    <div>
      {/* Example: Admin Navigation */}
      <ModernAdminNavigation
        open={true}
        onItemClick={handleNavigation}
        onToggle={() => {}}
        currentPath="/admin/dashboard"
      />

      {/* Example: Kasir Navigation */}
      <KasirNavigation
        open={true}
        onItemClick={handleNavigation}
        currentPath="/kasir/dashboard"
      />

      {/* Example: Owner Navigation */}
      <OwnerNavigation
        open={true}
        onItemClick={handleNavigation}
        currentPath="/owner/dashboard"
      />

      {/* Example: Kitchen Navigation */}
      <KitchenNavigation
        open={true}
        onItemClick={handleNavigation}
        currentPath="/kitchen/dashboard"
      />

      {/* Example: Customer Navigation */}
      <CustomerNavigation
        open={true}
        onItemClick={handleNavigation}
        currentPath="/customer/menu"
      />
    </div>
  );
};

export default ModuleDemo;
export { LayoutExamples, NavigationExamples };
