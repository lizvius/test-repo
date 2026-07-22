import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  Timestamp, 
  updateDoc, 
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../config';
import { BatchPost } from '../../types';
import { getWIBDate } from '../../utils/format';

const POSTS_COLLECTION = 'posts';

export const createPost = async (postData: Omit<BatchPost, 'id' | 'createdAt' | 'archived'>): Promise<string> => {
  const now = new Date();
  const createdAt = now.toISOString();
  
  const post: Omit<BatchPost, 'id'> = {
    ...postData,
    archived: false,
    createdAt
  };

  const docRef = await addDoc(collection(db, POSTS_COLLECTION), post);
  return docRef.id;
};

export const getRecruiterPosts = async (
  telegramId: string, 
  pageSize: number = 10, 
  lastDoc?: any
) => {
  let q = query(
    collection(db, POSTS_COLLECTION),
    where('telegramId', '==', telegramId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as BatchPost[];

  return {
    posts,
    lastDoc: snapshot.docs[snapshot.docs.length - 1]
  };
};

export const archiveOldPosts = async () => {
  const today = getWIBDate();
  
  const q = query(
    collection(db, POSTS_COLLECTION),
    where('date', '<', today),
    where('archived', '==', false)
  );

  const snapshot = await getDocs(q);
  const promises = snapshot.docs.map(d => updateDoc(doc(db, POSTS_COLLECTION, d.id), { archived: true }));
  await Promise.all(promises);
};
