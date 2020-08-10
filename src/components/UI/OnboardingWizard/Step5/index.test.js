import React from 'react'
import { shallow } from 'enzyme'
import Step5 from './'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'mobx-react'

const mockStore = configureMockStore()
const store = mockStore({})

describe('Step5', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <Step5 />
      </Provider>
    )
    expect(wrapper).toMatchSnapshot()
  })
})
