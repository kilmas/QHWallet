import React from 'react';
import {
  TouchableOpacity,
} from 'react-native';
import { Badge, Icon } from '@ant-design/react-native';
import GlobalNavigation from '../utils/GlobalNavigation';

const DrawerIcon = (dot) => (
  <TouchableOpacity style={{ paddingHorizontal: 12 }} onPress={() => GlobalNavigation.toggleDrawer()}>
    <Badge dot={dot}>
      <Icon name="align-left" />
    </Badge>
  </TouchableOpacity>
)

export default DrawerIcon;