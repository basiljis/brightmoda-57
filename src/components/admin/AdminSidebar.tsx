import { BarChart3, Package, BookOpen, FileText, ShoppingCart, Settings, Mail, HelpCircle, ChevronDown, Home, Palette, Type, CreditCard, Truck, Database, Image, Layout } from "lucide-react";
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
import { useState } from "react";

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
    subItems: [
      { value: "references-categories", label: "Категории" },
      { value: "references-collections", label: "Коллекции" },
      { value: "references-colors", label: "Цвета" },
      { value: "references-sizes", label: "Размеры" },
    ],
  },
  {
    value: "content",
    label: "Контент",
    icon: FileText,
    subItems: [
      { value: "content-lookbook", label: "Lookbook" },
      { value: "content-pages", label: "Контент страниц" },
      { value: "content-header", label: "Коллекции в шапке" },
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
  const collapsed = state === "collapsed";

  const visibleSections = sections.filter(section => !hiddenSections.includes(section.value));

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
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="pt-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold px-4 py-3">
            {!collapsed && "Админ-панель"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleSections.map((section) => {
                const Icon = section.icon;
                const hasSubItems = section.subItems && section.subItems.length > 0;
                const isActive = activeTab === section.value || 
                  section.subItems?.some(sub => activeTab === sub.value);

                if (hasSubItems) {
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
                              {section.subItems?.map((subItem) => (
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
