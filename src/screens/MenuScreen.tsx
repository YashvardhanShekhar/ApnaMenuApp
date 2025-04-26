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

type MenuItem = {
  id: number;
  name: string;
  price: number;
  available: boolean;
};

type MenuItems = {
  [category: string]: MenuItem[];
};

type RouteParams = {
  updatedDish?: {
    id: number;
    category: string;
    name: string;
    price: number;
    available: boolean;
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
      available: boolean;
    },
  ) => void;
};

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
    item: MenuItem;
  } | null>(null);

  // State for add category dialog
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    fetchUser();
  }, []);

  const [menuItems, setMenuItems] = useState<MenuItems>({
    Snacks: [
      {id: 1, name: 'French Fries', price: 149, available: true},
      {id: 2, name: 'Onion Rings', price: 179, available: true},
    ],
    Beverages: [
      {id: 3, name: 'Coke', price: 79, available: true},
      {id: 4, name: 'Lemonade', price: 99, available: true},
    ],
    'Main Course': [
      {id: 5, name: 'Cheeseburger', price: 349, available: true},
      {id: 6, name: 'Chicken Sandwich', price: 299, available: true},
      {
        id: 7,
        name: 'chicken dum murga special pulav biriyani',
        price: 110,
        available: true,
      },
    ],
    Desserts: [
      {id: 8, name: 'Ice Cream', price: 149, available: true},
      {id: 9, name: 'Chocolate Cake', price: 199, available: true},
    ],
  });

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

  useEffect(() => {
    if (route.params?.updatedDish) {
      const {id, category, name, price, available} = route.params.updatedDish;
      setMenuItems(prev => ({
        ...prev,
        [category]: prev[category].map(item =>
          item.id === id ? {...item, name, price, available} : item,
        ),
      }));
    }
  }, [route.params?.updatedDish]);

  const icons = {
    Snacks: '🍟',
    Beverages: '🥤',
    'Main Course': '🍔',
    Desserts: '🍰',
  };

  const handleAddDish = (category: string) => {
    navigation.navigate('AddDish', {
      category,
      isNewDish: true,
      itemId: Date.now(),
      name: '',
      price: 0,
      available: true,
    });
  };

  const handleAddCategory = () => {
    // Show the add category dialog
    setNewCategoryName('');
    setCategoryError('');
    setAddCategoryModalVisible(true);
  };

  const handleAddCategoryConfirm = () => {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      setCategoryError('Category name cannot be empty');
      return;
    }

    // Check if category already exists
    if (Object.keys(menuItems).includes(trimmedName)) {
      setCategoryError('Category already exists');
      return;
    }

    // Add the new category
    const updatedMenuItems = {
      ...menuItems,
      [trimmedName]: [],
    };

    setMenuItems(updatedMenuItems);

    // Set the new category as expanded by default
    setExpandedCategories(prev => ({
      ...prev,
      [trimmedName]: true,
    }));

    // Hide modal
    setAddCategoryModalVisible(false);

    // Show confirmation snackbar with undo
    Snackbar.show({
      text: `${trimmedName} category added successfully`,
      duration: Snackbar.LENGTH_SHORT,
      action: {
        text: 'UNDO',
        textColor: '#0F766E',
        onPress: () => {
          // Remove the category
          const {[trimmedName]: _, ...rest} = updatedMenuItems;
          setMenuItems(rest);

          // Remove from expanded categories
          const {[trimmedName]: __, ...expandedRest} = expandedCategories;
          setExpandedCategories(expandedRest);
        },
      },
    });
  };

  const handleEditItem = (category: string, item: MenuItem) => {
    navigation.navigate('EditDish', {
      category,
      itemId: item.id,
      name: item.name,
      price: item.price,
      available: item.available,
    } as any);
  };

  // Handle long press to delete
  const handleLongPress = (category: string, item: MenuItem) => {
    // Trigger haptic feedback
    ReactNativeHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
    });

    // Set the item to delete and show modal
    setItemToDelete({category, item});
    setDeleteModalVisible(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      const {category, item} = itemToDelete;

      // Remove the item from the category
      setMenuItems(prev => ({
        ...prev,
        [category]: prev[category].filter(i => i.id !== item.id),
      }));

      // Hide modal
      setDeleteModalVisible(false);
      setItemToDelete(null);

      // Show confirmation snackbar
      Snackbar.show({
        text: `${item.name} deleted successfully`,
        duration: Snackbar.LENGTH_SHORT,
        action: {
          text: 'UNDO',
          textColor: '#0F766E',
          onPress: () => {
            // Restore the deleted item
            setMenuItems(prev => ({
              ...prev,
              [category]: [...prev[category], item].sort((a, b) => a.id - b.id),
            }));
          },
        },
      });
    }
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Filter items based on search query across all categories
  const getFilteredItems = () => {
    const result: MenuItems = {};

    Object.entries(menuItems).forEach(([category, items]) => {
      const filteredCategoryItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      if (filteredCategoryItems.length > 0) {
        result[category] = filteredCategoryItems;
      }
    });

    return result;
  };

  const filteredMenuItems = searchQuery ? getFilteredItems() : menuItems;

  // Check if any modal is visible to update status bar
  const isAnyModalVisible = deleteModalVisible || addCategoryModalVisible;

  return (
    <SafeAreaView style={styles.container}>
      {isAnyModalVisible ? (
        <StatusBar
          backgroundColor="rgba(109, 117, 136, 0.6)"
          barStyle="dark-content"
        />
      ) : (
        <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />
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

        {/* Categories with dropdown functionality */}
        <View style={styles.categoriesContainer}>
          {Object.entries(filteredMenuItems).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              {/* Category Header with dropdown toggle */}
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category)}>
                <View style={styles.categoryTitleContainer}>
                  <Text style={styles.categoryIcon}>
                    {icons[category as keyof typeof icons] || '📋'}
                  </Text>
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

              {/* Category Items */}
              {expandedCategories[category] && (
                <View style={styles.itemsContainer}>
                  {items.map(item => (
                    <Animatable.View
                      key={item.id}
                      animation="fadeIn"
                      duration={400}>
                      <TouchableOpacity
                        style={styles.card}
                        onLongPress={() => handleLongPress(category, item)}
                        onPress={() => handleEditItem(category, item)}
                        delayLongPress={300}>
                        <View style={{flex: 1}}>
                          <Text style={styles.foodName}>{item.name}</Text>
                          <Text style={styles.foodPrice}>₹{item.price}</Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.availabilityButton,
                            {
                              backgroundColor: item.available
                                ? '#D1FAE5'
                                : '#FEE2E2',
                            },
                          ]}
                          onPress={() => {
                            setMenuItems(prev => ({
                              ...prev,
                              [category]: prev[category].map(i =>
                                i.id === item.id
                                  ? {...i, available: !i.available}
                                  : i,
                              ),
                            }));
                          }}>
                          <Text
                            style={{
                              color: item.available ? '#047857' : '#DC2626',
                              fontWeight: '600',
                            }}>
                            {item.available ? 'Available' : 'Sold Out'}
                          </Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </Animatable.View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Add Category Button */}
      <TouchableOpacity
        style={styles.addCategoryButton}
        onPress={handleAddCategory}>
        <Icon name="folder-plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Delete Item</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>
              Are you sure you want to delete{' '}
              <Text style={{fontWeight: '700'}}>
                {itemToDelete?.item?.name}
              </Text>
              ?
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
              onPress={handleAddCategoryConfirm}>
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
  container: {flex: 1, backgroundColor: '#f9f9f9'},
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
