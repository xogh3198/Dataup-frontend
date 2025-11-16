# 막차 타임 - 인하대생 안전 귀가 서비스

인하대학교 통학생을 위한 늦은 밤 막차 정보 및 도보 구간 안전도 통합 안내 서비스입니다.

## 주요 기능

### P0 (필수 기능)
- **막차 기반 최소 출발 시각 계산**: 막차를 놓치지 않도록 가장 늦은 출발 시각 제공
- **도보 구간 안전도 평가**: 범죄 통계 기반 안전도 점수 계산 및 경고 표시

### P1 (확장 기능)
- 최적 동선 비교 추천 (향후 구현 예정)

## 기술 스택

- **Frontend**: React Native
- **Navigation**: React Navigation (Stack Navigator)
- **HTTP Client**: Axios
- **Backend**: Spring Boot (REST API)
- **Database**: PostgreSQL

## 프로젝트 구조

```
frontend/
├── App.js              # 네비게이션 설정 및 앱 진입점
├── HomeScreen.js       # 홈 화면 (경로 입력)
├── ResultScreen.js     # 결과 화면 (막차 시각, 안전도 표시)
├── index.js            # React Native 앱 등록
├── package.json        # 의존성 관리
└── app.json            # 앱 설정
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

또는

```bash
yarn install
```

### 2. iOS 실행

```bash
npm run ios
```

### 3. Android 실행

```bash
npm run android
```

## API 연동

### 백엔드 API 엔드포인트 설정

`HomeScreen.js` 파일에서 API URL을 수정하세요:

```javascript
const API_URL = 'http://[YOUR_SPRING_BOOT_API_URL]/api/search';
```

### API 요청 형식

```javascript
GET /api/search?start=인하대학교&end=강남역
```

### API 응답 형식 (예상)

```json
{
  "destination": "강남역",
  "lastTrainTime": "2024-01-15T22:40:00",
  "recommendedDepartureTime": "2024-01-15T21:25:00",
  "latestDepartureTime": "2024-01-15T22:40:00",
  "totalDuration": "1시간 15분",
  "transferInfo": "9-1, 1호선",
  "walkingDistance": "580m",
  "safetyScore": 72
}
```

## 화면 구성

### HomeScreen (홈 화면)
- 출발지: 인하대학교 (고정)
- 도착지: 사용자 입력 (자동완성 지원 예정)
- 자주 가는 목적지: 빠른 선택을 위한 카드
- 경로 검색 버튼

### ResultScreen (결과 화면)
- 현재 시각 (실시간 업데이트)
- 목적지 정보
- 막차 시각
- 권장 출발 시각
- 최대 출발 시각
- 경로 상세 정보 (소요 시간, 환승 정보, 도보 거리)
- 안전도 점수 및 배지
- 안전 위험 경고 (안전도 70점 미만 시)

## 개발 참고사항

### 스타일링
- 모든 스타일은 `StyleSheet.create`를 사용하여 정의
- Figma 디자인 기반으로 UI 구성
- 색상 팔레트:
  - Primary: `#007AFF`
  - Background: `#F4F7FF`
  - Danger: `#F44336`
  - Safe: `#4CAF50`
  - Warning: `#FF9800`

### 아이콘
현재는 이모지로 아이콘을 대체하고 있습니다. 프로덕션에서는 `react-native-vector-icons` 같은 라이브러리 사용을 권장합니다.

## 향후 개선 사항

- [ ] 도착지 자동완성 기능 구현
- [ ] 지도 연동 (P1)
- [ ] 다중 경로 비교 기능 (P1)
- [ ] 사용자 위치 기반 출발지 자동 설정
- [ ] 최근 검색 기록 저장
- [ ] 푸시 알림 (막차 시간 알림)

## 라이선스

이 프로젝트는 Dataup Contest 4조의 프로젝트입니다.

