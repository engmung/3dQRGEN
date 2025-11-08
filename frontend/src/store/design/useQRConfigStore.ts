import { usePlateStore } from './usePlateStore';
import type { QRType } from '../../types/design';
import type { WiFiData, EmailData } from '../../utils/qrGenerator';

/**
 * QR 설정 전용 스토어
 * usePlateStore의 선택된 판에 대한 QR 관련 설정만 관리
 */
export const useQRConfigStore = () => {
  const plates = usePlateStore(state => state.plates);
  const selectedPlateId = usePlateStore(state => state.selectedPlateId);
  const updatePlate = usePlateStore(state => state.updatePlate);

  const selectedPlate = plates.find(p => p.id === selectedPlateId);

  return {
    // 현재 선택된 판의 QR 설정
    qrType: selectedPlate?.qrType ?? 'url',
    qrUrl: selectedPlate?.qrUrl ?? 'https://example.com',
    qrWifiData: selectedPlate?.qrWifiData ?? { ssid: '', password: '', security: 'WPA' as const },
    qrEmailData: selectedPlate?.qrEmailData ?? { recipient: '', subject: '', body: '' },
    qrSize: selectedPlate?.qrSize ?? 50,
    qrThickness: selectedPlate?.qrThickness ?? 2,
    qrHeightOffset: selectedPlate?.qrHeightOffset ?? 0,
    qrHorizontalOffset: selectedPlate?.qrHorizontalOffset ?? 0,

    // QR 타입 변경
    setQRType: (qrType: QRType) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { qrType });
      }
    },

    // URL 변경
    setQRUrl: (qrUrl: string) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { qrUrl });
      }
    },

    // WiFi 데이터 변경
    setQRWifiData: (qrWifiData: WiFiData) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { qrWifiData });
      }
    },

    // Email 데이터 변경
    setQREmailData: (qrEmailData: EmailData) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { qrEmailData });
      }
    },

    // QR 크기 변경
    setQRSize: (qrSize: number) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { qrSize });
      }
    },

    // QR 두께 변경
    setQRThickness: (qrThickness: number) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { qrThickness });
      }
    },

    // QR 높이 오프셋 변경
    setQRHeightOffset: (qrHeightOffset: number) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { qrHeightOffset });
      }
    },

    // QR 좌우 오프셋 변경
    setQRHorizontalOffset: (qrHorizontalOffset: number) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { qrHorizontalOffset });
      }
    },
  };
};
