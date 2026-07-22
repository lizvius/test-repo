import { useState, useCallback, useEffect } from 'react';
import { DailyReport, DailyReportFormData } from '../types';
import { createDailyReport, getReportsByTelegramId, getAllReports } from '../firebase/services/reportService';
import { syncReportToSheetsApi } from '../services/api';
import { useAuth } from './useAuth';

export function useReports() {
  const { telegramUser, userProfile } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!telegramUser) return;
    setIsLoading(true);
    setError(null);
    try {
      let data: DailyReport[] = [];
      if (userProfile?.role === 'Admin' || userProfile?.role === 'Owner') {
        data = await getAllReports();
      } else {
        data = await getReportsByTelegramId(String(telegramUser.id));
      }
      setReports(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil data laporan.');
    } finally {
      setIsLoading(false);
    }
  }, [telegramUser, userProfile]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const submitReport = async (formData: DailyReportFormData) => {
    if (!telegramUser) throw new Error('Pengguna tidak terautentikasi');
    setIsLoading(true);
    setError(null);
    try {
      const name = `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim() || 'Recruiter';
      const newReport = await createDailyReport(
        {
          telegramId: String(telegramUser.id),
          username: telegramUser.username || '',
          name
        },
        formData
      );
      setReports((prev) => [newReport, ...prev]);

      // Sync report to Google Sheets automatically
      syncReportToSheetsApi(newReport).catch((err) => {
        console.warn('[Google Sheets] Auto sync report failed:', err);
      });

      return newReport;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim laporan harian.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reports,
    isLoading,
    error,
    refetch: fetchReports,
    submitReport
  };
}
