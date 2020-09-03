import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createDrawerNavigator } from 'react-navigation-drawer';
import React from 'react';
import CardStackStyleInterpolator from 'react-navigation-stack/src/views/StackView/StackViewStyleInterpolator';
import Splash from './pages/Splash/Splash';
import CreateImportWallet from './pages/CreateImport/CreateImportWallet';
import PrivacyPolicies from './pages/CreateImport/PrivacyPolicies';
import NameWallet from './pages/CreateImport/NameWallet';
import CreateWalletSuccess from './pages/CreateImport/CreateWalletSuccess';
import BackupWallet from './pages/CreateImport/BackupWallet';
import BackupWalletVerify from './pages/CreateImport/BackupWalletVerify';
import ImportMethod from './pages/CreateImport/ImportMethod';
import InputPhrases from './pages/CreateImport/InputPhrases';
import SelectTypes from './pages/CreateImport/SelectTypes';
import InputPrivateKey from './pages/CreateImport/InputPrivateKey';
import Wallet from './pages/Wallet/Wallet';
import SendCoin from './pages/Wallet/SendCoin';
import Receive from './pages/Wallet/Receive';
import History from './pages/Wallet/History';
import WalletManagement from './pages/Wallet/WalletManagement';
import AddWallet from './pages/Wallet/AddWallet';
import WalletSetting from './pages/Wallet/WalletSetting';
import ChangeWalletName from './pages/Wallet/ChangeWalletName';
import CreateNameWallet from './pages/Wallet/CreateNameWallet';
import DeleteWallet from './pages/Wallet/DeleteWallet';
import Settings from './pages/Settings/Settings';
import Language from './pages/Settings/Language';
import Currency from './pages/Settings/Currency';
import Contacts from './pages/Settings/Contacts';
import AddContacts from './pages/Settings/AddContacts';
import AboutUs from './pages/Settings/AboutUs';
import Security from './pages/Settings/Security';
import Drawer from './components/Drawer';
import Welcome from './pages/Splash/Welcome';
import Defi from './pages/Defi/Defi';
import Browser from './pages/Browser';
import Approve from './pages/ApproveView/Approve'
import Approval from './pages/Approval'
import AddAsset from './pages/AddAsset'
import Asset from './pages/Asset'
import Confirm from './pages/SendFlow/Confirm'
import Amount from './pages/SendFlow/Amount'
import SendTo from './pages/SendFlow/SendTo'
import VoteList from './pages/Wallet/VoteList'
import AddBookmark from './pages/AddBookmark'

let RouterContainer

const routerFun = (initialRouteName) => {
  if (!initialRouteName) return null
  if (initialRouteName === 'DApp') {
    initialRouteName = 'Browser'
  }
  if (RouterContainer) return RouterContainer;
  const Tab = createBottomTabNavigator(
    {
      Wallet,
      Defi,
      Browser: createStackNavigator({
        DApp: {
          screen: Browser,
          navigationOptions: {
            gesturesEnabled: false
          }
        }
      }, {
        headerMode: 'none',
      }),
      // DApp: Browser,
    },
    {
      initialRouteName,
      lazy: true,
      swipeEnabled: false,
      defaultNavigationOptions: () => ({
        tabBarVisible: false
      }),
    },
  );
  
  const TabDrawer = createDrawerNavigator(
    {
      
      Tab,
    },
    {
      // Drawer
      drawerLockMode: 'unlocked', // 设置是否响应手势
      drawerPosition: 'left',
      useNativeAnimations: true,
      drawerType: 'font',
      drawerWidth: 289,
      overlayColor: 'rgba(0,0,0,0.2)',
      contentComponent: props => <Drawer />,
    },
  );
  
  const RootNavigate = createStackNavigator(
    {
      TabDrawer,
      ApprovalView: Approval,
      ApproveView: Approve,
      Splash,
      Welcome,
  
      // Wallet
      AddWallet, 
      WalletSetting, 
      WalletManagement, 
      CreateNameWallet,
      ChangeWalletName,
      DeleteWallet,
      SendCoin,
      Receive,
      History,
      // CreateImport
      CreateImportWallet,
      PrivacyPolicies,
      NameWallet,
      CreateWalletSuccess: {
        screen: CreateWalletSuccess,
        navigationOptions: {
          gesturesEnabled: false,
        },
      },
      BackupWallet, 
      BackupWalletVerify, 
      ImportMethod,
      InputPhrases,
      SelectTypes,
      InputPrivateKey, 
  
      // Settings
      Settings,
      Language,
      Currency, 
      Contacts,
      AddContacts, 
      AboutUs,
      Security,
      AddAsset,
      Asset,
      SendFlowView: {
        screen: createStackNavigator({
          SendTo: {
            screen: SendTo
          },
          Amount: {
            screen: Amount
          },
          Confirm: {
            screen: Confirm
          }
        }, {
          headerMode: 'none',
        })
      },
      VoteList,
      AddBookmarkView: {
        screen: createStackNavigator({
          AddBookmark: {
            screen: AddBookmark
          }
        }, {
          headerMode: 'none',
        })
      },
    },
    {
      headerMode: 'none',
      initialRouteName: 'Splash',
      initialRouteParams: {},
      mode: 'card',
      transitionConfig: () => ({
        // 只要修改最后的forVertical就可以实现不同的动画了。
        screenInterpolator: CardStackStyleInterpolator.forHorizontal,
      }),
    },
  );
  RouterContainer = createAppContainer(RootNavigate);
  return RouterContainer;
}

export default routerFun;
