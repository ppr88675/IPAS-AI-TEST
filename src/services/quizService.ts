import { 
  collection, 
  getDocs, 
  setDoc,
  doc,
  query, 
  where,
  limit 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  category?: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const quizService = {
  // 獲取所有題目
  async getAllQuestions(): Promise<Question[]> {
    const path = 'questions';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => doc.data() as Question);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  // 隨機獲取 N 題
  async getRandomQuestions(count: number = 20): Promise<Question[]> {
    try {
      const all = await this.getAllQuestions();
      if (all.length === 0) return [];
      return all.sort(() => 0.5 - Math.random()).slice(0, count);
    } catch (error) {
      console.error("Error in getRandomQuestions:", error);
      return [];
    }
  },

  // 初始化題庫（種子資料 - 使用 ID 做為 Doc ID 以防重複）
  async seedQuestions(questions: Question[]) {
    const path = 'questions';
    try {
      const promises = questions.map(q => 
        setDoc(doc(db, path, q.id.toString()), q)
      );
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
