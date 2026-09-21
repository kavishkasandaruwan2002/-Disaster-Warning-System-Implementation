import React from 'react';
import Header from '../components/Header';

const MainLayout = ({ children }) => {
  return (
    <div>
      <Header />
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
