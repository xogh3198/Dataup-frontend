import { Platform } from 'react-native';

/**
 * API 기본 URL 설정
 * * - iOS 시뮬레이터: localhost 사용 가능
 * - Android 에뮬레이터: 10.0.2.2 사용 (localhost 대신)
 * - 실제 기기: 컴퓨터의 로컬 IP 주소 사용 필요 (예: 192.168.0.100)
 */

// -------------------------------------------------------------------
// ⭐️ 실제 기기 테스트 시, 본인의 Mac IP 주소를 여기에 입력하세요!
// (예: '192.168.1.10')
const DEVICE_IP = null;
// -------------------------------------------------------------------

const getBaseURL = () => {
  if (DEVICE_IP) {
    // 실제 기기 테스트용 IP (위에서 입력한 값)
    return `http://${DEVICE_IP}:8080`;
  }

  if (__DEV__) {
    // 개발 모드 (시뮬레이터/에뮬레이터)
    if (Platform.OS === 'android') {
      // Android 에뮬레이터는 10.0.2.2 사용
      return 'http://10.0.2.2:8080';
    } else {
      // iOS 시뮬레이터는 localhost 사용
      return 'http://localhost:8080';
    }
  } else {
    // 프로덕션 환경 (실제 서버 주소로 변경 필요)
    return 'https://your-production-server.com';
  }
};

export const API_BASE_URL = getBaseURL();

// API 엔드포인트
export const API_ENDPOINTS = {
  SEARCH: '/api/search',
};

// 전체 API URL 생성 함수
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};