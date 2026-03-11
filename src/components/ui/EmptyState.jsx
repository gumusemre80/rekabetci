import React from 'react';

const EmptyState = ({ 
  icon = "ℹ️", 
  title = "Veri Bulunamadı", 
  message = "Burada henüz gösterilecek bir şey yok.",
  children
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem',
      textAlign: 'center',
      animation: 'fadeIn 0.4s ease-out'
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem',
        opacity: 0.8,
        filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.05))'
      }}>
        {icon}
      </div>
      <h3 style={{ 
        fontSize: '1.25rem', 
        color: 'var(--accent)', 
        marginBottom: '0.5rem',
        fontWeight: 600 
      }}>
        {title}
      </h3>
      <p style={{ 
        color: 'var(--text-muted)', 
        fontSize: '0.9rem',
        maxWidth: '280px',
        lineHeight: 1.5,
        margin: 0
      }}>
        {message}
      </p>
      {children && (
        <div style={{ marginTop: '1.5rem', width: '100%' }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
