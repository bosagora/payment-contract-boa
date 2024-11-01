import { Tspec } from "tspec";
import { ResultCode, ShopTaskStatus } from "./types";

export type ShopApiSpec = Tspec.DefineApiSpec<{
    tags: ["Shop"];
    paths: {
        "/v1/shop/info/{shopId}": {
            get: {
                summary: "Provide shop information";
                path: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
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
                             * ID of Shop
                             * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                             */
                            shopId: string;
                            /**
                             * Name of Shop
                             * @example "Coffee Nine"
                             */
                            name: string;
                            /**
                             * Basic currency symbol of Shop
                             * @example "php"
                             */
                            currency: string;
                            /**
                             * Active status of Shop ( 0: None, 1: ACTIVE, 2: INACTIVE )
                             * @example 1
                             */
                            status: number;
                            /**
                             * Wallet address of the shop owner
                             * @example "0xafFe745418Ad24c272175e5B58610A8a35e2EcDa"
                             */
                            account: string;
                            /**
                             * Wallet address that authorizes cancellation on behalf of the shop owner
                             * @example "0xD10ADf251463A260242c216c8c7D3e736eBdB398"
                             */
                            delegator: string;
                            /**
                             * Amount of provided
                             * @example "1000000000000000000000"
                             */
                            providedAmount: string;
                            /**
                             * Amount of used
                             * @example "2000000000000000000000"
                             */
                            usedAmount: string;
                            /**
                             * Amount of refunded
                             * @example "0"
                             */
                            refundedAmount: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
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
        "/v1/shop/list": {
            get: {
                summary: "Provide all shop information";
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
                             * ID of Shop
                             * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                             */
                            shopId: string;
                            /**
                             * Name of Shop
                             * @example "Coffee Nine"
                             */
                            name: string;
                            /**
                             * Basic currency symbol of Shop
                             * @example "php"
                             */
                            currency: string;
                            /**
                             * Active status of Shop ( 0: None, 1: ACTIVE, 2: INACTIVE )
                             * @example 1
                             */
                            status: number;
                            /**
                             * Wallet address of the shop owner
                             * @example "0xafFe745418Ad24c272175e5B58610A8a35e2EcDa"
                             */
                            account: string;
                            /**
                             * Amount of provided
                             * @example "1000000000000000000000"
                             */
                            providedAmount: string;
                            /**
                             * Amount of used
                             * @example "2000000000000000000000"
                             */
                            usedAmount: string;
                            /**
                             * Amount of refunded
                             * @example "0"
                             */
                            refundedAmount: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
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
        "/v1/shop/nonce/{account}": {
            get: {
                summary: "Provide the nonce corresponding to the wallet address of the shop owner";
                description: "The nonce is required for signing.</br>This is to produce a signature result that is not the same, including the ever-changing nonce in the original data to be signed.</br>The nonce is recorded in the contract, which increases the value of the nonce by 1 when the signature is used.";
                path: {
                    /**
                     * Address of wallet
                     * @example "0xafFe745418Ad24c272175e5B58610A8a35e2EcDa"
                     */
                    account: string;
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
                             * Address of wallet
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            account: string;

                            /**
                             * Nonce for address of wallet in Shop Contract
                             * @example "45"
                             */
                            nonce: string;
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
        "/v1/shop/refundable/{shopId}": {
            get: {
                summary: "Provide refundable amount";
                path: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
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
                             * Basic currency amount equivalent to refundable amount
                             * @example "2000000000000000000000"
                             */
                            refundableAmount: string;
                            /**
                             * Token amount equivalent to refundable amount
                             * @example "500000000000000000000"
                             */
                            refundableToken: string;
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
        "/v1/shop/update/create": {
            post: {
                summary: "Start changing the name and rate symbol of the shop. Completed after successful approval of the shop owner";
                body: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
                    /**
                     * Name of Shop
                     * @example "Coffee Nine"
                     */
                    name: string;
                    /**
                     * Basic currency symbol of Shop
                     * @example "php"
                     */
                    currency: string;
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
                             * Name of Shop
                             * @example "Coffee Nine"
                             */
                            name: string;
                            /**
                             * Basic currency symbol of Shop
                             * @example "php"
                             */
                            currency: string;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Task progress status ( 11: OPENED, 12: FAILED_TX, 13: REVERTED_TX, 14: SENT_TX, 15: DENIED, 16: COMPLETED )
                             * @example 11
                             */
                            taskStatus: ShopTaskStatus;
                            /**
                             * Task start time
                             * @example 1722948039
                             */
                            timestamp: number;
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
        "/v1/shop/update/approval": {
            post: {
                summary: "Approve changing the name and rate symbol of the shop.";
                body: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
                    /**
                     * Name of Shop
                     * @example "Coffee Nine"
                     */
                    name: string;
                    /**
                     * Basic currency symbol of Shop
                     * @example "php"
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
                             * Name of Shop
                             * @example "Coffee Nine"
                             */
                            name: string;
                            /**
                             * Basic currency symbol of Shop
                             * @example "php"
                             */
                            currency: string;
                            /**
                             * Task progress status ( 11: OPENED, 12: FAILED_TX, 13: REVERTED_TX, 14: SENT_TX, 15: DENIED, 16: COMPLETED )
                             * @example 11
                             */
                            taskStatus: ShopTaskStatus;
                            /**
                             * Task start time
                             * @example 1722948039
                             */
                            timestamp: number;
                            /**
                             * Hash of transaction
                             * @example "0xe5502185d39057bd82e6dde675821b87313570df77d3e23d8e5712bd5f3fa6b6"
                             */
                            txHash?: string;
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
        "/v1/shop/status/create": {
            post: {
                summary: "Start changing the activation of the shop. Completed after successful approval of the shop owner";
                body: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
                    /**
                     * Active status of Shop ( 0: None, 1: ACTIVE, 2: INACTIVE )
                     * @example 1
                     */
                    status: string;
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
                             * Active status of Shop ( 0: None, 1: ACTIVE, 2: INACTIVE )
                             * @example 1
                             */
                            status: number;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Task progress status ( 11: OPENED, 12: FAILED_TX, 13: REVERTED_TX, 14: SENT_TX, 15: DENIED, 16: COMPLETED )
                             * @example 11
                             */
                            taskStatus: ShopTaskStatus;
                            /**
                             * Task start time
                             * @example 1722948039
                             */
                            timestamp: number;
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
        "/v1/shop/status/approval": {
            post: {
                summary: "Approve changing the activation of the shop.";
                body: {
                    /**
                     * ID of Task
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    taskId: string;
                    /**
                     * If this value is true, the change is accepted; if false, the change is rejected.
                     * @example true
                     */
                    approval: boolean;
                    /**
                     * Signature of shop owner
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
                             * Active status of Shop ( 0: None, 1: ACTIVE, 2: INACTIVE )
                             * @example 1
                             */
                            status: number;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Task progress status ( 11: OPENED, 12: FAILED_TX, 13: REVERTED_TX, 14: SENT_TX, 15: DENIED, 16: COMPLETED )
                             * @example 11
                             */
                            taskStatus: ShopTaskStatus;
                            /**
                             * Task start time
                             * @example 1722948039
                             */
                            timestamp: number;
                            /**
                             * Hash of transaction
                             * @example "0xe5502185d39057bd82e6dde675821b87313570df77d3e23d8e5712bd5f3fa6b6"
                             */
                            txHash?: string;
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
        "/v1/shop/task": {
            get: {
                summary: "provide details of the task.";
                body: {
                    /**
                     * ID of Task
                     * @example "0x6d335fe57648a92b6024be84fd4f265fb497366a916f5a28a5f2a04e523d9c7b"
                     */
                    taskId: string;
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
                             * ID of Task
                             * @example "0x6d335fe57648a92b6024be84fd4f265fb497366a916f5a28a5f2a04e523d9c7b"
                             */
                            taskId: string;
                            /**
                             * Type of Task ("shop_add", "shop_update", "shop_status" )
                             * @example "shop_update"
                             */
                            type: string;
                            /**
                             * ID of Shop
                             * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                             */
                            shopId: string;
                            /**
                             * Name of Shop
                             * @example "Coffee Nine"
                             */
                            name: string;
                            /**
                             * Basic currency symbol of Shop
                             * @example "php"
                             */
                            currency: string;
                            /**
                             * Active status of Shop ( 0: None, 1: ACTIVE, 2: INACTIVE )
                             * @example 1
                             */
                            status: number;
                            /**
                             * ID of terminal
                             * @example "KIOSK0001"
                             */
                            terminalId: string;
                            /**
                             * Task progress status ( 11: OPENED, 12: FAILED_TX, 13: REVERTED_TX, 14: SENT_TX, 15: DENIED, 16: COMPLETED )
                             * @example 11
                             */
                            taskStatus: ShopTaskStatus;
                            /**
                             * Wallet address of the shop owner
                             * @example "0xafFe745418Ad24c272175e5B58610A8a35e2EcDa"
                             */
                            account: string;
                            /**
                             * Task start time
                             * @example 1722948039
                             */
                            timestamp: number;
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
        "/v1/shop/refund": {
            post: {
                summary: "";
                body: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
                    /**
                     * Amount for refund (info. decimals are 18)
                     * @example "100000000000000000000000"
                     */
                    amount: string;
                    /**
                     * Address of wallet
                     * @example "0xafFe745418Ad24c272175e5B58610A8a35e2EcDa"
                     */
                    account: string;
                    /**
                     * Signature of shop owner
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
                             * Hash of transaction
                             * @example "0x3798157a3f32c0ed7692f240eb83f3a3c2f6077c5ad7acf7a9a54d426d63632e"
                             */
                            txHash: string;
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
        "/v1/shop/settlement/manager/set": {
            post: {
                summary: "Set settlement manager of the shop(shopId)";
                body: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
                    /**
                     * Address of wallet
                     * @example "0xafFe745418Ad24c272175e5B58610A8a35e2EcDa"
                     */
                    account: string;
                    /**
                     * ID of settlement manager
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    managerId: string;
                    /**
                     * Signature of shop owner
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
                             * Hash of transaction
                             * @example "0x3798157a3f32c0ed7692f240eb83f3a3c2f6077c5ad7acf7a9a54d426d63632e"
                             */
                            txHash: string;
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
        "/v1/shop/settlement/manager/remove": {
            post: {
                summary: "Remove settlement manager of the shop(shopId)";
                body: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
                    /**
                     * Address of wallet
                     * @example "0xafFe745418Ad24c272175e5B58610A8a35e2EcDa"
                     */
                    account: string;
                    /**
                     * Signature of shop owner
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
                             * Hash of transaction
                             * @example "0x3798157a3f32c0ed7692f240eb83f3a3c2f6077c5ad7acf7a9a54d426d63632e"
                             */
                            txHash: string;
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
        "/v1/shop/settlement/manager/get/{shopId}": {
            get: {
                summary: "Provide settlement manager";
                path: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
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
                             * ID of Shop
                             * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                             */
                            shopId: string;
                            /**
                             * ID of Settlement Manager
                             * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                             */
                            managerId: string;
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
        "/v1/shop/settlement/client/length/{shopId}": {
            get: {
                summary: "Provide number of registered shops";
                path: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
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
                             * ID of Shop
                             * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                             */
                            shopId: string;
                            /**
                             * Number of registered shop
                             * @example 10
                             */
                            length: number;
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
        "/v1/shop/settlement/client/list/{shopId}": {
            get: {
                summary: "Provide registered shops";
                path: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
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
                             * ID of Shop
                             * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                             */
                            shopId: string;
                            /**
                             * registered shops
                             * @example 10
                             */
                            clients: string[];
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
        "/v1/shop/settlement/collect": {
            post: {
                summary: "Collect settlement amount";
                body: {
                    /**
                     * ID of Shop
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    shopId: string;
                    /**
                     * Address of wallet
                     * @example "0xafFe745418Ad24c272175e5B58610A8a35e2EcDa"
                     */
                    account: string;
                    /**
                     * Address of wallet
                     * @example "0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874,0x0001be96d74202df38fd21462ffcef10dfe0fcbd7caa3947689a3903e8b6b874"
                     */
                    clients: string;
                    /**
                     * Signature of shop owner
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
                             * Hash of transaction
                             * @example "0x3798157a3f32c0ed7692f240eb83f3a3c2f6077c5ad7acf7a9a54d426d63632e"
                             */
                            txHash: string;
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
