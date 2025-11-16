import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { getApiUrl, API_ENDPOINTS } from './src/config/api';

// --- Icon Components (예시) ---
// 실제 앱에서는 'react-native-vector-icons' 같은 라이브러리를 사용하는 것이 좋습니다.
// 여기서는 간단히 텍스트로 아이콘을 대체합니다.
const LocationIcon = () => <Text style={styles.icon}>📍</Text>;
const ClockIcon = () => <Text style={styles.icon}>🕒</Text>;
// ---------------------------------

const HomeScreen = ({ navigation }) => {
  // '도착지' 입력값을 관리하기 위한 State
  const [destination, setDestination] = useState('');
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(false);

  // '자주 가는 목적지' 목록 (임시 데이터)
  const frequentDestinations = [
    { id: 1, name: '강남역', icon: '📍' },
    { id: 2, name: '홍대입구역', icon: '📍' },
    { id: 3, name: '신촌역', icon: '📍' },
    { id: 4, name: '서울역', icon: '📍' },
  ];

  // '경로 검색' 버튼을 눌렀을 때의 로직
  const handleSearch = async () => {
    if (!destination.trim()) {
      alert('도착지를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 백엔드 API 엔드포인트 호출
      const API_URL = getApiUrl(API_ENDPOINTS.SEARCH);
      
      console.log('API 호출:', API_URL);
      console.log('요청 파라미터:', { start: '인하대학교', end: destination.trim() });
      
      // 백엔드에 출발지, 도착지 정보 전송
      const response = await axios.get(API_URL, {
        params: {
          start: '인하대학교', // 출발지는 고정
          end: destination.trim(),
        },
        timeout: 10000, // 10초 타임아웃
      });

      console.log('API 응답:', response.data);

      // API 호출 성공 시, 결과 데이터를 'Result' 화면으로 넘겨주며 이동
      navigation.navigate('Result', {
        resultData: response.data, // 백엔드에서 받은 경로/시간/안전도 정보
      });

    } catch (error) {
      console.error('API Error:', error);
      
      let errorMessage = '경로 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
      } else if (error.response) {
        // 서버 응답이 있는 경우
        const status = error.response.status;
        if (status === 404) {
          errorMessage = '경로를 찾을 수 없습니다. 다른 목적지를 입력해주세요.';
        } else if (status >= 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. 헤더 섹션 */}
        <View style={styles.header}>
          <ClockIcon />
          <Text style={styles.headerTitle}>막차 타임</Text>
        </View>
        <Text style={styles.headerSubtitle}>인하대생을 위한 안전 귀가 경로 안내</Text>

        {/* 2. 환영 카드 */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            막차를 놓치지 않는 가장 늦은 출발 시간과 안전한 경로를 알려드립니다
          </Text>
        </View>

        {/* 3. 경로 입력 섹션 */}
        <View style={styles.searchSection}>
          {/* 출발지 (고정) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>출발</Text>
            <View style={styles.inputWrapperFixed}>
              <LocationIcon />
              <Text style={styles.fixedText}>인하대학교</Text>
            </View>
          </View>

          {/* 도착지 (입력) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>도착</Text>
            <View style={styles.inputWrapper}>
              <LocationIcon />
              <TextInput
                style={styles.textInput}
                placeholder="도착지를 입력하세요 (예: 강남역)"
                placeholderTextColor="#999"
                value={destination}
                onChangeText={setDestination} // 입력값을 state에 반영
              />
            </View>
          </View>

          {/* 검색 버튼 */}
          <TouchableOpacity
            style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.searchButtonText}>검색 중...</Text>
              </View>
            ) : (
              <Text style={styles.searchButtonText}>경로 검색</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 4. 자주 가는 목적지 */}
        <View style={styles.frequentSection}>
          <Text style={styles.frequentTitle}>자주 가는 목적지</Text>
          <View style={styles.frequentGrid}>
            {frequentDestinations.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.frequentCard}
                // '자주 가는 목적지'를 누르면 도착지 입력창에 자동 완성
                onPress={() => setDestination(item.name)}
              >
                <LocationIcon />
                <Text style={styles.frequentCardText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FF', // Figma 배경색과 유사하게
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  // 환영 카드
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  // 경로 입력
  searchSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#007AFF', // Figma 포인트 색상
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  inputWrapperFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF', // 비활성 느낌
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  fixedText: {
    fontSize: 16,
    color: '#777',
    fontWeight: '500',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  // 검색 버튼
  searchButton: {
    backgroundColor: '#007AFF', // Figma 버튼 색상
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 자주 가는 목적지
  frequentSection: {},
  frequentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  frequentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  frequentCard: {
    backgroundColor: '#FFFFFF',
    width: '48%', // 2열 그리드
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  frequentCardText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
});

export default HomeScreen;