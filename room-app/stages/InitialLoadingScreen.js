import React from 'react';
import { StyleSheet, Image, Platform, Alert } from 'react-native';
import { Container, Content } from 'native-base'
//import Spinner from 'react-native-loading-spinner-overlay';

import * as Linking from 'expo-linking'

import { NavigationEvents } from 'react-navigation';

import { sendAuthToken, fetchUserInfo, sendMagicToken } from '../helpers/networkers/networker'
import { deleteTokens, setTokens, getToken } from '../helpers/tokenHelper'
import { registerForPushNotificationsAsync } from '../helpers/permissionsHelpers'

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: '#000'
  },
  icon: {
    flex: 1,
    flexDirection: 'column',
    top: 400,
    justifyContent: 'center',
    alignItems: 'center',
  }
})

export default class InitialLoadingScreen extends React.Component {

  /*
    This screen decides whether the user is authorised 
    (by checking the tokens stored in memory against the server),
    and if so, decides to what extent the user is authorised. Either: 
    partial | complete | unauthorised
  */

  constructor(props) {

    super(props)
    this.state = {
      spinning: false
    }
  }

  _handleMagicLink = async (event) => {

    let url = event.url
    let { path, queryParams } = Linking.parse(url)
    console.log(`Linked to app with path: ${path} and data: ${JSON.stringify(queryParams)}`)

    /*
    if (path != '--/magic') {
      console.log('Caught a linking that wasnt the magic type')
      return
    } */

    let magic_token = queryParams['magic_token']

    let authToken = await sendMagicToken(magic_token)

    await this._authoriseUser(await authToken)
    // something to do with this ?

    //setTimeout(async () => { await this._authoriseUser() }, 1000) // TODO_v3 change to actual async/await
    // TODO_v3 show refreshing

  }

  componentDidMount() {

    Linking.addEventListener('url', this._handleMagicLink)

  }

  static navigationOptions = { headerShown: false }

  _authoriseUser = async (authToken = null) => {

    //await deleteTokens()

    let authStatus = await sendAuthToken(authToken)
    
    if (authStatus == "completely-authorised") {

      //await registerForPushNotificationsAsync()

      Linking.removeEventListener('url', this._handleMagicLink)

      this.props.navigation.navigate('App')
    }
    else if (authStatus == "partially-authorised") {

      Linking.removeEventListener('url', this._handleMagicLink)

      this.props.navigation.navigate('SetUp')

    }
    else if (authStatus == "unauthorised") {

      //Linking.removeEventListener('url', this._handleMagicLink)

      this.props.navigation.navigate('Auth')
    }
  }

  render() {
    return (

      <Container style={styles.container}>
        <NavigationEvents onWillFocus={() => this._authoriseUser(null)} />

        <Content contentContainerStyle={{ backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
          <Image style={{ width: 350, height: 350, }} source={require('../assets/icon.png')} />

        </Content>
      </Container>
    )
  }
}