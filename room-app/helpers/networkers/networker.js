import { AsyncStorage, Alert } from 'react-native'

import { Toast } from 'native-base'

import { setTokens, getToken } from '../tokenHelper'

import { network } from './baseNetworker'

// ------------------------------------THE ROOM---------------------------------------------//

export async function enterTheRoom(roomID) {

  const access_token = await getToken("access")

  let body = JSON.stringify({
    room_id: roomID,
  })

  let response = await network('/enter-room', 'POST', body, access_token)

  switch (response['status']) {
    case 200:
      let theRoom = response['content']
      await AsyncStorage.setItem('theRoom', JSON.stringify(theRoom))
      return true
      break
    case 501:
      break
  }

  return false
}

export async function fetchTheRoom(roomID, location) {

  const access_token = await getToken("access")

  let body = JSON.stringify({
    room_id: roomID,
    location: location
  })

  let response = await network('/fetch-the-room', 'POST', body, access_token)

  switch (response['status']) {
    case 200:
      let theRoom = response['content']
      await AsyncStorage.setItem('theRoom', JSON.stringify(theRoom))
      return 're-fetched-room'
    case 205:
      console.log('I was booted from the room')
      return 'booted-from-room'
    case 501:
      break
  }

  return
}

export async function exitTheRoom(roomID) {

  const access_token = await getToken("access")

  let body = JSON.stringify({
    room_id: roomID,
  })

  let response = await network('/exit-room', 'POST', body, access_token)

  switch (response['status']) {
    case 200:
      break
    case 501:
      break
  }

  return
}

export async function fetchNearbyRooms(location) {

  const access_token = await getToken("access")

  let body = JSON.stringify({
    location: location,
  })

  let response = await network('/find-nearby-rooms', 'POST', body, access_token)

  switch (response['status']) {
    case 200:
      let nearbyRooms = response['content']
      await AsyncStorage.setItem('nearbyRooms', JSON.stringify(nearbyRooms))
      break
    case 501:

      break
  }

  return
}

export async function postInteraction(roomID, receiverID, interactionType) {
  // posts a: "hello" or "goodbye" with some member

  const access_token = await getToken("access")

  let body = JSON.stringify({
    room_id: roomID,
    receiver_id: receiverID,
    interaction_type: interactionType
  })

  let response = await network('/interaction', 'POST', body, access_token, 0)

  switch (response['status']) {
    case 200:
      //let theRoom = response['content']
      //await AsyncStorage.setItem('theRoom', JSON.stringify(theRoom))
      return true
    case 501:
      break
  }

  return false
}

export async function reportHuman(receiverID, reportCode, hideHuman) {
  // reports someone

  const access_token = await getToken("access")

  let body = JSON.stringify({
    receiver_id: receiverID,
    report_code: reportCode,
    hide_human: hideHuman
  })

  let response = await network('/report', 'POST', body, access_token, 0)

  switch (response['status']) {
    case 200:
      //let theRoom = response['content']
      //await AsyncStorage.setItem('theRoom', JSON.stringify(theRoom))
      break
    case 501:
      break
  }

  return
}

// ------------------------------------USER INFO---------------------------------------------//

export async function fetchUserInfo() {
  const access_token = await getToken("access")

  let response = await network('/user/my-info', 'GET', null, access_token)

  switch (response['status']) {
    case 200:
      let userInfo = response['content']
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo))
      break
    case 501:
      break
  }

  return

}

export async function postMyProfile(myProfile) {
  const access_token = await getToken("access")

  let body = JSON.stringify(myProfile)
  console.log(body)

  let response = await network('/user/my-profile', 'POST', body, access_token)

  await fetchUserInfo()

  switch (response['status']) {
    case 200:
      let picURL = response['content']
      return true
      break
    case 501:
      Toast.show({ text: "Something went wrong. Please try updating later", duration: 3000 })
      return false
      break
  }
  return false
}

// ------------------------------------EXPO DEVICE TOKEN------------------------------------//

export async function sendDeviceToken(device_token) {

  const access_token = await getToken("access")

  let body = JSON.stringify({ device_token: device_token })

  let response = await network('/user/auth/notifications', 'POST', body, access_token)

  return response['status']

}

// ------------------------------------AUTH---------------------------------------------//

export async function sendEmailAddr(email_addr) {
  // sends the email address to the server
  // server sends the magic link to this email address

  let body = JSON.stringify({ email_addr: email_addr })

  let response = await network('/user/auth/magic-email', 'POST', body)

  return response['status']

}

export async function sendMagicToken(magic_token) {
  // sends the magic token to the server (received in the magic link email)
  // server sends back a (partial | complete) auth token

  let response = await network('/user/auth/magic-token/', 'GET', null, magic_token) // !! THIS LINE IS FAILNIG W NETWORK REQUEST

  await setTokens(await response['content'])

  let authToken = await response['content']['auth_token']
  
  return authToken
}

export async function signUpUser(myProfile) {
  // sends remaining user info to server
  // sends (partial) auth token
  // receives complete auth token

  let partial_auth_token = await getToken("auth")

  let body = JSON.stringify(myProfile)

  console.log('Im sending the profile', body)

  let response = await network('/user/auth/sign-up', 'POST', body, partial_auth_token)

  await setTokens(response['content'])

  return response['status']
}

export async function sendAuthToken(authToken = null) {
  // posts the auth token
  // receives whether (CompletelyAuthorised | PartiallyAuthorised | Unauthorised)
  // receives the tokens (access, refresh, auth?) if authorised

  let storedAuthToken, response
  console.log(authToken + ' is given')

  if (authToken == null) {

    storedAuthToken = await getToken("auth")

    if (await storedAuthToken == null) {
      return "unauthorised"
    }

    response = await network('/user/authorise-me', 'GET', null, await storedAuthToken)

  } else {

    response = await network('/user/authorise-me', 'GET', null, authToken)
  }


  let authStatus = response['content']['auth_status']

  switch (authStatus) {

    case "completely-authorised":
      await setTokens(response['content']['tokens'])
      break
    case "partially-authorised":
      await setTokens(response['content']['tokens'])
      break
    case "unauthorised":
      break

  }

  return authStatus
}

// ------------------------------------END---------------------------------------------//