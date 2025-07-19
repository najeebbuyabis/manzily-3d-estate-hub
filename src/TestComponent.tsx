import React, { useState, useEffect } from 'react';

const TestComponent: React.FC = () => {
  const [test, setTest] = useState('React hooks working');
  
  useEffect(() => {
    console.log('React dispatcher is working correctly');
    setTest('React hooks and dispatcher working!');
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'system-ui',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1>{test}</h1>
      <p>If you see this, React is working correctly.</p>
      <button 
        onClick={() => setTest('Button clicked - hooks still working!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test useState
      </button>
    </div>
  );
};

export default TestComponent;