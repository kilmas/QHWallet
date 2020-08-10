import React from 'react'
import { shallow } from 'enzyme'
import Step4 from './'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'mobx-react'

const mockStore = configureMockStore()
const store = mockStore({})

describe('Step4', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <Step4 />
      </Provider>
    )
    expect(wrapper).toMatchSnapshot()
  })
})
