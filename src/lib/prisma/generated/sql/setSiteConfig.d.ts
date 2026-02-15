import * as $runtime from "../runtime/client"

/**
 * @param opening_at when enterprise is openning
 * @param closing_at when enterprise is closing
 * @param min_duration minimal duration of one appointment
 * @param support_email support email of enterprise
 * @param phone_number telephone number of enterprise
 * @param timezone default timezone of DB ( the same where enterprise is )
 */
export const setSiteConfig: (opening_at: string, closing_at: string, min_duration: number, support_email: string, phone_number: string, timezone: string) => $runtime.TypedSql<setSiteConfig.Parameters, setSiteConfig.Result>

export namespace setSiteConfig {
  export type Parameters = [opening_at: string, closing_at: string, min_duration: number, support_email: string, phone_number: string, timezone: string]
  export type Result = {}
}
