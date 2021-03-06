import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import FadeIn from 'react-native-fade-in-image';
import { toDataUrl } from '../../../utils/blockies.js';
import { colors } from '../../../styles/common.js';

/**
 * UI component that renders an Identicon
 * for now it's just a blockie
 * but we could add more types in the future
 */
// eslint-disable-next-line react/display-name
const Identicon = React.memo(props => {
  const { diameter, address, customStyle, noFadeIn } = props;
  if (!address) return null;
  const uri = toDataUrl(address);

  const image = (
    <Image
      source={{ uri }}
      style={[
        {
          height: diameter,
          width: diameter,
          borderRadius: diameter / 2
        },
        customStyle
      ]}
    />
  );

  if (noFadeIn) {
    return image;
  }
  return <FadeIn placeholderStyle={{ backgroundColor: colors.white }}>{image}</FadeIn>;
});

Identicon.propTypes = {
	/**
	 * Diameter that represents the size of the identicon
	 */
  diameter: PropTypes.number,
	/**
	 * Address used to render a specific identicon
	 */
  address: PropTypes.string,
	/**
	 * Custom style to apply to image
	 */
  customStyle: PropTypes.object,
	/**
	 * True if render is happening without fade in
	 */
  noFadeIn: PropTypes.bool
};

Identicon.defaultProps = {
  diameter: 46
};

export default Identicon;
