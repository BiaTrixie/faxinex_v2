import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomBar from '@/components/BottomBar';
import Colors from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/FirebaseConfig';

import { AlertCircle } from 'lucide-react-native';

const PERIODS = ['GRUPO', 'GLOBAL'];

interface User {
  id: string;
  name: string;
  image: string;
  points: number;
  group_id?: string;
}

export default function RankingScreen() {
  const { colors } = useTheme();
  const { user } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('GRUPO');
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userGroupId, setUserGroupId] = useState<string | null>(null);

  // Buscar o group_id do usuário logado
  const fetchUserGroupId = async () => {
    if (!user?.id) return null;

    try {
      const userDoc = await getDoc(doc(firestore, 'Users', user.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserGroupId(userData.group_id || null);
        return userData.group_id || null;
      }
    } catch (error) {
      console.error('Erro ao buscar group_id do usuário:', error);
    }
    return null;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Primeiro, obter o group_id do usuário atual
      const groupId = await fetchUserGroupId();

      const res = await fetch('https://backend-faxinex.vercel.app/users');
      const data = await res.json();

      let filteredUsers = data;

      if (selectedPeriod === 'GRUPO' && groupId) {
        // Filtrar apenas usuários do mesmo grupo
        filteredUsers = data.filter((user: User) => user.group_id === groupId);
      }
      // Para GLOBAL, mostra todos os usuários (não filtra)

      // Ordena por pontos decrescente
      const sortedUsers = filteredUsers.sort(
        (a: User, b: User) => (b.points || 0) - (a.points || 0)
      );

      setUsers(sortedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedPeriod, user?.id]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUsers().finally(() => setRefreshing(false));
  }, [selectedPeriod]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

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
        {points || 0} pts
      </Text>
    </View>
  );

  const getTopThreeUsers = () => {
    return users.slice(0, 3);
  };

  const shouldShowGroupRanking = selectedPeriod === 'GRUPO' && userGroupId;
  const hasNoGroupAccess = selectedPeriod === 'GRUPO' && !userGroupId;

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
              onPress={() => handlePeriodChange(period)}
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.primary }]}>
            Carregando ranking...
          </Text>
        </View>
      ) : hasNoGroupAccess ? (
        <View style={styles.noGroupContainer}>
          <AlertCircle color={colors.primary} size={48} />
          <Text style={[styles.noGroupTitle, { color: colors.primary }]}>
            Você precisa estar em um grupo
          </Text>
          <Text style={[styles.noGroupText, { color: colors.secondaryText }]}>
            Você precisa estar em um grupo para ver o ranking do grupo
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {users.length > 0 && (
            <View style={styles.topThree}>
              {/* Segunda posição */}
              {users[1] && (
                <View style={styles.secondPlace}>
                  <Image
                    source={{ uri: users[1].image }}
                    style={styles.topThreeAvatar}
                  />
                  <View style={[styles.crown, styles.silverCrown]}>
                    <Text style={styles.crownText}>2</Text>
                  </View>
                  <Text style={styles.topThreeName}>{users[1].name}</Text>
                  <Text style={styles.topThreePoints}>{users[1].points || 0} pts</Text>
                </View>
              )}

              {/* Primeira posição */}
              {users[0] && (
                <View style={styles.firstPlace}>
                  <Image
                    source={{ uri: users[0].image }}
                    style={[styles.topThreeAvatar, styles.firstPlaceAvatar]}
                  />
                  <View style={[styles.crown, styles.goldCrown]}>
                    <Text style={styles.crownText}>1</Text>
                  </View>
                  <Text style={styles.topThreeName}>{users[0].name}</Text>
                  <Text style={styles.topThreePoints}>{users[0].points || 0} pts</Text>
                </View>
              )}

              {/* Terceira posição */}
              {users[2] && (
                <View style={styles.thirdPlace}>
                  <Image
                    source={{ uri: users[2].image }}
                    style={styles.topThreeAvatar}
                  />
                  <View style={[styles.crown, styles.bronzeCrown]}>
                    <Text style={styles.crownText}>3</Text>
                  </View>
                  <Text style={styles.topThreeName}>{users[2].name}</Text>
                  <Text style={styles.topThreePoints}>{users[2].points || 0} pts</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.rankingList}>
            {users.length > 0 ? (
              users.map((rankUser, idx) => (
                <RankingItem
                  key={rankUser.id}
                  position={idx + 1}
                  name={rankUser.name}
                  points={rankUser.points || 0}
                  image={rankUser.image}
                  isCurrentUser={rankUser.id === user?.id}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                  {selectedPeriod === 'GRUPO'
                    ? 'Nenhum membro do grupo encontrado'
                    : 'Nenhum usuário encontrado'
                  }
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  noGroupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  noGroupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noGroupText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  periodButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  topThree: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 30,
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
    fontSize: 12,
  },
  topThreeName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    textAlign: 'center',
  },
  topThreePoints: {
    fontSize: 12,
    color: '#666',
  },
  rankingList: {
    gap: 10,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});