import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError, OperationType } from '../error';
import { UserProfile, UserRole, UserStatus } from '../../types';

const COLLECTION_NAME = 'users';

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'connection_test'));
    return true;
  } catch {
    return false;
  }
}

export async function getUserProfile(telegramId: string): Promise<UserProfile | null> {
  const userRef = doc(db, COLLECTION_NAME, telegramId);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${telegramId}`);
  }
}

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
  const now = new Date().toISOString();
  const fullProfile: UserProfile = {
    ...profile,
    role: profile.role || 'Recruiter',
    status: profile.status || 'Pending',
    approved: profile.approved ?? false,
    createdAt: now,
    updatedAt: now
  };

  const userRef = doc(db, COLLECTION_NAME, profile.telegramId);
  try {
    await setDoc(userRef, fullProfile);
    return fullProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${profile.telegramId}`);
  }
}

export async function updateUserStatus(
  telegramId: string,
  status: UserStatus,
  approved: boolean,
  approvedBy: string
): Promise<void> {
  const userRef = doc(db, COLLECTION_NAME, telegramId);
  const now = new Date().toISOString();

  try {
    await updateDoc(userRef, {
      status,
      approved,
      approvedBy,
      approvedAt: now,
      updatedAt: now
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${telegramId}`);
  }
}

export async function updateUserRole(
  telegramId: string,
  role: UserRole,
  updatedBy: string
): Promise<void> {
  const userRef = doc(db, COLLECTION_NAME, telegramId);
  const now = new Date().toISOString();

  try {
    await updateDoc(userRef, {
      role,
      updatedBy,
      updatedAt: now
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${telegramId}`);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, COLLECTION_NAME);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

export async function getUsersByRole(role: UserRole): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, COLLECTION_NAME);
    const q = query(usersRef, where('role', '==', role));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map((docSnap) => docSnap.data() as UserProfile);
    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}
