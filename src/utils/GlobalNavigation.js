import {NavigationActions, StackActions} from 'react-navigation';
import {DrawerActions} from 'react-navigation-drawer';

let _navigator;
// add other navigation functions that you need and export them

const GlobalNavigation = {
  navigate(routeName, params) {
    if (_navigator) {
      _navigator._navigation.navigate(routeName, params);
    }
  },
  reset(routeName, params) {
    if (_navigator) {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({routeName, params})],
      });
      _navigator._navigation.dispatch(resetAction);
    }
  },
  setTopLevelNavigator(navigatorRef) {
    _navigator = navigatorRef;
  },
  dispatch(option) {
    if (_navigator) {
      _navigator.dispatch(option);
    }
  },
  goBack(key) {
    if (_navigator) {
      const {routes} = _navigator.state.nav;
      const currentPageKey = routes[routes.length - 1].key;
      _navigator._navigation.goBack(key || currentPageKey);
      // _navigator.dispatch(NavigationActions.back())
    }
  },

  toggleDrawer() {
    if (_navigator) {
      _navigator.dispatch(DrawerActions.toggleDrawer());
    }
  },
};

export default GlobalNavigation;
