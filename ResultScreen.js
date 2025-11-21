import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  NativeModules, // [중요] NativeModules import
} from 'react-native';
import PushNotification from "react-native-push-notification";

// [중요] 우리가 만든 Native Module (SharedStorage) 사용
const { SharedStorage } = NativeModules;

const { width } = Dimensions.get('window');

const ResultScreen = ({ route, navigation }) => {
  const { resultData } = route.params || {};

  const [activeTab, setActiveTab] = useState('time');
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- 데이터 추출 ---
  const destination = resultData?.destination || '목적지';
  const totalDuration = resultData?.totalDuration || '0분';
  const transferInfo = resultData?.transferInfo || '-';
  const walkingDistance = resultData?.walkingDistance || '-';
  const safetyScore = resultData?.safetyScore || 0;

  const lastTrainTimeStr = resultData?.lastTrainTime;
  const recommendedTimeStr = resultData?.recommendedDepartureTime;
  const latestTimeStr = resultData?.latestDepartureTime || lastTrainTimeStr;

  // --- 헬퍼 함수 ---
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    try {
      const date = new Date(timeString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) { return '--:--'; }
  };

  // [수정] 위젯 데이터 업데이트 함수
  const updateWidget = async () => {
    try {
      // 위젯에 보낼 데이터를 JSON 문자열로 변환
      const widgetData = JSON.stringify({
        destination: destination,
        time: formatTime(recommendedTimeStr),      // 권장 출발 시간
        lastTrain: formatTime(lastTrainTimeStr),   // [추가] 막차 시간
      });

      // Java 모듈(SharedStorage)을 통해 저장
      await SharedStorage.set(widgetData);
      console.log('✅ 위젯 데이터 저장 성공 (Native):', widgetData);
    } catch (error) {
      console.log('❌ 위젯 데이터 저장 실패:', error);
    }
  };

  useEffect(() => {
    // 1. 알림 채널 생성
    PushNotification.createChannel(
      {
        channelId: "departure-alarm",
        channelName: "Departure Alarm",
        channelDescription: "막차 출발 알림",
        playSound: true,
        soundName: "default",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );

    // 2. 화면 진입 시 위젯 데이터 즉시 업데이트
    if (destination && recommendedTimeStr) {
        updateWidget();
    }

    // 3. 현재 시간 타이머
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [destination, recommendedTimeStr]);

  const getCurrentTimeString = () => {
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const calculateMinutesLeft = (targetTimeStr) => {
    if (!targetTimeStr) return 0;
    const target = new Date(targetTimeStr);
    const now = new Date();
    const diffMs = target - now;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins > 0 ? diffMins : 0;
  };

  const getArrivalTime = () => {
    const durationMins = parseInt(totalDuration.replace(/[^0-9]/g, '')) || 0;
    const arrivalDate = new Date(currentTime.getTime() + durationMins * 60000);
    const hours = String(arrivalDate.getHours()).padStart(2, '0');
    const minutes = String(arrivalDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSetAlarm = () => {
    if (!recommendedTimeStr) {
      Alert.alert("오류", "출발 시간 정보가 없어 알람을 설정할 수 없습니다.");
      return;
    }
    const departureDate = new Date(recommendedTimeStr);
    const alarmTime = new Date(departureDate.getTime() - 10 * 60 * 1000);

    if (alarmTime < new Date()) {
      Alert.alert("알림", "출발 알람 시간이 이미 지났습니다.");
      return;
    }

    PushNotification.localNotificationSchedule({
      channelId: "departure-alarm",
      title: "🏃 출발 준비!",
      message: `10분 뒤(${formatTime(recommendedTimeStr)})에 출발해야 막차를 탈 수 있습니다!`,
      date: alarmTime,
      allowWhileIdle: true,
    });

    // 알람 설정 시에도 위젯 업데이트 (확실하게 저장)
    updateWidget();

    Alert.alert("알람 설정 완료", `${formatTime(alarmTime)}에 알림이 울립니다.`);
  };

  // --- 탭 1: 최적 경로 UI ---
  const renderRouteTab = () => (
    <View style={{ gap: 12 }}>
      <View style={styles.cardDefault}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>총 소요 시간</Text>
          <Text style={styles.cardSubTitle}>{getArrivalTime()} 도착 예정</Text>
        </View>
        
        <View style={styles.centerContent}>
          <Text style={styles.heroTimeTextGoogleBlue}>{totalDuration}</Text>
        </View>
        
        <View style={styles.divider} />

        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <View style={styles.iconBox}><Text style={{fontSize: 20}}>🚇</Text></View>
            <View>
              <Text style={styles.infoLabel}>환승 정보</Text>
              <Text style={styles.infoValue}>{transferInfo}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.iconBox}><Text style={{fontSize: 20}}>🚶</Text></View>
            <View>
              <Text style={styles.infoLabel}>도보 거리</Text>
              <Text style={styles.infoValue}>{walkingDistance}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconBox}><Text style={{fontSize: 20}}>🛡️</Text></View>
            <View>
              <Text style={styles.infoLabel}>안전도</Text>
              <Text style={[styles.infoValue, { color: safetyScore >= 70 ? '#1E8E3E' : '#EA4335' }]}>
                {safetyScore}점
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // --- 탭 2: 막차 정보 UI ---
  const renderTimeTab = () => {
    const minutesLeft = calculateMinutesLeft(lastTrainTimeStr);
    const progressPercent = Math.max(0, Math.min(100, (minutesLeft / 180) * 100));

    return (
      <View style={{ gap: 16 }}>
        
        {/* 1. 현재 시각 (기본 테두리) */}
        <View style={styles.cardDefault}>
          <View style={styles.rowBetweenCenter}>
            <View>
              <Text style={styles.cardLabel}>현재 시각</Text>
              <Text style={styles.currentTimeText}>{getCurrentTimeString()}</Text>
            </View>
            <View style={styles.routeTag}>
              <Text style={styles.routeText}>인하대</Text>
              <Text style={styles.routeArrow}>→</Text>
              <Text style={styles.routeTextDest}>{destination}</Text>
            </View>
          </View>
        </View>

        {/* 2. 막차 시간 (빨간색 테두리 강조) */}
        <View style={styles.cardRedBorder}>
          <View style={styles.rowBetweenCenter}>
            <View style={styles.iconTitleRow}>
              <Text style={styles.cardTitle}>막차 시간</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: '#FCE8E6' }]}>
              <Text style={[styles.statusChipText, { color: '#D93025' }]}>{minutesLeft}분 남음</Text>
            </View>
          </View>

          <View style={styles.centerContentVertical}>
             <Text style={styles.heroTimeTextGoogleRed}>{formatTime(lastTrainTimeStr)}</Text>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: '#EA4335' }]} />
          </View>
        </View>

        {/* 3. 권장 출발 시간 (파란색 테두리 강조) */}
        <View style={styles.cardBlueBorder}>
          <View style={styles.rowBetweenCenter}>
            <View style={styles.iconTitleRow}>
              <Text style={styles.cardTitle}>권장 출발</Text>
            </View>
             <View style={[styles.statusChip, { backgroundColor: '#E8F0FE' }]}>
              <Text style={[styles.statusChipText, { color: '#1967D2' }]}>추천</Text>
            </View>
          </View>
          
          <View style={styles.centerContentVertical}>
             <Text style={styles.heroTimeTextGoogleBlue}>{formatTime(recommendedTimeStr)}</Text>
          </View>

          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleSetAlarm}
            activeOpacity={0.9}
          >
            <Text style={styles.googleButtonText}>🔔  10분 전 알림 설정</Text>
          </TouchableOpacity>
        </View>

        {/* 4. 데드라인 정보 (노란색 테두리 경고) */}
        <View style={styles.cardYellowBorder}>
          <View style={styles.rowCenter}>
            <Text style={{ fontSize: 22, marginRight: 12 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: '#B06000', lineHeight: 20 }}>
                늦어도 <Text style={{ fontWeight: 'bold' }}>{formatTime(latestTimeStr)}</Text>에는 출발해야 합니다.
              </Text>
            </View>
          </View>
        </View>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 50 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'route' ? '경로 상세' : '막차 안내'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 탭바 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'route' && styles.tabButtonActive]}
          onPress={() => setActiveTab('route')}
        >
          <Text style={[styles.tabText, activeTab === 'route' && styles.tabTextActive]}>최적 경로</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'time' && styles.tabButtonActive]}
          onPress={() => setActiveTab('time')}
        >
          <Text style={[styles.tabText, activeTab === 'time' && styles.tabTextActive]}>막차 정보</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'route' ? renderRouteTab() : renderTimeTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1, backgroundColor: '#F8F9FA' },
  contentContainer: { padding: 16, paddingBottom: 40 },

  // 헤더
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F3F4',
  },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#202124' },
  
  backButton: { 
    padding: 8, 
    minWidth: 48,
    alignItems: 'center', justifyContent: 'center'
  },
  backIcon: { 
    fontSize: 40, 
    color: '#5F6368', 
    fontWeight: '300',
    includeFontPadding: false,
    lineHeight: 40, 
  },

  // 탭바
  tabContainer: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: '#F1F3F4',
  },
  tabButton: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderRadius: 24, marginHorizontal: 4,
  },
  tabButtonActive: { backgroundColor: '#E8F0FE' },
  tabText: { fontSize: 14, color: '#5F6368', fontWeight: '500' },
  tabTextActive: { color: '#1967D2', fontWeight: '700' },

  // Cards
  cardDefault: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1,
    borderColor: '#DADCE0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardRedBorder: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1.5,
    borderColor: '#F28B82',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardBlueBorder: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1.5,
    borderColor: '#8AB4F8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardYellowBorder: {
    backgroundColor: '#FEF7E0', borderRadius: 16, padding: 16, borderWidth: 1,
    borderColor: '#FDD663',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },

  // Text Styles
  cardLabel: { fontSize: 12, color: '#5F6368', marginBottom: 4, fontWeight: '500' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#202124' },
  cardSubTitle: { fontSize: 14, color: '#5F6368' },
  
  currentTimeText: { fontSize: 32, fontWeight: '400', color: '#202124' },
  
  heroTimeTextGoogleRed: { fontSize: 44, fontWeight: '400', color: '#EA4335' },
  heroTimeTextGoogleBlue: { fontSize: 44, fontWeight: '400', color: '#1967D2' },

  // Layout
  rowBetweenCenter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  centerContent: { alignItems: 'flex-start', marginVertical: 8 },
  centerContentVertical: { alignItems: 'center', marginVertical: 12 },
  iconTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },

  // Components
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F3F4', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  divider: { height: 1, backgroundColor: '#F1F3F4', marginVertical: 16 },
  infoList: { gap: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#5F6368' },
  infoValue: { fontSize: 15, color: '#202124', fontWeight: '500' },

  routeTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F3F4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: '#DADCE0',
  },
  routeText: { fontSize: 13, fontWeight: '500', color: '#5F6368' },
  routeTextDest: { fontSize: 13, fontWeight: '700', color: '#202124' },
  routeArrow: { fontSize: 12, color: '#9CA3AF', marginHorizontal: 6 },

  statusChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  statusChipText: { fontSize: 12, fontWeight: '700' },

  progressBarBg: { height: 4, backgroundColor: '#F1F3F4', borderRadius: 2, overflow: 'hidden', marginTop: 12, width: '100%' },
  progressBarFill: { height: '100%', borderRadius: 2 },

  googleButton: {
    width: '100%',
    backgroundColor: '#1A73E8',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 12,
    elevation: 1,
  },
  googleButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
});

export default ResultScreen;