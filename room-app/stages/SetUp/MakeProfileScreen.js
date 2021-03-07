import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Platform, AsyncStorage, KeyboardAvoidingView } from "react-native";

import { Text, Textarea, Icon, ListItem, Card, CardItem, Button, ActionSheet, Body, Left, Right, Toast, Container, Header, Content, Grid, Row, Col } from "native-base";

import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';

//import EditableProfile from "../../components/EditableProfile"


import { postMyProfile, signUpUser } from "../../helpers/networkers/networker"
import { getAge } from '../../helpers/dateHelper'

const s = StyleSheet.create({
    headerTitle: {
        color: '#E8E8E8'
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
})

export default class MakeProfileScreen extends React.Component {

    constructor(props) {

        super(props)

        let isSetup = this.props.navigation.getParam('isSetup')

        if (isSetup) {
            this.state = {

                full_name: this.props.navigation.getParam('full_name'),
                birthday: this.props.navigation.getParam('birthday'),
                one_liner: '',
                pic_url: null,
                base64: '',
                isBase64: false,

                message: '',
                isSetup: isSetup,
                upToDate: true,
                imageValid: false, // if pic_url is null, or '' then invalid,
                oneLinerValid: false,

            }
        } else {

            this.state = {

                full_name: this.props.navigation.getParam('full_name'),
                birthday: this.props.navigation.getParam('birthday'),
                one_liner: this.props.navigation.getParam('one_liner'),
                pic_url: this.props.navigation.getParam('pic_url'),
                base64: '',
                isBase64: false,

                message: '',
                isSetup: isSetup,
                upToDate: true,
                imageValid: true,
                oneLinerValid: true,

            }
        }

    }

    static navigationOptions = {
        headerShown: false,
    }

    componentDidMount() {
        this._loadHumanInfo()
    }

    _loadHumanInfo = async () => {

        //await fetchUserInfo()
        let userInfo = await AsyncStorage.getItem('userInfo')
        
        this.setState(JSON.parse(userInfo))
    }

    _onBackPress = () => {


        this.props.navigation.goBack()

        /*
        Alert.alert(
            "Are you sure?",
            "You'll lose any updates to your profile.",
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Go back', onPress: this.props.navigation.goBack },
            ],
            { cancelable: false }
        )
        */
    }


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

        if (img_data == null) {
            this.setState({ message: 'You need to have a profile pic', imageValid: false })
            return false
        } else {
            this.setState({ imageValid: true })
            return true

        }
    }

    _saveMyProfile = async () => {

        Toast.show({ text: "Saving...", duration: 1500, textStyle: { textAlign: 'center' } })

        let state = this.state

        let myProfile = {
            one_liner: state.one_liner,
        }

        if (state.base64 != '') {
            myProfile['base64'] = state.base64
        }

        if (!this.state.isSetup) {

            let saved = await postMyProfile(myProfile)
            if (saved) {
                this.setState({ upToDate: true })
                Toast.show({ text: "Saved!", duration: 3000, textStyle: { textAlign: 'center' } })
            }

        } else {

            myProfile['full_name'] = state.full_name
            myProfile['birthday'] = state.birthday

            let saved = await signUpUser(myProfile)

            this.props.navigation.navigate('InitialLoading')

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
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.1,
                base64: true,
                exif: false
            });
            if (!result.cancelled) {

                if (this._validateImage(result.base64)) {
                    this.setState({ pic_url: `data:image/png;base64,${result.base64}`, base64: result.base64, isBase64: true, imageValid: true, upToDate: false })
                }

            }

        } catch (E) {
            console.log(E);
        }
    }

    _renderAnImage = (pic_url) => {

        let picURL = ''
        if (this.state.isBase64) { // render a bas 64 picture

            picURL = pic_url
        } else { // render a url picture
            picURL = pic_url + '?' + new Date()

        }

        return (

            <Image
                borderRadius={15}
                source={{ uri: picURL }}
                style={{ width: 300, height: 300 }}
            />

            /*              */
        )

    }


    /*---------------------------------------------------------------RENDER-------------------------------------------------------------------------*/

    render() {

        let item = this.state

        //let isMyProfile = this.props.isMyProfile
        let picURL = this.state.pic_url
        let isImageValid = (this.state.base64 != '') || (picURL != null)

        let buttonDisabled = (this.state.upToDate || !this.state.oneLinerValid || !this.state.imageValid)

        return (

            <Container style={{ backgroundColor: '#000' }}>

                {/*                 <Header transparent iosBarStyle="light-content" androidStatusBarColor="#000">
                    <Left>
                        <Button transparent onPress={this._onBackPress}>
                            <Icon style={{ color: '#fff' }} name="ios-arrow-back" type="Ionicons" />
                        </Button>
                    </Left>
                    <Body style={{ flex: 4, alignItems: 'center' }}>
                        <Text style={s.headerTitle}>
                            Make your profile
                        </Text>
                    </Body>
                    <Right />
                </Header> 
                // TODO keyboardavoiding view instead of this hacky solution
                */}

                <Content padder contentContainerStyle={{ alignItems: 'center', flex: 1 }} scrollEnabled={false} >

                    <Grid>
                        <Col size={1}>
                                <Icon onPress={this._onBackPress} style={{ color: '#fff', fontSize: 35, width: null }} name="ios-arrow-back" type="Ionicons" />
                        </Col>
                        <Col size={8} style={{justifyContent: 'center'}}>

                            <Card style={{ width: 300, height: 500, backgroundColor: 'black', borderRadius: 30, borderTopWidth: 7, borderBottomWidth: 7, borderRightWidth: 1, borderLeftWidth: 1 }} >

                                <TouchableOpacity onPress={this._myImageTapped}>
                                    <CardItem cardBody style={{ justifyContent: 'center', backgroundColor: 'black' }} >
                                        {
                                            isImageValid ?
                                                this._renderAnImage(item.pic_url)
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
                                        rowSpan={6}
                                        ellipsizeMode={'clip'}
                                        maxLength={140}
                                        style={s.oneLinerText}
                                    >
                                        {item.one_liner}
                                    </Textarea>
                                </CardItem>

                            </Card>

                            <Text>
                                {'\n'}
                            </Text>

                        </Col>

                        <Col size={1}/>
                    </Grid>

                    {
                        buttonDisabled ?
                            <Button light bordered block disabled={true} >
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
                </Content>
            </Container>
        )
    }
}

/*





<ListItem style={{ borderBottomWidth: 0 }}>
                            <Text style={{ textAlign: 'center', color: '#ffffff' }}>
                                {this.state.message}
                            </Text>
                        </ListItem>


                        <ListItem style={{ borderBottomWidth: 0, justifyContent: 'center', flex: 1 }}>

                        </ListItem>
                        <ListItem style={{ borderBottomWidth: 0 }}>


                        </ListItem>


*/