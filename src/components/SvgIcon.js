import React from 'react';
import PropTypes from 'prop-types';
import { SvgXml } from 'react-native-svg';
import svgs from '../svgs/svgs';

export default
class SvgIcon extends React.Component {
  static propTypes = {
    icon: PropTypes.string.isRequired,
    size: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    style: PropTypes.object,
  }

  static defaultProps = {
    style: {},
    size: null,
    width: 0,
    height: 0,
  }

  render() {
    const svgXmlData = svgs[this.props.icon];

    if (!svgXmlData) {
      const errMsg = `Miss "${this.props.icon}" svg file`;
      throw new Error(errMsg);
    }

    return (
      <SvgXml
        width={this.props.size ? this.props.size : this.props.width}
        height={this.props.size ? this.props.size : this.props.height}
        xml={svgXmlData}
        style={this.props.style}
      />
    );
  }
}