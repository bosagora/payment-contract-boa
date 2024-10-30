import { Tspec } from "tspec";
import { ResultCode } from "./types";

export type ProvisionApiSpec = Tspec.DefineApiSpec<{
    tags: ["Loyalty Point Provider"];
    paths: {
        "/v1/provision/balance/{provider}": {
            get: {
                summary: "Provide a point provider's assets";
                path: {
                    /**
                     * Wallet address of the provider
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    provider: string;
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
                             * Wallet address of the provider
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            provider: string;
                            providable: {
                                /**
                                 * Amount of tokens that can be provided (info. decimals are 18)
                                 * @example "100000000000000000000000"
                                 */
                                token: string;
                                /**
                                 * Amount of points corresponding to tokens that can be provided (info. decimals are 18)
                                 * @example "112108371800000000000000"
                                 */
                                point: string;
                            };
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
        "/v1/provision/register": {
            post: {
                summary: "Register the provider. To become a point provider, you must first deposit 50,000 tokens";
                body: {
                    /**
                     * Wallet address of the provider
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    provider: string;
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
                             * Wallet address of the provider
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            provider: string;
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
        "/v1/provision/send/account": {
            post: {
                summary: "Request the ability to provide points to the recipient's wallet address";
                body: {
                    /**
                     * Wallet address of the provider
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    provider: string;
                    /**
                     * Wallet address of the receiver
                     * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                     */
                    receiver: string;
                    /**
                     * Point amount to be provided
                     * @example "10000000000000000000000000"
                     */
                    amount: string;
                    /**
                     * Signature of provider or agent
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
                             * Wallet address of the provider
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            provider: string;
                            /**
                             * Wallet address of the receiver
                             * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                             */
                            receiver: string;
                            /**
                             * Point amount to be provided
                             * @example "10000000000000000000000000"
                             */
                            amount: string;
                            /**
                             * Hash of transaction
                             * @example "0xe5502185d39057bd82e6dde675821b87313570df77d3e23d8e5712bd5f3fa6b6"
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
        "/v1/provision/send/phoneHash": {
            post: {
                summary: "Request the ability to provide points to the recipient's phone number hash";
                body: {
                    /**
                     * Wallet address of the provider
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    provider: string;
                    /**
                     * Phone number hash of the receiver
                     * @example "0xF48F4BF6C8B5B285F0D9EB5D52623EE14B6F2B5980E87FAC89E4B968995FAE2B"
                     */
                    receiver: string;
                    /**
                     * Point amount to be provided
                     * @example "10000000000000000000000000"
                     */
                    amount: string;
                    /**
                     * Signature of provider or agent
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
                             * Wallet address of the provider
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            provider: string;
                            /**
                             * Phone number hash of the receiver
                             * @example "0xF48F4BF6C8B5B285F0D9EB5D52623EE14B6F2B5980E87FAC89E4B968995FAE2B"
                             */
                            receiver: string;
                            /**
                             * Point amount to be provided
                             * @example "10000000000000000000000000"
                             */
                            amount: string;
                            /**
                             * Hash of transaction
                             * @example "0xe5502185d39057bd82e6dde675821b87313570df77d3e23d8e5712bd5f3fa6b6"
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
        "/v1/provision/status/{provider}": {
            get: {
                summary: "Provides the status value of the point provider";
                path: {
                    /**
                     * Wallet address of the provider
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    provider: string;
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
                             * Wallet address of the provider
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            provider: string;
                            /**
                             * If this value is true, it is an approved point provider, otherwise it is not a point provider.
                             * @example true
                             */
                            enable: boolean;
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
