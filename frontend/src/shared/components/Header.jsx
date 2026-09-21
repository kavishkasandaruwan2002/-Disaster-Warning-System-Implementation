import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{
      background: '#0f172a',
      color: '#ffffff',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h2 style={{ margin: 0 }}>DEWECS - Disaster Warning System</h2>
      <nav style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/" style={{ color: '#93c5fd', textDecoration: 'none' }}>Home</Link>
        <Link to="/ground-reports" style={{ color: '#93c5fd', textDecoration: 'none' }}>Ground Reports</Link>
        <Link to="/hazard-warnings" style={{ color: '#93c5fd', textDecoration: 'none' }}>Hazard Warnings</Link>
        <Link to="/resources" style={{ color: '#93c5fd', textDecoration: 'none' }}>Resources</Link>
        <Link to="/analysis-reports" style={{ color: '#93c5fd', textDecoration: 'none' }}>Analysis Reports</Link>
      </nav>
    </header>
  );
};

export default Header;
