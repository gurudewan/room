
import React, { useState, Component } from 'react';
import {
    AsyncStorage,
    View,
    ActivityIndicator,
    StyleSheet,
    Keyboard,
    FlatList,
    RefreshControl, Image
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
    StyleProvider,
    Fab,
    Toast
} from "native-base";

import EmptyIcon from "../../components/EmptyIcon"

import { NavigationEvents } from "react-navigation";
import { fetchNearbyRooms, enterTheRoom } from "../../helpers/networkers/networker";
import { TouchableOpacity } from "react-native-gesture-handler";

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

export default class EnterRoomScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rooms: [],
            refreshing: false,
            location: null,
            message: "",
            fabActive: false,
            locationPermitted: null
        };
    }
    componentDidMount() {
        Toast.show({ text: "COVID-19 is still on the loose, so please be sensible when meeting new people", duration: 5000, type: 'danger',  position: 'bottom' })
    }

    /*______________________________________________________________________________________________________________
      RENDER CHILD COMPONENTS
      ______________________________________________________________________________________________________________*/

    //--------------------------------------------------------------------------------------------//

    _enterARoom = async (roomID) => {

        let response = await enterTheRoom(roomID)
        if (response) {
            this.props.navigation.navigate('TheRoom', { roomID: roomID })
        }
    }


    //--------------------------------------------------------------------------------------------//

    _refreshNearbyRooms = async () => {
        console.log('I am fetching rooms')

        let location = await this._getSetLocation()

        this.setState({ refreshing: true })
        // get list of nearby rooms
        // update state
        // post location to server

        let updated = await fetchNearbyRooms(location)
        let rawNearbyRooms = await AsyncStorage.getItem("nearbyRooms")

        let nearbyRooms = JSON.parse(rawNearbyRooms)

        this.setState({ rooms: nearbyRooms })

        this.setState({ refreshing: false });

    };

    _getSetLocation = async () => {
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
            this.setState({ message: "Permission to access location was denied", locationPermitted: false })
            // todo show that location is not permitted
        }

        let location = await Location.getCurrentPositionAsync({});
        this.setState({ location: location })

        return location
    }

    _renderRoomPreview = ({ item, index }) => {

        let renderImage = false // 'ggl_photo_uri' in item

        /* to show image:
                    <CardItem cardBody>
                        {
                            renderImage ?
                                <Image
                                    source={{ uri: item.ggl_photo_uri }}
                                    style={{ height: 150, width: 200, flex: 1 }}
                                />
                                : null
                        }
                    </CardItem>
        */

        return (
            <TouchableOpacity onPress={() => this._enterARoom(item._id['$oid'])}>
                <Card transparent >
                    <CardItem style={{ backgroundColor: 'black' }} >
                        <Left>
                            <Body>
                                <Text style={{ fontSize: 20, color: 'white' }}>{item.name}</Text>
                            </Body>
                        </Left>
                    </CardItem>
                </Card>
            </TouchableOpacity>
        )
    };

    _renderEmptyMessage = () => {
        const msg1 = "You aren't near any rooms";
        const submsg1 = "Next time you're out and about,\n check back into the room";

        return (
            <EmptyIcon
                message={msg1}
                subMessage={submsg1}
            />
        );
    };

    render() {

        return (
            <Container style={{ backgroundColor: 'black' }}>
                <NavigationEvents onWillFocus={this._refreshNearbyRooms} />
                <Header transparent iosBarStyle="light-content" androidStatusBarColor="#000">
                    <Left style={{ flex: 1 }} />
                    <Body style={{ flex: 3, alignItems: 'center' }}>
                        <Text style={s.headerTitle}>
                            Choose your room
                        </Text>
                    </Body>
                    <Right style={{ flex: 1 }} />
                </Header>
                <View style={{ flex: 1 }} />
                <View style={{ flex: 8 }}>

                    <FlatList
                        data={this.state.rooms}
                        keyExtractor={(item, index) => item._id['$oid']}
                        renderItem={this._renderRoomPreview}
                        scrollEnabled={true}

                        contentContainerStyle={{ flexGrow: 1 }}

                        //ListHeaderComponent={this._renderHeader}

                        ListEmptyComponent={this._renderEmptyMessage}
                    //ListFooterComponentStyle={{ flex: 1, justifyContent: 'flex-end' }}
                    />

                </View>
                <View style={{ flex: 2 }}>
                    <Fab
                        active={this.state.fabActive}
                        direction="left"
                        containerStyle={{}}
                        style={{ backgroundColor: '#fff', color: 'black' }}
                        position="bottomRight"
                        onPress={() => this.props.navigation.navigate('Account')}>

                        <Icon name='account' type='MaterialCommunityIcons' style={{ color: 'black' }} />
                    </Fab>
                </View>

            </Container>
        );
    }
}
