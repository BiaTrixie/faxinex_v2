import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/FirebaseConfig';

export interface Difficulty {
  id: number;
  name: string;
  points: number;
}

export interface TaskCompletionResult {
  success: boolean;
  message: string;
  pointsAwarded?: number;
}

class TaskService {
  private static instance: TaskService;
  private difficultiesCache: Difficulty[] | null = null;

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  /**
   * Busca as dificuldades da API e mantém em cache
   */
  async getDifficulties(): Promise<Difficulty[]> {
    if (this.difficultiesCache) {
      return this.difficultiesCache;
    }

    try {
      const response = await fetch('https://backend-faxinex.vercel.app/difficulties');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dificuldades');
      }

      const difficulties = await response.json();
      this.difficultiesCache = difficulties;
      return difficulties;
    } catch (error) {
      console.error('Erro ao buscar dificuldades, usando fallback:', error);
      
      // Fallback para dificuldades padrão
      const fallbackDifficulties: Difficulty[] = [
        { id: 1, name: 'Fácil', points: 3 },
        { id: 2, name: 'Média', points: 5 },
        { id: 3, name: 'Difícil', points: 8 }
      ];
      
      this.difficultiesCache = fallbackDifficulties;
      return fallbackDifficulties;
    }
  }

  /**
   * Busca uma dificuldade específica pelo ID
   */
  async getDifficultyById(id: number): Promise<Difficulty | null> {
    const difficulties = await this.getDifficulties();
    return difficulties.find(d => d.id === id) || null;
  }

  /**
   * Atualiza o status de uma tarefa no backend
   */
  async updateTaskStatus(taskId: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`https://backend-faxinex.vercel.app/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao atualizar tarefa no backend:', error);
      return false;
    }
  }

  /**
   * Atualiza os pontos do usuário no Firestore
   */
  async updateUserPoints(userId: string, pointsToAdd: number): Promise<boolean> {
    try {
      const userDocRef = doc(firestore, 'Users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.error('Usuário não encontrado no Firestore');
        return false;
      }

      const currentPoints = userDoc.data().points || 0;
      const newPoints = currentPoints + pointsToAdd;

      await updateDoc(userDocRef, {
        points: newPoints,
        lastPointsUpdate: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar pontos do usuário:', error);
      return false;
    }
  }

  /**
   * Atualiza a tarefa no Firestore
   */
  async updateTaskInFirestore(taskId: string, updateData: any): Promise<boolean> {
    try {
      await updateDoc(doc(firestore, 'Tasks', taskId), updateData);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tarefa no Firestore:', error);
      return false;
    }
  }

  /**
   * Completa uma tarefa e atualiza os pontos do usuário
   */
  async completeTask(
    taskId: string, 
    userId: string, 
    difficultyId: number
  ): Promise<TaskCompletionResult> {
    try {
      // 1. Buscar informações da dificuldade
      const difficulty = await this.getDifficultyById(difficultyId);
      if (!difficulty) {
        return {
          success: false,
          message: 'Dificuldade não encontrada'
        };
      }

      // 2. Atualizar status da tarefa no backend
      const backendUpdateSuccess = await this.updateTaskStatus(taskId, 'Finalizada');
      if (!backendUpdateSuccess) {
        return {
          success: false,
          message: 'Erro ao atualizar tarefa no servidor'
        };
      }

      // 3. Atualizar tarefa no Firestore
      const firestoreUpdateSuccess = await this.updateTaskInFirestore(taskId, {
        status: 'Finalizada',
        completedAt: new Date(),
        completedBy: userId,
      });

      if (!firestoreUpdateSuccess) {
        return {
          success: false,
          message: 'Erro ao atualizar tarefa no banco de dados'
        };
      }

      // 4. Adicionar pontos ao usuário
      const pointsUpdateSuccess = await this.updateUserPoints(userId, difficulty.points);
      if (!pointsUpdateSuccess) {
        return {
          success: false,
          message: 'Tarefa concluída, mas erro ao adicionar pontos'
        };
      }

      return {
        success: true,
        message: `Tarefa concluída! Você ganhou ${difficulty.points} pontos!`,
        pointsAwarded: difficulty.points
      };

    } catch (error) {
      console.error('Erro ao completar tarefa:', error);
      return {
        success: false,
        message: 'Erro inesperado ao completar tarefa'
      };
    }
  }

  /**
   * Verifica se um usuário pode completar uma tarefa
   */
  canUserCompleteTask(task: any, userId: string): boolean {
    if (!task || !userId) return false;
    
    // Verificar se a tarefa já está concluída
    if (task.status === 'Finalizada') return false;
    
    // Verificar se o usuário é participante da tarefa
    if (!task.participants.includes(userId)) return false;
    
    return true;
  }

  /**
   * Formatar cor da dificuldade
   */
  getDifficultyColor(difficultyId: number): string {
    switch (difficultyId) {
      case 1: return '#4CAF50'; // Verde para fácil
      case 2: return '#FF9800'; // Laranja para média
      case 3: return '#F44336'; // Vermelho para difícil
      default: return '#9E9E9E'; // Cinza para desconhecida
    }
  }

  /**
   * Limpar cache das dificuldades (útil para forçar reload)
   */
  clearDifficultiesCache(): void {
    this.difficultiesCache = null;
  }
}

export default TaskService.getInstance();