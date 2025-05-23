import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import BottomBar from '@/components/BottomBar';
import { useTheme } from '@/contexts/ThemeContext';

const PERIODS = ['DIÁRIO', 'SEMANAL', 'MENSAL', 'TOTAL'];

export default function RankingScreen() {
  const { colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('SEMANAL');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const RankingItem = ({ position, name, points, isCurrentUser = false }) => (
    <View style={[
      styles.rankingItem,
      isCurrentUser && { backgroundColor: colors.lightBlue2 }
    ]}>
      <View style={styles.positionContainer}>
        <Text style={[
          styles.position,
          isCurrentUser && { color: colors.text }
        ]}>
          {position}
        </Text>
      </View>
      <Image
        source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
        style={styles.avatar}
      />
      <Text style={[
        styles.userName,
        isCurrentUser && { color: colors.text }
      ]}>
        {name}
      </Text>
      <Text style={[
        styles.points,
        isCurrentUser && { color: colors.text }
      ]}>
        {points} pts
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.lightBlue1]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>RANKING</Text>
        <View style={styles.periodSelector}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && { backgroundColor: colors.background }
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && { color: colors.primary }
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.topThree}>
          <View style={styles.secondPlace}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
              style={styles.topThreeAvatar}
            />
            <View style={[styles.crown, styles.silverCrown]}>
              <Text style={styles.crownText}>2</Text>
            </View>
            <Text style={styles.topThreeName}>MARIA</Text>
            <Text style={styles.topThreePoints}>850 pts</Text>
          </View>
          
          <View style={styles.firstPlace}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
              style={[styles.topThreeAvatar, styles.firstPlaceAvatar]}
            />
            <View style={[styles.crown, styles.goldCrown]}>
              <Text style={styles.crownText}>1</Text>
            </View>
            <Text style={styles.topThreeName}>JOÃO</Text>
            <Text style={styles.topThreePoints}>920 pts</Text>
          </View>
          
          <View style={styles.thirdPlace}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
              style={styles.topThreeAvatar}
            />
            <View style={[styles.crown, styles.bronzeCrown]}>
              <Text style={styles.crownText}>3</Text>
            </View>
            <Text style={styles.topThreeName}>PEDRO</Text>
            <Text style={styles.topThreePoints}>780 pts</Text>
          </View>
        </View>

        <View style={styles.rankingList}>
          <RankingItem position={4} name="ANA" points={700} />
          <RankingItem position={5} name="CARLOS" points={650} />
          <RankingItem position={6} name="RONALDO" points={600} isCurrentUser />
          <RankingItem position={7} name="PATRICIA" points={550} />
          <RankingItem position={8} name="MARCOS" points={500} />
        </View>
      </ScrollView>
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  selectedPeriodButton: {
    backgroundColor: '#FFF',
  },
  periodButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedPeriodButtonText: {
    color: Colors.light.primary,
  },
  content: {
    flex: 1,
    padding: 35
  },
  topThree: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: 'colors.background,',
  },
  firstPlace: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  secondPlace: {
    alignItems: 'center',
    marginTop: 30,
  },
  thirdPlace: {
    alignItems: 'center',
    marginTop: 45,
  },
  topThreeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  firstPlaceAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  crown: {
    position: 'absolute',
    top: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldCrown: {
    backgroundColor: '#FFD700',
  },
  silverCrown: {
    backgroundColor: '#C0C0C0',
  },
  bronzeCrown: {
    backgroundColor: '#CD7F32',
  },
  crownText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  topThreeName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  topThreePoints: {
    fontSize: 12,
    color: '#666',
  },
  rankingList: {
    padding: 20,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  currentUserItem: {
    backgroundColor: Colors.light.lightBlue2,
  },
  positionContainer: {
    width: 30,
    alignItems: 'center',
  },
  position: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  currentUserText: {
    color: '#FFF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 15,
    color: '#333',
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});