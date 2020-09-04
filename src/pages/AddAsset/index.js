import React from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Tabs } from '@ant-design/react-native';
import { colors, fontStyles } from '../../styles/common';
import AddCustomToken from '../../components/UI/AddCustomToken';
import SearchTokenAutocomplete from '../../components/UI/SearchTokenAutocomplete';
import { strings } from '../../locales/i18n';
import AddCustomCollectible from '../../components/UI/AddCustomCollectible';
import TitleBar from '../../components/TitleBar';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white
  },
  tabUnderlineStyle: {
    height: 2,
    backgroundColor: colors.blue
  },
  tabStyle: {
    paddingBottom: 0
  },
  textStyle: {
    fontSize: 16,
    letterSpacing: 0.5,
    ...fontStyles.bold
  }
});

/**
 * PureComponent that provides ability to add assets.
 */
export default class AddAsset extends React.Component {

  state = {
    address: '',
    symbol: '',
    decimals: ''
  };

  static propTypes = {
		/**
		/* navigation object required to push new views
		*/
    navigation: PropTypes.object
  };

  render() {
    const {
      navigation: {
        state: {
          params: { assetType, collectibleContract }
        }
      },
      navigation
    } = this.props;
    return (
      <SafeAreaView style={styles.wrapper}>
        <TitleBar title={strings('add_asset.title')} />
        {assetType === 'token' ? (
          <Tabs tabs={[
            { title: strings('add_asset.search_token') },
            { title: strings('add_asset.custom_token') },
          ]}>
            <SearchTokenAutocomplete
              navigation={navigation}
              tabLabel={strings('add_asset.search_token')}
              testID={'tab-search-token'}
            />
            <AddCustomToken
              navigation={navigation}
              tabLabel={strings('add_asset.custom_token')}
              testID={'tab-add-custom-token'}
            />
          </Tabs>
        ) : (
            <AddCustomCollectible
              navigation={navigation}
              collectibleContract={collectibleContract}
              testID={'add-custom-collectible'}
            />
          )}
      </SafeAreaView>
    );
  };
}
