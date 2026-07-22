import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError, OperationType } from '../error';
import { SystemSettings } from '../../types';

const COLLECTION_NAME = 'settings';
const DEFAULT_SETTING_ID = 'global_settings';

export async function getSystemSettings(): Promise<SystemSettings> {
  const settingRef = doc(db, COLLECTION_NAME, DEFAULT_SETTING_ID);
  try {
    const docSnap = await getDoc(settingRef);
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
    }

    // Default system settings
    const defaultSettings: SystemSettings = {
      id: DEFAULT_SETTING_ID,
      systemStatus: 'Operational',
      allowRegistrations: true,
      announcementHeader: 'Selamat Datang di Portal Rekrutmen AzurLizeTeam',
      updatedAt: new Date().toISOString()
    };

    return defaultSettings;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${DEFAULT_SETTING_ID}`);
  }
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  const settingRef = doc(db, COLLECTION_NAME, DEFAULT_SETTING_ID);
  const now = new Date().toISOString();

  try {
    const existing = await getSystemSettings();
    const updated: SystemSettings = {
      ...existing,
      ...settings,
      updatedAt: now
    };

    await setDoc(settingRef, updated);
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${DEFAULT_SETTING_ID}`);
  }
}
