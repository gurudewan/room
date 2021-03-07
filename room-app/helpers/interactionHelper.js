import { AsyncStorage } from 'react-native'

export const findRewards = async (transaction) => {
  /*
      Accepts a transaction/receipt.
      Returns an array of related rewards.
  */
  let rewards = await AsyncStorage.getItem('rewards')
  let jsonRewards = JSON.parse(rewards)
  let results = jsonRewards.filter(checkID)
  // TODO here bug
  // !!

  return results

}

function checkID(reward) {
  return reward.merchantID == reward.rewardMerchantID // todo change the key based on dataplan
}

export async function updateLocalRoom(roomID, receiverID) {
  /*
    Called when a reward is activated locally.
    Accepts the _id and the expiry_time of the reward.
    Updates to show that reward has been activated/redeemed.
    So that this can be pushed to the server.
  */
  let rawRewards = await AsyncStorage.getItem('rewards')

  var rewards = JSON.parse(rawRewards)

  var theReward = null;
  
  for (var i = 0; i < rewards.length; i++) {
  
    if (rewards[i]._id["$oid"] === rewardID) {

      rewards[i].timestamp = timeStamp
      rewards[i].status = rewardStatus
      
      if (expiryTime != null) {
        rewards[i].expiry_time = expiryTime
      }
      if (discountCode != null) {
        console.log('updating the TYIGORNFJRINIK')
        rewards[i].discount_code = discountCode
      }
      
      theReward = rewards[i]
    }
  }

  await AsyncStorage.setItem('rewards', JSON.stringify(rewards))

  return theReward

}