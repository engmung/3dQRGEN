import { useDesignStore } from '../../../store/useDesignStore';

interface PresetImageGridProps {
  plateId: string;
}

const presetImages = [
  { src: '/images/insta.png', name: 'insta.png', label: 'Instagram' },
  { src: '/images/wifi.png', name: 'wifi.png', label: 'WiFi' },
];

const buttonStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  border: '2px solid #ddd',
  borderRadius: '4px',
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  outline: 'none',
};

export function PresetImageGrid({ plateId }: PresetImageGridProps) {
  const handlePresetClick = async (src: string, name: string) => {
    const response = await fetch(src);
    const blob = await response.blob();
    const file = new File([blob], name, { type: 'image/png' });
    useDesignStore.getState().addImage(plateId, file);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      {presetImages.map((preset) => (
        <button
          key={preset.src}
          onClick={() => handlePresetClick(preset.src, preset.name)}
          style={buttonStyle}
        >
          <img src={preset.src} alt={preset.label} style={{ width: '32px', height: '32px' }} />
          <span>{preset.label}</span>
        </button>
      ))}
    </div>
  );
}
