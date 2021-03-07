import NetInfo from '@react-native-community/netinfo';
import { Toast } from 'native-base'
import { setTokens, getToken, deleteTokens } from '../tokenHelper'

import { keys } from '../../keys'

let ENV = keys['environment'],
  ROOM_CORE_URL = keys['ROOM_CORE_URL'][ENV] + '/app'

const NUM_OF_RETRIES = 0

export async function network(url, method, body = {}, token = null, n = NUM_OF_RETRIES) {
  
  let netState = await NetInfo.fetch()

  if (netState.isConnected == false) {
    Toast.show({ text: "You're offline - please go online.", duration: 3000 })
    n = -1
    return
  }

  let options = {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json', // todo
      'token': token
    },
    body: body
  }


  if (n < 0) {
    Toast.show({ text: "There was a problem - please try again.", duration: 3000 })
    return
  }

  try {
    console.log('==============================================')
    console.log('im going to hit ' + url)

    let rawResponse = await fetch(ROOM_CORE_URL + url, options)
    //console.log(rawResponse.text())

    //console.log(rawResponse)

    let status = rawResponse.status

    let response = await rawResponse.json()
    
    response['status'] = status

    if (status == 200 || status == 201 || status == 202) { // SUCCESFUL

      return response

    }

    else if (status == 401) { // UNAUTHORISED

      if (response['content']['auth_status'] == 'unauthorised') {
        await deleteTokens()
        return response

      }
      else if (response['content'] == 'invalid-refresh-token') {
        await deleteTokens()
        return response

      }
      else if (response['content'] == 'invalid-magic-token' || response['content'] == 'invalid-auth-token') {

        Toast.show({ text: "Something went wrong with your login, so please try again." })

        return "IT WAS INVALID"
      }
      else if (response['content'] == 'invalid-access-token') {

        let tokens = await refreshAllTokens()
        let access_token = tokens['access_token']

        return await network(url, method, body, access_token, n - 1) 
        // !! TODO_BUG_LEVEL_1 fix some infinite fetch loop that happens here

      }
    }

    else if (status == 400 || status == 404) {
      // case where app made a bad request to the core
      Toast.show({ text: "There was a problem - please try again.", duration: 3000 })
      console.log(response)

    }

    else if (status == 501) {
      // databaser error on server side
      let responseContent = response['content']

      switch (responseContent) {
        case "email-send-failure":
          Toast.show({ text: "Your magic email was not sent - please try again.", duration: 3000 })
          break
        case "find-user-error":
        case "server-error":
        case "databaser-server-error":
        case "no-merchants":
        case "plaid-error":
        case "no-such-payment-link-error":
        case "no-such-user":
          await deleteTokens()
      }

    }

    return response

  } catch (e) {
    console.log(e)
    
    if ((e.message === 'Timeout' || e.message === 'Network request failed') && (n >= 0)) {
      // then retry
      console.log("The network request failed or timed out.")
      return network(url, method, body, options, n - 1)

    } else {
      //Toast.show({text: "There was a network problem, so please try again"}) caught by NetInfo now
      throw e
    }
  }
}

async function refreshAllTokens() {

  const refresh_token = await getToken("refresh")

  let response = await network('/user/tokens', 'GET', null, refresh_token)

  let tokens = response['content']

  await setTokens(response['content'])

  return tokens
}