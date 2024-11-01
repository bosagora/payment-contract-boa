import { Tspec } from "tspec";
import { ResultCode } from "./types";

export type AgentApiSpec = Tspec.DefineApiSpec<{
    tags: ["Agent"];
    paths: {
        "/v1/agent/provision/{account}": {
            get: {
                summary: "Provide information on the provider's agent";
                path: {
                    /**
                     * Wallet address of the provider
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
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
                             * Wallet address of the provider
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            account: string;
                            /**
                             * Wallet address of the agent
                             * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                             */
                            agent: string;
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
        "/v1/agent/provision/": {
            post: {
                summary: "Register information on the provider's agent";
                body: {
                    /**
                     * Wallet address of the provider
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    account: string;
                    /**
                     * Wallet address of the agent
                     * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                     */
                    agent: string;
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
                            account: string;
                            /**
                             * Wallet address of the agent
                             * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                             */
                            agent: string;
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
        "/v1/agent/refund/{account}": {
            get: {
                summary: "Provide information on the refund's agent";
                path: {
                    /**
                     * Wallet address of the account's owner
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
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
                             * Wallet address of the account's owner
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            account: string;
                            /**
                             * Wallet address of the agent
                             * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                             */
                            agent: string;
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
        "/v1/agent/refund/": {
            post: {
                summary: "Register information on the refund's agent";
                body: {
                    /**
                     * Wallet address of the account's owner
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    account: string;
                    /**
                     * Wallet address of the agent
                     * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                     */
                    agent: string;
                    /**
                     * Signature of account's owner or agent
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
                             * Wallet address of the account's owner
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            account: string;
                            /**
                             * Wallet address of the agent
                             * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                             */
                            agent: string;
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
        "/v1/agent/withdrawal/{account}": {
            get: {
                summary: "Provide information on the withdrawal's agent";
                path: {
                    /**
                     * Wallet address of the shop's owner
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
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
                             * Wallet address of the account's owner
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            account: string;
                            /**
                             * Wallet address of the agent
                             * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                             */
                            agent: string;
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
        "/v1/agent/withdrawal/": {
            post: {
                summary: "Register information on the withdrawal's agent";
                body: {
                    /**
                     * Wallet address of the account's owner
                     * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                     */
                    account: string;
                    /**
                     * Wallet address of the agent
                     * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                     */
                    agent: string;
                    /**
                     * Signature of account's owner or agent
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
                             * Wallet address of the account's owner
                             * @example "0x5650CD3E6E8963B43D21FAE60EE7A03BCEFCE766"
                             */
                            account: string;
                            /**
                             * Wallet address of the agent
                             * @example "0x3FE8D00143bd0eAd2397D48ba0E31E5E1268dBfb"
                             */
                            agent: string;
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
    };
}>;
