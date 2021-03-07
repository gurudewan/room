import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { LogBox, StyleSheet, Text, View } from 'react-native';
import { Root } from "native-base";
import { Provider as StateProvider } from 'react-redux'
import store from './helpers/redux/store'
import { connect } from 'react-redux'

import * as Font from 'expo-font';

import { AppLoading } from "expo";
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import Spinner from 'react-native-loading-spinner-overlay';

//-----------------------------------------IMPORT SCREENS-----------------------------------------//

import InitialLoadingScreen from './stages/InitialLoadingScreen'

import LogInSignUpScreen from './stages/Auth/LogInSignUpScreen'
import EnterEmailAddressScreen from './stages/Auth/EnterEmailAddressScreen'
import AwaitingEmailScreen from './stages/Auth/AwaitingEmailScreen'

import IntroScreen from './stages/SetUp/IntroScreen'
import EnterBioDataScreen from './stages/SetUp/EnterBioDataScreen'
import MakeProfileScreen from './stages/SetUp/MakeProfileScreen'


import TheRoomScreen from './stages/App/TheRoomScreen'
import EnterRoomScreen from './stages/App/EnterRoomScreen'
import AccountScreen from './stages/App/AccountScreen'
import TutorialScreen from './stages/App/TutorialScreen'

//-----------------------------------------APP + AUTH NAVS-----------------------------------------//

//LogBox.ignoreAllLogs()

const AuthNavigator = createStackNavigator({
  LogInSignUp: LogInSignUpScreen,
  EnterEmailAddress: EnterEmailAddressScreen,
  AwaitingEmail: AwaitingEmailScreen,
})


const SetUpNavigator = createStackNavigator({
  Intro: IntroScreen,
  EnterBioData: EnterBioDataScreen,
  MakeProfile: MakeProfileScreen
},
  {
    headerMode: 'none'
  }
)

const AppNavigator = createStackNavigator({
  
  EnterRoom: EnterRoomScreen,
  TheRoom: TheRoomScreen,
  Account: AccountScreen,
  MakeProfile: MakeProfileScreen,
  Tutorial: TutorialScreen

  
},
  {
    headerMode: 'none'
  }
)

//-----------------------------------------MASTER NAV-----------------------------------------//

// the highest level of Navigation

const MasterNavigator = createSwitchNavigator(
  {
    InitialLoading: InitialLoadingScreen,
    App: AppNavigator,
    Auth: AuthNavigator,
    SetUp: SetUpNavigator
  },
  {
    initialRouteName: 'InitialLoading',
  }
)

//-----------------------------------------CREATE + EXPORT-----------------------------------------//

const MasterApp = createAppContainer(MasterNavigator)


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  async componentDidMount() {

    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });
    this.setState({ loading: false });
  }


  render() {

    if (this.state.loading) {
      return (
        <StateProvider store={store}>
          <Root>
            <AppLoading />
          </Root>
        </StateProvider>

      );
    }
    else {
      return (
        <StateProvider store={store}>
          <Root>
            <Spinner
              visible={false}
              textContent={''}
            />
            <MasterApp />
          </Root>
        </StateProvider>
      );
    }

  }
}