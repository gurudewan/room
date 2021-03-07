import React, { Component } from "react";
import { StyleSheet, View, AsyncStorage, Image } from "react-native";

import {
  Header,
  Item,
  Container,
  Content,
  Form,
  Label,
  Button,
  Input,
  Text,
  Toast,
  Left,
  Right,
  Body,
  Icon,
  Title
} from "native-base";

import AppIntro from "rn-falcon-app-intro";

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
    //backgroundColor: '#007aff', // '#9DD6EB',
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "300",
    textAlign: 'center'
  },
  textSmall: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "200",
    textAlign: 'center'
  },
  textBig: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: 'center'
  },     
  icon: { 
    width: 150, 
    height: 150,
}

});

export default class IntroSlides extends Component {
  /*
    User is sent here after completing the sign-up process (in the EnterBioData).
    Describes how VLT works and asks the user to submit a card.
  */

  constructor(props) {
    super(props);
    this.state = {};
  }

  _resetApp = async () => {
    await AsyncStorage.clear().then(
      this.props.navigation.navigate("InitialLoading")
    );
  };

  _onDoneButtonClick = () => {
    this.props.navigation.navigate("EnterBioData")
  };

  _refreshNumOfCards = async () => {
    //await fetchPaymentLinks();

    let paymentLinks = await AsyncStorage.getItem("paymentLinks");

    this.setState({ numOfCards: JSON.parse(paymentLinks).length });
  };

  render() {
    return (
      <Container style={{ backgroundColor: "#000" }}>
        <Header transparent iosBarStyle="light-content" androidStatusBarColor="#000" >
          <Left>
            <Button transparent onPress={this._resetApp}>
              <Icon name="arrow-back" style={{ color: "#ffffff" }} />
            </Button>
          </Left>
          <Body />
          <Right />
        </Header>
        <Content
          scrollEnabled={false}
          padder
          contentContainerStyle={{ flex: 1 }}
        >
          <AppIntro
            onDoneBtnClick={this._onDoneButtonClick}
            showSkipButton={false}
            showDoneButton={true}
            defaultIndex={this.state.defaultSliderIndex}
            doneBtnLabel={'Start'}
          >
            <View style={styles.slide}>
              <Text style={styles.textBig}>
                {`enter the room\n`}
              </Text>
              <Icon
                type="Entypo"
                name="location"
                style={{ fontSize: 120, color: "white" }}
              />
              <Text style={styles.textSmall}>
                {`\nsee people in the\n same room as you`}
              </Text>

            </View>
            <View style={styles.slide}>
              <Text style={styles.textBig}>
                {`read the room\n`}
              </Text>
                <Image source={require('../../assets/hisent.png')} style={styles.icon} />
              <Text style={styles.textSmall}>
                {`\nif you like someone, \n double tap to send \n a virtual wave`}
              </Text>
            </View>
            <View style={styles.slide}>
              <Text style={styles.textBig}>
                {`work the room\n`}
              </Text>
              <Image source={require('../../assets/hihi.png')} style={styles.icon} />


              <Text style={styles.textSmall}>
                {`\n if they wave back,\n say hi to them offline`}
              </Text>
            </View>

            <View style={styles.slide}>
              <Text style={styles.text}>
                {` we're bringing\n social back\n by taking it offline.`}
              </Text>

            </View>

          </AppIntro>
        </Content>
      </Container>
    );
  }
}
