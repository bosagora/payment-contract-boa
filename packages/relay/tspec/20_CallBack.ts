import { Tspec } from "tspec";
import { LoyaltyPaymentTaskStatus, ResultCode } from "./types";

interface PaymentCallBackData {
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
     * ID of shop
     * @example "0x00011936a68f7c26797fa2ab64d444ea82c2fb1af36cdea6d4ff845da635f287"
     */
    shopId: string;
    /**
     * Wallet address of user
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
}

interface ShopCallBackData {
    /**
     * ID of Task
     * @example "0x6d335fe57648a92b6024be84fd4f265fb497366a916f5a28a5f2a04e523d9c7b"
     */
    taskId: string;
    /**
     * ID of Shop
     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
     */
    shopId: string;
    /**
     * New name to be changed of Shop
     * @example "Coffee Nine"
     */
    name: string;
    /**
     * New currency symbol to be changed of Shop
     * @example "krw"
     */
    currency: string;
    /**
     * Active status of Shop ( 0: None, 1: ACTIVE, 2: INACTIVE )
     * @example 1
     */
    status: number;
    /**
     * Wallet address of shop owner
     * @example "0xafFe745418Ad24c272175e5B58610A8a35e2EcDa"
     */
    account: string;
    /**
     * ID of terminal
     * @example "KIOSK0001"
     */
    terminalId: string;
}

interface TaskCallBackRequest {
    /**
     * Type of Task ( "pay_new", "pay_cancel", "shop_add", "shop_update", "shop_status" )
     * @example "pay_new"
     */
    type: string;
    /**
     * Result Code
     * @example 0
     */
    code: ResultCode;
    /**
     * Result Message
     * @example "Success"
     */
    message: string;
    /**
     * Result Data
     */
    data: PaymentCallBackData | ShopCallBackData;
}

export type CallbackApiSpec = Tspec.DefineApiSpec<{
    tags: ["Payment", "Shop", "External CallBack"];
    paths: {
        "/external/callback": {
            post: {
                summary: "Send payment and store tak processing status to the external domain";
                body: TaskCallBackRequest;
                responses: {
                    200: {};
                };
            };
        };
    };
}>;
