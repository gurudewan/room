import React from 'react'

import { Content, Text} from 'native-base'
import { StyleSheet } from 'react-native'

import _ from "lodash";

const s = StyleSheet.create({

    smallText: { textAlign: 'center', fontSize: 16, color: 'white' },
    bigText: { textAlign: 'center', fontSize: 18, color: 'white' },
    emoji: { textAlign: 'center', fontSize: 35}
});

export default class EmptyIcon extends React.Component {
    /*
      Use this to display an empty page

      PROPS:
        - iconName = the iconName to use (from https://unicodey.com/emoji-data/table.htm)
        - message = the message to display to the user
        - subMessage = the sub-message to display to the user
        - color = {  } # TODO make this a prop
    */
    render() {

        return (
            <Content padder contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', flex: 1 }} scrollEnabled={false}>
                <Text style={s.bigText}>{this.props.message}</Text>
                <Text>{'\n'}</Text>
                <Text style={s.emoji}>{_.sample(['😢', '😲', '😬', '😰', '🧐', '😔', '😑'])}</Text>
                <Text>{'\n'}</Text>
                <Text style={s.smallText}>{this.props.subMessage}</Text>
            </Content>
        )
    }
}