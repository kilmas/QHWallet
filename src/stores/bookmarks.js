import { action, observable } from 'mobx'
import { persist } from 'mobx-persist'

export default class Bookmarks {
  @persist('list') @observable bookmarks = []

  @action
  addBookmark = bookmarks => {
    this.bookmarks.push(bookmarks)
  }

  @action
  removeBookmark = bookmark => {
    this.bookmarks = this.bookmarks.filter(item => item.url !== bookmark.url)
  }
}
