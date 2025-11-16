import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';

// Icon Components
const ClockIcon = () => <Text style={styles.icon}>🕒</Text>;
const LocationIcon = () => <Text style={styles.icon}>📍</Text>;
const WarningIcon = () => <Text style={styles.icon}>⚠️</Text>;
const CheckIcon = () => <Text style={styles.icon}>✓</Text>;

const ResultScreen = ({ route, navigation }) => {
  const { resultData } = route.params || {};
  
  // 현재 시각을 실시간으로 업데이트
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // 1초마다 현재 시각 업데이트
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // 시간 포맷팅 함수 (백엔드 LocalDateTime 형식 처리)
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    
    try {
      // 백엔드에서 LocalDateTime이 JSON으로 변환되면 ISO 8601 형식 문자열로 전송됨
      // 예: "2024-01-15T22:40:00" 또는 "2024-01-15T22:40:00.000"
      const date = new Date(timeString);
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('시간 포맷팅 오류:', error);
      return '--:--';
    }
  };

  // 현재 시각 포맷팅
  const getCurrentTimeString = () => {
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 안전도 점수에 따른 색상 결정
  const getSafetyColor = (score) => {
    if (score >= 80) return '#4CAF50'; // 안전 (녹색)
    if (score >= 70) return '#FF9800'; // 주의 (주황색)
    return '#F44336'; // 위험 (빨간색)
  };

  // 안전도 점수에 따른 텍스트
  const getSafetyText = (score) => {
    if (score >= 80) return '안전';
    if (score >= 70) return '주의';
    return '위험';
  };

  // 안전도 점수가 임계값(70점) 미만인지 확인
  const isDangerous = resultData?.safetyScore < 70;

  // 목적지 정보
  const destination = resultData?.destination || '목적지 정보 없음';
  
  // 막차 시각
  const lastTrainTime = resultData?.lastTrainTime || null;
  
  // 권장 출발 시각
  const recommendedDepartureTime = resultData?.recommendedDepartureTime || null;
  
  // 최대 늦춰도 출발 가능한 시간 (막차 시각과 동일하거나 다른 기준)
  const latestDepartureTime = resultData?.latestDepartureTime || lastTrainTime;
  
  // 안전도 점수
  const safetyScore = resultData?.safetyScore || 0;
  
  // 총 소요 시간
  const totalDuration = resultData?.totalDuration || '--';
  
  // 환승 정보
  const transferInfo = resultData?.transferInfo || '정보 없음';
  
  // 도보 거리
  const walkingDistance = resultData?.walkingDistance || '--';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>경로 검색 결과</Text>
        </View>

        {/* 현재 시각 카드 */}
        <View style={styles.currentTimeCard}>
          <ClockIcon />
          <View style={styles.currentTimeContent}>
            <Text style={styles.currentTimeLabel}>현재 시각</Text>
            <Text style={styles.currentTimeValue}>{getCurrentTimeString()}</Text>
          </View>
        </View>

        {/* 목적지 정보 */}
        <View style={styles.destinationCard}>
          <LocationIcon />
          <View style={styles.destinationContent}>
            <Text style={styles.destinationLabel}>목적지</Text>
            <Text style={styles.destinationValue}>{destination}</Text>
          </View>
        </View>

        {/* 막차 시각 및 출발 시각 정보 */}
        <View style={styles.timeInfoCard}>
          <Text style={styles.timeInfoTitle}>막차 정보</Text>
          
          {/* 막차 시각 */}
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>막차 시각</Text>
            <Text style={styles.timeValue}>
              {lastTrainTime ? formatTime(lastTrainTime) : '--:--'}
            </Text>
          </View>

          {/* 권장 출발 시각 */}
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>권장 출발 시각</Text>
            <Text style={[styles.timeValue, styles.recommendedTime]}>
              {recommendedDepartureTime ? formatTime(recommendedDepartureTime) : '--:--'}
            </Text>
          </View>

          {/* 최대 늦춰도 출발 가능한 시간 */}
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>최대 출발 시각</Text>
            <Text style={[styles.timeValue, styles.latestTime]}>
              {latestDepartureTime ? formatTime(latestDepartureTime) : '--:--'}
            </Text>
          </View>

          {/* 경고 문구 */}
          <View style={styles.warningBox}>
            <WarningIcon />
            <Text style={styles.warningText}>
              이 시간 이후 출발하면 막차를 놓칠 수 있습니다
            </Text>
          </View>
        </View>

        {/* 경로 상세 정보 */}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>경로 상세</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>총 소요 시간</Text>
            <Text style={styles.detailValue}>{totalDuration}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>환승 정보</Text>
            <Text style={styles.detailValue}>{transferInfo}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>도보 거리</Text>
            <Text style={styles.detailValue}>{walkingDistance}</Text>
          </View>
        </View>

        {/* 안전도 점수 카드 */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <Text style={styles.safetyTitle}>안전도 평가</Text>
            <View
              style={[
                styles.safetyBadge,
                { backgroundColor: getSafetyColor(safetyScore) },
              ]}
            >
              <Text style={styles.safetyBadgeText}>
                안전도 {safetyScore}점
              </Text>
            </View>
          </View>
          <Text style={styles.safetyStatus}>
            상태: <Text style={{ color: getSafetyColor(safetyScore) }}>
              {getSafetyText(safetyScore)}
            </Text>
          </Text>
        </View>

        {/* 안전 위험 경고 (안전도 점수가 70점 미만일 경우) */}
        {isDangerous && (
          <View style={styles.dangerWarningCard}>
            <WarningIcon />
            <View style={styles.dangerWarningContent}>
              <Text style={styles.dangerWarningTitle}>
                안전 위험 구간 포함
              </Text>
              <Text style={styles.dangerWarningText}>
                이 경로에는 안전 위험 구간이 포함되어 있습니다.{'\n'}
                택시 등 대체 수단을 고려해주세요.
              </Text>
            </View>
          </View>
        )}

        {/* 안전한 경로일 경우 */}
        {!isDangerous && safetyScore > 0 && (
          <View style={styles.safePathCard}>
            <CheckIcon />
            <Text style={styles.safePathText}>
              안전한 경로입니다. 안심하고 이용하세요.
            </Text>
          </View>
        )}

        {/* 다시 검색 버튼 */}
        <TouchableOpacity
          style={styles.searchAgainButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.searchAgainButtonText}>다시 검색하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  // 현재 시각 카드
  currentTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  currentTimeContent: {
    flex: 1,
  },
  currentTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentTimeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  // 목적지 카드
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  destinationContent: {
    flex: 1,
  },
  destinationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  destinationValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  // 시간 정보 카드
  timeInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  timeInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 16,
    color: '#666',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  recommendedTime: {
    color: '#007AFF',
    fontSize: 20,
  },
  latestTime: {
    color: '#F44336',
    fontSize: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    marginLeft: 8,
  },
  // 경로 상세 카드
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  // 안전도 카드
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  safetyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  safetyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  safetyBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  safetyStatus: {
    fontSize: 16,
    color: '#666',
  },
  // 위험 경고 카드
  dangerWarningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  dangerWarningContent: {
    flex: 1,
    marginLeft: 12,
  },
  dangerWarningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  dangerWarningText: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
  },
  // 안전 경로 카드
  safePathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  safePathText: {
    flex: 1,
    fontSize: 15,
    color: '#2E7D32',
    marginLeft: 12,
    fontWeight: '500',
  },
  // 다시 검색 버튼
  searchAgainButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  searchAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ResultScreen;

