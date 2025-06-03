import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit3, X, UserMinus, UserPlus, Crown } from 'lucide-react-native';
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import Colors from '@/constants/Colors';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import BottomBar from '@/components/BottomBar';
import BackButton from '@/components/BackButton';
import { firestore } from '@/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import { useTheme } from '@/contexts/ThemeContext';
import sendEmail from '@/services/SendEmail';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  image: string;
  isAdmin: boolean;
}

interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  participants: string[];
  createdAt: any;
}

export default function GroupSettingsScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams();
  const { colors } = useTheme();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingChanges, setSavingChanges] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const { user } = useUser();

  const isCurrentUserAdmin = group?.createdBy === user?.id;

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    if (!groupId || !user?.id) return;

    try {
      setLoading(true);

      // Buscar dados do grupo
      const groupDoc = await getDoc(
        doc(firestore, 'Groups', groupId as string)
      );
      if (!groupDoc.exists()) {
        Alert.alert('Erro', 'Grupo não encontrado');
        router.back();
        return;
      }

      const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;
      setGroup(groupData);
      setEditedName(groupData.name);
      setEditedDescription(groupData.description);

      // Buscar dados dos membros
      if (groupData.participants && groupData.participants.length > 0) {
        const membersPromises = groupData.participants.map(
          async (participantId) => {
            // Se for o usuário logado, use os dados do Clerk
            if (participantId === user.id) {
              return {
                id: user.id,
                name: user.firstName || user.username || 'Usuário sem nome',
                email: user.primaryEmailAddress?.emailAddress || '',
                image:
                  user.imageUrl ||
                  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
                isAdmin: participantId === groupData.createdBy,
              };
            }
            // Para outros membros, busque do Firestore
            const userDoc = await getDoc(
              doc(firestore, 'Users', participantId)
            );
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                id: participantId,
                name: userData.name || 'Usuário sem nome',
                email: userData.email || '',
                image:
                  userData.image ||
                  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
                isAdmin: participantId === groupData.createdBy,
              };
            }
            return null;
          }
        );

        const membersData = await Promise.all(membersPromises);
        setMembers(
          membersData.filter((member) => member !== null) as GroupMember[]
        );
      }
    } catch (error) {
      console.error('Erro ao buscar dados do grupo:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!group || !isCurrentUserAdmin) return;

    try {
      setSavingChanges(true);

      await updateDoc(doc(firestore, 'Groups', group.id), {
        name: editedName.trim(),
        description: editedDescription.trim(),
      });

      setGroup((prev) =>
        prev
          ? {
              ...prev,
              name: editedName.trim(),
              description: editedDescription.trim(),
            }
          : null
      );

      setIsEditing(false);
      Alert.alert('Sucesso', 'Informações do grupo atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setSavingChanges(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim() || !group) return;

    try {
      setAddingMember(true);

      // Buscar usuário pelo email (opcional, pode remover se quiser permitir convite para qualquer email)
      const usersQuery = query(
        collection(firestore, 'Users'),
        where('email', '==', newMemberEmail.trim().toLowerCase())
      );
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        Alert.alert(
          'Aviso',
          'Convite enviado! Se o usuário se cadastrar, poderá usar este email para entrar no grupo.'
        );
        // Mesmo que não exista, envie o email de convite
      }

      // Enviar email de convite
      try {
        await sendEmail(newMemberEmail.trim(), group.id);
      } catch (emailError) {
        console.warn('Erro ao enviar email:', emailError);
        Alert.alert('Erro', 'Não foi possível enviar o convite por email.');
        return;
      }

      setNewMemberEmail('');
      setShowAddMember(false);
      Alert.alert('Sucesso', 'Convite enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao convidar membro:', error);
      Alert.alert('Erro', 'Não foi possível enviar o convite');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!isCurrentUserAdmin || memberId === group?.createdBy) return;

    Alert.alert(
      'Remover Membro',
      `Tem certeza que deseja remover ${memberName} do grupo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeMember(memberId),
        },
      ]
    );
  };

  const removeMember = async (memberId: string) => {
    if (!group) return;

    try {
      // Remover do grupo
      await updateDoc(doc(firestore, 'Groups', group.id), {
        participants: arrayRemove(memberId),
      });

      // Limpar grupo_id do usuário
      await updateDoc(doc(firestore, 'Users', memberId), {
        group_id: '',
      });

      // Atualizar estado local
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.filter((id) => id !== memberId),
            }
          : null
      );

      Alert.alert('Sucesso', 'Membro removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      Alert.alert('Erro', 'Não foi possível remover o membro');
    }
  };

  const handleDeleteGroup = () => {
    if (!isCurrentUserAdmin) return;

    Alert.alert(
      'Excluir Grupo',
      'Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: deleteGroup,
        },
      ]
    );
  };

  const deleteGroup = async () => {
    if (!group) return;

    try {
      // Remover grupo_id de todos os participantes
      const updatePromises = group.participants.map((participantId) =>
        updateDoc(doc(firestore, 'Users', participantId), { group_id: '' })
      );
      await Promise.all(updatePromises);

      // Excluir o grupo
      await deleteDoc(doc(firestore, 'Groups', group.id));

      Alert.alert('Sucesso', 'Grupo excluído com sucesso!');
      router.replace('/home');
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      Alert.alert('Erro', 'Não foi possível excluir o grupo');
    }
  };

  const handleMakeAdmin = (memberId: string, memberName: string) => {
    if (!isCurrentUserAdmin || memberId === group?.createdBy) return;

    Alert.alert(
      'Transferir Administração',
      `Tem certeza que deseja tornar ${memberName} o novo administrador do grupo? Você perderá o acesso de admin.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Transferir',
          style: 'destructive',
          onPress: () => makeAdmin(memberId),
        },
      ]
    );
  };

  const makeAdmin = async (memberId: string) => {
    if (!group) return;

    try {
      await updateDoc(doc(firestore, 'Groups', group.id), {
        createdBy: memberId,
      });

      setGroup((prev) =>
        prev
          ? {
              ...prev,
              createdBy: memberId,
            }
          : null
      );

      Alert.alert('Sucesso', 'Administração transferida com sucesso!');
    } catch (error) {
      console.error('Erro ao transferir administração:', error);
      Alert.alert('Erro', 'Não foi possível transferir a administração');
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.primary }]}>
            Carregando configurações...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: colors.primary }]}>
            Grupo não encontrado
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const MemberItem = ({ member }: { member: GroupMember }) => (
    <View style={styles.memberItem}>
      <Image source={{ uri: member.image }} style={styles.memberAvatar} />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameContainer}>
          <Text style={[styles.memberName, { color: colors.primary }]}>
            {member.name}
          </Text>
          {member.isAdmin && <Crown color={Colors.light.primary} size={16} />}
        </View>
        <Text style={styles.memberEmail}>{member.email}</Text>
      </View>
      {isCurrentUserAdmin && !member.isAdmin && (
        <>
          <TouchableOpacity
            style={styles.makeAdminButton}
            onPress={() => handleMakeAdmin(member.id, member.name)}
          >
            <Crown color="#FFD700" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveMember(member.id, member.name)}
          >
            <UserMinus color="#FF4444" size={20} />
          </TouchableOpacity>
        </>
      )}
      {isCurrentUserAdmin && member.isAdmin && null}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <BackButton />

      <LinearGradient
        colors={[colors.primary, colors.lightBlue1]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>CONFIGURAÇÕES DO GRUPO</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Informações do Grupo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Informações do Grupo
            </Text>
            {isCurrentUserAdmin && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <X color={colors.primary} size={24} />
                ) : (
                  <Edit3 color={colors.primary} size={24} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View>
              <TextInput
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Nome do grupo"
                style={styles.input}
              />
              <TextInput
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Descrição do grupo"
                style={styles.input}
              />
              <View style={styles.editActions}>
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setIsEditing(false);
                    setEditedName(group.name);
                    setEditedDescription(group.description);
                  }}
                  variant="outline"
                  style={styles.actionButton}
                />
                <Button
                  title="Salvar"
                  onPress={handleSaveChanges}
                  loading={savingChanges}
                  style={styles.actionButton}
                />
              </View>
            </View>
          ) : (
            <View>
              <Text style={[styles.groupName, { color: colors.primary }]}>
                {group.name}
              </Text>
              <Text style={styles.groupDescription}>{group.description}</Text>
              <Text style={styles.groupId}>ID do Grupo: {group.id}</Text>
            </View>
          )}
        </View>

        {/* Membros */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Membros ({members.length})
            </Text>
            {isCurrentUserAdmin && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddMember(!showAddMember)}
              >
                <UserPlus color={colors.primary} size={24} />
              </TouchableOpacity>
            )}
          </View>

          {showAddMember && (
            <View style={styles.addMemberSection}>
              <TextInput
                value={newMemberEmail}
                onChangeText={setNewMemberEmail}
                placeholder="Email do novo membro"
                keyboardType="email-address"
                style={styles.input}
              />
              <View style={styles.addMemberActions}>
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setShowAddMember(false);
                    setNewMemberEmail('');
                  }}
                  variant="outline"
                  style={styles.actionButton}
                />
                <Button
                  title="Adicionar"
                  onPress={handleAddMember}
                  loading={addingMember}
                  style={styles.actionButton}
                />
              </View>
            </View>
          )}

          <View style={styles.membersList}>
            {members.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))}
          </View>
        </View>

        {/* Ações Perigosas */}
        {isCurrentUserAdmin && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#FF4444' }]}>
              Zona de Perigo
            </Text>
            <Button
              title="Excluir Grupo"
              onPress={handleDeleteGroup}
              style={[styles.deleteButton, { backgroundColor: '#FF4444' }]}
            />
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
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
  content: {
    flex: 1,
    padding: 20,
    marginBottom: 70,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 5,
  },
  addButton: {
    padding: 5,
  },
  input: {
    marginBottom: 15,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  groupDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    lineHeight: 24,
  },
  groupId: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'monospace',
  },
  addMemberSection: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  addMemberActions: {
    flexDirection: 'row',
    gap: 10,
  },
  membersList: {
    gap: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  deleteButton: {
    marginTop: 10,
  },
  makeAdminButton: {
    padding: 8,
    marginRight: 4,
  },
});
