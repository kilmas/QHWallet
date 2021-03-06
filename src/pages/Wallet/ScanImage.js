import React from 'react'
import { RNCamera } from 'react-native-camera'
import { inject, observer } from 'mobx-react'
import { Toast } from '@ant-design/react-native'
import BarcodeMask from 'react-native-barcode-mask'
import Container from '../../components/Container'
import TitleBar from '../../components/TitleBar'

@inject('store')
@observer
class ScanImage extends React.Component {

  render() {
    return (
      <Container>
        <RNCamera
          style={{
            width: '100%',
            height: '100%',
          }}
          flashMode={RNCamera.Constants.FlashMode.auto}
          autoFocus={RNCamera.Constants.AutoFocus.on}
          onBarCodeRead={code => {
            Toast.info(code.data, 1);
            this.props.navigation.goBack();
            this.props.navigation.state.params.onSave(code.data);
          }}>
          <BarcodeMask
            width={250}
            height={250}
            edgeColor={'#007CFF'}
            showAnimatedLine={true}
          />
          <TitleBar title="Scan"/>
        </RNCamera>
      </Container>
    )
  }
}

export default ScanImage
