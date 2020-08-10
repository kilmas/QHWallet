import React from 'react'
import { shallow } from 'enzyme'
import UrlAutocomplete from './'
import { Provider } from 'mobx-react'
import configureMockStore from 'redux-mock-store'

const mockStore = configureMockStore()
const store = mockStore({})

describe('UrlAutocomplete', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <UrlAutocomplete network={'ropsten'} />
      </Provider>
    )
    expect(wrapper).toMatchSnapshot()
  })
})
