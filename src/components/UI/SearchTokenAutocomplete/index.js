import React, { PureComponent } from 'react';
import { View, StyleSheet, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';
import ActionView from '../ActionView';
import AssetSearch from '../AssetSearch';
import AssetList from '../AssetList';
import { strings } from '../../../locales/i18n';
import Engine from '../../../modules/metamask/core/Engine';
import { colors } from '../../../styles/common';

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    flex: 1
  }
});

/**
 * PureComponent that provides ability to add searched assets with metadata.
 */
export default class SearchTokenAutocomplete extends PureComponent {
  state = {
    searchResults: [],
    searchQuery: '',
    selectedAsset: {}
  };

  static propTypes = {
		/**
		/* navigation object required to push new views
		*/
    navigation: PropTypes.object
  };

  cancelAddToken = () => {
    this.props.navigation.goBack();
  };

  handleSearch = opts => {
    this.setState({ searchResults: opts.results, searchQuery: opts.searchQuery });
  };

  handleSelectAsset = asset => {
    this.setState({ selectedAsset: asset });
  };

  addToken = async () => {
    const { AssetsController } = Engine.context;
    const { address, symbol, decimals, image } = this.state.selectedAsset;
    await AssetsController.addToken(address, symbol, decimals, image);
    // Clear state before closing
    this.setState(
      {
        searchResults: [],
        searchQuery: '',
        selectedAsset: {}
      },
      () => {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.goBack();
        });
      }
    );
  };

  render = () => {
    const { searchResults, selectedAsset, searchQuery } = this.state;
    const { address, symbol, decimals } = selectedAsset;

    // add OKB USDK
    let results = []
    if (searchQuery.toUpperCase()  === 'OKB') {
      results = [{ "address": "0x75231f58b43240c9718dd58b4967c5114342a86c", "decimals": 18, "erc20": true, "image": "https://cn.etherscan.com/token/images/okex_28.png", "name": "OK OKB", "symbol": "OKB" }, ...searchResults]
    } else if (searchQuery.toUpperCase() === 'USDK') {
      results = [{ "address": "0x1c48f86ae57291f7686349f12601910bd8d470bb", "decimals": 18, "erc20": true, "image": "https://cn.etherscan.com/token/images/usdk_32.png", "name": "OK USDK", "symbol": "USDK" }, ...searchResults]
    } else {
      results = searchResults
    }

    return (
      <View style={styles.wrapper}>
        <ActionView
          cancelText={strings('add_asset.tokens.cancel_add_token')}
          confirmText={strings('add_asset.tokens.add_token')}
          onCancelPress={this.cancelAddToken}
          onConfirmPress={this.addToken}
          confirmDisabled={!(address && symbol && decimals)}
        >
          <View style={{ flex: 1 }}>
            <AssetSearch onSearch={this.handleSearch} />
            <AssetList
              searchResults={results}
              handleSelectAsset={this.handleSelectAsset}
              selectedAsset={selectedAsset}
              searchQuery={searchQuery}
            />
          </View>
        </ActionView>
      </View>
    );
  };
}
