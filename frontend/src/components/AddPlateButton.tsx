import { useDesignStore } from '../store/useDesignStore';

export const AddPlateButton = () => {
  const addPlate = useDesignStore((state) => state.addPlate);

  return (
    <button
      onClick={addPlate}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        minWidth: '50px',
        minHeight: '50px',
        borderRadius: '50%',
        background: '#4CAF50',
        color: 'white',
        border: 'none',
        fontSize: '28px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'transform 0.2s, background 0.2s',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.background = '#45a049';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.background = '#4CAF50';
      }}
      title="Add plate"
    >
      +
    </button>
  );
};
