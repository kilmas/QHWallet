import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { View, Text, StyleSheet } from 'react-native';
import Coachmark from '../Coachmark';
import Device from '../../../../utils/devices';
import onboardingStyles from './../styles';
import { strings } from '../../../../locales/i18n';

const styles = StyleSheet.create({
  main: {
    flex: 1
  },
  coachmark: {
    marginHorizontal: 16
  },
  coachmarkContainer: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Device.isIphoneX() ? 36 : Device.isIos() ? 16 : 36
  }
});

class Step1 extends React.Component {
  static propTypes = {
		/**
		 * Callback called when closing step
		 */
    onClose: PropTypes.func,
		/**
		 * Dispatch set onboarding wizard step
		 */
    setOnboardingWizardStep: PropTypes.func
  };

	/**
	 * Dispatches 'setOnboardingWizardStep' with next step
	 */
  onNext = () => {
    const { setOnboardingWizardStep } = this.props;
    setOnboardingWizardStep && setOnboardingWizardStep(2);
  };

	/**
	 * Calls props 'onClose'
	 */
  onClose = () => {
    const { onClose } = this.props;
    onClose && onClose(false);
  };

	/**
	 * Returns content for this step
	 */
  content = () => (
    <View style={onboardingStyles.contentContainer}>
      <Text style={onboardingStyles.content}>{strings('onboarding_wizard.step1.content1')}</Text>
      <Text style={onboardingStyles.content}>{strings('onboarding_wizard.step1.content2')}</Text>
    </View>
  );

  render() {
    return (
      <View style={styles.main} testID={'onboarding-wizard-step1-view'}>
        <View style={styles.coachmarkContainer}>
          <Coachmark
            title={strings('onboarding_wizard.step1.title')}
            content={this.content()}
            onNext={this.onNext}
            onBack={this.onClose}
            coachmarkStyle={styles.coachmark}
            action
          />
        </View>
      </View>
    );
  }
}

export default inject(({ store: state }) => ({
  setOnboardingWizardStep: step => state.wizard.setOnboardingWizardStep(step)
}))(observer(Step1))

