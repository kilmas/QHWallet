
import React, { Component } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "react-native";
import { observer, inject } from "mobx-react";
import { Flex, Icon } from "@ant-design/react-native";
import { computed } from "mobx";
import { styles as themeStyles } from '../../../theme';
import { strings } from "../../../locales/i18n";
import GlobalNavigation from "../../../utils/GlobalNavigation";
import { string } from "prop-types";

@inject('store')
@observer
class AssetsAction extends Component {
  render() {
    const { accountStore } = this.props.store
    const { onSave, onTransfer,  onReceive, onScan, onCross, onCrossOKT  } = this.props;
    return (
      <Flex justify="around" style={styles.sendView}>
        {[{
          onPress: onReceive,
          img: <Icon name="enter" />,
          text: strings('wallet.receive'),
        }, {
          onPress: onTransfer,
          img: <Icon name="send" />,
          text: strings('wallet.send')
        }, {
          onPress: onScan,
          img: <Icon name="scan" />,
          text: strings('Scan')
        }, , {
          onPress: onCrossOKT,
          img: <Icon name="transaction" />,
          text: strings('Cross OKT')
        }, {
          onPress: onCross,
          img: <Icon name="retweet" />,
          text: strings('Cross FO')
        }].filter(item=>item.onPress).map((item,index) => (<TouchableOpacity style={styles.touchAction} onPress={item.onPress} key={index.toString()}>
          {item.img}
          <Text style={{ ...themeStyles.btnSecondaryText, fontSize: 14 }}>
            {item.text}
          </Text>
        </TouchableOpacity>)
        )}
      </Flex>
    );
  }
}

const styles = StyleSheet.create({
  touchAction: {
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
  },
  sendView: {
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
});


export default AssetsAction;
