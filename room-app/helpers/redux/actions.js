
import { useSelector } from 'react-redux'

export const FETCH_RECEIPTS_PENDING = 'FETCH_RECEIPTS_PENDING'
export const FETCH_RECEIPTS_SUCCESS = 'FETCH_RECEIPTS_SUCCESS'
export const FETCH_RECEIPTS_ERROR = 'FETCH_RECEIPTS_ERROR'


//export const getReceipts = useSelector(state => state.receipts)

export const fetchReceiptsPending = receipts => ({
    type: SET_RECEIPTS
  })

export const fetchReceiptsSuccess = receipts => ({
    type: SET_RECEIPTS,
    payload: receipts
  })

export const fetchReceiptsError = error => ({
    type: SET_RECEIPTS,
    error: error
  })