import { StyleSheet } from "react-native";

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

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  qrIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    marginLeft: 16,
  },

  // QR Modal Styles
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  qrModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },

  qrCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },

  qrModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },

  qrModalSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },

  qrCodeContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },

  qrUrlText: {
    fontSize: 14,
    // color: '#64748B',
    color: '#0F766E',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});

export default styles