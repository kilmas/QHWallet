import { action, observable } from 'mobx';
import { persist } from 'mobx-persist'

export default class Wizard {

  @persist @observable step = 0;

  @action
  setOnboardingWizardStep = step => {
    this.step = step;
  };
}