import { action, observable } from 'mobx'
import { persist, create } from 'mobx-persist'
import AsyncStorage from '@react-native-community/async-storage';

export default class Bookmarks {

  @persist('list') @observable bookmarks = [];

  @action
  addBookmark = bookmarks => {
    this.bookmarks.push(bookmarks);
  };

  @action
  removeBookmark = bookmark => {
    this.bookmarks = this.bookmarks.filter(item => item.url !== bookmark.url);
  };
}
