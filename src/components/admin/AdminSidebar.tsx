import { BarChart3, Package, BookOpen, FileText, ShoppingCart, Settings, Mail, HelpCircle, ChevronDown, Home, Palette, Type, CreditCard, Truck, Database, Image, Layout, Search, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminSection {
  value: string;
  label: string;
  icon: any;
  subItems?: {
    value: string;
    label: string;
  }[];
}

const sections: AdminSection[] = [
  {
    value: "analytics",
    label: "Аналитика",
    icon: BarChart3,
  },
  {
    value: "products",
    label: "Товары",
    icon: Package,
    subItems: [
      { value: "products-management", label: "Управление товарами" },
      { value: "products-import-export", label: "Импорт/Экспорт" },
    ],
  },
  {
    value: "references",
    label: "Справочники",
    icon: Database,
  },
  {
    value: "content",
    label: "Контент",
    icon: FileText,
    subItems: [
      { value: "content-home-blocks", label: "Главная" },
      { value: "content-header", label: "Коллекции в шапке" },
      { value: "content-lookbook", label: "Lookbook" },
      { value: "content-catalog", label: "Каталог" },
      { value: "content-footer", label: "Подвал" },
      { value: "content-menus", label: "Другие разделы" },
    ],
  },
  {
    value: "orders",
    label: "Заказы",
    icon: ShoppingCart,
  },
  {
    value: "settings",
    label: "Настройки",
    icon: Settings,
    subItems: [
      { value: "settings-site", label: "Настройки сайта" },
      { value: "settings-seo", label: "SEO" },
      { value: "settings-fonts", label: "Шрифты" },
      { value: "settings-email", label: "Email" },
      { value: "settings-delivery", label: "Доставка" },
      { value: "settings-payment", label: "Платежи" },
    ],
  },
  {
    value: "subscriptions",
    label: "Подписки",
    icon: Mail,
  },
  {
    value: "instructions",
    label: "Инструкции",
    icon: HelpCircle,
  },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hiddenSections: string[];
}

export function AdminSidebar({ activeTab, onTabChange, hiddenSections }: AdminSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const collapsed = state === "collapsed";

  const visibleSections = sections.filter(section => !hiddenSections.includes(section.value));

  // Filter sections based on search query
  const filteredSections = visibleSections.filter(section => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const matchesLabel = section.label.toLowerCase().includes(query);
    const matchesSubItems = section.subItems?.some(sub => 
      sub.label.toLowerCase().includes(query)
    );
    
    return matchesLabel || matchesSubItems;
  });

  // Auto-expand groups that match search
  useEffect(() => {
    if (searchQuery.trim()) {
      const matchingGroups = filteredSections
        .filter(section => section.subItems)
        .map(section => section.value);
      setOpenGroups(matchingGroups);
    }
  }, [searchQuery]);

  const toggleGroup = (value: string) => {
    setOpenGroups(prev => 
      prev.includes(value) 
        ? prev.filter(g => g !== value)
        : [...prev, value]
    );
  };

  const isGroupOpen = (value: string) => {
    // Auto-open if active tab belongs to this group
    const section = sections.find(s => s.value === value);
    if (section?.subItems) {
      const isActive = section.subItems.some(sub => activeTab === sub.value);
      return isActive || openGroups.includes(value);
    }
    return openGroups.includes(value);
  };

  const getNavCls = (isActive: boolean) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90" 
      : "hover:bg-muted";

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} sticky top-16 h-[calc(100vh-4rem)] z-20`}
      collapsible="icon"
    >
      <SidebarContent className="mt-0 pt-2 max-h-[calc(100vh-4rem)] overflow-y-auto pb-24">
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold px-4 py-3">
            {!collapsed && "Админ-панель"}
          </SidebarGroupLabel>
          
          {!collapsed && (
            <div className="px-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по разделам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSections.map((section) => {
                const Icon = section.icon;
                const hasSubItems = section.subItems && section.subItems.length > 0;
                const isActive = activeTab === section.value || 
                  section.subItems?.some(sub => activeTab === sub.value);

                // Filter sub-items based on search
                const filteredSubItems = section.subItems?.filter(sub => {
                  if (!searchQuery.trim()) return true;
                  return sub.label.toLowerCase().includes(searchQuery.toLowerCase());
                });

                if (hasSubItems && filteredSubItems && filteredSubItems.length > 0) {
                  return (
                    <Collapsible
                      key={section.value}
                      open={isGroupOpen(section.value)}
                      onOpenChange={() => toggleGroup(section.value)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            className={getNavCls(isActive)}
                            tooltip={collapsed ? section.label : undefined}
                          >
                            <Icon className="h-4 w-4" />
                            {!collapsed && (
                              <>
                                <span>{section.label}</span>
                                <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isGroupOpen(section.value) ? 'rotate-180' : ''}`} />
                              </>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {filteredSubItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.value}>
                                  <SidebarMenuSubButton
                                    onClick={() => onTabChange(subItem.value)}
                                    className={getNavCls(activeTab === subItem.value)}
                                  >
                                    <span>{subItem.label}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={section.value}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(section.value)}
                      className={getNavCls(activeTab === section.value)}
                      tooltip={collapsed ? section.label : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      {!collapsed && <span>{section.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
