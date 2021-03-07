import React from "react";

import { Text, Textarea, Icon, ListItem, Card, CardItem, Button, ActionSheet, Body, Left, Right, DatePicker, Toast } from "native-base";
import { View, StyleSheet, Image, TouchableOpacity, Platform } from "react-native";

import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';

import { FlatList, TextInput } from "react-native-gesture-handler";

import { postMyProfile, postInteraction, signUpUser } from "../helpers/networkers/networker"
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
        //fontWeight: '300',
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
            //showActions: true,
            //refreshing: false,
            upToDate: true,
            imageValid: props.isSetup ? false : true, // if pic_url is null, or '' then invalid,
            oneLinerValid: props.isSetup ? false : true,// this._validateOneLiner(props.data['one_liner']),
            message: '',

            //ssingleTap: false,
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

    /*------------------------------------------INPUT + VALIDATE + SAVE-------------------------------------------------------*/

    _onTextInput = (text) => {
        this.setState({ one_liner: text, upToDate: false })
        this._validateOneLiner(text)

    }

    _validateOneLiner = (oneLiner) => {
        if (oneLiner == '') {

            this.setState({ message: 'You need to have a tweet sized one liner', oneLinerValid: false })
        } else {
            this.setState({ message: '', oneLinerValid: true })
        }

    }

    _validateImage = (img_data) => {
        // img_data can represent either the base64 rep, or the s3 url - it just should not be empty
        console.log('=======')

        if (img_data == null) {
            this.setState({ message: 'You need to have a profile pic', imageValid: false })
            return false
        } else {
            this.setState({ imageValid: true })
            return true

        }
    }

    _saveMyProfile = async () => {

        Toast.show({ text: "Saving...", duration: 3000, textStyle: { textAlign: 'center' } })

        let state = this.state

        let myProfile = {
            one_liner: state.one_liner,
        }

        if (state.base64 != '') {
            myProfile['base64'] = state.base64
        }

        if (this.props.isSetup) {

            myProfile['full_name'] = state.full_name
            myProfile['birthday'] = state.birthday

            let saved = await signUpUser(myProfile)

            this.props.navigation.navigate('InitialLoading')

        } else {

            let saved = await postMyProfile(myProfile)
            if (saved) {
                this.setState({ upToDate: true })
                Toast.show({ text: "Saved!", duration: 3000, textStyle: { textAlign: 'center' } })

            }

        }
    }

    /*-----------------------------------IMAGES-------------------------------------------*/

    getPermissionAsync = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    };

    _myImageTapped = async () => {

        var BUTTONS = ["Choose New", "Cancel"]

        ActionSheet.show(
            {
                options: BUTTONS,
                cancelButtonIndex: 1,
                //destructiveButtonIndex: DESTRUCTIVE_INDEX,
                //title: ""
            },
            buttonIndex => {
                if (buttonIndex == 0) {
                    this._pickImage()
                }
                //this.setState({ clicked: BUTTONS[buttonIndex] });
            }
        )
    }

    _pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                //allowsEditing: true,
                //aspect: [1, 1],
                quality: 0.5,
                base64: true,
                exif: false
            });
            if (!result.cancelled) {

                if (this._validateImage(result.base64)) {
                    this.setState({ pic_url: `data:image/png;base64,${result.base64}`, base64: result.base64, imageValid: true, upToDate: false })
                    // navigate to next screen, pass it 
                }

            }

        } catch (E) {
            console.log(E);
        }
    }


    /*----------------------------------------------------RENDER------------------------------------------------------------------------*/


    render() {
        let item = this.state

        //let isMyProfile = this.props.isMyProfile
        let isSetup = this.props.isSetup
        let picURL = this.state.pic_url
        let isImageValid = (this.state.base64 != '') || (picURL != null)

        let buttonDisabled = (this.state.upToDate || !this.state.oneLinerValid || !this.state.imageValid)

        return (

            <Card style={{ flex: 1, width: 300, height: 500, backgroundColor: 'black', borderColor: 'white', borderRadius: 25, borderTopWidth: 7, borderBottomWidth: 7, borderRightWidth: 1, borderLeftWidth: 1 }} >

                <TouchableOpacity onPress={this._myImageTapped}>
                    <CardItem cardBody style={{ justifyContent: 'center', backgroundColor: 'black' }} >
                        {
                            !isSetup ?
                                <Image
                                    borderRadius={15}
                                    source={{ uri: item.pic_url }}
                                    style={{ width: 300, height: 300 }}
                                />
                                :
                                <View style={{ width: 300, height: 300, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text>
                                        <Icon name='image' type='EvilIcons' style={{ fontSize: 100, color: 'white' }} />

                                    </Text>
                                    <Text style={{ fontSize: 22, color: 'white' }}>
                                        choose your pic
                                    </Text>
                                </View>
                        }
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
                </TouchableOpacity>

                <CardItem transparent style={{ backgroundColor: 'black' }}>
                    <Textarea
                        placeholder={'Write a one liner!'}
                        //allowsEditing={!isMyProfile}
                        disabled={false}
                        onChangeText={(text) => this._onTextInput(text)}
                        rowSpan={3}
                        ellipsizeMode={'clip'}
                        maxLength={70}
                        style={s.oneLinerText}
                    >
                        {item.one_liner}
                    </Textarea>
                </CardItem>

            </Card>
        );
    }
}


/*


                { buttonDisabled ?
                    <Button light bordered block onPress={this._saveMyProfile} disabled={true} >
                        <Text style={{ color: '#fff' }}>
                            Save
                        </Text>
                    </Button>
                    :
                    <Button light block onPress={this._saveMyProfile} disabled={false} style={{ backgroundColor: 'white' }} >
                        <Text style={{ color: '#000' }}>
                            Save
                        </Text>
                    </Button>

                }

*/