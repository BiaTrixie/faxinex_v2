import React, { useState, useEffect } from 'react';
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

// 1. Defina a interface User
interface User {
  id: string;
  name: string;
  image: string;
  points: number;
}

export default function RankingScreen() {
  const { colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('SEMANAL');
  const [refreshing, setRefreshing] = useState(false);
  // 2. Tipar o estado users corretamente
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('https://backend-faxinex.vercel.app/users');
      const data = await res.json();
      // Ordena por pontos decrescente
      setUsers(
        data.sort(
          (a: { points: number }, b: { points: number }) => b.points - a.points
        )
      );
    } catch (e) {
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUsers().finally(() => setRefreshing(false));
  }, []);

  // 3. Tipar as props do RankingItem
  const RankingItem = ({
    position,
    name,
    points,
    image,
    isCurrentUser = false,
  }: {
    position: number;
    name: string;
    points: number;
    image: string;
    isCurrentUser?: boolean;
  }) => (
    <View
      style={[
        styles.rankingItem,
        isCurrentUser && { backgroundColor: colors.lightBlue2 },
      ]}
    >
      <View style={styles.positionContainer}>
        <Text
          style={[styles.position, isCurrentUser && { color: colors.text }]}
        >
          {position}
        </Text>
      </View>
      <Image source={{ uri: image }} style={styles.avatar} />
      <Text style={[styles.userName, isCurrentUser && { color: colors.text }]}>
        {name}
      </Text>
      <Text style={[styles.points, isCurrentUser && { color: colors.text }]}>
        {points} pts
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
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
                selectedPeriod === period && {
                  backgroundColor: colors.background,
                },
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && { color: colors.primary },
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
        {users.length >= 3 && (
          <View style={styles.topThree}>
            <View style={styles.secondPlace}>
              <Image
                source={{ uri: users[1].image }}
                style={styles.topThreeAvatar}
              />
              <View style={[styles.crown, styles.silverCrown]}>
                <Text style={styles.crownText}>2</Text>
              </View>
              <Text style={styles.topThreeName}>{users[1].name}</Text>
              <Text style={styles.topThreePoints}>{users[1].points} pts</Text>
            </View>
            <View style={styles.firstPlace}>
              <Image
                source={{ uri: users[0].image }}
                style={[styles.topThreeAvatar, styles.firstPlaceAvatar]}
              />
              <View style={[styles.crown, styles.goldCrown]}>
                <Text style={styles.crownText}>1</Text>
              </View>
              <Text style={styles.topThreeName}>{users[0].name}</Text>
              <Text style={styles.topThreePoints}>{users[0].points} pts</Text>
            </View>
            <View style={styles.thirdPlace}>
              <Image
                source={{ uri: users[2].image }}
                style={styles.topThreeAvatar}
              />
              <View style={[styles.crown, styles.bronzeCrown]}>
                <Text style={styles.crownText}>3</Text>
              </View>
              <Text style={styles.topThreeName}>{users[2].name}</Text>
              <Text style={styles.topThreePoints}>{users[2].points} pts</Text>
            </View>
          </View>
        )}

        <View style={styles.rankingList}>
          {users.map((user, idx) => (
            <RankingItem
              key={user.id}
              position={idx + 1}
              name={user.name}
              points={user.points}
              image={user.image}
            />
          ))}
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
