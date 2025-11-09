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
      texts: [],  // 제품 유형 변경 시 배열 초기화
      images: [],  // 제품 유형 변경 시 배열 초기화
    });
  };

  return (
    <div style={sectionStyle}>
      <label style={labelStyle}>제품 유형</label>
      <div style={radioGroupStyle}>
        <label style={radioLabelStyle}>
          <input
            type="radio"
            name="productType"
            value="stand"
            checked={selectedPlate.productType === 'stand'}
            onChange={() => handleProductTypeChange('stand')}
          />
          <span>QR 거치대</span>
        </label>
        <label style={radioLabelStyle}>
          <input
            type="radio"
            name="productType"
            value="card"
            checked={selectedPlate.productType === 'card'}
            onChange={() => handleProductTypeChange('card')}
          />
          <span>명함</span>
        </label>
      </div>
    </div>
  );
}
