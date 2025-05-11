import {createNavigationContainerRef, StackActions} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigate = (name: string, params?: object) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};

export const resetToLogin = () => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  }
};

export function replace(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

export function reset(name: string) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name}],
    });
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function getParent() {
  if (navigationRef.isReady()) {
    return navigationRef.getParent();
  }
  return null;
}


export function hideTabBar() {
  const parent = getParent();
  if (parent) {
    parent.setOptions({
      tabBarStyle: {
        display: 'none',
      },
    });
  }
}

export function showTabBar(parent: { setOptions?: (options: any) => void }) {
  if (parent) {
    parent.setOptions({
      tabBarShowLabel: false,
      headerShown: false,
      tabBarStyle: {
        position: 'absolute',
        bottom: 15,
        left: 20,
        right: 20,
        backgroundColor: '#ffffff',
        borderRadius: 25,
        height: 55,
        paddingBottom: 8,
        paddingTop: 8,
        marginHorizontal: 30,
        shadowColor: '#7F5DF0',
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
      },
    });
  }
}

