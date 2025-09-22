import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Edit, Trash2, Check } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DeliveryAddress {
  id: string;
  title: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  postal_code?: string;
  is_default: boolean;
}

const DeliveryAddresses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    recipient_name: '',
    phone: '',
    address_line: '',
    city: '',
    postal_code: '',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      recipient_name: '',
      phone: '',
      address_line: '',
      city: '',
      postal_code: '',
      is_default: false
    });
    setEditingAddress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from('delivery_addresses')
          .update(formData)
          .eq('id', editingAddress.id);
        
        if (error) throw error;
        toast({ title: "Адрес обновлен" });
      } else {
        const { error } = await supabase
          .from('delivery_addresses')
          .insert([{ ...formData, user_id: user?.id }]);
        
        if (error) throw error;
        toast({ title: "Адрес добавлен" });
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось сохранить адрес",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (address: DeliveryAddress) => {
    setEditingAddress(address);
    setFormData({
      title: address.title,
      recipient_name: address.recipient_name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city,
      postal_code: address.postal_code || '',
      is_default: address.is_default
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот адрес?')) return;
    
    try {
      const { error } = await supabase
        .from('delivery_addresses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Адрес удален" });
      loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось удалить адрес",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // Сначала убираем флаг по умолчанию со всех адресов
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Затем устанавливаем флаг для выбранного адреса
      const { error } = await supabase
        .from('delivery_addresses')
        .update({ is_default: true })
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Адрес установлен по умолчанию" });
      loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось установить адрес по умолчанию",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Адреса доставки
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? 'Редактировать адрес' : 'Добавить адрес'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Название адреса</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Дом, Работа, и т.д."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="recipient_name">Получатель</Label>
                  <Input
                    id="recipient_name"
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+7 (999) 123-45-67"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address_line">Адрес</Label>
                  <Input
                    id="address_line"
                    value={formData.address_line}
                    onChange={(e) => setFormData({...formData, address_line: e.target.value})}
                    placeholder="Улица, дом, квартира"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Город</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Индекс</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                    className="rounded border-border"
                  />
                  <Label htmlFor="is_default">Адрес по умолчанию</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingAddress ? 'Сохранить' : 'Добавить'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {addresses.length > 0 ? addresses.map((address) => (
            <div key={address.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{address.title}</h4>
                  {address.is_default && (
                    <Badge variant="default" className="text-xs">По умолчанию</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  {!address.is_default && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      title="Установить по умолчанию"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>{address.recipient_name}</strong></p>
                <p>{address.phone}</p>
                <p>{address.address_line}</p>
                <p>{address.city}{address.postal_code && `, ${address.postal_code}`}</p>
              </div>
            </div>
          )) : (
            <p className="text-center text-muted-foreground py-8">
              Адреса доставки не добавлены
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryAddresses;