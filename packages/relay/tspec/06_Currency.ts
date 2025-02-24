import { Tspec } from "tspec";
import { ResultCode } from "./types";

export type CurrencyApiSpec = Tspec.DefineApiSpec<{
    tags: ["Currency"];
    paths: {
        "/v1/currency/convert": {
            get: {
                summary: "Provide value converted from one currency to another";
                query: {
                    /**
                     * Amount (info. 1 UNIT = "1000000000000000000", decimals is 18
                     * @example "10000000000000000000000000"
                     */
                    amount: string;
                    /**
                     * Currency Symbol of source (ex. acc, point, usd, krw, php, ...)
                     * @example "krw"
                     */
                    from: string;
                    /**
                     * Currency Symbol of target (ex. acc, point, usd, krw, php, ...)
                     * @example "point"
                     */
                    to: string;
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
                             * Value converted to target currency (info. decimals are 18)
                             * @example "10000000000000000000000000"
                             */
                            amount: string;
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
