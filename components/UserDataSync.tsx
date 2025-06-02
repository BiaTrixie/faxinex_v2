import React, { useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/FirebaseConfig';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function UserDataSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const syncUserData = async () => {
      if (!isLoaded || !isSignedIn || !user) return;

      try {
        const userDocRef = doc(firestore, 'Users', user.id);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          const email = user.primaryEmailAddress?.emailAddress || '';
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim();
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
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: error.message || 'Erro ao sincronizar dados do usuário.',
        });
      }
    };

    syncUserData();
  }, [isLoaded, isSignedIn, user]);

  return null;
}
