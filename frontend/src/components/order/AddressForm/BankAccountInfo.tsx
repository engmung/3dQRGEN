/**
 * BankAccountInfo Component
 * Bank account information with copy buttons
 */

import React from 'react';
import { COLORS } from '../../../constants/colors';
import CopyButton from '../../common/CopyButton';
import { formatPrice } from '../../../utils/formatters';

interface BankAccountInfoProps {
  totalPrice: number;
}

const BANK_INFO = {
  BANK_NAME: '신한은행',
  ACCOUNT_NUMBER: '110-548-406070',
  ACCOUNT_NUMBER_PLAIN: '110548406070',
  ACCOUNT_HOLDER: '이승훈',
};

export const BankAccountInfo: React.FC<BankAccountInfoProps> = ({ totalPrice }) => {
  const handleCopyAll = async () => {
    const accountInfo = `${BANK_INFO.BANK_NAME} ${BANK_INFO.ACCOUNT_NUMBER} (예금주: ${BANK_INFO.ACCOUNT_HOLDER})\n입금액: ${formatPrice(totalPrice)}`;

    try {
      await navigator.clipboard.writeText(accountInfo);
      alert('전체 입금 정보가 복사되었습니다');
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>💳</span>
        <span style={styles.headerText}>입금 계좌 정보</span>
      </div>

      <div style={styles.accountCard}>
        {/* Bank Name */}
        <div style={styles.row}>
          <div style={styles.fieldContainer}>
            <div style={styles.fieldLabel}>은행명</div>
            <div style={styles.fieldValue}>{BANK_INFO.BANK_NAME}</div>
          </div>
          <CopyButton value={BANK_INFO.BANK_NAME} label="복사" size="sm" />
        </div>

        {/* Account Number */}
        <div style={styles.row}>
          <div style={styles.fieldContainer}>
            <div style={styles.fieldLabel}>계좌번호</div>
            <div style={{ ...styles.fieldValue, fontFamily: 'monospace', fontSize: '20px' }}>
              {BANK_INFO.ACCOUNT_NUMBER}
            </div>
          </div>
          <CopyButton value={BANK_INFO.ACCOUNT_NUMBER_PLAIN} label="복사" size="sm" />
        </div>

        {/* Account Holder */}
        <div style={styles.row}>
          <div style={styles.fieldContainer}>
            <div style={styles.fieldLabel}>예금주</div>
            <div style={styles.fieldValue}>{BANK_INFO.ACCOUNT_HOLDER}</div>
          </div>
          <CopyButton value={BANK_INFO.ACCOUNT_HOLDER} label="복사" size="sm" />
        </div>
      </div>

      {/* Copy All Button */}
      <button onClick={handleCopyAll} style={styles.copyAllButton}>
        전체 계좌정보 복사하기
      </button>

      {/* Info Box */}
      <div style={styles.infoBox}>
        <div style={styles.infoText}>
          <strong style={styles.infoTitle}>주문 진행 안내</strong>
          <br />
          • 입금 확인 후 생산이 시작됩니다
          <br />
          • 입금자명은 주문자명과 동일하게 해주세요
          <br />
          • 주문 진행 상황은 '내 주문' 메뉴에서 확인 가능합니다
          <br />• 입금 확인은 영업일 기준 24시간 이내 처리됩니다
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px',
  } as React.CSSProperties,

  header: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: COLORS.UI.TEXT_PRIMARY,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,

  icon: {
    fontSize: '24px',
  } as React.CSSProperties,

  headerText: {
    fontSize: '16px',
  } as React.CSSProperties,

  accountCard: {
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: `1px solid ${COLORS.UI.BORDER}`,
    marginBottom: '12px',
  } as React.CSSProperties,

  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  } as React.CSSProperties,

  fieldContainer: {
    flex: 1,
  } as React.CSSProperties,

  fieldLabel: {
    fontSize: '12px',
    color: COLORS.UI.TEXT_SECONDARY,
    marginBottom: '4px',
  } as React.CSSProperties,

  fieldValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#000',
  } as React.CSSProperties,

  copyAllButton: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    backgroundColor: COLORS.INFO,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '15px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  infoBox: {
    padding: '12px',
    backgroundColor: '#F5F3F0',
    borderRadius: '6px',
    border: `1px solid ${COLORS.UI.BORDER}`,
  } as React.CSSProperties,

  infoText: {
    fontSize: '13px',
    color: COLORS.UI.TEXT_SECONDARY,
    lineHeight: '1.6',
  } as React.CSSProperties,

  infoTitle: {
    color: COLORS.UI.TEXT_PRIMARY,
  } as React.CSSProperties,
};
