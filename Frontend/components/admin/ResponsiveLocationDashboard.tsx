import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import {
  MapPin,
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  Bug,
  RefreshCw,
  Grid,
  Maximize2,
  Minimize2,
  Filter,
  Calendar,
  Settings,
} from 'lucide-react-native';
import InteractiveLocationMap from './InteractiveLocationMap';
import EnhancedLocationLeaderboard from './EnhancedLocationLeaderboard';
import RecentActivityPanel from './RecentActivityPanel';
import DiseaseTrendsPanel from './DiseaseTrendsPanel';
import UserGrowthPanel from './UserGrowthPanel';

const { width, height } = Dimensions.get('window');

type PanelType = 'map' | 'leaderboard' | 'activity' | 'trends' | 'growth';
type ViewMode = 'mobile' | 'tablet' | 'desktop';

interface PanelConfig {
  id: PanelType;
  title: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  description: string;
  priority: number;
}

export default function ResponsiveLocationDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');
  const [selectedPanel, setSelectedPanel] = useState<PanelType>('map');
  const [expandedPanels, setExpandedPanels] = useState<Set<PanelType>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showPanelSelector, setShowPanelSelector] = useState(false);

  const panels: PanelConfig[] = [
    {
      id: 'map',
      title: 'Interactive Map',
      icon: MapPin,
      component: InteractiveLocationMap,
      description: 'Real-time location data visualization',
      priority: 1,
    },
    {
      id: 'leaderboard',
      title: 'Location Leaderboard',
      icon: BarChart3,
      component: EnhancedLocationLeaderboard,
      description: 'Top performing locations',
      priority: 2,
    },
    {
      id: 'activity',
      title: 'Recent Activity',
      icon: Activity,
      component: RecentActivityPanel,
      description: 'Latest scan activities',
      priority: 3,
    },
    {
      id: 'trends',
      title: 'Disease Trends',
      icon: Bug,
      component: DiseaseTrendsPanel,
      description: 'Disease pattern analysis',
      priority: 4,
    },
    {
      id: 'growth',
      title: 'User Growth',
      icon: Users,
      component: UserGrowthPanel,
      description: 'User analytics and growth',
      priority: 5,
    },
  ];

  // Determine view mode based on screen size
  useEffect(() => {
    const updateViewMode = () => {
      if (width < 768) {
        setViewMode('mobile');
      } else if (width < 1024) {
        setViewMode('tablet');
      } else {
        setViewMode('desktop');
      }
    };

    updateViewMode();
    
    const subscription = Dimensions.addEventListener('change', updateViewMode);
    return () => subscription?.remove();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 2 * 60 * 1000); // Refresh every 2 minutes

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const togglePanelExpansion = (panelId: PanelType) => {
    const newExpanded = new Set(expandedPanels);
    if (newExpanded.has(panelId)) {
      newExpanded.delete(panelId);
    } else {
      newExpanded.add(panelId);
    }
    setExpandedPanels(newExpanded);
  };

  const getPanelComponent = (panelId: PanelType) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return null;
    
    const Component = panel.component;
    return <Component key={panelId} />;
  };

  const renderMobileView = () => (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.mobileHeader}>
        <View style={styles.headerContent}>
          <MapPin size={24} color="#059669" strokeWidth={2} />
          <Text style={styles.headerTitle}>Location Analytics</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionButton, autoRefresh && styles.activeActionButton]}
            onPress={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw
              size={16}
              color={autoRefresh ? '#ffffff' : '#6b7280'}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowPanelSelector(!showPanelSelector)}
          >
            <Grid size={16} color="#6b7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Panel Selector */}
      {showPanelSelector && (
        <View style={styles.panelSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {panels.map((panel) => (
              <TouchableOpacity
                key={panel.id}
                style={[
                  styles.panelSelectorItem,
                  selectedPanel === panel.id && styles.activePanelSelectorItem,
                ]}
                onPress={() => {
                  setSelectedPanel(panel.id);
                  setShowPanelSelector(false);
                }}
              >
                <React.createElement(panel.icon, {
                  size: 20,
                  color: selectedPanel === panel.id ? '#ffffff' : '#6b7280',
                  strokeWidth: 2,
                })}
                <Text
                  style={[
                    styles.panelSelectorText,
                    selectedPanel === panel.id && styles.activePanelSelectorText,
                  ]}
                >
                  {panel.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Selected Panel */}
      <View style={styles.mobileContent}>
        {getPanelComponent(selectedPanel)}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {panels.slice(0, 4).map((panel) => (
          <TouchableOpacity
            key={panel.id}
            style={[
              styles.bottomNavItem,
              selectedPanel === panel.id && styles.activeBottomNavItem,
            ]}
            onPress={() => setSelectedPanel(panel.id)}
          >
            <React.createElement(panel.icon, {
              size: 20,
              color: selectedPanel === panel.id ? '#059669' : '#6b7280',
              strokeWidth: 2,
            })}
            <Text
              style={[
                styles.bottomNavText,
                selectedPanel === panel.id && styles.activeBottomNavText,
              ]}
            >
              {panel.title.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTabletView = () => (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.tabletHeader}>
        <View style={styles.headerContent}>
          <MapPin size={24} color="#059669" strokeWidth={2} />
          <Text style={styles.headerTitle}>Location Analytics Dashboard</Text>
        </View>
        <View style={styles.headerActions}>
          <Text style={styles.lastRefreshText}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, autoRefresh && styles.activeActionButton]}
            onPress={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw
              size={16}
              color={autoRefresh ? '#ffffff' : '#6b7280'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.actionButtonText,
                autoRefresh && styles.activeActionButtonText,
              ]}
            >
              Auto Refresh
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Two-Column Layout */}
      <View style={styles.tabletContent}>
        {/* Left Column - Map */}
        <View style={styles.tabletLeftColumn}>
          <View style={styles.tabletPanel}>
            <View style={styles.tabletPanelHeader}>
              <MapPin size={20} color="#059669" strokeWidth={2} />
              <Text style={styles.tabletPanelTitle}>Interactive Map</Text>
              <TouchableOpacity
                onPress={() => togglePanelExpansion('map')}
                style={styles.expandButton}
              >
                {React.createElement(
                  expandedPanels.has('map') ? Minimize2 : Maximize2,
                  { size: 16, color: '#6b7280', strokeWidth: 2 }
                )}
              </TouchableOpacity>
            </View>
            <View style={expandedPanels.has('map') ? styles.expandedPanel : styles.normalPanel}>
              {getPanelComponent('map')}
            </View>
          </View>
        </View>

        {/* Right Column - Other Panels */}
        <View style={styles.tabletRightColumn}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {panels.slice(1).map((panel) => (
              <View key={panel.id} style={styles.tabletPanel}>
                <View style={styles.tabletPanelHeader}>
                  <React.createElement(panel.icon, {
                    size: 20,
                    color: '#059669',
                    strokeWidth: 2,
                  })}
                  <Text style={styles.tabletPanelTitle}>{panel.title}</Text>
                  <TouchableOpacity
                    onPress={() => togglePanelExpansion(panel.id)}
                    style={styles.expandButton}
                  >
                    {React.createElement(
                      expandedPanels.has(panel.id) ? Minimize2 : Maximize2,
                      { size: 16, color: '#6b7280', strokeWidth: 2 }
                    )}
                  </TouchableOpacity>
                </View>
                <View style={expandedPanels.has(panel.id) ? styles.expandedPanel : styles.normalPanel}>
                  {getPanelComponent(panel.id)}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );

  const renderDesktopView = () => (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.desktopHeader}>
        <View style={styles.headerContent}>
          <MapPin size={28} color="#059669" strokeWidth={2} />
          <View>
            <Text style={styles.headerTitle}>Location Analytics Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Comprehensive location-based insights and analytics
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Text style={styles.lastRefreshText}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, autoRefresh && styles.activeActionButton]}
            onPress={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw
              size={16}
              color={autoRefresh ? '#ffffff' : '#6b7280'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.actionButtonText,
                autoRefresh && styles.activeActionButtonText,
              ]}
            >
              Auto Refresh
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid Layout */}
      <View style={styles.desktopContent}>
        {/* Top Row - Map and Leaderboard */}
        <View style={styles.desktopRow}>
          <View style={styles.desktopPanelLarge}>
            <View style={styles.desktopPanelHeader}>
              <MapPin size={20} color="#059669" strokeWidth={2} />
              <Text style={styles.desktopPanelTitle}>Interactive Map</Text>
              <TouchableOpacity
                onPress={() => togglePanelExpansion('map')}
                style={styles.expandButton}
              >
                {React.createElement(
                  expandedPanels.has('map') ? Minimize2 : Maximize2,
                  { size: 16, color: '#6b7280', strokeWidth: 2 }
                )}
              </TouchableOpacity>
            </View>
            <View style={expandedPanels.has('map') ? styles.expandedPanel : styles.normalPanel}>
              {getPanelComponent('map')}
            </View>
          </View>
          <View style={styles.desktopPanelMedium}>
            <View style={styles.desktopPanelHeader}>
              <BarChart3 size={20} color="#059669" strokeWidth={2} />
              <Text style={styles.desktopPanelTitle}>Location Leaderboard</Text>
              <TouchableOpacity
                onPress={() => togglePanelExpansion('leaderboard')}
                style={styles.expandButton}
              >
                {React.createElement(
                  expandedPanels.has('leaderboard') ? Minimize2 : Maximize2,
                  { size: 16, color: '#6b7280', strokeWidth: 2 }
                )}
              </TouchableOpacity>
            </View>
            <View style={expandedPanels.has('leaderboard') ? styles.expandedPanel : styles.normalPanel}>
              {getPanelComponent('leaderboard')}
            </View>
          </View>
        </View>

        {/* Bottom Row - Activity, Trends, Growth */}
        <View style={styles.desktopRow}>
          <View style={styles.desktopPanelSmall}>
            <View style={styles.desktopPanelHeader}>
              <Activity size={20} color="#059669" strokeWidth={2} />
              <Text style={styles.desktopPanelTitle}>Recent Activity</Text>
              <TouchableOpacity
                onPress={() => togglePanelExpansion('activity')}
                style={styles.expandButton}
              >
                {React.createElement(
                  expandedPanels.has('activity') ? Minimize2 : Maximize2,
                  { size: 16, color: '#6b7280', strokeWidth: 2 }
                )}
              </TouchableOpacity>
            </View>
            <View style={expandedPanels.has('activity') ? styles.expandedPanel : styles.normalPanel}>
              {getPanelComponent('activity')}
            </View>
          </View>
          <View style={styles.desktopPanelSmall}>
            <View style={styles.desktopPanelHeader}>
              <Bug size={20} color="#059669" strokeWidth={2} />
              <Text style={styles.desktopPanelTitle}>Disease Trends</Text>
              <TouchableOpacity
                onPress={() => togglePanelExpansion('trends')}
                style={styles.expandButton}
              >
                {React.createElement(
                  expandedPanels.has('trends') ? Minimize2 : Maximize2,
                  { size: 16, color: '#6b7280', strokeWidth: 2 }
                )}
              </TouchableOpacity>
            </View>
            <View style={expandedPanels.has('trends') ? styles.expandedPanel : styles.normalPanel}>
              {getPanelComponent('trends')}
            </View>
          </View>
          <View style={styles.desktopPanelSmall}>
            <View style={styles.desktopPanelHeader}>
              <Users size={20} color="#059669" strokeWidth={2} />
              <Text style={styles.desktopPanelTitle}>User Growth</Text>
              <TouchableOpacity
                onPress={() => togglePanelExpansion('growth')}
                style={styles.expandButton}
              >
                {React.createElement(
                  expandedPanels.has('growth') ? Minimize2 : Maximize2,
                  { size: 16, color: '#6b7280', strokeWidth: 2 }
                )}
              </TouchableOpacity>
            </View>
            <View style={expandedPanels.has('growth') ? styles.expandedPanel : styles.normalPanel}>
              {getPanelComponent('growth')}
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {viewMode === 'mobile' && renderMobileView()}
      {viewMode === 'tablet' && renderTabletView()}
      {viewMode === 'desktop' && renderDesktopView()}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Mobile Styles
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mobileContent: {
    flex: 1,
    padding: 16,
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeBottomNavItem: {
    backgroundColor: '#f0fdf4',
  },
  bottomNavText: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  activeBottomNavText: {
    color: '#059669',
    fontWeight: '600',
  },
  panelSelector: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  panelSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    gap: 8,
  },
  activePanelSelectorItem: {
    backgroundColor: '#059669',
  },
  panelSelectorText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activePanelSelectorText: {
    color: '#ffffff',
  },

  // Tablet Styles
  tabletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabletContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  tabletLeftColumn: {
    flex: 2,
  },
  tabletRightColumn: {
    flex: 1,
  },
  tabletPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabletPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 8,
  },
  tabletPanelTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },

  // Desktop Styles
  desktopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  desktopContent: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  desktopRow: {
    flexDirection: 'row',
    gap: 24,
  },
  desktopPanelLarge: {
    flex: 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  desktopPanelMedium: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  desktopPanelSmall: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  desktopPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  desktopPanelTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },

  // Shared Styles
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lastRefreshText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  activeActionButton: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeActionButtonText: {
    color: '#ffffff',
  },
  expandButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  normalPanel: {
    height: 400,
  },
  expandedPanel: {
    height: 600,
  },
}); 