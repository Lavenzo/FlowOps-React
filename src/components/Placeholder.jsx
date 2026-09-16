export default function Placeholder({ title }) {
  return (
    <div className="placeholder-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#6b7280',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h2 style={{ color: '#374151', fontSize: '1.5rem', marginBottom: '1rem' }}>
        {title}
      </h2>
      <p style={{ fontSize: '1.125rem' }}>
        Module coming in a future FlowOps release.
      </p>
    </div>
  );
}
