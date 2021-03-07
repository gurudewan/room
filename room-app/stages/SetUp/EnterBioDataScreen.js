import React from 'react';
import { KeyboardAvoidingView, Alert, Keyboard, AsyncStorage } from 'react-native';

import { Header, Item, Container, Content, Form, Label, Button, Input, Text, Grid, Col, Left, Right, Body, Icon, DatePicker } from 'native-base'

import { signUpUser, sendAuthToken, fetchPlaidLinkToken } from '../../helpers/networkers/networker'

import { getAge } from '../../helpers/dateHelper'

export default class EnterNameScreen extends React.Component {
    /*
        User is sent here after app intro.
        User enters their full name.
        User submits the name, which completes the sign-up process.
        User is then to the add bank accounts screen.

        Also gets a Plaid Link token for next screen.
    */

    static navigationOptions = {
        headerShown: false
    }
    constructor(props) {
        super(props)

        this.state = {
            name: '',
            birthday: '',
            message: "Let's get to know each other"
        }

        this.setDate = this.setDate.bind(this);

    }

    _goBack = () => {
        this.props.navigation.navigate('Intro')
    }

    setDate = (newDate) => { this.setState({ birthday: newDate }) }

    render() {
        return (

            <Container style={{ backgroundColor: '#000' }}>
                <Header transparent iosBarStyle="light-content" androidStatusBarColor="#000">
                    <Left>
                        <Button transparent onPress={this._goBack}>
                            <Icon name='arrow-back' style={{ color: '#ffffff' }} />
                        </Button>
                    </Left>
                    <Body />
                    <Right />
                </Header>

                <Content padder contentContainerStyle={{ justifyContent: 'flex-start', flex: 1 }} scrollEnabled={false}>
                    <Text style={{ textAlign: 'center', color: '#ffffff' }}>
                        {this.state.message}
                    </Text>
                    <Form style={{}}>
                        <Item stackedLabel >
                            <Label style={{ color: '#ffffff' }}>Your full name</Label>

                            <Input
                                onChangeText={(input) => this.setState({ name: input })}
                                autoCorrect={false}
                                autoCapitalize={"words"}
                                autoFocus={true}
                                ref={formInput => this.formInput = formInput}
                                autoCompleteType={"name"}
                                clearButtonMode={"while-editing"}
                                style={{ color: '#ffffff' }}

                            />
                        </Item>

                        <Item stackedLabel>
                            <Label style={{ color: '#ffffff' }}>Your birthday</Label>

                            <DatePicker
                                defaultDate={new Date(2020, 1, 1)}
                                //minimumDate={new Date(2018, 1, 1)}
                                maximumDate={new Date()}
                                locale={"en_GB"}
                                timeZoneOffsetInMinutes={undefined}
                                modalTransparent={false}
                                animationType={"fade"}
                                androidMode={"default"}
                                //placeHolderText="Select your birthday"
                                textStyle={{ color: "white" }}
                                placeHolderTextStyle={{ color: "#d3d3d3" }}
                                onDateChange={this.setDate}
                                disabled={false}
                            />
                        </Item>

                        { /*
                            this.state.birthday == '' ?
                                <Text> </Text> :
                                <Text style={{ color: '#fff', alignSelf: 'center' }}>{getAge(this.state.birthday)} years old</Text>
                                */
                        }

                    </Form>

                    <Text>~{"\n"}</Text>

                    <Text>~{"\n"}</Text>

                    <Button block onPress={this._sendName} style={{ backgroundColor: '#ffffff' }}>
                        <Text style={{ color: '#007aff' }}>
                            Next
                        </Text>
                    </Button>
                </Content>
            </Container>
        );
    }

    _sendName = async () => {
        let name = this.state.name
        let birthday = this.state.birthday

        let validName = this._validateName(name)
        let validBday = this._validateBirthday(birthday)

        if (validName && validBday) {
            Keyboard.dismiss()

            this.props.navigation.navigate('MakeProfile', { isSetup: true, full_name: name, birthday: birthday })
        }

        else if (!validName && !validBday) {
            this.setState({
                message: "You need to enter your full name and be over 18 to enter the room"
            })
        }
        else if (!validName) {
            this.setState({
                message: "Please enter a valid full name"
            })

        } else if (!validBday) {
            this.setState({
                message: "You need to be over 18 to enter the room"
            })
        }
    }

    _validateName = (name) => {
        var regularExpression = /^[a-zA-Z]+ [a-zA-Z]+$/
        return regularExpression.test(name)
    }

    _validateBirthday = (birthday) => {
        let age = getAge(birthday)
        return age >= 18
    }


}