/**
 * Progress status of payment task </br>
 * 11:Opened for New Payment </br>
 * 12:Failed Approve for New Payment </br>
 * 13:Reverted Approve for New Payment </br>
 * 14:Sent Tx for New Payment </br>
 * 15:Confirm Tx for New Payment </br>
 * 16:Denied New Payment </br>
 * 17:Complete New Payment </br>
 * 18:Close New Payment </br>
 * 19:Failed New Payment </br>
 * 51:Opened for Cancel Payment </br>
 * 52:Failed Approve for Cancel Payment </br>
 * 53:Failed Approve for Cancel Payment </br>
 * 54:Sent Tx for Cancel Payment </br>
 * 55:Confirm Tx for Cancel Payment </br>
 * 56:Denied Cancel Payment </br>
 * 57:Complete Cancel Payment </br>
 * 58:Close Cancel Payment </br>
 * 59:Failed Cancel Payment </br>
 */
export enum LoyaltyPaymentTaskStatus {
    NULL = 0,
    OPENED_NEW = 11,
    APPROVED_NEW_FAILED_TX = 12,
    APPROVED_NEW_REVERTED_TX = 13,
    APPROVED_NEW_SENT_TX = 14,
    APPROVED_NEW_CONFIRMED_TX = 15,
    DENIED_NEW = 16,
    REPLY_COMPLETED_NEW = 17,
    CLOSED_NEW = 18,
    FAILED_NEW = 19,
    OPENED_CANCEL = 51,
    APPROVED_CANCEL_FAILED_TX = 52,
    APPROVED_CANCEL_REVERTED_TX = 53,
    APPROVED_CANCEL_SENT_TX = 54,
    APPROVED_CANCEL_CONFIRMED_TX = 55,
    DENIED_CANCEL = 56,
    REPLY_COMPLETED_CANCEL = 57,
    CLOSED_CANCEL = 58,
    FAILED_CANCEL = 59,
}

/**
 * Task progress status </br>
 * 11:Opened Task </br>
 * 12:Failed Tx </br>
 * 13:Reverted Tx </br>
 * 14:Sent Tx </br>
 * 15:Denied </br>
 * 16:Completed </br>
 * 70:Timeout </br>
 */
export enum ShopTaskStatus {
    NULL = 0,
    OPENED = 11,
    FAILED_TX = 12,
    REVERTED_TX = 13,
    SENT_TX = 14,
    DENIED = 15,
    COMPLETED = 16,
    TIMEOUT = 70,
}

/**
 * ResultCode</br>
 */
export enum ResultCode {
    "CODE0000" = 0,
    "CODE1000" = 1000,
    "CODE1001" = 1001,
    "CODE1002" = 1002,
    "CODE1003" = 1003,
    "CODE1010" = 1010,
    "CODE1020" = 1020,
    "CODE1030" = 1030,
    "CODE1031" = 1031,
    "CODE1050" = 1050,
    "CODE1051" = 1051,
    "CODE1052" = 1052,
    "CODE1053" = 1053,
    "CODE1054" = 1054,
    "CODE1160" = 1160,
    "CODE1161" = 1161,
    "CODE1162" = 1162,
    "CODE1163" = 1163,
    "CODE1164" = 1164,
    "CODE1170" = 1170,
    "CODE1171" = 1171,
    "CODE1172" = 1172,
    "CODE1173" = 1173,
    "CODE1174" = 1174,
    "CODE1200" = 1200,
    "CODE1201" = 1201,
    "CODE1202" = 1202,
    "CODE1211" = 1211,
    "CODE1220" = 1220,
    "CODE1221" = 1221,
    "CODE1222" = 1222,
    "CODE1501" = 1501,
    "CODE1502" = 1502,
    "CODE1503" = 1503,
    "CODE1505" = 1505,
    "CODE1506" = 1506,
    "CODE1510" = 1510,
    "CODE1511" = 1511,
    "CODE1512" = 1512,
    "CODE1513" = 1513,
    "CODE1514" = 1514,
    "CODE1520" = 1520,
    "CODE1521" = 1521,
    "CODE1530" = 1530,
    "CODE1531" = 1531,
    "CODE1532" = 1532,
    "CODE1533" = 1533,
    "CODE1534" = 1534,
    "CODE1711" = 1711,
    "CODE1712" = 1712,
    "CODE1714" = 1714,
    "CODE1715" = 1715,
    "CODE1716" = 1716,
    "CODE1717" = 1717,
    "CODE1718" = 1718,
    "CODE2001" = 2001,
    "CODE2002" = 2002,
    "CODE2003" = 2003,
    "CODE2004" = 2004,
    "CODE2005" = 2005,
    "CODE2006" = 2006,
    "CODE2007" = 2007,
    "CODE2008" = 2008,
    "CODE2020" = 2020,
    "CODE2022" = 2022,
    "CODE2024" = 2024,
    "CODE2025" = 2025,
    "CODE2026" = 2026,
    "CODE2027" = 2027,
    "CODE2028" = 2028,
    "CODE2029" = 2029,
    "CODE2030" = 2030,
    "CODE2033" = 2033,
    "CODE2040" = 2040,
    "CODE3001" = 3001,
    "CODE3072" = 3072,
    "CODE4000" = 4000,
    "CODE5000" = 5000,
    "CODE6000" = 6000,
    "CODE7000" = 7000,
}
