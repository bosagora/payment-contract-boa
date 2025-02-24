import { Tspec } from "tspec";
import { ResultCode } from "./types";

export type HistoryApiSpec = Tspec.DefineApiSpec<{
    tags: ["History"];
    paths: {
        "/v1/token/main/history/{account}": {
            get: {
                summary: "Provider the history of token transfers for the account in the main chain";
                path: {
                    /**
                     * Wallet address of the provider
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    account: string;
                };
                query: {
                    /**
                     * Current Page Number
                     * @example 1
                     */
                    pageNumber: number;
                    /**
                     * Number of items per page
                     * @example 10
                     */
                    pageSize: number;
                };
                responses: {
                    200: {
                        /**
                         * Result Code
                         * @example 0
                         */
                        code: ResultCode;
                        data: {
                            /**
                             * Wallet address of the sender
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            from: string;
                            /**
                             * Wallet address of the receiver
                             * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                             */
                            to: string;
                            /**
                             * Transferred amount
                             * @example "10000000000000000000000000"
                             */
                            value: string;
                            /**
                             * Timestamp of block
                             * @example "1722945138"
                             */
                            blockTimestamp: string;
                        }[];
                        error?: {
                            /**
                             * Error Message
                             * @example "Failed to check the validity of parameters"
                             */
                            message: string;
                        };
                    };
                };
            };
        };
        "/v1/token/side/history/{account}": {
            post: {
                summary: "Provider the history of token transfers for the account in the side chain";
                path: {
                    /**
                     * Wallet address of the provider
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    account: string;
                };
                query: {
                    /**
                     * Current Page Number
                     * @example 1
                     */
                    pageNumber: number;
                    /**
                     * Number of items per page
                     * @example 10
                     */
                    pageSize: number;
                };
                responses: {
                    200: {
                        /**
                         * Result Code
                         * @example 0
                         */
                        code: ResultCode;
                        data: {
                            /**
                             * Wallet address of the sender
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            from: string;
                            /**
                             * Wallet address of the receiver
                             * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                             */
                            to: string;
                            /**
                             * Transferred amount
                             * @example "10000000000000000000000000"
                             */
                            value: string;
                            /**
                             * Timestamp of block
                             * @example "16745119473"
                             */
                            blockTimestamp: string;
                        }[];
                        error?: {
                            /**
                             * Error Message
                             * @example "Failed to check the validity of parameters"
                             */
                            message: string;
                        };
                    };
                };
            };
        };
        "/v1/ledger/history/account/{account}": {
            get: {
                summary: "Provide a history for the account";
                path: {
                    /**
                     * Wallet address of the provider
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    account: string;
                };
                query: {
                    /**
                     * Current Page Number
                     * @example 1
                     */
                    pageNumber: number;
                    /**
                     * Number of items per page
                     * @example 10
                     */
                    pageSize: number;
                    /**
                     * Filter
                     * @example "1,2"
                     */
                    actions: string;
                };
                responses: {
                    200: {
                        /**
                         * Result Code
                         * @example 0
                         */
                        code: ResultCode;
                        data: {
                            pageInfo: {
                                /**
                                 * The Number of Items
                                 * @example 3
                                 */
                                totalCount: number;
                                /**
                                 * The Number of Pages
                                 * @example 1
                                 */
                                totalPages: number;
                            };
                            items: {
                                /**
                                 * Wallet address of the provider
                                 * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                                 */
                                account: string;
                                /**
                                 * Reason the item was created
                                 * @example 1
                                 */
                                action: string;
                                /**
                                 * Is Cancel Payment?
                                 * @example false
                                 */
                                cancel: boolean;
                                /**
                                 * Point Amount
                                 * @example "5000000000000000000000000"
                                 */
                                amountPoint: string;
                                /**
                                 * Token Amount
                                 * @example "0"
                                 */
                                amountToken: string;
                                /**
                                 * Value of Used Amount
                                 * @example "5000000000000000000000000"
                                 */
                                amountValue: string;
                                /**
                                 * Fee Point
                                 * @example 0"
                                 */
                                feePoint: string;
                                /**
                                 * Fee Token
                                 * @example 0"
                                 */
                                feeToken: string;
                                /**
                                 * Value of Fee
                                 * @example 0"
                                 */
                                feeValue: string;
                                /**
                                 * Balance of point
                                 * @example "10000000000000000000000000"
                                 */
                                balancePoint: string;
                                /**
                                 * Balance of token
                                 * @example "100000000000000000000000"
                                 */
                                balanceToken: string;
                                /**
                                 * ID of Purchase
                                 * @example "P00000002200843"
                                 */
                                purchaseId: string;
                                /**
                                 * ID of Payment
                                 * @example "0x0000000000000000000000000000000000000000000000000000000000000000"
                                 */
                                paymentId: string;
                                /**
                                 * ID of Shop
                                 * @example "0x00012a23595cf31762a61502546e8b9f947baf3bd55040d9bd535f8afdbff409"
                                 */
                                shopId: string;
                                /**
                                 * Block Number
                                 * @example "559"
                                 */
                                blockNumber: string;
                                /**
                                 * Block TimeStamp
                                 * @example "1722945138"
                                 */
                                blockTimestamp: string;
                                /**
                                 * Transaction Hash
                                 * @example "0xbf7a697d5047973737cd255b49c521c520fc82c21459bff55e3499acb54e6f63"
                                 */
                                transactionHash: string;
                            }[];
                        };
                        error?: {
                            /**
                             * Error Message
                             * @example "Failed to check the validity of parameters"
                             */
                            message: string;
                        };
                    };
                };
            };
        };
        "/v1/shop/history/{shopId}": {
            get: {
                summary: "Provide a history for the shop";
                path: {
                    /**
                     * ID of Shop
                     * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                     */
                    shopId: string;
                };
                query: {
                    /**
                     * Current Page Number
                     * @example 1
                     */
                    pageNumber: number;
                    /**
                     * Number of items per page
                     * @example 10
                     */
                    pageSize: number;
                    /**
                     * Filter
                     * @example "1,2"
                     */
                    actions: string;
                };
                responses: {
                    200: {
                        /**
                         * Result Code
                         * @example 0
                         */
                        code: ResultCode;
                        data: {
                            pageInfo: {
                                /**
                                 * The Number of Items
                                 * @example 3
                                 */
                                totalCount: number;
                                /**
                                 * The Number of Pages
                                 * @example 1
                                 */
                                totalPages: number;
                            };
                            items: {
                                /**
                                 * ID of Shop
                                 * @example "0x00012a23595cf31762a61502546e8b9f947baf3bd55040d9bd535f8afdbff409"
                                 */
                                shopId: string;
                                /**
                                 * Basic currency symbol of Shop
                                 * @example "krw"
                                 */
                                currency: string;
                                /**
                                 * Reason the item was created
                                 * @example 1
                                 */
                                action: string;
                                /**
                                 * Is Cancel Payment?
                                 * @example false
                                 */
                                cancel: boolean;
                                /**
                                 * Amount
                                 * @example "1000000000000000000000"
                                 */
                                increase: string;
                                /**
                                 * Provided Amount
                                 * @example "7000000000000000000000"
                                 */
                                providedAmount: string;
                                /**
                                 * Used Amount
                                 * @example "100000000000000000000"
                                 */
                                usedAmount: string;
                                /**
                                 * Refund Amount
                                 * @example "0"
                                 */
                                refundedAmount: string;
                                /**
                                 * ID of Purchase
                                 * @example "P172294893503200000"
                                 */
                                purchaseId: string;
                                /**
                                 * ID of Payment
                                 * @example null
                                 */
                                paymentId: string;
                                /**
                                 * Block Number
                                 * @example "771"
                                 */
                                blockNumber: string;
                                /**
                                 * Block TimeStamp
                                 * @example "1722948976"
                                 */
                                blockTimestamp: string;
                                /**
                                 * Transaction Hash
                                 * @example "0x17da663a07f3e6a70b6ca8d8a89debf97863687e6ec7effe454824cea9ee2059"
                                 */
                                transactionHash: string;
                            }[];
                        };
                        error?: {
                            /**
                             * Error Message
                             * @example "Failed to check the validity of parameters"
                             */
                            message: string;
                        };
                    };
                };
            };
        };
    };
}>;
