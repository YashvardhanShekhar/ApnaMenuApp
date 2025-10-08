import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TextInput,
  StatusBar,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import styles from '../styles/menuScreenStyle';
import * as Animatable from 'react-native-animatable';
import {useIsFocused} from '@react-navigation/native';
import {
  fetchMenu,
  fetchUrl,
  saveMenu,
  saveStats,
  syncData,
} from '../services/storageService';
import * as NavigationService from '../services/navigationService';
import {checkInternet} from '../components/checkInternet';
import {deleteDishDB, setAvailability} from '../services/databaseManager';
import {Haptic} from '../components/haptics';
import {Portal} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';

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

  // QR Code modal state
  const [showQRModal, setShowQRModal] = useState(false);
  const [url, setUrl] = useState('your-restaurant-url'); // Replace with actual URL

  // States for expandable categories
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [allExpanded, setAllExpanded] = useState(false);

  // State for long press detection
  const [longPressedItem, setLongPressedItem] = useState<string | null>(null);

  // Get screen dimensions for QR code modal
  const screenWidth = Dimensions.get('window').width;
  const qrSize = screenWidth * 0.7;

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
      const url = await fetchUrl();
      setUrl(url);
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
    let filteredMenu: Menu = {...menuItems};

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

  const handleAddDish = (category: string | null) => {
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
    await deleteDishDB(category, item);
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
      {showQRModal ? (
        <StatusBar
          backgroundColor="rgba(0, 0, 0, 0.8)"
          barStyle="light-content"
        />
      ) : (
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      )}

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
        {/* Profile Info with QR Icon */}
        <View style={styles.headerSection}>
          <View style={{flex: 1}}>
            <Text style={styles.headerTitle}>Menu Items</Text>
            <Text style={styles.headerSubtitle}>
              Manage your restaurant menu items
            </Text>
          </View>
          <TouchableOpacity
            style={styles.qrIconButton}
            onPress={() => {
              setShowQRModal(true);
            }}>
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={24}
              color="#0F766E"
            />
          </TouchableOpacity>
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
                                    handleDelete(category, item.name);
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

      {/* QR Code Modal using Portal */}
      <Portal>
        <Modal
          visible={showQRModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowQRModal(false)}>
          <View style={styles.qrModalOverlay}>
            <View style={styles.qrModalContainer}>
              <TouchableOpacity
                style={styles.qrCloseButton}
                onPress={() => setShowQRModal(false)}>
                <Icon name="x" size={24} color="#666" />
              </TouchableOpacity>

              <Text style={styles.qrModalTitle}>Menu QR Code</Text>
              <Text style={styles.qrModalSubtitle}>
                Scan to view the digital menu
              </Text>

              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={`https://apnamenu.vercel.app/${encodeURIComponent(url)}/menu`}
                  size={qrSize}
                  color="black"
                  backgroundColor="white"
                />
              </View>
              <TouchableOpacity
                onPress={async () =>
                  Linking.openURL(
                    `https://apnamenu.vercel.app/${encodeURIComponent(url)}/menu`,
                  )
                }
                onLongPress={async () =>
                  Clipboard.setString(
                    `https://apnamenu.vercel.app/${encodeURIComponent(url)}/menu`,
                  )
                }>
                <Text style={styles.qrUrlText}>apnamenu.vercel.app/{url}/menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

export default MenuItemsScreen;
