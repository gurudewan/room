import { Dimensions, StyleSheet } from 'react-native'

let { height, width } = Dimensions.get('window')

export default styler = StyleSheet.create({
    button: {
        width: width * 0.9,
        justifyContent: "center",
        alignItems: "center"
    },
  })