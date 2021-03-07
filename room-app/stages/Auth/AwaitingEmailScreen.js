import React from 'react';
import { View, AsyncStorage, Image, Alert, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking'

import { Item, Container, Content, Form, Input, Button, Text, Toast, Label, Header, Left, Body, Right, Icon, Thumbnail } from 'native-base'

import { sendEmailAddr } from '../../helpers/networkers/networker'

const s = StyleSheet.create({
	text: {
		textAlign: 'center',
		color: '#ffffff',
		fontSize: 18
	}
});

export default class AwaitingEmailScreen extends React.Component {

	static navigationOptions = {
		headerShown: false,
	}

	constructor(props) {
		super(props)
		this.state = {
			email_addr: this.props.navigation.getParam('email_addr'),
			message: "We're sending an email to",
			submessage: "Please hang on a sec"
		}
	}

	componentDidMount() {
		this._getMagicLink()
	}

	//-------------------------------------------------------MAIN RENDER-------------------------------------------------------//

	_getMagicLink = async () => {

		let responseStatus = await sendEmailAddr(this.state.email_addr)

		if (responseStatus == 200) {
			this.setState({ message: "We've sent an email to", submessage: "Your key to room is in there\nCheck your spam if you don't see it" })
			console.log('analytics-auth-sent login email')
		} else {
			this.setState({ message: "We couldn't send the email to", submessage: "Sorry! Please try again" })
		}
	}

	render() {

		return (
			<Container style={{ backgroundColor: '#000' }}>
				
                <Header transparent iosBarStyle="light-content" androidStatusBarColor="#000">
					<Left>
						<Button transparent onPress={() => navigation.goBack()}>
							<Icon style={{ color: '#fff' }} name="ios-arrow-back" type="Ionicons" />
						</Button>
					</Left>
					<Body />
					<Right />
				</Header>

				<Content padder contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} scrollEnabled={false}>

					<Text style={s.text}>{this.state.message}</Text>
					
					<Text style={s.text}>{this.state.email_addr}{"\n"}</Text>
					
					<Icon style={{ color: '#fff', fontSize: 150 }} name="key" type="Feather" />

					<Text style={s.text}>{this.state.submessage}</Text>

				</Content>

			</Container>
		)
	}

}
