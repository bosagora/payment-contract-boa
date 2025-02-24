import { Tspec } from "tspec";
import { LoyaltyPaymentTaskStatus, ResultCode } from "./types";

export type PaymentApiSpec = Tspec.DefineApiSpec<{
    tags: ["Payment"];
    paths: {
        "/v1/payment/account/temporary": {
            post: {
                summary: "Provide a temporary address for payment";
                body: {
                    /**
                     * Wallet address of user
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    account: string;
                    /**
                     * Signature of user wallet
                     * @example "0x020d671b80fbd20466d8cb65cef79a24e3bca3fdf82e9dd89d78e7a4c4c045bd72944c20bb1d839e76ee6bb69fed61f64376c37799598b40b8c49148f3cdd88a1b"
                     */
                    signature: string;
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
                             * Temporary wallet address for payment
                             * @example "0xfFFffffF603fe1D97658fFeF5b590B4000000000"
                             */
                            temporaryAccount: string;
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
        "/v1/payment/info": {
            get: {
                summary: "Check the user's balance for the amount required to start the payment";
                query: {
                    /**
                     * Wallet address of user or temporary wallet address of user
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    account: string;
                    /**
                     * Amount to be used for payment (info. decimals are 18)
                     * @example "100000000000000000000000"
                     */
                    amount: string;
                    /**
                     * Currency symbol for amount to be used for payment
                     * @example "krw"
                     */
                    currency: string;
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
                             * Wallet address for payment
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            account: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * User's point balance (info. decimals are 18)
                             * @example "100000000000000000000000"
                             */
                            balance: string;
                            /**
                             * User's point balance converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000000"
                             */
                            balanceValue: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * Fee Rate
                             * @example "5"
                             */
                            feeRate: number;
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
        "/v1/payment/new/open": {
            post: {
                summary: "Open a new payment";
                body: {
                    /**
                     * ID of Purchase
                     * @example "P00000000000203"
                     */
                    purchaseId: string;
                    /**
                     * Amount to be used for payment (info. decimals are 18)
                     * @example "100000000000000000000"
                     */
                    amount: string;
                    /**
                     * Currency symbol for amount to be used for payment
                     * @example "krw"
                     */
                    currency: string;
                    /**
                     * ID of shop
                     * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                     */
                    shopId: string;
                    /**
                     * Temporary wallet address of user
                     * @example "0xfFfFFfFF5D8F0dB23fE79F2085C4069B00000000"
                     */
                    account: string;
                    /**
                     * ID of terminal
                     * @example "KIOSK0001"
                     */
                    terminalId?: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v1/payment/new/close": {
            post: {
                summary: "Close a new payment";
                body: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
                    /**
                     * If this value is true, the payment will be processed normally, and if this value is false, all processes that have been processed so far will be canceled.
                     * @example true
                     */
                    confirm: boolean;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v1/payment/new/approval": {
            post: {
                summary: "Approve a new payment";
                body: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
                    /**
                     * If this value is true, the payment is accepted; if false, the payment is rejected.
                     * @example true
                     */
                    approval: boolean;
                    /**
                     * Signature of user wallet
                     * @example "0x020d671b80fbd20466d8cb65cef79a24e3bca3fdf82e9dd89d78e7a4c4c045bd72944c20bb1d839e76ee6bb69fed61f64376c37799598b40b8c49148f3cdd88a1b"
                     */
                    signature: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v1/payment/item": {
            get: {
                summary: "Provider a payment information";
                query: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v1/payment/cancel/open": {
            post: {
                summary: "Open a cancel payment";
                body: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
                    /**
                     * ID of terminal
                     * @example "KIOSK0001"
                     */
                    terminalId?: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v1/payment/cancel/close": {
            post: {
                summary: "Close a cancel payment";
                body: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
                    /**
                     * If this value is true, the cancel payment will be processed normally, and if this value is false, all processes that have been processed so far will be canceled.
                     * @example true
                     */
                    confirm: boolean;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v1/payment/cancel/approval": {
            post: {
                summary: "Approve a cancel payment";
                body: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
                    /**
                     * If this value is true, the payment is accepted; if false, the payment is rejected.
                     * @example true
                     */
                    approval: boolean;
                    /**
                     * Signature of user wallet
                     * @example "0x020d671b80fbd20466d8cb65cef79a24e3bca3fdf82e9dd89d78e7a4c4c045bd72944c20bb1d839e76ee6bb69fed61f64376c37799598b40b8c49148f3cdd88a1b"
                     */
                    signature: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v2/payment/account/temporary": {
            post: {
                summary: "Provide a temporary address for payment";
                body: {
                    /**
                     * Wallet address of user
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    account: string;
                    /**
                     * Signature of user wallet
                     * @example "0x020d671b80fbd20466d8cb65cef79a24e3bca3fdf82e9dd89d78e7a4c4c045bd72944c20bb1d839e76ee6bb69fed61f64376c37799598b40b8c49148f3cdd88a1b"
                     */
                    signature: string;
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
                             * Temporary wallet address for payment
                             * @example "0xfFFffffF603fe1D97658fFeF5b590B4000000000"
                             */
                            temporaryAccount: string;
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
        "/v2/payment/info": {
            get: {
                summary: "Check the user's balance for the amount required to start the payment";
                query: {
                    /**
                     * Wallet address of user or temporary wallet address of user
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    account: string;
                    /**
                     * Amount to be used for payment (info. decimals are 18)
                     * @example "100000000000000000000000"
                     */
                    amount: string;
                    /**
                     * Currency symbol for amount to be used for payment
                     * @example "krw"
                     */
                    currency: string;
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
                             * Wallet address for payment
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            account: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * User's point balance (info. decimals are 18)
                             * @example "100000000000000000000000"
                             */
                            balance: string;
                            /**
                             * User's point balance converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000000"
                             */
                            balanceValue: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * Fee Rate
                             * @example "5"
                             */
                            feeRate: number;
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
        "/v2/payment/new/open": {
            post: {
                summary: "Open a new payment";
                body: {
                    /**
                     * ID of Purchase
                     * @example "P00000000000203"
                     */
                    purchaseId: string;
                    /**
                     * Amount to be used for payment (info. decimals are 18)
                     * @example "100000000000000000000"
                     */
                    amount: string;
                    /**
                     * Currency symbol for amount to be used for payment
                     * @example "krw"
                     */
                    currency: string;
                    /**
                     * ID of shop
                     * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                     */
                    shopId: string;
                    /**
                     * Temporary wallet address of user
                     * @example "0xfFfFFfFF5D8F0dB23fE79F2085C4069B00000000"
                     */
                    account: string;
                    /**
                     * ID of terminal
                     * @example "KIOSK0001"
                     */
                    terminalId: string;
                    /**
                     * Signature of agent wallet
                     * @example "0x020d671b80fbd20466d8cb65cef79a24e3bca3fdf82e9dd89d78e7a4c4c045bd72944c20bb1d839e76ee6bb69fed61f64376c37799598b40b8c49148f3cdd88a1b"
                     */
                    signature: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v2/payment/new/close": {
            post: {
                summary: "Close a new payment";
                body: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
                    /**
                     * If this value is true, the payment will be processed normally, and if this value is false, all processes that have been processed so far will be canceled.
                     * @example true
                     */
                    confirm: boolean;
                    /**
                     * Signature of agent wallet
                     * @example "0x020d671b80fbd20466d8cb65cef79a24e3bca3fdf82e9dd89d78e7a4c4c045bd72944c20bb1d839e76ee6bb69fed61f64376c37799598b40b8c49148f3cdd88a1b"
                     */
                    signature: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v2/payment/new/approval": {
            post: {
                summary: "Approve a new payment";
                body: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
                    /**
                     * If this value is true, the payment is accepted; if false, the payment is rejected.
                     * @example true
                     */
                    approval: boolean;
                    /**
                     * Signature of user wallet
                     * @example "0x020d671b80fbd20466d8cb65cef79a24e3bca3fdf82e9dd89d78e7a4c4c045bd72944c20bb1d839e76ee6bb69fed61f64376c37799598b40b8c49148f3cdd88a1b"
                     */
                    signature: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v2/payment/item": {
            get: {
                summary: "Provider a payment information";
                query: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v2/payment/cancel/open": {
            post: {
                summary: "Open a cancel payment";
                body: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
                    /**
                     * ID of terminal
                     * @example "KIOSK0001"
                     */
                    terminalId: string;
                    /**
                     * Signature of agent wallet
                     * @example "0x020d671b80fbd20466d8cb65cef79a24e3bca3fdf82e9dd89d78e7a4c4c045bd72944c20bb1d839e76ee6bb69fed61f64376c37799598b40b8c49148f3cdd88a1b"
                     */
                    signature: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v2/payment/cancel/close": {
            post: {
                summary: "Close a cancel payment";
                body: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
                    /**
                     * If this value is true, the cancel payment will be processed normally, and if this value is false, all processes that have been processed so far will be canceled.
                     * @example true
                     */
                    confirm: boolean;
                    /**
                     * Signature of agent wallet
                     * @example "0x020d671b80fbd20466d8cb65cef79a24e3bca3fdf82e9dd89d78e7a4c4c045bd72944c20bb1d839e76ee6bb69fed61f64376c37799598b40b8c49148f3cdd88a1b"
                     */
                    signature: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * Amount of points to be paid (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidPoint: string;
                            /**
                             * Amount of points to be paid converted to payment currency (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            paidValue: string;
                            /**
                             * Fee (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feePoint: string;
                            /**
                             * Fee converted to payment currency (info. decimals are 18)
                             * @example "5000000000000000000"
                             */
                            feeValue: string;
                            /**
                             * Amount of points to be paid including fees (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalPoint: string;
                            /**
                             * Amount of points to be paid including fees converted to payment currency (info. decimals are 18)
                             * @example "105000000000000000000"
                             */
                            totalValue: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
        "/v2/payment/cancel/approval": {
            post: {
                summary: "Approve a cancel payment";
                body: {
                    /**
                     * ID of Payment
                     * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                     */
                    paymentId: string;
                    /**
                     * If this value is true, the payment is accepted; if false, the payment is rejected.
                     * @example true
                     */
                    approval: boolean;
                    /**
                     * Signature of user wallet
                     * @example "0x020d671b80fbd20466d8cb65cef79a24e3bca3fdf82e9dd89d78e7a4c4c045bd72944c20bb1d839e76ee6bb69fed61f64376c37799598b40b8c49148f3cdd88a1b"
                     */
                    signature: string;
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
                             * ID of Payment
                             * @example "0x2d9100c28be32e1a29e55b2ead66d472a6271627235778379657d08c9dc1d901"
                             */
                            paymentId: string;
                            /**
                             * ID of Purchase
                             * @example "P00000000000203"
                             */
                            purchaseId: string;
                            /**
                             * Amount to be used for payment (info. decimals are 18)
                             * @example "100000000000000000000"
                             */
                            amount: string;
                            /**
                             * Currency symbol for amount to be used for payment
                             * @example "krw"
                             */
                            currency: string;
                            /**
                             * ID of Shop
                             * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
                             */
                            shopId: string;
                            /**
                             * Wallet address for payment
                             * @example "0x5A3Fc8990417b3e6ddCdAE0E8039E798A609Ef84"
                             */
                            account: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Progress status of payment task
                             * @example 18
                             */
                            paymentStatus: LoyaltyPaymentTaskStatus;
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
