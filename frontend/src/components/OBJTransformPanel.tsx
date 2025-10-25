import { useOBJPreviewStore, type Transform } from '../store/objPreviewStore';

const sectionStyle = {
  marginBottom: '20px',
  padding: '15px',
  background: '#f9f9f9',
  borderRadius: '8px',
  border: '1px solid #ddd',
};

const labelStyle = {
  display: 'block',
  marginBottom: '4px',
  fontWeight: 'bold' as const,
  fontSize: '11px',
  color: '#555',
};

const inputNumberStyle = {
  width: '100%',
  padding: '6px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '13px',
  boxSizing: 'border-box' as const,
};

interface TransformControlsProps {
  title: string;
  transform: Transform;
  onUpdate: (transform: Partial<Transform>) => void;
}

const TransformControls = ({ title, transform, onUpdate }: TransformControlsProps) => {
  return (
    <div style={sectionStyle}>
      <h4 style={{ marginTop: 0, marginBottom: '10px', fontSize: '13px', color: '#333' }}>
        {title}
      </h4>

      {/* Position */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Pos X (mm)</label>
            <input
              type="number"
              value={transform.position[0]}
              onChange={(e) =>
                onUpdate({
                  position: [Number(e.target.value), transform.position[1], transform.position[2]],
                })
              }
              step="0.1"
              style={inputNumberStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Pos Y (mm)</label>
            <input
              type="number"
              value={transform.position[1]}
              onChange={(e) =>
                onUpdate({
                  position: [transform.position[0], Number(e.target.value), transform.position[2]],
                })
              }
              step="0.1"
              style={inputNumberStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Pos Z (mm)</label>
            <input
              type="number"
              value={transform.position[2]}
              onChange={(e) =>
                onUpdate({
                  position: [transform.position[0], transform.position[1], Number(e.target.value)],
                })
              }
              step="0.1"
              style={inputNumberStyle}
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Rot X (°)</label>
            <input
              type="number"
              value={transform.rotation[0]}
              onChange={(e) =>
                onUpdate({
                  rotation: [Number(e.target.value), transform.rotation[1], transform.rotation[2]],
                })
              }
              step="1"
              style={inputNumberStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Rot Y (°)</label>
            <input
              type="number"
              value={transform.rotation[1]}
              onChange={(e) =>
                onUpdate({
                  rotation: [transform.rotation[0], Number(e.target.value), transform.rotation[2]],
                })
              }
              step="1"
              style={inputNumberStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Rot Z (°)</label>
            <input
              type="number"
              value={transform.rotation[2]}
              onChange={(e) =>
                onUpdate({
                  rotation: [transform.rotation[0], transform.rotation[1], Number(e.target.value)],
                })
              }
              step="1"
              style={inputNumberStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const OBJTransformPanel = () => {
  const backTransform = useOBJPreviewStore((state) => state.backTransform);
  const brigeTransform = useOBJPreviewStore((state) => state.brigeTransform);
  const frontTransform = useOBJPreviewStore((state) => state.frontTransform);
  const pinTransform = useOBJPreviewStore((state) => state.pinTransform);
  const globalRotation = useOBJPreviewStore((state) => state.globalRotation);

  const updateBackTransform = useOBJPreviewStore((state) => state.updateBackTransform);
  const updateBrigeTransform = useOBJPreviewStore((state) => state.updateBrigeTransform);
  const updateFrontTransform = useOBJPreviewStore((state) => state.updateFrontTransform);
  const updatePinTransform = useOBJPreviewStore((state) => state.updatePinTransform);
  const updateGlobalRotation = useOBJPreviewStore((state) => state.updateGlobalRotation);
  const resetAllTransforms = useOBJPreviewStore((state) => state.resetAllTransforms);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '50vh',
        overflowY: 'auto',
        background: '#fff',
        borderTop: '2px solid #333',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 200,
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>🎛️ OBJ Transform 컨트롤</h3>
        <button
          onClick={resetAllTransforms}
          style={{
            padding: '8px 16px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#f57c00')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#ff9800')}
        >
          🔄 Reset All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {/* Back */}
        <TransformControls
          title="🔹 Back 파츠"
          transform={backTransform}
          onUpdate={updateBackTransform}
        />

        {/* Brige */}
        <TransformControls
          title="🔹 Brige 파츠"
          transform={brigeTransform}
          onUpdate={updateBrigeTransform}
        />

        {/* Front (QR/텍스트/이미지 포함) */}
        <TransformControls
          title="🔹 Front 파츠 (+ QR/텍스트/이미지)"
          transform={frontTransform}
          onUpdate={updateFrontTransform}
        />

        {/* Pin */}
        <TransformControls
          title="🔹 Pin 파츠"
          transform={pinTransform}
          onUpdate={updatePinTransform}
        />
      </div>

      {/* Global Rotation */}
      <div style={{ ...sectionStyle, marginTop: '15px', background: '#e3f2fd' }}>
        <h4 style={{ marginTop: 0, marginBottom: '10px', fontSize: '13px', color: '#0277bd' }}>
          🌍 Global Rotation (전체 눕히기)
        </h4>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Rot X (°)</label>
            <input
              type="number"
              value={globalRotation[0]}
              onChange={(e) =>
                updateGlobalRotation([Number(e.target.value), globalRotation[1], globalRotation[2]])
              }
              step="1"
              style={inputNumberStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Rot Y (°)</label>
            <input
              type="number"
              value={globalRotation[1]}
              onChange={(e) =>
                updateGlobalRotation([globalRotation[0], Number(e.target.value), globalRotation[2]])
              }
              step="1"
              style={inputNumberStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Rot Z (°)</label>
            <input
              type="number"
              value={globalRotation[2]}
              onChange={(e) =>
                updateGlobalRotation([globalRotation[0], globalRotation[1], Number(e.target.value)])
              }
              step="1"
              style={inputNumberStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
