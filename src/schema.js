
export const typeDefs = `#graphql
    scalar JSON

    # -------- query

    type Query {
        works(ids: [ID], filter: JSON, pagination: Pagination): [Work]!
        work(id: ID!): Work
        appoitments(ids: [ID], filter: JSON, pagination: Pagination): [Appointment]!
        appointment(id: ID!): Appointment
    }

    input Pagination {
        perPage: Int!
        page: Int!
    }


    # -------- mutation

    type Mutation {
        updateWork(id: ID!, data: WorkUpdate!): updateWorkResponse!
        updateWorks(ids: [ID]!, data: WorkUpdate!): updateWorksResponse!
        
    }

    interface MutationResponse {
        code: String!
        success: Boolean!
        message: String
    }

    type updateWorkResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String
        work: Work
    }

    type updateWorksResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String
        work: [Work]
    }


    # -------- appointment

    enum BestWayToTouch {
        WHATSAPP
        PHONE
        TEXT
    }

    type Appointment {
        id: Int!
        name: String!
        surname: String!
        address: String!
        job_desc: String!
        bwt: BestWayToTouch!
    }


    # -------- works

    enum WorkCategory {
        ASSEMBLING
        MOUNTING
        PLUMBING
    }

    type Work {
        id: Int!
        img_urls: [String]!
        img_id: ID!
        category: WorkCategory!
    }

    input WorkUpdate {
        img_urls: [String]
        img_id: ID
        category: WorkCategory
    }

    input WorkCreate {
        img_urls: [String]!
        img_id: ID!
        category: WorkCategory!
    }
`;