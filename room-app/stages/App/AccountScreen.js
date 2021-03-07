import React from 'react';
import { Alert, View, AsyncStorage, SectionList, Linking, StyleSheet } from 'react-native';
import { Body, List, ListItem, Text, Right, Left, Container, Header, Content, Title, Button, StyleProvider, Card, CardItem, Icon, ActionSheet } from 'native-base';

import { NavigationEvents } from 'react-navigation';

import { deleteTokens } from '../../helpers/tokenHelper'
import { fetchUserInfo } from '../../helpers/networkers/networker'
import { getAge } from '../../helpers/dateHelper'

import { keys } from '../../keys'

let ROOM_WEBSITE_URL = keys['ROOM_WEBSITE_URL']

const s = StyleSheet.create({
    button: {
        alignSelf: 'center'
    }
})

export default class AccountScreen extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            imageURI: 'http://room-photographer.s3.amazonaws.com/5f6df0a41fdcbb047c25fbdd.png',
            base64: '',
            one_liner: '',
            full_name: '',
            birthday: '',
            pic_url: '',
            activeactive: false
        }
    }

    static navigationOptions = {
        headerShown: false,
    }

    componentDidMount() {
        this._renderUserInfo()
    }

    _renderUserInfo = async () => {

        await fetchUserInfo()
        let userInfo = await AsyncStorage.getItem('userInfo')

        this.setState(JSON.parse(userInfo))
    }

    _signOutButtonPress = () => {
        Alert.alert(
            "Are you sure?",
            "You're logging out.",
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Leave', onPress: this._signOut },
            ],
            { cancelable: false }
        )
    }

    _signOut = async () => {
        await deleteTokens()
        await AsyncStorage.clear().then(
            this.props.navigation.navigate('InitialLoading')
        )
    }

    _openWebsite = () => {
        Linking.openURL(ROOM_WEBSITE_URL)
    }
    _openInstagram = () => {
        Linking.openURL('https://instagram.com/roomtheapp')
    }

    _openTwitter = () => {
        Linking.openURL('https://twitter.com/roomtheapp')
    }

    render() {

        return (

            <Container>
                <NavigationEvents onWillFocus={this._renderUserInfo} />

                <Header transparent iosBarStyle="dark-content" androidStatusBarColor="#fff" >
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.goBack()}>
                            <Icon style={{ color: '#007aff' }} name="ios-arrow-back" type="Ionicons" />
                        </Button>
                    </Left>
                    <Body style={{ flex: 4, alignItems: 'center' }}>
                        <Text style={s.headerTitle}>
                        </Text>
                    </Body>
                    <Right />
                </Header>

                <Content>
                    <ListItem itemHeader first>
                        <Text>
                            YOUR PROFILE
                        </Text>
                    </ListItem>

                    <ListItem selected onPress={() => this.props.navigation.navigate('MakeProfile', { isSetup: false, ...this.state })} >
                        <Left>
                            <Text>Edit</Text>
                        </Left>
                        <Right>
                            <Icon name="arrow-forward" />
                        </Right>
                    </ListItem>

                    {/*                     
                    <ListItem itemHeader>
                        <Text>
                            YOUR FILTERS
                        </Text>
                    </ListItem> */}

                    <ListItem itemHeader>
                        <Text>
                            YOUR DETAILS
                        </Text>
                    </ListItem>

                    <ListItem style={{ flex: 1 }} onPress={() => Alert.alert("You can't edit this", "If you need to correct your name, birthday or email address - please get in touch.")}>

                        <Text style={{ alignSelf: 'center' }}>{this.state.full_name + "\n\n" + getAge(this.state.birthday) + "\n\n" + this.state.email_addr}</Text>
                    </ListItem>

                    <ListItem itemHeader first>
                        <Text>GET HELP</Text>
                    </ListItem>

                    <ListItem selected onPress={() => this.props.navigation.navigate('Tutorial', { isSetup: false, ...this.state })} >
                        <Left>
                            <Text>How Room Works</Text>
                        </Left>
                        <Right>
                            <Icon name="arrow-forward" />
                        </Right>
                    </ListItem>

                    <ListItem itemHeader first>
                        <Text>GET IN TOUCH</Text>
                    </ListItem>
                    
                    <ListItem>
                        <Body style={{ justifyContent: 'space-around', flexDirection: 'row' }}>
                            <Icon name='instagram' type='MaterialCommunityIcons' onPress={this._openInstagram} />
                            <Icon name='twitter' type='MaterialCommunityIcons' onPress={this._openTwitter} />
                        </Body>
                    </ListItem>

                    <ListItem selected onPress={() => Linking.openURL(ROOM_WEBSITE_URL)} >
                        <Text>Our Website</Text>
                    </ListItem>

                    <ListItem itemHeader first>
                        <Text>THE FORMAL STUFF</Text>
                    </ListItem>

                    <ListItem selected onPress={() => Linking.openURL(ROOM_WEBSITE_URL + '/privacy-policy')} >
                        <Text>Our Privacy Policy</Text>
                    </ListItem>

                    <ListItem selected onPress={() => Linking.openURL(ROOM_WEBSITE_URL + '/terms')} >
                        <Text>Our Terms</Text>
                    </ListItem>

                    <Button transparent onPress={this._signOutButtonPress} style={s.button}>
                        <Text>Leave The Room</Text>
                    </Button>

                </Content>
            </Container>
        )
    }
}