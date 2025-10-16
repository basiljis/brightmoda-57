import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  Eye, 
  Heart, 
  ShoppingCart, 
  ShoppingBag, 
  Mail,
  TrendingUp,
  Calendar,
  Filter,
  MapPin
} from 'lucide-react';

interface AnalyticsData {
  daily_stats: Array<{
    date: string;
    page_views: number;
    unique_visitors: number;
    favorites_added: number;
    cart_additions: number;
    completed_purchases: number;
    abandoned_carts: number;
    new_subscribers: number;
  }>;
  top_pages: Array<{
    page_path: string;
    views: number;
  }>;
  top_products: Array<{
    product_id: string;
    product_name: string;
    views: number;
    favorites: number;
    cart_additions: number;
  }>;
  geo_stats: {
    by_city: Array<{
      city: string;
      views: number;
    }>;
    by_region: Array<{
      region: string;
      views: number;
    }>;
    by_country: Array<{
      country: string;
      views: number;
    }>;
  };
  summary: {
    total_page_views: number;
    total_unique_visitors: number;
    total_favorites: number;
    total_cart_additions: number;
    total_purchases: number;
    total_subscribers: number;
    conversion_rate: number;
    abandonment_rate: number;
  };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

const AnalyticsDashboard = () => {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const [totalActiveSubscribers, setTotalActiveSubscribers] = useState(0);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const start = dateRange === 'custom' ? startDate : (() => {
        const date = new Date();
        date.setDate(date.getDate() - parseInt(dateRange));
        return date.toISOString().split('T')[0];
      })();
      
      const end = dateRange === 'custom' ? endDate : new Date().toISOString().split('T')[0];

      // Get daily summary data
      const { data: summaryData, error: summaryError } = await supabase
        .from('analytics_summary')
        .select('*')
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true });

      if (summaryError) throw summaryError;

      // Get top pages
      const { data: pageViews, error: pageError } = await supabase
        .from('page_views')
        .select('page_path')
        .gte('created_at', `${start}T00:00:00`)
        .lte('created_at', `${end}T23:59:59`);

      if (pageError) throw pageError;

      // Get product analytics
      const { data: productActions, error: productError } = await supabase
        .from('user_actions')
        .select('action_type, entity_id, metadata')
        .in('action_type', ['product_view', 'add_to_favorites', 'add_to_cart'])
        .eq('entity_type', 'product')
        .gte('created_at', `${start}T00:00:00`)
        .lte('created_at', `${end}T23:59:59`);

      if (productError) throw productError;

      // Get total active subscribers count
      const { count: activeSubscribersCount, error: subscribersError } = await supabase
        .from('email_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (subscribersError) throw subscribersError;
      setTotalActiveSubscribers(activeSubscribersCount || 0);

      // Get new subscribers count for the selected period
      const { count: newSubscribersCount, error: newSubscribersError } = await supabase
        .from('email_subscriptions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${start}T00:00:00`)
        .lte('created_at', `${end}T23:59:59`);

      if (newSubscribersError) throw newSubscribersError;

      // Process data
      const dailyStats = processDailyStats(summaryData || []);
      const topPages = processTopPages(pageViews || []);
      const topProducts = await processTopProducts(productActions || []);
      const geoStats = processGeoStats(pageViews || []);
      const summary = calculateSummary(summaryData || [], newSubscribersCount || 0);

      setAnalyticsData({
        daily_stats: dailyStats,
        top_pages: topPages,
        top_products: topProducts,
        geo_stats: geoStats,
        summary: summary
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные аналитики",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processDailyStats = (data: any[]) => {
    const statsMap = new Map();
    
    data.forEach(item => {
      const date = item.date;
      if (!statsMap.has(date)) {
        statsMap.set(date, {
          date,
          page_views: 0,
          unique_visitors: 0,
          favorites_added: 0,
          cart_additions: 0,
          completed_purchases: 0,
          abandoned_carts: 0,
          new_subscribers: 0
        });
      }
      
      const stats = statsMap.get(date);
      switch (item.metric_name) {
        case 'page_views':
          stats.page_views = item.metric_value;
          break;
        case 'unique_visitors':
          stats.unique_visitors = item.metric_value;
          break;
        case 'favorites_added':
          stats.favorites_added = item.metric_value;
          break;
        case 'cart_additions':
          stats.cart_additions = item.metric_value;
          break;
        case 'completed_purchases':
          stats.completed_purchases = item.metric_value;
          break;
        case 'abandoned_carts':
          stats.abandoned_carts = item.metric_value;
          break;
        case 'new_subscribers':
          stats.new_subscribers = item.metric_value;
          break;
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const processTopPages = (pageViews: any[]) => {
    const pageCount = new Map();
    pageViews.forEach(view => {
      const path = view.page_path;
      pageCount.set(path, (pageCount.get(path) || 0) + 1);
    });

    return Array.from(pageCount.entries())
      .map(([page_path, views]) => ({ page_path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  };

  const processGeoStats = (pageViews: any[]) => {
    const cityCount = new Map();
    const regionCount = new Map();
    const countryCount = new Map();
    
    pageViews.forEach(view => {
      if (view.city) {
        cityCount.set(view.city, (cityCount.get(view.city) || 0) + 1);
      }
      if (view.region) {
        regionCount.set(view.region, (regionCount.get(view.region) || 0) + 1);
      }
      if (view.country) {
        countryCount.set(view.country, (countryCount.get(view.country) || 0) + 1);
      }
    });

    return {
      by_city: Array.from(cityCount.entries())
        .map(([city, views]) => ({ city, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 15),
      by_region: Array.from(regionCount.entries())
        .map(([region, views]) => ({ region, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 15),
      by_country: Array.from(countryCount.entries())
        .map(([country, views]) => ({ country, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 15)
    };
  };

  const processTopProducts = async (actions: any[]) => {
    const productStats = new Map();
    
    actions.forEach(action => {
      const productId = action.entity_id;
      if (!productStats.has(productId)) {
        productStats.set(productId, {
          product_id: productId,
          product_name: action.metadata?.product_name || `Product ${productId}`,
          views: 0,
          favorites: 0,
          cart_additions: 0
        });
      }
      
      const stats = productStats.get(productId);
      switch (action.action_type) {
        case 'product_view':
          stats.views++;
          break;
        case 'add_to_favorites':
          stats.favorites++;
          break;
        case 'add_to_cart':
          stats.cart_additions++;
          break;
      }
    });

    return Array.from(productStats.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  };

  const calculateSummary = (data: any[], newSubscribersCount: number) => {
    const summary = {
      total_page_views: 0,
      total_unique_visitors: 0,
      total_favorites: 0,
      total_cart_additions: 0,
      total_purchases: 0,
      total_subscribers: newSubscribersCount,
      conversion_rate: 0,
      abandonment_rate: 0
    };

    data.forEach(item => {
      switch (item.metric_name) {
        case 'page_views':
          summary.total_page_views += item.metric_value;
          break;
        case 'unique_visitors':
          summary.total_unique_visitors += item.metric_value;
          break;
        case 'favorites_added':
          summary.total_favorites += item.metric_value;
          break;
        case 'cart_additions':
          summary.total_cart_additions += item.metric_value;
          break;
        case 'completed_purchases':
          summary.total_purchases += item.metric_value;
          break;
      }
    });

    summary.conversion_rate = summary.total_cart_additions > 0 
      ? (summary.total_purchases / summary.total_cart_additions) * 100 
      : 0;
      
    const totalCarts = data
      .filter(item => item.metric_name === 'abandoned_carts')
      .reduce((sum, item) => sum + item.metric_value, 0);
    
    summary.abandonment_rate = (summary.total_cart_additions + totalCarts) > 0
      ? (totalCarts / (summary.total_cart_additions + totalCarts)) * 100
      : 0;

    return summary;
  };

  const updateSummary = async () => {
    try {
      const { error } = await supabase.rpc('update_analytics_summary');
      if (error) throw error;
      
      toast({
        title: "Обновлено",
        description: "Сводка аналитики обновлена",
      });
      
      loadAnalytics();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить сводку",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  useEffect(() => {
    if (dateRange === 'custom') {
      loadAnalytics();
    }
  }, [startDate, endDate]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Загрузка аналитики...</div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Нет данных для отображения</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Аналитика сайта
          </CardTitle>
          <CardDescription>
            Статистика посещений, действий пользователей и конверсии
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Label>Период:</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 дней</SelectItem>
                  <SelectItem value="30">30 дней</SelectItem>
                  <SelectItem value="90">90 дней</SelectItem>
                  <SelectItem value="custom">Свой период</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateRange === 'custom' && (
              <>
                <div className="flex items-center gap-2">
                  <Label>С:</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[140px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label>По:</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[140px]"
                  />
                </div>
              </>
            )}
            
            <Button onClick={updateSummary} variant="outline">
              Обновить данные
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Просмотры</p>
                    <p className="text-2xl font-bold">{analyticsData.summary.total_page_views}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Посетители</p>
                    <p className="text-2xl font-bold">{analyticsData.summary.total_unique_visitors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Покупки</p>
                    <p className="text-2xl font-bold">{analyticsData.summary.total_purchases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Всего активных</p>
                    <p className="text-2xl font-bold">{totalActiveSubscribers}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Новых за период: {analyticsData.summary.total_subscribers}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="pages">Страницы</TabsTrigger>
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="geography">География</TabsTrigger>
              <TabsTrigger value="conversion">Конверсия</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ежедневная статистика</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.daily_stats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="page_views" stroke="hsl(var(--primary))" name="Просмотры" />
                      <Line type="monotone" dataKey="unique_visitors" stroke="hsl(var(--secondary))" name="Посетители" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Популярные страницы</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.top_pages}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="page_path" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Популярные товары</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.top_products.map((product, index) => (
                      <div key={product.product_id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{product.product_name}</p>
                          <p className="text-sm text-muted-foreground">ID: {product.product_id}</p>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {product.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {product.favorites}
                          </span>
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            {product.cart_additions}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="geography" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      По странам
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.geo_stats.by_country.map((item, index) => (
                        <div key={item.country} className="flex items-center justify-between">
                          <span className="text-sm">{item.country || 'Не определено'}</span>
                          <span className="text-sm font-medium">{item.views}</span>
                        </div>
                      ))}
                      {analyticsData.geo_stats.by_country.length === 0 && (
                        <p className="text-sm text-muted-foreground">Нет данных</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      По регионам
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.geo_stats.by_region.map((item, index) => (
                        <div key={item.region} className="flex items-center justify-between">
                          <span className="text-sm">{item.region || 'Не определено'}</span>
                          <span className="text-sm font-medium">{item.views}</span>
                        </div>
                      ))}
                      {analyticsData.geo_stats.by_region.length === 0 && (
                        <p className="text-sm text-muted-foreground">Нет данных</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      По городам
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.geo_stats.by_city.map((item, index) => (
                        <div key={item.city} className="flex items-center justify-between">
                          <span className="text-sm">{item.city || 'Не определено'}</span>
                          <span className="text-sm font-medium">{item.views}</span>
                        </div>
                      ))}
                      {analyticsData.geo_stats.by_city.length === 0 && (
                        <p className="text-sm text-muted-foreground">Нет данных</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="conversion" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Конверсия</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Конверсия корзина → покупка</p>
                        <p className="text-2xl font-bold">{analyticsData.summary.conversion_rate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Брошенные корзины</p>
                        <p className="text-2xl font-bold">{analyticsData.summary.abandonment_rate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Действия пользователей</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Избранное', value: analyticsData.summary.total_favorites },
                            { name: 'В корзину', value: analyticsData.summary.total_cart_additions },
                            { name: 'Покупки', value: analyticsData.summary.total_purchases },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;