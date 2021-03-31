import React, { Component, createRef } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import axios from "axios";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.page = 1;
    this.flatListRef = createRef();
    this.state = {
      loading: false, // user list uploading
      isRefreshing: false, // for pull to refresh
      data: [],
      error: '',
      showScrollTopBtn: false,
    };
  }

  fetchUser = (page) => {
    // stackexchange User API url
    const url = `https://api.stackexchange.com/2.2/users?page=${page}&order=desc&sort=reputation&site=stackoverflow`;
    this.setState({ loading: true });
    axios.get(url)
      .then((response) => {
        let listData = this.state.data;
        let data = listData.concat(response.data.items);
        this.setState({
          loading: false,
          data,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          error: 'Something just went wrong!',
        });
      });
  };

  onRefresh = () => {
    this.setState({ isRefreshing: true }); // true isRefreshing flag for enable pull to refresh indicator
    const url = 'https://api.stackexchange.com/2.2/users?page=1&order=desc&sort=reputation&site=stackoverflow';
    axios.get(url)
      .then((response) => {
        let data = response.data.items;
        this.setState({
          isRefreshing: false,
          data,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          error: 'Something just went wrong!',
        });
      });
  };

  renderSeparator = () => (
    <View
      style={{
        height: 2,
        width: '100%',
        backgroundColor: '#CED0CE'
      }}
    />
  );

  renderFooter = () => {
    if (!this.state.loading) return null;
    return <ActivityIndicator style={{ color: '#000' }} />
  };

  handleLoadMore = () => {
    if (!this.state.loading) {
      this.page = this.page + 1; // increase page by 1
      this.fetchUser(this.page); // method for API call
    }
  };

  scrollToTop = () => {
    this.flatListRef.scrollToOffset({ animated: true, offset: 0 })
  };

  componentDidMount() {
    this.fetchUser(this.page);
  }

  render() {
    const { loading, page, data, isRefreshing, showScrollTopBtn } = this.state;

    if (loading && page === 1) {
      return (
        <SafeAreaView
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <ActivityIndicator style={{ color: '#000' }} />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <FlatList
          ref={(ref) => { this.flatListRef = ref; }}
          data={data}
          onScroll={(event) => {
            if (!showScrollTopBtn && event.nativeEvent.contentOffset.y > 200) {
              this.setState({
                showScrollTopBtn: true,
              });
            }
            else if (event.nativeEvent.contentOffset.y < 200 && showScrollTopBtn) {
              this.setState({
                showScrollTopBtn: false,
              });
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={this.onRefresh}
            />
          }
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                padding: 15,
                alignItems: 'center',
              }}
            >
              <Image
                source={{ uri: item.profile_image }}
                style={{
                  height: 50,
                  width: 50,
                  marginRight: 10,
                }}
              />
              <Text
                style={{
                  fontSize: 18,
                  alignItems: 'center',
                  color: '#65A7C5',
                }}
              >
                {item.display_name}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={this.renderSeparator}
          ListFooterComponent={this.renderFooter}
          onEndReachedThreshold={0.4}
          onEndReached={this.handleLoadMore} // when it is far from the end with 0.4, call handleLoadMore()
        />
        {
          showScrollTopBtn ?
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                backgroundColor: '#EFDE76',
                padding: 20,
                borderRadius: 10,
              }}
              onPress={this.scrollToTop}
            >
              <Text>Scroll to Top</Text>
            </TouchableOpacity>
          : null
        }
      </SafeAreaView>
    );
  }
}
