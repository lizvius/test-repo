import { db } from '../config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { UserProfile, UserRole, UserStatus } from '../../types';
import { handleFirestoreError, OperationType } from '../error';

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const testRef = doc(db, 'settings', 'ping');
    await getDoc(testRef);
    return true;
  } catch {
    return false;
  }
}

export async function getUserProfile(telegramId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', String(telegramId));
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, `users/${telegramId}`);
  }
}

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
  const now = new Date().toISOString();
  const fullProfile: UserProfile = {
    ...profile,
    createdAt: now,
    updatedAt: now,
    role: profile.role || 'Recruiter',
    status: profile.status || 'Pending',
    approved: profile.approved ?? false
  };

  try {
    const userRef = doc(db, 'users', String(profile.telegramId));
    await setDoc(userRef, fullProfile);
    return fullProfile;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `users/${profile.telegramId}`);
  }
}

export async function updateUserStatus(
  telegramId: string,
  status: UserStatus,
  approved: boolean,
  approvedBy: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', String(telegramId));
    const now = new Date().toISOString();
    await updateDoc(userRef, {
      status,
      approved,
      approvedBy,
      approvedAt: now,
      updatedAt: now
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${telegramId}`);
  }
}

export async function updateUserRole(
  telegramId: string,
  role: UserRole,
  updatedBy: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', String(telegramId));
    const now = new Date().toISOString();
    await updateDoc(userRef, {
      role,
      updatedBy,
      updatedAt: now
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${telegramId}`);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => docSnap.data() as UserProfile);
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, 'users');
  }
}

export async function getUsersByRole(role: UserRole): Promise<UserProfile[]> {
  try {
    const users = await getAllUsers();
    return users.filter(u => u.role === role);
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, 'users');
  }
}
