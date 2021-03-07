import React from 'react';
import { StyleSheet } from 'react-native';

import { sendEmailAddr } from '../../helpers/networkers/networker'

import { Item, Container, Content, Form, Input, Button, Text, Toast, Label, Header, Left, Body, Right, Icon } from 'native-base'

const s = StyleSheet.create({
    container: {
        alignSelf: 'stretch',
        justifyContent: 'space-between'
    },
    bottom: {
        marginBottom: 36,
    }
})

export default class EnterEmailAddressScreen extends React.Component {
    /* 
        User is sent here after clicking 'Log In' or 'Sign Up'.
        User enters their email address.
        Initates magic link process: magic link will be sent to the entered email address.
    */

    static navigationOptions = {
        headerShown: false
    }
    constructor(props) {
        super(props)
        this.state = {
            email_addr: "",
			message: "Type the email address that you'd\n like to use to enter the room"
        }
    }

	_sendEmailAddress = async () => {
		let email_addr = this.state.email_addr

		if (this._validateEmail(email_addr)) {
			this.props.navigation.navigate('AwaitingEmail', { email_addr: email_addr });
		}
		else {
			this.setState({
				message: "You need to enter a valid email address"
			})

		}
	}

    _validateEmail = (email) => {
        var regularExpression = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return regularExpression.test(email)
    }

    render() {
        return (
            <Container style={{ backgroundColor: '#000' }}>

                <Header transparent iosBarStyle="light-content" androidStatusBarColor="#000" >
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.goBack()}>
                            <Icon style={{ color: '#fff' }} name="ios-arrow-back" type="Ionicons" />
                        </Button>
                    </Left>
                    <Body/>
                    <Right />
                </Header>

                <Content padder contentContainerStyle={{ justifyContent: 'flex-start', flex: 2 }} scrollEnabled={false}>

                    <Text style={{ textAlign: 'center', color: '#ffffff' }}>
                        {this.state.message}
                    </Text>
                    <Form>
                        <Item floatingLabel>
                            <Label style={{ color: '#ffffff' }}>Your email address</Label>
                            <Input
                                onChangeText={(input) => this.setState({ email_addr: input })}
                                autoCorrect={false}
                                autoCapitalize={"none"}
                                autoFocus={true}
                                ref={formInput => this.formInput = formInput}
                                keyboardType={"email-address"}
                                autoCompleteType={"email"}
                                clearButtonMode={"while-editing"}
                                style={{ color: '#ffffff' }}

                            />
                        </Item>
                    </Form>
                    <Text>{"\n"}</Text>
                    <Button block onPress={this._sendEmailAddress} style={{ backgroundColor: '#ffffff' }}>
                        <Text style={{ color: '#007aff' }}>
                            Next
                            </Text>
                    </Button>
                </Content>
            </Container>

        );
    }
}