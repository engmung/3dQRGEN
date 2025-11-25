import { useDesignStore, type ProductType } from '../store/useDesignStore';

const sectionStyle = {
  marginBottom: '20px',
  padding: '16px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  border: '1px solid #e5e0db'
};

const labelStyle = {
  display: 'block',
  marginBottom: '12px',
  fontWeight: 600,
  fontSize: '16px',
  color: '#333'
};

const radioGroupStyle = {
  display: 'flex',
  gap: '16px'
};

const radioLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '15px'
};

export function ProductTypeSelector() {
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const plates = useDesignStore((state) => state.plates);
  const updatePlate = useDesignStore((state) => state.updatePlate);

  const selectedPlate = plates.find(p => p.id === selectedPlateId);
  if (!selectedPlate) return null;

  const handleProductTypeChange = (productType: ProductType) => {
    updatePlate(selectedPlate.id, {
      productType,
      texts: [],  // Reset arrays when product type changes
      images: [],  // Reset arrays when product type changes
    });
  };

  return (
    <div style={sectionStyle}>
      <label style={labelStyle}>Product Type</label>
      <div style={radioGroupStyle}>
        <label style={radioLabelStyle}>
          <input
            type="radio"
            name="productType"
            value="stand"
            checked={selectedPlate.productType === 'stand'}
            onChange={() => handleProductTypeChange('stand')}
          />
          <span>QR Stand</span>
        </label>
        <label style={radioLabelStyle}>
          <input
            type="radio"
            name="productType"
            value="card"
            checked={selectedPlate.productType === 'card'}
            onChange={() => handleProductTypeChange('card')}
          />
          <span>Business Card</span>
        </label>
      </div>
    </div>
  );
}
