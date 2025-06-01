import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 12,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitleContainer: {
    marginBottom: 12,
  },
  categoryNameInput: {
    backgroundColor: '#FFFFFF',
    height: 48,
    fontSize: 18,
    fontWeight: '600',
  },
  categoryInputOutline: {
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#F1F5F9',
  },
  dishItem: {
    marginBottom: 12,
  },
  dishInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dishNameInput: {
    flex: 7,
    backgroundColor: '#FFFFFF',
    height: 50,
    marginRight: 8,
  },
  dishPriceInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 50,
    minWidth: 90,
  },
  inputOutline: {
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteButton: {
    padding: 12,
    marginLeft: 8,
  },
  errorText: {
    color: '#DC2626',
    paddingLeft: 0,
    fontSize: 14,
  },
  divider: {
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: '#E2E8F0',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  policyText: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 14,
    flexShrink: 1,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitButton: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
