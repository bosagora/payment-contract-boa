import { Tspec } from "tspec";
import { ResultCode } from "./types";

export type SystemInfoApiSpec = Tspec.DefineApiSpec<{
    tags: ["System Info"];
    paths: {
        "/v1/system/info": {
            get: {
                summary: "Provide information of System";
                responses: {
                    200: {
                        /**
                         * Result Code
                         * @example 0
                         */
                        code: ResultCode;
                        data: {
                            token: {
                                /**
                                 * Token Symbol
                                 * @example "ACC"
                                 */
                                symbol: string;
                            };
                            point: {
                                /**
                                 * Decimals
                                 * @example 2
                                 */
                                precision: number;
                                /**
                                 * Symbol of a currency of the same value
                                 * @example "PHP"
                                 */
                                equivalentCurrency: string;
                            };
                            /**
                             * Default Language for the System
                             * @example "en"
                             */
                            language: string;
                            support: {
                                /**
                                 * Moving Assets Using Chain Bridges
                                 * @example true
                                 */
                                chainBridge: boolean;
                                /**
                                 * Moving Assets Using Loyalty Bridges
                                 * @example true
                                 */
                                loyaltyBridge: boolean;
                                /**
                                 * Exchange Points for Tokens
                                 * @example true
                                 */
                                exchange: boolean;
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
    };
}>;
