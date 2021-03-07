import * as SecureStore from 'expo-secure-store';

export async function setTokens(tokens) {
    // accepts a dictionary of tokens
    // sets them into Secure Storage

    /* tokens dict must be of the form: (but can include only some of these)
    tokens = {
        'auth_token': '',
        'access_token': '',
        'refresh_token': '',
    }
    */

    var str_tokens = JSON.stringify(tokens)
    console.log('----setter is setting the tokens:')

    console.log(tokens)
    console.log(typeof tokens)

    console.log('------------------------------')
    try {
        await SecureStore.setItemAsync('tokens', str_tokens)

    } catch (error) {
        console.error(`setTokens failed with : ${error}`)
    }

    return tokens
}

export async function deleteTokens() {
    // delete all the tokens
    try {
        await SecureStore.deleteItemAsync('tokens')

    } catch (error) {
        console.error(`deleteTokens failed with : ${error}`)
        return null
    }
}

async function getAllTokens() {
    // get all the tokens
    try {
        const str_tokens = await SecureStore.getItemAsync('tokens')

        const tokens = await JSON.parse(str_tokens)

        return tokens

    } catch (error) {
        if (error instanceof TypeError) {
            console.log("The requested token is null")
            return null
        }
        else {
            console.error(`getAllTokens failed with : ${error}`)
            return
        }
    }
}


export async function getToken(type) {
    // takes in a type = ("access" | "refresh" | "auth")
    // and returns the desired token
    try {
        token = null
        const tokens = await getAllTokens()

        switch(type) {
            case "access":
                token = await tokens['access_token']
                break
            case "refresh":
                token = await tokens['refresh_token']
                break
            case "auth":
                token = await tokens['auth_token']
                break

            default:
                console.log("Invalid type of token requested")
                break
        }
        
        return token


    } catch (error) {
        
        if (error instanceof TypeError) {
            console.log("The " + type + " token is null")
            return null
        }
        console.error(`getToken failed with : ${error}`)
        return null
    }
}