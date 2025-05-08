import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import {useIsFocused} from '@react-navigation/native';
import {
  fetchMenu,
  saveMenu,
  saveStats,
  syncData,
} from '../services/storageService';
import * as NavigationService from '../services/navigationService';
import {checkInternet} from '../components/checkInternet';
import {deleteDish, setAvailability} from '../services/databaseManager';
import RNHapticFeedback from 'react-native-haptic-feedback';
import {Haptic} from '../components/haptics';


interface Menu {
  [key: string]: {
    [key: string]: MenuItem;
  };
}

type MenuItems = Record<string, Record<string, MenuItem>>;

const MenuItemsScreen = () => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuItems, setMenuItems] = useState<Menu>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'available', 'soldout'

  // States for expandable categories
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [allExpanded, setAllExpanded] = useState(false);

  // State for long press detection
  const [longPressedItem, setLongPressedItem] = useState<string | null>(null);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const ci = await checkInternet();
    if (!ci) {
      setRefreshing(false);
      return;
    }
    await syncData();
    await loadMenuItems();
    setRefreshing(false);
  }, []);

  const loadMenuItems = async () => {
    try {
      setRefreshing(true);
      const menu: Menu = await fetchMenu();
      if (menu) {
        setMenuItems(menu);
        loadStats();
        // Initialize all categories as expanded
        const initialExpandState: Record<string, boolean> = {};
        Object.keys(menu).forEach(category => {
          initialExpandState[category] = false;
        });
        setExpandedCategories(initialExpandState);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadMenuItems();
    }
  }, [isFocused]);

  const getFilteredItems = () => {
    let filteredMenu:Menu = {...menuItems};

    // Filter by search query
    if (searchQuery) {
      const result: MenuItems = {};

      Object.keys(menuItems).forEach(category => {
        const filteredItems: Record<string, MenuItem> = {};

        Object.keys(menuItems[category]).forEach(itemKey => {
          const item = menuItems[category][itemKey];
          if (item?.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
            filteredItems[itemKey] = item;
          }
        });

        if (Object.keys(filteredItems).length > 0) {
          result[category] = filteredItems;
        }
      });

      filteredMenu = result;
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      const result: MenuItems = {};
      if (filteredMenu[categoryFilter]) {
        result[categoryFilter] = filteredMenu[categoryFilter];
      }
      filteredMenu = result;
    }

    // Filter by availability
    if (availabilityFilter !== 'all') {
      const isAvailable = availabilityFilter === 'available';
      const result: MenuItems = {};

      Object.keys(filteredMenu).forEach(category => {
        const filteredItems: Record<string, MenuItem> = {};

        Object.keys(filteredMenu[category]).forEach(itemKey => {
          const item = filteredMenu[category][itemKey];
          if (item.status === isAvailable) {
            filteredItems[itemKey] = item;
          }
        });

        if (Object.keys(filteredItems).length > 0) {
          result[category] = filteredItems;
        }
      });

      filteredMenu = result;
    }

    return filteredMenu;
  };

  const filteredItems = getFilteredItems();

  const loadStats = async () => {
    // Calculate menu item statistics

    const totalItems = Object.keys(menuItems).reduce(
      (total, category) => total + Object.keys(menuItems[category]).length,
      0,
    );

    const availableItems = Object.keys(menuItems).reduce(
      (total, category) =>
        total +
        Object.keys(menuItems[category]).filter(
          item => menuItems[category][item].status,
        ).length,
      0,
    );

    const soldOutItems = totalItems - availableItems;
    await saveStats(totalItems, availableItems, soldOutItems);
  };

  const handleAddDish = (category: string|null) => {
    NavigationService.navigate('AddDish', {
      category,
    });
  };

  // Toggle single category expansion
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Toggle all categories expansion
  const toggleAllCategories = () => {
    const newExpandedState = !allExpanded;
    setAllExpanded(newExpandedState);

    const updatedExpandedCategories: Record<string, boolean> = {};
    Object.keys(filteredItems).forEach(category => {
      updatedExpandedCategories[category] = newExpandedState;
    });

    setExpandedCategories(updatedExpandedCategories);
  };

  // Handle delete item
  const handleDelete = async (category: string, item: string) => {
    await deleteDish(category, item);
    const updatedMenu = setMenuItems(prevMenuItems => {
      const updatedMenu = {...prevMenuItems};
      delete updatedMenu[category][item];

      if (Object.keys(updatedMenu[category]).length === 0) {
        delete updatedMenu[category];
      }
      saveMenu(updatedMenu);
      return updatedMenu;
    });

    setLongPressedItem(null);
  };

  const toggleAvailability = async (category: string, name: string) => {
    const val = !menuItems[category][name].status;
    const tempMenu = {...menuItems};
    tempMenu[category][name].status = val;
    setMenuItems(tempMenu);
    Haptic();
    await saveMenu(menuItems);
    await setAvailability(category, name, val);
    await loadStats();
  };

  // Reset long pressed item when filters change
  useEffect(() => {
    setLongPressedItem(null);
  }, [searchQuery, availabilityFilter, categoryFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0F766E']} // spinner color (Android)
            progressBackgroundColor="#FFFFFF" // background color (Android)
            tintColor="#0F766E" // spinner color (iOS)
          />
        }>
        {/* Profile Info */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Menu Items</Text>
          <Text style={styles.headerSubtitle}>
            Manage your restaurant menu items
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Icon name="search" size={19} color="#999" style={{marginLeft: 9}} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <Icon
              name="x"
              onPress={() => setSearchQuery('')}
              size={19}
              color="#999"
              style={{marginRight: 9}}
            />
          )}
        </View>

        {/* Filter Options with Expand/Collapse Toggle */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                availabilityFilter === 'all' && styles.filterButtonActive,
              ]}
              onPress={() => setAvailabilityFilter('all')}>
              <Text
                style={[
                  styles.filterButtonText,
                  availabilityFilter === 'all' && styles.filterButtonTextActive,
                ]}>
                All Items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                availabilityFilter === 'available' && styles.filterButtonActive,
              ]}
              onPress={() => setAvailabilityFilter('available')}>
              <Text
                style={[
                  styles.filterButtonText,
                  availabilityFilter === 'available' &&
                    styles.filterButtonTextActive,
                ]}>
                Available
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                availabilityFilter === 'soldout' && styles.filterButtonActive,
              ]}
              onPress={() => setAvailabilityFilter('soldout')}>
              <Text
                style={[
                  styles.filterButtonText,
                  availabilityFilter === 'soldout' &&
                    styles.filterButtonTextActive,
                ]}>
                Sold Out
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.expandCollapseButton}
              onPress={toggleAllCategories}>
              <Text> </Text>
              <Icon
                name={allExpanded ? 'minimize-2' : 'maximize-2'}
                size={18}
                color="#0F766E"
              />
              <Text> </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Menu Items List */}
        <View style={styles.menuItemsContainer}>
          {Object.keys(filteredItems).length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Icon name="alert-circle" size={48} color="#94A3B8" />
              <Text style={styles.emptyStateText}>No menu items found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try changing your search or filters
              </Text>
            </View>
          ) : (
            Object.keys(filteredItems).map(category => (
              <View key={category} style={styles.categorySection}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => toggleCategoryExpansion(category)}>
                  <View style={styles.categoryTitleContainer}>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <Text style={styles.itemCountBadge}>
                      {Object.keys(filteredItems[category]).length} items
                    </Text>
                  </View>
                  <View style={styles.categoryTitleContainer}>
                    <TouchableOpacity
                      style={styles.addDishSmallButton}
                      onPress={() => handleAddDish(category)}>
                      <Icon name="plus-circle" size={20} color="#0F766E" />
                    </TouchableOpacity>
                    <Icon
                      name={
                        expandedCategories[category]
                          ? 'chevron-up'
                          : 'chevron-down'
                      }
                      size={20}
                      color="#0F172A"
                    />
                  </View>
                </TouchableOpacity>

                {expandedCategories[category] && (
                  <Animatable.View
                    animation="fadeIn"
                    duration={300}
                    style={styles.itemsContainer}>
                    {Object.keys(filteredItems[category]).map(itemKey => {
                      const item = filteredItems[category][itemKey];
                      const itemId = `${category}-${itemKey}`;
                      const isLongPressed = longPressedItem === itemId;

                      return (
                        <Animatable.View
                          key={itemId}
                          animation="fadeIn"
                          duration={400}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                              styles.itemCard,
                              item.status
                                ? styles.availableCardBadge
                                : styles.soldOutCardBadge,
                              isLongPressed && styles.itemCardLongPressed,
                            ]}
                            onPress={() => {
                              setLongPressedItem(null);
                            }}
                            onLongPress={() => setLongPressedItem(itemId)}
                            delayLongPress={500}>
                            <View style={styles.itemDetails}>
                              <Text
                                style={[
                                  styles.itemName,
                                  isLongPressed && styles.fadedText,
                                ]}>
                                {item.name}
                              </Text>
                              <Text
                                style={[
                                  styles.itemPrice,
                                  isLongPressed && styles.fadedText,
                                ]}>
                                ₹{item.price}
                              </Text>
                            </View>

                            {isLongPressed ? (
                              <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => {
                                  if (item.name) {
                                    toggleAvailability(category, item.name);
                                  }
                                }}>
                                <Icon
                                  name="trash-2"
                                  size={20}
                                  color="#DC2626"
                                />
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                onPress={() => {
                                  if (item.name) {
                                    toggleAvailability(category, item.name);
                                  }
                                }}
                                style={[
                                  styles.statusBadge,
                                  item.status
                                    ? styles.availableBadge
                                    : styles.soldOutBadge,
                                ]}>
                                <Text
                                  style={[
                                    styles.statusText,
                                    item.status
                                      ? styles.availableText
                                      : styles.soldOutText,
                                  ]}>
                                  {item.status ? 'Available' : 'Sold Out'}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </TouchableOpacity>
                        </Animatable.View>
                      );
                    })}
                  </Animatable.View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Add Menu Item Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            handleAddDish(null);
          }}>
          <Icon name="plus-circle" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Add New Menu Item</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingBottom: 80,
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 10,
    color: '#0F172A',
  },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  filtersScrollView: {
    flexGrow: 0,
    flexShrink: 1,
    maxWidth: '70%',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#0F766E',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  expandCollapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  expandCollapseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F766E',
  },
  addDishSmallButton: {
    backgroundColor: '#CBD5E1',
    padding: 8,
    borderRadius: 24,
    marginRight: 5,
  },
  menuItemsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
    marginBottom: 30,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  categorySection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E2E8F0',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    maxWidth: '80%',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    paddingRight: 8,
    flexShrink: 1,
  },
  itemCountBadge: {
    fontSize: 14,
    color: '#64748B',
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemsContainer: {
    padding: 12,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
  },
  availableCardBadge: {
    borderLeftColor: '#047857',
  },
  soldOutCardBadge: {
    borderLeftColor: '#DC2626',
  },
  itemCardLongPressed: {
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#64748B',
  },
  fadedText: {
    opacity: 0.6,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  availableBadge: {
    backgroundColor: '#D1FAE5',
  },
  soldOutBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  availableText: {
    color: '#047857',
  },
  soldOutText: {
    color: '#DC2626',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default MenuItemsScreen;
