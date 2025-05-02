import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  StatusBar,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import {Button, Portal, Dialog} from 'react-native-paper';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Snackbar from 'react-native-snackbar';
import {
  addNewDish,
  deleteDish,
  setAvailability,
} from '../services/databaseManager';

type RouteParams = {
  updatedDish?: {
    id: number;
    category: string;
    name: string;
    price: number;
    status: boolean;
  };
};

type NavigationProps = {
  navigate: (
    screen: string,
    params: {
      category: string;
      isNewDish: boolean;
      itemId: number;
      name: string;
      price: number;
      status: boolean;
    },
  ) => void;
};

interface MenuItem {
  name: string;
  price: number;
  status: boolean;
}

type MenuItems = Record<string, Record<string, MenuItem>>;

const MenuScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProp<{params: RouteParams}, 'params'>>();

  const [user, setUser] = useState<any>({
    name: 'Tony',
    email: 'Tony@gmail.com',
  });

  // State for delete confirmation
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    category: string;
    item: string;
  } | null>(null);

  // // State for add category dialog
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      const res = await AsyncStorage.getItem('menu');
      const menu = JSON.parse(res);
      if (menu) {
        console.log(menu);
        setMenuItems(menu);
        setUser(JSON.parse(userData));
      } else {
        console.log('------     ------');
        console.log(menuItems);
      }
    };
    fetchUser();
  }, []);

  const [menuItems, setMenuItems] = useState<MenuItems>({});

  // State to track which categories are expanded or collapsed
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>(() => {
    // Initialize all categories as expanded
    const expanded: {[key: string]: boolean} = {};
    Object.keys(menuItems).forEach(category => {
      expanded[category] = true;
    });
    return expanded;
  });

  const [searchQuery, setSearchQuery] = useState('');

  const addDishInMenu = async (
    category: string,
    dishName: string,
    price: number,
  ) => {
    setMenuItems(() => {
      const prev = {...menuItems};
      if (!prev[category]) {
        prev[category] = {};
      }
      prev[category][dishName] = {
        name: dishName,
        price: price,
        status: true,
      };
      return prev;
    });
    await AsyncStorage.setItem('menu', JSON.stringify(menuItems));
  };

  const handleAddDish = (category: string) => {
    navigation.navigate('AddDish', {
      category,
      addDishInMenu,
      isNewDish: true,
      itemId: Date.now(),
      price: 0,
      status: true,
      name: '',
    });
  };

  const handleLongPress = (category: string, item: string) => {
    ReactNativeHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
    });
    setItemToDelete({category, item});
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      const {category, item} = itemToDelete;

      await deleteDish(category, item);

      setMenuItems(prevMenuItems => {
        const updatedMenu = {...prevMenuItems};
        delete updatedMenu[category][item];

        if (Object.keys(updatedMenu[category]).length === 0) {
          delete updatedMenu[category];
        }
        return updatedMenu;
      });

      await AsyncStorage.setItem('menu', JSON.stringify(menuItems));

      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getFilteredItems = () => {
    if (!searchQuery) return menuItems;

    const result: MenuItems = {};

    Object.keys(menuItems).forEach(category => {
      const filteredItems: Record<string, MenuItem> = {};

      Object.keys(menuItems[category]).forEach(dishKey => {
        const dish = menuItems[category][dishKey];
        if (dish.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          filteredItems[dishKey] = dish;
        }
      });

      // Only add the category if it has matching items
      if (Object.keys(filteredItems).length > 0) {
        result[category] = filteredItems;
      }
    });

    return result;
  };

  const filteredMenuItems = searchQuery ? getFilteredItems() : menuItems;

  const isAnyModalVisible = deleteModalVisible || addCategoryModalVisible;

  const toggleAvailability = async (category: string, name: string) => {
    const tempMenu = {...menuItems};
    setAvailability(category, name, !menuItems[category][name].status);
    console.log('--------------');
    tempMenu[category][name].status = !menuItems[category][name].status;
    setMenuItems(tempMenu);
    await AsyncStorage.setItem('menu', JSON.stringify(menuItems));
    ReactNativeHapticFeedback.trigger('impactLight', {
      enableVibrateFallback: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {isAnyModalVisible ? (
        <StatusBar
          backgroundColor="rgba(109, 117, 136, 0.6)"
          barStyle="dark-content"
        />
      ) : (
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      )}
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcome}>Hi, {user.name}! 👋</Text>
        </View>

        {/* Titles */}
        <Text style={styles.title}>Find your best food</Text>
        <Text style={styles.subtitle}>Order & Eat. 😎</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" style={{marginLeft: 10}} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your food"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <Icon
              name="x"
              onPress={() => setSearchQuery('')}
              size={20}
              color="#999"
              style={{marginRight: 10}}
            />
          )}
        </View>

        <View style={styles.categoriesContainer}>
          {Object.keys(filteredMenuItems).map(category => (
            <View key={category} style={styles.categorySection}>
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category)}>
                <View style={styles.categoryTitleContainer}>
                  {/* <Text style={styles.categoryIcon}>
                    {icons[category as keyof typeof icons] || '📋'}
                  </Text> */}
                  <Text style={styles.categoryTitle}>{category}</Text>
                </View>
                <View style={styles.categoryHeaderRight}>
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
                    size={24}
                    color="#0F172A"
                    style={{marginLeft: 10}}
                  />
                </View>
              </TouchableOpacity>

              {expandedCategories[category] && (
                <View style={styles.itemsContainer}>
                  {Object.keys(filteredMenuItems[category]).map(item => (
                    <Animatable.View
                      key={item}
                      animation="fadeIn"
                      duration={400}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.card}
                        onLongPress={() => handleLongPress(category, item)}
                        delayLongPress={300}>
                        <View style={{flex: 1}}>
                          <Text style={styles.foodName}>
                            {filteredMenuItems[category][item].name}
                          </Text>
                          <Text style={styles.foodPrice}>
                            ₹{filteredMenuItems[category][item].price}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.availabilityButton,
                            {
                              backgroundColor: filteredMenuItems[category][item]
                                .status
                                ? '#D1FAE5'
                                : '#FEE2E2',
                            },
                          ]}
                          onPress={() => {
                            toggleAvailability(category, item);
                          }}>
                          <Text
                            style={{
                              color: filteredMenuItems[category][item].status
                                ? '#047857'
                                : '#DC2626',
                              fontWeight: '600',
                            }}>
                            {filteredMenuItems[category][item].status
                              ? 'Available'
                              : 'Sold Out'}
                          </Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </Animatable.View>
                  ))}
                </View>
              )}
            </View>
          ))}
          <View style={styles.categorySection}>
            <TouchableOpacity activeOpacity={0.5} style={styles.categoryHeader}>
              <View style={styles.categoryTitleContainer}>
                <Text style={styles.categoryTitle}>Add New Dish Category</Text>
              </View>
              <View style={styles.categoryHeaderRight}>
                <TouchableOpacity
                  style={styles.addDishSmallButton}
                  onPress={() => handleAddDish(null)}>
                  <Icon name="plus-circle" size={20} color="#0F766E" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Dialog
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Delete Item</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>
              Are you sure you want to delete{' '}
              <Text style={{fontWeight: '700'}}>{itemToDelete?.item}</Text>?
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              mode="text"
              textColor="#64748B"
              onPress={() => setDeleteModalVisible(false)}>
              Cancel
            </Button>
            <Button
              mode="text"
              buttonColor="#EF4444"
              textColor="#fff"
              onPress={handleDeleteConfirm}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Add Category Dialog */}
      <Portal>
        <Dialog
          visible={addCategoryModalVisible}
          onDismiss={() => setAddCategoryModalVisible(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>
            Add New Category
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogLabel}>Category Name</Text>
            <TextInput
              style={[
                styles.dialogInput,
                categoryError ? styles.dialogInputError : null,
              ]}
              value={newCategoryName}
              onChangeText={text => {
                setNewCategoryName(text);
                setCategoryError('');
              }}
              placeholder="Enter category name"
              autoFocus
            />
            {categoryError ? (
              <Text style={styles.errorText}>{categoryError}</Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              mode="text"
              textColor="#64748B"
              onPress={() => {
                setAddCategoryModalVisible(false);
                setCategoryError('');
              }}>
              Cancel
            </Button>
            <Button
              mode="text"
              buttonColor="#0F766E"
              textColor="#fff"
              disabled={!newCategoryName.trim()}
              // onPress={handleAddCategoryConfirm}
            >
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Blurred Background when Modal is Active */}
      {isAnyModalVisible && (
        <Animatable.View
          animation="fadeIn"
          duration={200}
          style={styles.blurOverlay}
        />
      )}
    </SafeAreaView>
  );
};

export default MenuScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  welcome: {fontSize: 18, fontWeight: '600', color: '#1E293B'},
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginHorizontal: 20,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    marginHorizontal: 20,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    margin: 20,
    borderRadius: 14,
    height: 50,
  },
  searchInput: {flex: 1, fontSize: 16, marginHorizontal: 10, color: '#0F172A'},
  categoriesContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingBottom: 60,
  },
  categorySection: {
    marginBottom: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E2E8F0',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addDishSmallButton: {
    backgroundColor: '#CBD5E1',
    padding: 8,
    borderRadius: 24,
  },
  itemsContainer: {
    padding: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  foodIcon: {fontSize: 28, marginRight: 16},
  foodName: {fontSize: 16, fontWeight: '600', color: '#0F172A'},
  foodPrice: {color: '#64748B', marginTop: 4},
  availabilityButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginLeft: 8,
  },
  addCategoryButton: {
    backgroundColor: '#0F766E',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 90,
    right: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  // Dialog styles for both delete and add category
  dialog: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  dialogContent: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  dialogLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  dialogInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  dialogInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 6,
  },
  dialogActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    zIndex: 1,
  },
});
