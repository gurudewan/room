import { FETCH_RECEIPTS_PENDING, FETCH_RECEIPTS_SUCCESS, FETCH_RECEIPTS_ERROR } from './actions'

const initialState = {
    itemList: [],

    // receipts
    receipts: [],
    groupedReceipts: [],
    displayReceipts: [],
    receiptDetail: {},

    // rewards
    rewards: [],
    rewardDetail: {},

    // cards
    cards: [],
    plaidLinkToken: '',

    // user
    userInfo: {},

    // available here
    merchants: [],

    // state of rendering
    isLoading: false,
    showLoading: true,
    isErrored: false,

}

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_RECEIPTS_PENDING:
        // case FETCH_XX_PENDING:
            return {
                ...state,
                isLoading: true,
                showLoading: false,
            }
        case FETCH_RECEIPTS_SUCCESS:
            return {
                ...state,
                receipts: action.payload,
                isLoading: false,
                showLoading: false
            }
        case FETCH_RECEIPTS_ERROR:
            return {
                ...state,
                receipts: action.error,
                isLoading: false,
                showLoading: false
            }

        default:
            return state
    }
}

export default rootReducer