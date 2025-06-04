import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/FirebaseConfig';
import Toast from 'react-native-toast-message';

export default function UserDataSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    const syncUserData = async () => {
      if (!isLoaded || !isSignedIn || !user || hasSynced) return;

      try {
        const userDocRef = doc(firestore, 'Users', user.id);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.log('Criando documento do usuário no Firestore...');
          
          const email = user.primaryEmailAddress?.emailAddress || '';
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim() || user.username || 'Usuário';
          const imageUrl =
            user.imageUrl ||
            'https://i.postimg.cc/TPwPZK8R/renderizacao-3d-de-retrato-de-cao-de-desenho-animado.jpg';

          await setDoc(userDocRef, {
            id: user.id,
            name: fullName,
            email,
            group_id: '',
            image: imageUrl,
            isAdmin: false,
            createdAt: new Date(),
            points: 0,
          });

          console.log('Documento do usuário criado com sucesso');
        } else {
          // Atualizar dados se necessário
          const userData = userDoc.data();
          const updates: any = {};
          
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim() || user.username || 'Usuário';
          
          if (userData.name !== fullName) {
            updates.name = fullName;
          }
          
          if (user.primaryEmailAddress?.emailAddress && userData.email !== user.primaryEmailAddress.emailAddress) {
            updates.email = user.primaryEmailAddress.emailAddress;
          }
          
          if (user.imageUrl && userData.image !== user.imageUrl) {
            updates.image = user.imageUrl;
          }
          
          // Se há atualizações, aplicá-las
          if (Object.keys(updates).length > 0) {
            await setDoc(userDocRef, updates, { merge: true });
            console.log('Dados do usuário atualizados:', updates);
          }
        }
        
        setHasSynced(true);
      } catch (error: any) {
        console.error('Erro ao sincronizar dados do usuário:', error);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Erro ao sincronizar dados do usuário.',
        });
      }
    };

    syncUserData();
  }, [isLoaded, isSignedIn, user, hasSynced]);

  // Reset hasSynced when user changes
  useEffect(() => {
    if (user?.id) {
      setHasSynced(false);
    }
  }, [user?.id]);

  return null;
}