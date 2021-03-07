import React from 'react';
import { Alert, View, AsyncStorage, SectionList, Linking, StyleSheet, Image } from 'react-native';
import { Body, Grid, Row, Col, ListItem, Text, Right, Left, Container, Header, Content, Title, Button, StyleProvider, Card, CardItem, Icon, ActionSheet } from 'native-base';

import { NavigationEvents } from 'react-navigation';

import { keys } from '../../keys'

const s = StyleSheet.create({
    button: {
        alignSelf: 'center'
    },
    icon: {
        width: 50,
        height: 50,
        color: 'white'
    },
    headerTitle: {
        color: '#E8E8E8',
        //fontSize: 22
    },
    text: {
        color: 'white',
        alignSelf: 'center'
    }
})

export default class TutorialScreen extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return (

            <Container style={{ backgroundColor: 'black' }}>
                <NavigationEvents onWillFocus={this._renderUserInfo} />

                <Header transparent iosBarStyle="light-content" androidStatusBarColor="#000" >
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.goBack()}>
                            <Icon style={{ color: '#fff' }} name="ios-arrow-back" type="Ionicons" />
                        </Button>
                    </Left>
                    <Body style={{ flex: 4, alignItems: 'center' }}>
                        <Text style={s.headerTitle}>
                            How Room Works
                        </Text>
                    </Body>
                    <Right />
                </Header>

                <Content padder >
                    <Grid>
                        <Row>
                            <Col size={1}>
                                <Icon name='cursor-default-click' type='MaterialCommunityIcons' style={s.icon} />
                            </Col>
                            <Col size={3}>
                                <Text style={s.text}>
                                    double tap to send a wave
                            </Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col size={1}>
                                <Image source={require('../../assets/hisent.png')} style={s.icon} />
                            </Col>
                            <Col size={3}>
                                <Text style={s.text}>
                                    means you sent a wave
                            </Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col size={1}>
                                <Image source={require('../../assets/higot.png')} style={s.icon} />
                            </Col>
                            <Col size={3}>
                                <Text style={s.text}>
                                    means you got a wave
                            </Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col size={1}>
                                <Image source={require('../../assets/hihi.png')} style={s.icon} />
                            </Col>
                            <Col size={3}>
                                <Text style={s.text}>
                                    means you both waved
                                </Text>
                            </Col>
                        </Row>
                    </Grid>

                </Content>
            </Container>
        )
    }
}