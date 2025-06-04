import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  Filter, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Star,
  Users,
  Calendar,
  Trophy,
  X
} from 'lucide-react-native';
import { doc, getDoc } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-expo';

import Colors from '@/constants/Colors';
import BottomBar from '@/components/BottomBar';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/FirebaseConfig';

interface Task {
  id: string;
  taskName: string;
  description?: string;
  difficulty: number;
  participants: string[];
  category: string;
  idGroup: string;
  status: 'Pendente' | 'Finalizada';
  createdAt?: any;
  createdBy?: string;
}

interface GroupMember {
  id: string;
  name: string;
  image: string;
}

type FilterType = 'todas' | 'minhas' | 'pendentes' | 'finalizadas';
type SortType = 'recentes' | 'antigas' | 'dificuldade' | 'alfabetica';
type DateFilter = 'todas' | 'hoje' | 'semana' | 'mes';

const difficultyInfo = {
  1: { name: 'Fácil', color: '#4CAF50', points: 3 },
  2: { name: 'Média', color: '#FF9800', points: 5 },
  3: { name: 'Difícil', color: '#F44336', points: 8 },
};

export default function TasksViewScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useUser();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<{ [key: string]: GroupMember }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userGroupId, setUserGroupId] = useState<string | null>(null);
  
  // Estados de busca e filtros
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');
  const [sortBy, setSortBy] = useState<SortType>('recentes');
  const [dateFilter, setDateFilter] = useState<DateFilter>('todas');
  const [selectedParticipant, setSelectedParticipant] = useState<string>('todos');

  useEffect(() => {
    fetchUserGroupAndTasks();
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, activeFilter, sortBy, dateFilter, selectedParticipant, searchText, user]);

  const fetchUserGroupAndTasks = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Buscar grupo do usuário
      const userDoc = await getDoc(doc(firestore, 'Users', user.id));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const groupId = userData.group_id;
      setUserGroupId(groupId);

      if (!groupId) {
        setTasks([]);
        return;
      }

      // Buscar todas as tarefas da API (não filtrar por grupo aqui)
      const response = await fetch('https://backend-faxinex.vercel.app/tasks');
      const allTasks = await response.json();
      
      // Filtrar tarefas do grupo específico
      const groupTasks = allTasks.filter((task: Task) => task.idGroup === groupId);
      setTasks(groupTasks);

      // Buscar informações dos membros
      await fetchGroupMembers(groupId);
      
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const groupDoc = await getDoc(doc(firestore, 'Groups', groupId));
      if (!groupDoc.exists()) return;

      const groupData = groupDoc.data();
      const participants = groupData.participants || [];
      const membersMap: { [key: string]: GroupMember } = {};

      for (const participantId of participants) {
        if (user && participantId === user?.id) {
          membersMap[participantId] = {
            id: user.id,
            name: user.firstName || user.username || 'Você',
            image: user.imageUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          };
        } else {
          const memberDoc = await getDoc(doc(firestore, 'Users', participantId));
          if (memberDoc.exists()) {
            const memberData = memberDoc.data();
            membersMap[participantId] = {
              id: participantId,
              name: memberData.name || 'Usuário',
              image: memberData.image || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
            };
          }
        }
      }

      setMembers(membersMap);
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Aplicar busca por texto
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(task => 
        task.taskName.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.category.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtros por status
    switch (activeFilter) {
      case 'minhas':
        filtered = filtered.filter(task => 
          task.participants.includes(user?.id || '')
        );
        break;
      case 'pendentes':
        filtered = filtered.filter(task => task.status === 'Pendente');
        break;
      case 'finalizadas':
        filtered = filtered.filter(task => task.status === 'Finalizada');
        break;
      default:
        break;
    }

    // Aplicar filtro por data
    if (dateFilter !== 'todas') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(task => {
        if (!task.createdAt) return false;
        
        const taskDate = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
        const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        
        switch (dateFilter) {
          case 'hoje':
            return taskDay.getTime() === today.getTime();
          case 'semana':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return taskDay >= weekAgo;
          case 'mes':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return taskDay >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Aplicar filtro por participante
    if (selectedParticipant !== 'todos') {
      filtered = filtered.filter(task => 
        task.participants.includes(selectedParticipant)
      );
    }

    // Aplicar ordenação
    switch (sortBy) {
      case 'recentes':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case 'antigas':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'dificuldade':
        filtered.sort((a, b) => b.difficulty - a.difficulty);
        break;
      case 'alfabetica':
        filtered.sort((a, b) => a.taskName.localeCompare(b.taskName));
        break;
    }

    setFilteredTasks(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserGroupAndTasks();
    setRefreshing(false);
  };

  const handleTaskPress = (task: Task) => {
    router.push({
      pathname: '/tasks/detail',
      params: { 
        taskId: task.id,
        taskData: JSON.stringify(task)
      }
    });
  };

  const getTaskParticipantsNames = (participantIds: string[]) => {
    return participantIds
      .map(id => members[id]?.name || 'Usuário')
      .slice(0, 2)
      .join(', ') + (participantIds.length > 2 ? ` +${participantIds.length - 2}` : '');
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const clearSearch = () => {
    setSearchText('');
  };

  const resetFilters = () => {
    setActiveFilter('todas');
    setSortBy('recentes');
    setDateFilter('todas');
    setSelectedParticipant('todos');
    setSearchText('');
  };

  const FilterButton = ({ type, label, count }: { type: FilterType; label: string; count?: number }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { borderColor: colors.primary },
        activeFilter === type && { backgroundColor: colors.primary }
      ]}
      onPress={() => setActiveFilter(type)}
    >
      <Text style={[
        styles.filterButtonText,
        { color: activeFilter === type ? '#FFF' : colors.primary }
      ]}>
        {label} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  const SortButton = ({ type, label, icon }: { type: SortType; label: string; icon: React.ReactNode }) => (
    <TouchableOpacity
      style={[
        styles.sortButton,
        { borderColor: colors.primary },
        sortBy === type && { backgroundColor: colors.primary }
      ]}
      onPress={() => setSortBy(type)}
    >
      {icon}
      <Text style={[
        styles.sortButtonText,
        { color: sortBy === type ? '#FFF' : colors.primary }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const DateFilterButton = ({ type, label }: { type: DateFilter; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { borderColor: colors.primary },
        dateFilter === type && { backgroundColor: colors.primary }
      ]}
      onPress={() => setDateFilter(type)}
    >
      <Text style={[
        styles.filterButtonText,
        { color: dateFilter === type ? '#FFF' : colors.primary }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ParticipantFilterButton = ({ participantId, name }: { participantId: string; name: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { borderColor: colors.primary },
        selectedParticipant === participantId && { backgroundColor: colors.primary }
      ]}
      onPress={() => setSelectedParticipant(participantId)}
    >
      <Text style={[
        styles.filterButtonText,
        { color: selectedParticipant === participantId ? '#FFF' : colors.primary }
      ]}>
        {name}
      </Text>
    </TouchableOpacity>
  );

  const TaskCard = ({ task }: { task: Task }) => {
    const difficulty = difficultyInfo[task.difficulty as keyof typeof difficultyInfo];
    const isUserParticipant = task.participants.includes(user?.id || '');
    
    return (
      <TouchableOpacity
        style={[styles.taskCard, { borderLeftColor: difficulty.color, backgroundColor: colors.backgroundColorStatusCard }]}
        onPress={() => handleTaskPress(task)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleRow}>
            <Text style={[styles.taskTitle, { color: colors.primary }]} numberOfLines={1}>
              {task.taskName}
            </Text>
            <View style={styles.taskBadges}>
              {isUserParticipant && (
                <View style={[styles.badge, { backgroundColor: colors.lightBlue1 }]}>
                  <Text style={styles.badgeText}>Minha</Text>
                </View>
              )}
              <View style={[styles.statusBadge, { 
                backgroundColor: task.status === 'Finalizada' ? '#4CAF50' : '#FF9800' 
              }]}>
                {task.status === 'Finalizada' ? 
                  <CheckCircle2 color="#FFF" size={12} /> : 
                  <Clock color="#FFF" size={12} />
                }
                <Text style={styles.statusText}>{task.status}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <Star color={difficulty.color} size={14} />
              <Text style={[styles.metaText, { color: difficulty.color }]}>
                {difficulty.name} • {difficulty.points}pts
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Users color={colors.secondaryText} size={14} />
              <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                {task.participants.length} pessoas
              </Text>
            </View>
            
            {task.createdAt && (
              <View style={styles.metaItem}>
                <Calendar color={colors.secondaryText} size={14} />
                <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                  {formatDate(task.createdAt)}
                </Text>
              </View>
            )}
          </View>

          {task.description && (
            <Text style={[styles.taskDescription, { color: colors.secondaryText }]} numberOfLines={2}>
              {task.description}
            </Text>
          )}

          <View style={styles.participantsRow}>
            <View style={styles.participantAvatars}>
              {task.participants.slice(0, 3).map((participantId, index) => {
                const member = members[participantId];
                if (!member) return null;
                
                return (
                  <Image
                    key={participantId}
                    source={{ uri: member.image }}
                    style={[styles.participantAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
                  />
                );
              })}
              {task.participants.length > 3 && (
                <View style={[styles.participantAvatar, styles.moreParticipants]}>
                  <Text style={styles.moreParticipantsText}>+{task.participants.length - 3}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.participantNames, { color: colors.secondaryText }]} numberOfLines={1}>
              {getTaskParticipantsNames(task.participants)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.primary, colors.lightBlue1]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>TAREFAS</Text>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.primary }]}>
            Carregando tarefas...
          </Text>
        </View>
        <BottomBar />
      </SafeAreaView>
    );
  }

  if (!userGroupId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.primary, colors.lightBlue1]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>TAREFAS</Text>
        </LinearGradient>
        
        <View style={styles.noGroupContainer}>
          <AlertCircle color={colors.primary} size={48} />
          <Text style={[styles.noGroupTitle, { color: colors.primary }]}>
            Você precisa estar em um grupo
          </Text>
          <Text style={[styles.noGroupText, { color: colors.secondaryText }]}>
            Entre em um grupo ou crie um novo grupo para visualizar e gerenciar tarefas
          </Text>
        </View>
        <BottomBar />
      </SafeAreaView>
    );
  }

  const pendingCount = tasks.filter(t => t.status === 'Pendente').length;
  const completedCount = tasks.filter(t => t.status === 'Finalizada').length;
  const myTasksCount = tasks.filter(t => t.participants.includes(user?.id || '')).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.lightBlue1]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>TAREFAS</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Campo de busca */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search color={colors.secondaryText} size={20} />
            <TextInput
              style={[styles.searchInput, { color: colors.primary }]}
              placeholder="Buscar tarefas..."
              placeholderTextColor={colors.secondaryText}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X color={colors.secondaryText} size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filtros sempre visíveis */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterSectionTitle, { color: colors.primary }]}>
                Filtros
              </Text>
              <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
                <Text style={[styles.resetButtonText, { color: colors.primary }]}>
                  Limpar
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterGroup}>
              <Text style={[styles.filterGroupTitle, { color: colors.secondaryText }]}>
                Status:
              </Text>
              <View style={styles.filterRow}>
                <FilterButton type="todas" label="Todas" count={tasks.length} />
                <FilterButton type="minhas" label="Minhas" count={myTasksCount} />
                <FilterButton type="pendentes" label="Pendentes" count={pendingCount} />
                <FilterButton type="finalizadas" label="Finalizadas" count={completedCount} />
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={[styles.filterGroupTitle, { color: colors.secondaryText }]}>
                Data de criação:
              </Text>
              <View style={styles.filterRow}>
                <DateFilterButton type="todas" label="Todas" />
                <DateFilterButton type="hoje" label="Hoje" />
                <DateFilterButton type="semana" label="Esta semana" />
                <DateFilterButton type="mes" label="Este mês" />
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={[styles.filterGroupTitle, { color: colors.secondaryText }]}>
                Participante:
              </Text>
              <View style={styles.filterRow}>
                <ParticipantFilterButton participantId="todos" name="Todos" />
                {Object.values(members).map((member) => (
                  <ParticipantFilterButton
                    key={member.id}
                    participantId={member.id}
                    name={member.id === user?.id ? 'Você' : member.name}
                  />
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={[styles.filterGroupTitle, { color: colors.secondaryText }]}>
                Ordenar por:
              </Text>
              <View style={styles.sortRow}>
                <SortButton 
                  type="recentes" 
                  label="Recentes" 
                  icon={<Clock color={sortBy === 'recentes' ? '#FFF' : colors.primary} size={16} />} 
                />
                <SortButton 
                  type="dificuldade" 
                  label="Dificuldade" 
                  icon={<Trophy color={sortBy === 'dificuldade' ? '#FFF' : colors.primary} size={16} />} 
                />
                <SortButton 
                  type="alfabetica" 
                  label="A-Z" 
                  icon={<Filter color={sortBy === 'alfabetica' ? '#FFF' : colors.primary} size={16} />} 
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tasksContainer}>
          <View style={styles.tasksHeader}>
            <Text style={[styles.tasksCount, { color: colors.primary }]}>
              {filteredTasks.length} {filteredTasks.length === 1 ? 'tarefa' : 'tarefas'} encontrada(s)
              {searchText && ` para "${searchText}"`}
            </Text>
          </View>

          {filteredTasks.length > 0 ? (
            <View style={styles.tasksList}>
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Search color={colors.secondaryText} size={48} />
              <Text style={[styles.emptyTitle, { color: colors.primary }]}>
                Nenhuma tarefa encontrada
              </Text>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                {searchText 
                  ? `Nenhuma tarefa encontrada para "${searchText}"`
                  : activeFilter === 'todas' 
                    ? 'Ainda não há tarefas criadas neste grupo'
                    : `Não há tarefas ${activeFilter === 'minhas' ? 'suas' : activeFilter.toLowerCase()} no momento`
                }
              </Text>
            </View>
          )}
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
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
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
  noGroupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  noGroupText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
    // backgroundColor: '#F8F9FA',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterSection: {
    gap: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(94, 117, 242, 0.1)',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterGroup: {
    gap: 8,
  },
  filterGroupTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tasksContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  tasksHeader: {
    marginBottom: 20,
  },
  tasksCount: {
    fontSize: 18,
    fontWeight: '600',
  },
  tasksList: {
    gap: 15,
  },
  taskCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    gap: 12,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  taskBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  participantAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  moreParticipants: {
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreParticipantsText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#666',
  },
  participantNames: {
    fontSize: 12,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});