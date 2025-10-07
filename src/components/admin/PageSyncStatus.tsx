import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SyncStatus {
  totalPages: number;
  syncedPages: number;
  unsyncedPages: number;
  lastSync?: string;
}

const PageSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    totalPages: 0,
    syncedPages: 0,
    unsyncedPages: 0
  });
  const [loading, setLoading] = useState(false);

  // Определяем все страницы сайта (исключая системные страницы)
  const SITE_PAGES = [
    'home', 'catalog', 'about', 'contacts', 'lookbook',
    'privacy_policy', 'terms_of_use', 'public_offer', 'shipping_payment', 'returns_exchange',
    'cardigans', 'vests', 'sweaters', 'skirts', 'pants', 'scarves', 'hats',
    'blankets', 'pillows', 'pillowcases'
  ];

  useEffect(() => {
    checkSyncStatus();
  }, []);

  const checkSyncStatus = async () => {
    setLoading(true);
    try {
      // Получаем все страницы с контентом
      const { data: existingContent, error } = await supabase
        .from('page_content')
        .select('page_name, updated_at')
        .order('page_name');

      if (error) throw error;

      // Создаем карту существующих страниц
      const existingPages = new Set(existingContent?.map(item => item.page_name) || []);
      
      // Подсчитываем статистику
      const syncedPages = SITE_PAGES.filter(page => existingPages.has(page)).length;
      const unsyncedPages = SITE_PAGES.length - syncedPages;
      const lastSync = existingContent?.[0]?.updated_at;

      setSyncStatus({
        totalPages: SITE_PAGES.length,
        syncedPages,
        unsyncedPages,
        lastSync
      });

    } catch (error) {
      console.error('Error checking sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncPercentage = syncStatus.totalPages > 0 
    ? Math.round((syncStatus.syncedPages / syncStatus.totalPages) * 100)
    : 0;

  const getStatusColor = () => {
    if (syncPercentage >= 90) return 'text-green-600';
    if (syncPercentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (syncPercentage >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (syncPercentage >= 70) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusText = () => {
    if (syncPercentage >= 90) return 'Отлично';
    if (syncPercentage >= 70) return 'Хорошо';
    return 'Требует внимания';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Статус синхронизации страниц
        </CardTitle>
        <CardDescription>
          Общий статус синхронизации контента между сайтом и админ-панелью
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Прогресс-бар */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Прогресс синхронизации</span>
              <span className={`text-sm font-bold ${getStatusColor()}`}>
                {syncPercentage}%
              </span>
            </div>
            <Progress value={syncPercentage} className="h-2" />
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{syncStatus.totalPages}</div>
              <div className="text-xs text-muted-foreground">Всего страниц</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{syncStatus.syncedPages}</div>
              <div className="text-xs text-muted-foreground">Синхронизировано</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{syncStatus.unsyncedPages}</div>
              <div className="text-xs text-muted-foreground">Не синхронизировано</div>
            </div>
          </div>

          {/* Статус */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant={syncPercentage >= 90 ? 'default' : syncPercentage >= 70 ? 'secondary' : 'destructive'}
                className={
                  syncPercentage >= 90 ? 'bg-green-100 text-green-800' :
                  syncPercentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }
              >
                {getStatusText()}
              </Badge>
              {syncStatus.lastSync && (
                <span className="text-xs text-muted-foreground">
                  Последнее обновление: {new Date(syncStatus.lastSync).toLocaleDateString('ru-RU')}
                </span>
              )}
            </div>
            
            <button
              onClick={checkSyncStatus}
              disabled={loading}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Обновить статус"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Рекомендации */}
          {syncStatus.unsyncedPages > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Рекомендации</span>
              </div>
              <p className="text-xs text-amber-700">
                У вас есть {syncStatus.unsyncedPages} страниц без контента. 
                Создайте контент для этих страниц, чтобы улучшить SEO и пользовательский опыт.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PageSyncStatus;
