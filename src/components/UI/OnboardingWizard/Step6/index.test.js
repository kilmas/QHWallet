import React from 'react'
import { shallow } from 'enzyme'
import Step6 from './'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'mobx-react'

const mockStore = configureMockStore()
const store = mockStore({})

describe('Step6', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <Step6 />
      </Provider>
    )
    expect(wrapper).toMatchSnapshot()
  })
})
