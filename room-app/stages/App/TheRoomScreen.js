
import React, { Component } from "react";
import {
    AsyncStorage,
    View,
    ActivityIndicator,
    StyleSheet,
    Keyboard,
    FlatList,
    RefreshControl,
    Dimensions,
    Alert
} from "react-native";
import _ from "lodash";

import * as Location from 'expo-location';

import {
    Button,
    Header,
    Card,
    CardItem,
    Icon,
    Text,
    Right,
    Left,
    Body,
    Item,
    ListItem,
    Input,
    Title,
    Container,
    Content,
    Image,
    StyleProvider,
    Grid,
    Col,
    Row
} from "native-base";

import EmptyIcon from "../../components/EmptyIcon"
import MemberProfile from "../../components/MemberProfile"

import { exitTheRoom, fetchTheRoom } from "../../helpers/networkers/networker"

import { NavigationEvents } from "react-navigation";

const s = StyleSheet.create({
    big: {
        alignSelf: "center"
    },
    small: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    body: {
        fontSize: 18,
        flex: 3
    },
    icon: {
        color: "#007aff"
    },
    smallText: {
        fontSize: 12
    },
    headerTitle: {
        color: '#E8E8E8',
        fontSize: 20

    }
});

export default class TheRoomScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            roomID: null,
            room: {},
            refresh: false,
            formattedMembers: []
        };
    }

    static navigationOptions = {
        gesturesEnabled: false
    };

    componentDidMount() {
        this.interval = setInterval(
            this._refreshTheRoom
            , 5000)
    }

    componentWillUnmount() {
        clearInterval(this.interval)
        this._exitRoom()
    }


    _refreshTheRoom = async () => {

        let oldRawRoom = await AsyncStorage.getItem("theRoom")
        let oldRoom = JSON.parse(oldRawRoom)

        let roomID = this.props.navigation.getParam('roomID', null)

        let location = await Location.getCurrentPositionAsync({});

        let response = await fetchTheRoom(roomID, location)

        if (response == 're-fetched-room') {
            let rawRoom = await AsyncStorage.getItem("theRoom")
            let theRoom = JSON.parse(rawRoom)

            this.setState({ room: theRoom })

            this.setState({ formattedMembers: theRoom.members })

            console.log('the room I got is:')
            console.log(theRoom)
            // somehow refresh the MemberProfile component

            //this._formatMembers()

            //console.log('I got the room')
            //console.log(theRoom)
            //console.log('------------------------------------------------------')

            //this.setState({ refresh: true })

        } else if (response == 'booted-from-room') {
            await this._exitRoom()
        }

    }

    //-------------exit room----------------//

    _exitRoomPress = () => {
        Alert.alert(
            "Are you sure?",
            "You're leaving the room.",
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', onPress: this._exitRoom },
            ],
            { cancelable: false }
        )
    }

    _exitRoom = async () => {
        let roomID = this.state.room['_id']['$oid']

        //await AsyncStorage.setItem('theRoom', null)
        console.log('exiting the room with id' + roomID.toString())
        await exitTheRoom(roomID)

        this.props.navigation.goBack()
    }

    //--------------------------------------//

    /*______________________________________________________________________________________________________________
      RENDER CHILD COMPONENTS
      ______________________________________________________________________________________________________________*/

    //--------------------------------------------------------------------------------------------//

    _renderHeader = () => {
        return (
            <Header transparent iosBarStyle="light-content" androidStatusBarColor="#000">
            <Left style={{flex: 1}} />
                <Body style={{ flex: 2, alignItems: 'center' }}>
                    <Text style={s.headerTitle}>
                        {this.state.room.name}
                    </Text>
                </Body>
                <Right style={{flex: 1}}>
                    <Button transparent onPress={this._exitRoomPress}>
                        <Icon style={{ color: '#E8E8E8', fontSize: 25 }} name="exit-to-app" type="MaterialIcons" />
                    </Button>
                </Right>
            </Header>
        )
    }

    _renderAColumn = ({ item, index }) => {
        return (
            <Col>
                {item}
            </Col>
        )
    }

    _formatMembers = () => {
        //const PIC_HEIGHT = 200
        //const MAX_HEIGHT = Dimensions.get('window').height

        const numItemsPerColumn = 2 // Math.floor(MAX_HEIGHT / PIC_HEIGHT)

        var members = this._createMembersArray()

        const numOfColumns = Math.ceil(members.length / numItemsPerColumn)

        var columns = []

        var i

        for (i = 0; i < numOfColumns; i++) {
            columns[i] = members.slice(i * numItemsPerColumn, (i + 1) * numItemsPerColumn)
        }

        this.setState({ formattedMembers: columns })
    }

    _createMembersArray = () => {

        //console.log('==================')
        //console.log(this.state.room)
        let theRoom = this.state.room
        let rawMembers = theRoom.members

        var members = []
        var i

        for (i = 0; i < rawMembers.length; i++) {
            members.push(
                <MemberProfile data={rawMembers[i]} myProfile={false} room={this.state.room._id['$oid']} />
            )
        }

        return members
    }

    _renderAMember = ({ item, index }) => {
        return (
            <ListItem style={{ borderBottomWidth: 0, justifyContent: 'center', flex: 1 }}>
                <MemberProfile data={item} myProfile={false} room={this.state.room._id['$oid']} />
            </ListItem>
        )
    }

    _renderEmptyMessage = () => {
        const msg1 = "You're the only member here"
        const submsg1 = ""

        return (
            <EmptyIcon
                message={msg1}
                subMessage={submsg1}
            />
        );
    };

    render() {
        //console.log(this.state.room)
        //console.log(this.state.formattedMembers)

        return (
            <Container style={{ backgroundColor: 'black' }}>
                <NavigationEvents onWillFocus={this._refreshTheRoom} />

                {this._renderHeader()}

                <Content padder contentContainerStyle={{ flex: 1, alignItems: 'center' }}>
                    <FlatList
                        data={this.state.formattedMembers}
                        keyExtractor={(item, index) => item._id['$oid']}
                        //keyExtractor={(item, index) => Math.random()}
                        horizontal={true}
                        //extraData={this.state}
                        style={{ shadowColor: 'transparent', }}

                        renderItem={this._renderAMember}

                        ListEmptyComponent={this._renderEmptyMessage}
                    />
                </Content>

            </Container>
        );
    }
}
