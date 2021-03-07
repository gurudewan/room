import React from "react";

import { View, AsyncStorage, StyleSheet, Image, Dimensions, TouchableOpacity, Linking } from "react-native";
import { Button, Container, Content, Text, Icon, Header } from "native-base";
import Hyperlink from 'react-native-hyperlink'

import AppIntro from "rn-falcon-app-intro";
// TODO_MVP2 replpace AppIntro with Story

import { deleteTokens } from "../../helpers/tokenHelper";
import { keys } from '../../keys'

import styler from "../../helpers/styles/styles";

let { dimHeight, dimWidth } = Dimensions.get('window')
let ROOM_WEBSITE_URL = keys['ROOM_WEBSITE_URL']

let termsURL = ROOM_WEBSITE_URL + '/terms'
let privacyPolicyURL = ROOM_WEBSITE_URL + '/privacy-policy'
const styles = StyleSheet.create({
  firstSlide: {
    flex: 1,
    justifyContent: 'space-evenly',

  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'center',

  },
  text: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "bold",
    textAlign: "center"
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  icon: {
    fontSize: 150,
    color: "white"
  },
  smallText: {
    color: "#fff",
    fontSize: 14,

  },
  hyperText: {
    color: "#fff",
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  linkingView: {
    display: "flex",
    flexDirection: "row",
    flex: 1,
    flexWrap: 'wrap',
    margin: 10,
    //textAlign: 'center'
    //alignItems: 'center'
  }
});


export default class LogInSignUpScreen extends React.Component {
  /*
    Unauthorised user landing page.
    User can choose to initate 'Log In' or 'Sign Up' process 
      Note: (both are in fact the same on the app end, as both use magic links).
    User sees some slides describing what VLT does as well.
  */

  static navigationOptions = { headerShown: false };

  _handlePress = () => {
    this.props.navigation.navigate("EnterEmailAddress");
  };

  _resetApp = async () => {
    //await deleteTokens()
    await AsyncStorage.clear().then(
      this.props.navigation.navigate("InitialLoading")
    );
  };

  _onDone = () => {
    // User finished the introduction. Show real app through
    // navigation or simply by controlling state
    //this.setState({ showRealApp: true });
    /*           <AppIntroSlider renderItem={this._renderItem} slides={slides} onDone={this._onDone} showNextButton={false} showDoneButton={false}/>
 */
  }

  _renderItem = ({ item }) => {



    return (
      <View style={styles.slide}>
        <Text style={styles.title}>{item.title}</Text>
        {item.image ?
          <Image source={item.image} style={styles.image} /> :
          <Icon
            type="Ionicons"
            name="ios-paper"
            style={styles.icon}
          />
        }

        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  }

  render() {
    return (
      <Container style={{ backgroundColor: "#000" }}>
        <Header transparent iosBarStyle="light-content" androidStatusBarColor="#000" />
        <Content
          scrollEnabled={false}
          padder
          contentContainerStyle={{ flex: 4 }}
        >

          <View style={{ flex: 5, justifyContent: 'space-evenly' }}>
            <Image
              style={styles.image}
              source={require("../../assets/icon.png")}
            />
          </View>

          <View style={{ flex: 2 }}>

          </View>

          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Button
              block
              onPress={this._handlePress}
              style={{ backgroundColor: "#ffffff" }}
            >
              <Text style={{ color: "#007aff" }}>Enter the Room</Text>
            </Button>
          </View>

          <View style={{flex: 1}}>

          </View>

          {/*
             <Hyperlink
              linkStyle={styles.hyperText}
              linkText={url => url === privacyPolicyURL ? 'Privacy Policy' : 'Terms'}
            >
              <Text style={styles.smallText}>
                By entering the Room, you're agreeing to our {termsURL}.
              </Text>
            </Hyperlink>
            

              <Text style={styles.smallText}> and </Text>
              <TouchableOpacity onPress={() => Linking.openURL(privacyPolicyURL)}>
                <Text style={styles.hyperText} >Privacy Policy</Text>
              </TouchableOpacity>

                            <Text style={styles.smallText}>.</Text>
          <View style={styles.linkingView}>
            <Text style={styles.smallText}>By entering the Room, you're agreeing to our</Text>
            <TouchableOpacity onPress={() => Linking.openURL(termsURL)}>
              <Text style={styles.hyperText} >
                Terms</Text>
            </TouchableOpacity>
          </View>
         
   */}


        </Content>
      </Container>
    );
  }
}
