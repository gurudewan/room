import React from "react";

import { Text, Textarea, Icon, ListItem, Card, CardItem, Button, ActionSheet, Body, Left, Right, DatePicker, Toast } from "native-base";
import { View, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";

import { postInteraction, reportHuman } from "../helpers/networkers/networker"
import { getAge } from '../helpers/dateHelper'

const s = StyleSheet.create({
    big: {
        alignSelf: "center"
    },
    small: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    nameText: {
        fontSize: 22,
        flex: 3,
        fontWeight: '400',
        color: 'white'
    },
    ageText: {
        fontSize: 22,
        flex: 3,
        fontWeight: '300',
        color: 'white'
    },
    oneLinerText: {
        //fontSize: 18,
        //fontWeight: '300'
        fontSize: 20,
        color: '#E8E8E8',
        fontWeight: '200',
        backgroundColor: 'black'

    },
    bottomPanel: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        fontSize: 30,
        justifyContent: 'space-between',
        backgroundColor: 'black'
        //flexDirection: 'row',
        //flexGrow: 1,
        //flex: 1,
    },
    reportButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        color: 'grey'
    },
    interaction: {
        width: 50,
        height: 50,
        alignSelf: 'center',
        position: 'absolute',
        left: 130,
        top: 460,
    },
});

export default class Profile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            active: true,
            pic_url: props.data['pic_url'],
            base64: '',
            one_liner: props.data['one_liner'],
            full_name: props.data['full_name'],
            birthday: props.data['birthday'],
            interaction: props.data['interaction'],
            showActions: true,
            refreshing: false,
            singleTap: false,
            hideHuman: false,
            reportCode: ''
        };
    }


    /*
        Use this to display a Member Profile
  
        PROPS:
          - editing || Bool || 
          - isMyProfile || Bool || if this is the MemberProfile of the user itself, then set to true - otherwise false
          - isSetup || Bool || true if rendering for setting up the profile (just after sign up), false otherwise (editing my profile, or showing other people's profiles)
          - navigation || RNavigation normal prop || used to control the navigation from this child component
      */


    /*-----------------------------------PRESS---------------------------------------------*/


    _anImageTapped = async () => {

        if (this.state.singleTap) {
            Toast.show({ text: "Saying hi...", duration: 3000, textStyle: { textAlign: 'center' } })
            await this._sayHi()

        } else {
            this.setState({ singleTap: true })
            setTimeout(
                () => {
                    this.setState({ singleTap: false })
                }, 1000)
        }

    }


    /*---------------------------------------------------INTERACTIONS----------------------------------------------------------*/

    _renderInteraction = (interaction) => {

        if (interaction == 'hihi') {
            // double hand
            return (
                <Image source={require('../assets/hihi.png')} style={s.interaction} />
            )
        } else if (interaction == 'higot') {
            // palm facing me // onPress={this._sayHi(interaction)}
            return (
                <Image source={require('../assets/higot.png')} style={s.interaction} />
            )
        } else if (interaction == 'hisent') {
            // hand facing away
            return (
                <Image source={require('../assets/hisent.png')} style={s.interaction} />
            )
        }

    }


    _sayHi = async () => {
        // get _id of current profile
        // post it up to the server with a +1

        // if interaction != 'hihi' and interaction != 'hisent'

        let interaction = this.state.interaction

        if ((interaction != 'hihi') && (interaction != 'hisent')) {
            let receiverID = this.props.data._id['$oid']
            let roomID = this.props.room

            let saidHi = await postInteraction(roomID, receiverID, 'hi')

            if (await saidHi){
                console.log('updating')

                // update the local interaction / room

                // reset the state of this member to whatever is returned

                Toast.show({ text: "Waved!", duration: 3000, textStyle: { textAlign: 'center' } })

            } else {
                console.log('error while saying hi')
                Toast.show({ text: "Couldn't wave - try again later", duration: 3000, textStyle: { textAlign: 'center' } })
            }
        } else {
            console.log('you already said hi')
        }

    }

    _reportPressed = async () => {

        var hideHuman = false

        const actionButtons = ["fake profile", "inappropriate profile", "seem under 18", "made me uncomfortable offline", "Cancel"]

        ActionSheet.show(
            {
                options: actionButtons,
                cancelButtonIndex: 4,
                title: "Why are you reporting this person?"
            },
            buttonIndex => {
                var reportCode = ''

                switch (buttonIndex) {
                    case 0:
                        reportCode = 'fake_profile'
                        break
                    case 1:
                        reportCode = 'inappropriate_profile'
                        break
                    case 2:
                        reportCode = 'underage_profile'
                        break
                    case 3:
                        reportCode = 'bad_behaviour'
                        break
                    case 4:
                    default:
                        reportCode = 'not'
                        return
                }

                Alert.alert('Do you want to hide this person?', "You won't see each other in any rooms in the future.", [
                    {
                        text: 'Yes',
                        onPress: async () => this._sendReport(true, reportCode)
                    },
                    {
                        text: 'No',
                        onPress: async () => this._sendReport(false, reportCode)
                    },
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancelled'),
                        style: 'cancel'
                    }
                ])

            }
        )

    }


    _sendReport = async (hideHuman, reportCode) => {
        let receiverID = this.props.data._id['$oid']

        await reportHuman(receiverID, reportCode, hideHuman)

        if (hideHuman) {
            Toast.show({ text: "Reported + Hidden", duration: 3000, textStyle: { textAlign: 'center' } })
        } else {
            Toast.show({ text: "Reported", duration: 3000, textStyle: { textAlign: 'center' } })
        }
    }
    /*----------------------------------------------------RENDER------------------------------------------------------------------------*/


    render() {
        let item = this.state

        return (

            <Card style={{ flex: 1, width: 300, height: 550, backgroundColor: 'black', borderColor: 'white', borderRadius: 30, borderTopWidth: 7, borderBottomWidth: 7, borderRightWidth: 1, borderLeftWidth: 1 }} >

                <TouchableOpacity onPress={this._anImageTapped}>
                    <View>
                        <CardItem cardBody style={{ justifyContent: 'center', backgroundColor: 'black' }} >
                            <Image
                                borderRadius={15}
                                source={{ uri: item.pic_url + '?' + new Date() }}
                                style={{ width: 300, height: 300 }}
                            />

                        </CardItem>

                        <CardItem style={s.bottomPanel}>
                            <Left>
                                <Text style={s.nameText}>
                                    {item.full_name.split(' ')[0]}
                                </Text>
                            </Left>

                            <Right>
                                <Text style={s.ageText}>
                                    {getAge(item.birthday.toString())}
                                </Text>
                            </Right>
                        </CardItem>
                    </View>


                    <CardItem transparent style={{ backgroundColor: 'black' }}>
                        <Textarea
                            placeholder={'Your one liner'}
                            //allowsEditing={!isMyProfile}
                            disabled={true}

                            rowSpan={6}
                            ellipsizeMode={'clip'}
                            maxLength={140}
                            style={s.oneLinerText}
                        >
                            {item.one_liner}
                        </Textarea>
                    </CardItem>
                    <TouchableOpacity onPress={this._reportPressed} style={{width: 50, height: 40}}>
                        <Button transparent >
                            <Icon name='dots-three-vertical' type='Entypo' style={s.reportButton} />
                        </Button>
                    </TouchableOpacity>

                    {this._renderInteraction(item.interaction)}

                </TouchableOpacity>

            </Card>
        );
    }
}