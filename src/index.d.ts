interface MenuItem {
  name?: string;
  price?: number;
  status?: boolean;
}

interface Menu {
  name?: MenuItem;
}

interface ProfileInformation {
  name: string;
  phoneNumber: string | null;
  address: string | null;
  description: string | null;
}

interface LinkedUsers {
  [email]: {
    name: string;
    email: string;
  };
}

interface linkedUser {
  name: string;
  email: string;
}

interface User {
  name: string;
  email: string;
  photo: URL;
}

interface Data {
  info: ProfileInformation;
  menu: Menu;
  linkedUsers: LinkedUsers;
}

interface Error {
  message: string;
}

interface Stats {
  totalItems?: number;
  availableItems?: number;
  soldOutItems?: number;
}

// Component for displaying contact information items
interface ContactItemProps {
  icon: string;
  title: string;
  value: string;
  placeholder: string;
  isDescription?: boolean;
}

interface DeleteAccountValues {
  email: string;
  restaurantUrl: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'model';
}

interface TempLinkedUser {
  name: string;
  isOriginal: boolean;
  email: string;
}