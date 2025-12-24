
import { PaginationOutput } from "./sources.types"

// schema of response of each query / mutation
export type ResponseSchema = {
    code: number,
    success: boolean,
    message: string,
    data: any[]
    pagination?: PaginationOutput
}