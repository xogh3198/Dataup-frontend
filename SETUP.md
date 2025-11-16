# 막차 타임 앱 실행 가이드

## 사전 준비

### 1. 백엔드 서버 실행

백엔드 서버가 먼저 실행되어 있어야 합니다.

```bash
cd ../backend/dataup
./gradlew bootRun
```

또는

```bash
cd ../backend/dataup
./gradlew build
java -jar build/libs/dataup-0.0.1-SNAPSHOT.jar
```

백엔드 서버가 정상적으로 실행되면 `http://localhost:8080`에서 접근 가능합니다.

### 2. 프론트엔드 의존성 설치

```bash
cd frontend
npm install
```

## 실행 방법

### iOS 시뮬레이터에서 실행

1. Xcode가 설치되어 있어야 합니다.
2. Metro 번들러 시작:
   ```bash
   npm start
   ```
3. 새 터미널에서 iOS 앱 실행:
   ```bash
   npm run ios
   ```

### Android 에뮬레이터에서 실행

1. Android Studio가 설치되어 있고 에뮬레이터가 실행 중이어야 합니다.
2. Metro 번들러 시작:
   ```bash
   npm start
   ```
3. 새 터미널에서 Android 앱 실행:
   ```bash
   npm run android
   ```

### 실제 기기에서 실행

실제 기기에서 테스트하려면:

1. **컴퓨터와 기기가 같은 Wi-Fi 네트워크에 연결**되어 있어야 합니다.

2. **컴퓨터의 IP 주소 확인**:
   - macOS/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
   - 예: `192.168.0.100`

3. **API 설정 파일 수정**:
   `src/config/api.js` 파일을 열고:
   ```javascript
   export const DEVICE_IP = '192.168.0.100'; // 실제 IP로 변경
   ```
   
   그리고 `getBaseURL` 함수를 수정:
   ```javascript
   const getBaseURL = () => {
     if (__DEV__) {
       if (DEVICE_IP) {
         return `http://${DEVICE_IP}:8080`;
       }
       // ... 기존 코드
     }
   };
   ```

4. **백엔드 서버가 외부 접근을 허용하도록 설정**:
   `backend/dataup/src/main/resources/application.properties`에 추가:
   ```properties
   server.address=0.0.0.0
   ```

5. **앱 실행**:
   ```bash
   npm run ios
   # 또는
   npm run android
   ```

## 테스트 방법

### 1. 백엔드 API 직접 테스트

터미널에서:
```bash
curl "http://localhost:8080/api/search?start=인하대학교&end=강남역"
```

정상 응답 예시:
```json
{
  "destination": "강남역",
  "lastTrainTime": "2024-01-15T22:40:00",
  "recommendedDepartureTime": "2024-01-15T21:25:00",
  "latestDepartureTime": "2024-01-15T22:40:00",
  "totalDuration": "75분",
  "transferInfo": "9-1, 1호선",
  "walkingDistance": "580m",
  "safetyScore": 72
}
```

### 2. 앱에서 테스트

1. 앱 실행 후 홈 화면에서 도착지 입력 (예: "강남역")
2. "경로 검색" 버튼 클릭
3. 결과 화면에서 다음 정보 확인:
   - 현재 시각
   - 목적지 정보
   - 막차 시각
   - 권장 출발 시각
   - 안전도 점수

### 3. 디버깅

React Native 디버거 사용:
- iOS: `Cmd + D` → "Debug"
- Android: `Cmd + M` (Mac) 또는 `Ctrl + M` (Windows) → "Debug"

콘솔 로그 확인:
- Metro 번들러 터미널에서 API 호출 로그 확인
- Chrome DevTools에서 네트워크 요청 확인

## 문제 해결

### 백엔드 연결 실패

1. **백엔드 서버가 실행 중인지 확인**:
   ```bash
   curl http://localhost:8080/api/search?start=인하대학교&end=강남역
   ```

2. **포트 확인**: 백엔드가 8080 포트에서 실행 중인지 확인

3. **방화벽 확인**: 방화벽이 8080 포트를 차단하지 않는지 확인

### Android 에뮬레이터에서 연결 실패

- Android 에뮬레이터는 `10.0.2.2`를 사용해야 합니다.
- `src/config/api.js`에서 자동으로 설정됩니다.

### iOS 시뮬레이터에서 연결 실패

- `localhost` 또는 `127.0.0.1`을 사용해야 합니다.
- `src/config/api.js`에서 자동으로 설정됩니다.

### 실제 기기에서 연결 실패

1. 컴퓨터와 기기가 같은 Wi-Fi에 연결되어 있는지 확인
2. 컴퓨터의 IP 주소가 올바른지 확인
3. 백엔드 서버가 `0.0.0.0`으로 바인딩되어 있는지 확인
4. 라우터의 AP 격리 기능이 꺼져 있는지 확인

## 개발 모드 vs 프로덕션 모드

- **개발 모드** (`__DEV__ = true`): 로컬 서버 사용
- **프로덕션 모드** (`__DEV__ = false`): 실제 서버 URL 사용 (배포 시 수정 필요)

