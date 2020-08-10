import React, { Component, PureComponent } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import PropTypes from "prop-types";
import { strings } from "../locales/i18n";

class FlatListLoadMoreView extends PureComponent {
  static propTypes = {
    status: PropTypes.oneOf(["empty", "loading", "nomore"]),
    text: PropTypes.string,
  };

  static defaultProps = {
    status: "empty",
    text: `- ${strings("end line")} -`,
  };

  render() {
    if (this.props.status === "empty") {
      return <View />;
    }
    return (
      <View style={[styles.container, this.props.style]}>
        {this.props.status === "loading" ? (
          <ActivityIndicator size="small" color="#000000" />
        ) : (
          <Text style={styles.text}>{this.props.text}</Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 12,
    color: '#333',
  },
});
export default FlatListLoadMoreView;
