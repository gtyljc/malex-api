import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  CountryCode: { input: any; output: any; }
  DateTimeISO: { input: any; output: any; }
  EmailAddress: { input: any; output: any; }
  /** Public scalars, types, interfaces, enums... */
  JSONObject: { input: any; output: any; }
  JWT: { input: any; output: any; }
  PhoneNumber: { input: any; output: any; }
  PositiveFloat: { input: any; output: any; }
  PositiveInt: { input: any; output: any; }
  TimeZone: { input: any; output: any; }
  URL: { input: any; output: any; }
};

export type ApiResponseInterface = {
  /**
   * All mutation and query responses must inherit this interface
   * and include data field with a type of modified or readed entity ( always represents an array )
   */
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type AdminPanelKeyResponse = ApiResponseInterface & {
  __typename?: 'AdminPanelKeyResponse';
  code: Scalars['Int']['output'];
  data: Array<Maybe<Scalars['String']['output']>>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type AppointmentCreateInput = {
  address: Scalars['String']['input'];
  bwt: BestWayToTouchEnum;
  date: Scalars['DateTimeISO']['input'];
  job_desc: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone_number: Scalars['PhoneNumber']['input'];
  surname: Scalars['String']['input'];
};

export type AppointmentResponseType = ApiResponseInterface & {
  __typename?: 'AppointmentResponseType';
  code: Scalars['Int']['output'];
  data: Array<Maybe<AppointmentType>>;
  message: Scalars['String']['output'];
  pagination?: Maybe<PaginationType>;
  success: Scalars['Boolean']['output'];
};

export type AppointmentType = {
  __typename?: 'AppointmentType';
  address: Scalars['String']['output'];
  bwt: BestWayToTouchEnum;
  completed: Scalars['Boolean']['output'];
  date: Scalars['DateTimeISO']['output'];
  duration: Scalars['PositiveFloat']['output'];
  id: Scalars['ID']['output'];
  job_desc: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone_number: Scalars['PhoneNumber']['output'];
  surname: Scalars['String']['output'];
};

export type AppointmentUpdateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  bwt?: InputMaybe<BestWayToTouchEnum>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  date?: InputMaybe<Scalars['DateTimeISO']['input']>;
  duration?: InputMaybe<Scalars['PositiveFloat']['input']>;
  job_desc?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone_number?: InputMaybe<Scalars['PhoneNumber']['input']>;
  surname?: InputMaybe<Scalars['String']['input']>;
};

export enum BestWayToTouchEnum {
  Phone = 'PHONE',
  Text = 'TEXT',
  Whatsapp = 'WHATSAPP'
}

export type BusyResponseType = ApiResponseInterface & {
  __typename?: 'BusyResponseType';
  code: Scalars['Int']['output'];
  data: Array<Maybe<BusyType>>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type BusyType = {
  __typename?: 'BusyType';
  busy: Scalars['Boolean']['output'];
  date: Scalars['DateTimeISO']['output'];
};

export type FinalizeUploadImageResponseType = ApiResponseInterface & {
  __typename?: 'FinalizeUploadImageResponseType';
  code: Scalars['Int']['output'];
  data: Array<Maybe<FinalizeUploadImageType>>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type FinalizeUploadImageType = {
  __typename?: 'FinalizeUploadImageType';
  id: Scalars['ID']['output'];
  url: Scalars['URL']['output'];
};

export type JwtResponseType = ApiResponseInterface & {
  __typename?: 'JWTResponseType';
  code: Scalars['Int']['output'];
  data: Array<Maybe<JwtType>>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type JwtType = {
  __typename?: 'JWTType';
  at: Scalars['JWT']['output'];
  rt: Scalars['JWT']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  adminLogin: JwtResponseType;
  adminLogout: JwtResponseType;
  createAT: JwtResponseType;
  createAppointment: AppointmentResponseType;
  createRT: JwtResponseType;
  createWork: WorkResponseType;
  deleteManyWorks: WorkResponseType;
  deleteWork: WorkResponseType;
  finalizeImageUpload: FinalizeUploadImageResponseType;
  startImageUpload: StartUploadImageResponseType;
  updateAppointment: AppointmentResponseType;
  updateManyAppointments: AppointmentResponseType;
  updateManyWorks: WorkResponseType;
  updateSiteConfig: SiteConfigResponseType;
  updateWork: WorkResponseType;
};


export type MutationAdminLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationCreateAppointmentArgs = {
  data: AppointmentCreateInput;
};


export type MutationCreateRtArgs = {
  role: RoleEnum;
  user_id: Scalars['ID']['input'];
};


export type MutationCreateWorkArgs = {
  data?: InputMaybe<WorkCreateInput>;
};


export type MutationDeleteManyWorksArgs = {
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
};


export type MutationDeleteWorkArgs = {
  id: Scalars['ID']['input'];
};


export type MutationFinalizeImageUploadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationStartImageUploadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateAppointmentArgs = {
  data?: InputMaybe<AppointmentUpdateInput>;
  id: Scalars['ID']['input'];
};


export type MutationUpdateManyAppointmentsArgs = {
  data?: InputMaybe<AppointmentUpdateInput>;
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
};


export type MutationUpdateManyWorksArgs = {
  data?: InputMaybe<WorkUpdateInput>;
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
};


export type MutationUpdateSiteConfigArgs = {
  data?: InputMaybe<SiteConfigUpdateInput>;
  id: Scalars['ID']['input'];
};


export type MutationUpdateWorkArgs = {
  data?: InputMaybe<WorkUpdateInput>;
  id: Scalars['ID']['input'];
};

export enum OrderEnum {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type PageInfoType = {
  __typename?: 'PageInfoType';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
};

export type PaginationInput = {
  page: Scalars['PositiveInt']['input'];
  perPage: Scalars['PositiveInt']['input'];
};

export type PaginationType = {
  __typename?: 'PaginationType';
  pageInfo: PageInfoType;
  total: Scalars['Int']['output'];
};

export type PublicConfigResponseType = ApiResponseInterface & {
  __typename?: 'PublicConfigResponseType';
  code: Scalars['Int']['output'];
  data: Array<Maybe<PublicConfigType>>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type PublicConfigType = {
  __typename?: 'PublicConfigType';
  c_country: Scalars['CountryCode']['output'];
  closing_at: Scalars['DateTimeISO']['output'];
  min_duration: Scalars['PositiveFloat']['output'];
  opening_at: Scalars['DateTimeISO']['output'];
  phone_number: Scalars['PhoneNumber']['output'];
  support_email: Scalars['EmailAddress']['output'];
  timezone: Scalars['TimeZone']['output'];
};

export type PublicWorkResponseType = ApiResponseInterface & {
  __typename?: 'PublicWorkResponseType';
  code: Scalars['Int']['output'];
  data: Array<Maybe<PublicWorkType>>;
  message: Scalars['String']['output'];
  pagination?: Maybe<PaginationType>;
  success: Scalars['Boolean']['output'];
};

export type PublicWorkType = {
  __typename?: 'PublicWorkType';
  category: WorkCategoryEnum;
  img_url: Scalars['URL']['output'];
  timestamp: Scalars['DateTimeISO']['output'];
};

export type Query = {
  __typename?: 'Query';
  adminPanelKey?: Maybe<AdminPanelKeyResponse>;
  appointment: AppointmentResponseType;
  appointments: AppointmentResponseType;
  busyInRange: BusyResponseType;
  getWorks: PublicWorkResponseType;
  newWorks: PublicWorkResponseType;
  publicConfig: PublicConfigResponseType;
  siteConfig: SiteConfigResponseType;
  work: WorkResponseType;
  works: WorkResponseType;
};


export type QueryAppointmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAppointmentsArgs = {
  filter?: InputMaybe<Scalars['JSONObject']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<SortInput>;
};


export type QueryBusyInRangeArgs = {
  date: Scalars['DateTimeISO']['input'];
  unit: TimeUnitEnum;
};


export type QueryGetWorksArgs = {
  filter: Scalars['JSONObject']['input'];
  pagination: PaginationInput;
  sort?: InputMaybe<SortInput>;
};


export type QueryNewWorksArgs = {
  num?: InputMaybe<Scalars['PositiveInt']['input']>;
};


export type QuerySiteConfigArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorkArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorksArgs = {
  filter?: InputMaybe<Scalars['JSONObject']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<SortInput>;
};

export enum RoleEnum {
  Admin = 'ADMIN',
  Guest = 'GUEST',
  Superadmin = 'SUPERADMIN',
  Superuser = 'SUPERUSER',
  User = 'USER'
}

export type SiteConfigResponseType = ApiResponseInterface & {
  __typename?: 'SiteConfigResponseType';
  code: Scalars['Int']['output'];
  data: Array<Maybe<SiteConfigType>>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type SiteConfigType = {
  __typename?: 'SiteConfigType';
  c_country: Scalars['CountryCode']['output'];
  closing_at: Scalars['DateTimeISO']['output'];
  id: Scalars['ID']['output'];
  min_duration: Scalars['PositiveFloat']['output'];
  opening_at: Scalars['DateTimeISO']['output'];
  phone_number: Scalars['PhoneNumber']['output'];
  support_email: Scalars['EmailAddress']['output'];
  timezone: Scalars['TimeZone']['output'];
};

export type SiteConfigUpdateInput = {
  c_country?: InputMaybe<Scalars['CountryCode']['input']>;
  closing_at?: InputMaybe<Scalars['DateTimeISO']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  min_duration?: InputMaybe<Scalars['PositiveFloat']['input']>;
  opening_at?: InputMaybe<Scalars['DateTimeISO']['input']>;
  phone_number?: InputMaybe<Scalars['PhoneNumber']['input']>;
  support_email?: InputMaybe<Scalars['EmailAddress']['input']>;
  timezone?: InputMaybe<Scalars['TimeZone']['input']>;
};

export type SortInput = {
  field: Scalars['String']['input'];
  order: OrderEnum;
};

export type StartUploadImageResponseType = ApiResponseInterface & {
  __typename?: 'StartUploadImageResponseType';
  code: Scalars['Int']['output'];
  data: Array<Maybe<StartUploadImageType>>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type StartUploadImageType = {
  __typename?: 'StartUploadImageType';
  id: Scalars['ID']['output'];
  url: Scalars['URL']['output'];
};

export enum TimeUnitEnum {
  Appointment = 'APPOINTMENT',
  Day = 'DAY'
}

export enum WorkCategoryEnum {
  Assembling = 'ASSEMBLING',
  Mounting = 'MOUNTING',
  Plumbing = 'PLUMBING'
}

export type WorkCreateInput = {
  category: WorkCategoryEnum;
  img_id: Scalars['ID']['input'];
  img_url: Scalars['URL']['input'];
  timestamp: Scalars['DateTimeISO']['input'];
};

export type WorkResponseType = ApiResponseInterface & {
  __typename?: 'WorkResponseType';
  code: Scalars['Int']['output'];
  data: Array<Maybe<WorkType>>;
  message: Scalars['String']['output'];
  pagination?: Maybe<PaginationType>;
  success: Scalars['Boolean']['output'];
};

export type WorkType = {
  __typename?: 'WorkType';
  category: WorkCategoryEnum;
  id: Scalars['ID']['output'];
  img_id: Scalars['ID']['output'];
  img_url: Scalars['URL']['output'];
  timestamp: Scalars['DateTimeISO']['output'];
};

export type WorkUpdateInput = {
  category?: InputMaybe<WorkCategoryEnum>;
  img_id?: InputMaybe<Scalars['ID']['input']>;
  img_url?: InputMaybe<Scalars['URL']['input']>;
  timestamp?: InputMaybe<Scalars['DateTimeISO']['input']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;




/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  APIResponseInterface:
    | ( AdminPanelKeyResponse )
    | ( AppointmentResponseType )
    | ( BusyResponseType )
    | ( FinalizeUploadImageResponseType )
    | ( JwtResponseType )
    | ( PublicConfigResponseType )
    | ( PublicWorkResponseType )
    | ( SiteConfigResponseType )
    | ( StartUploadImageResponseType )
    | ( WorkResponseType )
  ;
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  APIResponseInterface: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['APIResponseInterface']>;
  AdminPanelKeyResponse: ResolverTypeWrapper<AdminPanelKeyResponse>;
  AppointmentCreateInput: AppointmentCreateInput;
  AppointmentResponseType: ResolverTypeWrapper<AppointmentResponseType>;
  AppointmentType: ResolverTypeWrapper<AppointmentType>;
  AppointmentUpdateInput: AppointmentUpdateInput;
  BestWayToTouchEnum: BestWayToTouchEnum;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BusyResponseType: ResolverTypeWrapper<BusyResponseType>;
  BusyType: ResolverTypeWrapper<BusyType>;
  CountryCode: ResolverTypeWrapper<Scalars['CountryCode']['output']>;
  DateTimeISO: ResolverTypeWrapper<Scalars['DateTimeISO']['output']>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  FinalizeUploadImageResponseType: ResolverTypeWrapper<FinalizeUploadImageResponseType>;
  FinalizeUploadImageType: ResolverTypeWrapper<FinalizeUploadImageType>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']['output']>;
  JWT: ResolverTypeWrapper<Scalars['JWT']['output']>;
  JWTResponseType: ResolverTypeWrapper<JwtResponseType>;
  JWTType: ResolverTypeWrapper<JwtType>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  OrderEnum: OrderEnum;
  PageInfoType: ResolverTypeWrapper<PageInfoType>;
  PaginationInput: PaginationInput;
  PaginationType: ResolverTypeWrapper<PaginationType>;
  PhoneNumber: ResolverTypeWrapper<Scalars['PhoneNumber']['output']>;
  PositiveFloat: ResolverTypeWrapper<Scalars['PositiveFloat']['output']>;
  PositiveInt: ResolverTypeWrapper<Scalars['PositiveInt']['output']>;
  PublicConfigResponseType: ResolverTypeWrapper<PublicConfigResponseType>;
  PublicConfigType: ResolverTypeWrapper<PublicConfigType>;
  PublicWorkResponseType: ResolverTypeWrapper<PublicWorkResponseType>;
  PublicWorkType: ResolverTypeWrapper<PublicWorkType>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RoleEnum: RoleEnum;
  SiteConfigResponseType: ResolverTypeWrapper<SiteConfigResponseType>;
  SiteConfigType: ResolverTypeWrapper<SiteConfigType>;
  SiteConfigUpdateInput: SiteConfigUpdateInput;
  SortInput: SortInput;
  StartUploadImageResponseType: ResolverTypeWrapper<StartUploadImageResponseType>;
  StartUploadImageType: ResolverTypeWrapper<StartUploadImageType>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  TimeUnitEnum: TimeUnitEnum;
  TimeZone: ResolverTypeWrapper<Scalars['TimeZone']['output']>;
  URL: ResolverTypeWrapper<Scalars['URL']['output']>;
  WorkCategoryEnum: WorkCategoryEnum;
  WorkCreateInput: WorkCreateInput;
  WorkResponseType: ResolverTypeWrapper<WorkResponseType>;
  WorkType: ResolverTypeWrapper<WorkType>;
  WorkUpdateInput: WorkUpdateInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  APIResponseInterface: ResolversInterfaceTypes<ResolversParentTypes>['APIResponseInterface'];
  AdminPanelKeyResponse: AdminPanelKeyResponse;
  AppointmentCreateInput: AppointmentCreateInput;
  AppointmentResponseType: AppointmentResponseType;
  AppointmentType: AppointmentType;
  AppointmentUpdateInput: AppointmentUpdateInput;
  Boolean: Scalars['Boolean']['output'];
  BusyResponseType: BusyResponseType;
  BusyType: BusyType;
  CountryCode: Scalars['CountryCode']['output'];
  DateTimeISO: Scalars['DateTimeISO']['output'];
  EmailAddress: Scalars['EmailAddress']['output'];
  FinalizeUploadImageResponseType: FinalizeUploadImageResponseType;
  FinalizeUploadImageType: FinalizeUploadImageType;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  JSONObject: Scalars['JSONObject']['output'];
  JWT: Scalars['JWT']['output'];
  JWTResponseType: JwtResponseType;
  JWTType: JwtType;
  Mutation: Record<PropertyKey, never>;
  PageInfoType: PageInfoType;
  PaginationInput: PaginationInput;
  PaginationType: PaginationType;
  PhoneNumber: Scalars['PhoneNumber']['output'];
  PositiveFloat: Scalars['PositiveFloat']['output'];
  PositiveInt: Scalars['PositiveInt']['output'];
  PublicConfigResponseType: PublicConfigResponseType;
  PublicConfigType: PublicConfigType;
  PublicWorkResponseType: PublicWorkResponseType;
  PublicWorkType: PublicWorkType;
  Query: Record<PropertyKey, never>;
  SiteConfigResponseType: SiteConfigResponseType;
  SiteConfigType: SiteConfigType;
  SiteConfigUpdateInput: SiteConfigUpdateInput;
  SortInput: SortInput;
  StartUploadImageResponseType: StartUploadImageResponseType;
  StartUploadImageType: StartUploadImageType;
  String: Scalars['String']['output'];
  TimeZone: Scalars['TimeZone']['output'];
  URL: Scalars['URL']['output'];
  WorkCreateInput: WorkCreateInput;
  WorkResponseType: WorkResponseType;
  WorkType: WorkType;
  WorkUpdateInput: WorkUpdateInput;
};

export type AuthDirectiveArgs = {
  role?: Maybe<RoleEnum>;
};

export type AuthDirectiveResolver<Result, Parent, ContextType = any, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ApiResponseInterfaceResolvers<ContextType = any, ParentType extends ResolversParentTypes['APIResponseInterface'] = ResolversParentTypes['APIResponseInterface']> = {
  __resolveType: TypeResolveFn<'AdminPanelKeyResponse' | 'AppointmentResponseType' | 'BusyResponseType' | 'FinalizeUploadImageResponseType' | 'JWTResponseType' | 'PublicConfigResponseType' | 'PublicWorkResponseType' | 'SiteConfigResponseType' | 'StartUploadImageResponseType' | 'WorkResponseType', ParentType, ContextType>;
};

export type AdminPanelKeyResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['AdminPanelKeyResponse'] = ResolversParentTypes['AdminPanelKeyResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AppointmentResponseTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['AppointmentResponseType'] = ResolversParentTypes['AppointmentResponseType']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['AppointmentType']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pagination?: Resolver<Maybe<ResolversTypes['PaginationType']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AppointmentTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['AppointmentType'] = ResolversParentTypes['AppointmentType']> = {
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bwt?: Resolver<ResolversTypes['BestWayToTouchEnum'], ParentType, ContextType>;
  completed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  duration?: Resolver<ResolversTypes['PositiveFloat'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  job_desc?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phone_number?: Resolver<ResolversTypes['PhoneNumber'], ParentType, ContextType>;
  surname?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type BusyResponseTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['BusyResponseType'] = ResolversParentTypes['BusyResponseType']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['BusyType']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['BusyType'] = ResolversParentTypes['BusyType']> = {
  busy?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
};

export interface CountryCodeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['CountryCode'], any> {
  name: 'CountryCode';
}

export interface DateTimeIsoScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTimeISO'], any> {
  name: 'DateTimeISO';
}

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type FinalizeUploadImageResponseTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['FinalizeUploadImageResponseType'] = ResolversParentTypes['FinalizeUploadImageResponseType']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['FinalizeUploadImageType']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FinalizeUploadImageTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['FinalizeUploadImageType'] = ResolversParentTypes['FinalizeUploadImageType']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
};

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export interface JwtScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JWT'], any> {
  name: 'JWT';
}

export type JwtResponseTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['JWTResponseType'] = ResolversParentTypes['JWTResponseType']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['JWTType']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JwtTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['JWTType'] = ResolversParentTypes['JWTType']> = {
  at?: Resolver<ResolversTypes['JWT'], ParentType, ContextType>;
  rt?: Resolver<ResolversTypes['JWT'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  adminLogin?: Resolver<ResolversTypes['JWTResponseType'], ParentType, ContextType, RequireFields<MutationAdminLoginArgs, 'password' | 'username'>>;
  adminLogout?: Resolver<ResolversTypes['JWTResponseType'], ParentType, ContextType>;
  createAT?: Resolver<ResolversTypes['JWTResponseType'], ParentType, ContextType>;
  createAppointment?: Resolver<ResolversTypes['AppointmentResponseType'], ParentType, ContextType, RequireFields<MutationCreateAppointmentArgs, 'data'>>;
  createRT?: Resolver<ResolversTypes['JWTResponseType'], ParentType, ContextType, RequireFields<MutationCreateRtArgs, 'role' | 'user_id'>>;
  createWork?: Resolver<ResolversTypes['WorkResponseType'], ParentType, ContextType, Partial<MutationCreateWorkArgs>>;
  deleteManyWorks?: Resolver<ResolversTypes['WorkResponseType'], ParentType, ContextType, RequireFields<MutationDeleteManyWorksArgs, 'ids'>>;
  deleteWork?: Resolver<ResolversTypes['WorkResponseType'], ParentType, ContextType, RequireFields<MutationDeleteWorkArgs, 'id'>>;
  finalizeImageUpload?: Resolver<ResolversTypes['FinalizeUploadImageResponseType'], ParentType, ContextType, RequireFields<MutationFinalizeImageUploadArgs, 'id'>>;
  startImageUpload?: Resolver<ResolversTypes['StartUploadImageResponseType'], ParentType, ContextType, RequireFields<MutationStartImageUploadArgs, 'id'>>;
  updateAppointment?: Resolver<ResolversTypes['AppointmentResponseType'], ParentType, ContextType, RequireFields<MutationUpdateAppointmentArgs, 'id'>>;
  updateManyAppointments?: Resolver<ResolversTypes['AppointmentResponseType'], ParentType, ContextType, RequireFields<MutationUpdateManyAppointmentsArgs, 'ids'>>;
  updateManyWorks?: Resolver<ResolversTypes['WorkResponseType'], ParentType, ContextType, RequireFields<MutationUpdateManyWorksArgs, 'ids'>>;
  updateSiteConfig?: Resolver<ResolversTypes['SiteConfigResponseType'], ParentType, ContextType, RequireFields<MutationUpdateSiteConfigArgs, 'id'>>;
  updateWork?: Resolver<ResolversTypes['WorkResponseType'], ParentType, ContextType, RequireFields<MutationUpdateWorkArgs, 'id'>>;
};

export type PageInfoTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInfoType'] = ResolversParentTypes['PageInfoType']> = {
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type PaginationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginationType'] = ResolversParentTypes['PaginationType']> = {
  pageInfo?: Resolver<ResolversTypes['PageInfoType'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export interface PhoneNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PhoneNumber'], any> {
  name: 'PhoneNumber';
}

export interface PositiveFloatScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PositiveFloat'], any> {
  name: 'PositiveFloat';
}

export interface PositiveIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PositiveInt'], any> {
  name: 'PositiveInt';
}

export type PublicConfigResponseTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PublicConfigResponseType'] = ResolversParentTypes['PublicConfigResponseType']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['PublicConfigType']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PublicConfigTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PublicConfigType'] = ResolversParentTypes['PublicConfigType']> = {
  c_country?: Resolver<ResolversTypes['CountryCode'], ParentType, ContextType>;
  closing_at?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  min_duration?: Resolver<ResolversTypes['PositiveFloat'], ParentType, ContextType>;
  opening_at?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  phone_number?: Resolver<ResolversTypes['PhoneNumber'], ParentType, ContextType>;
  support_email?: Resolver<ResolversTypes['EmailAddress'], ParentType, ContextType>;
  timezone?: Resolver<ResolversTypes['TimeZone'], ParentType, ContextType>;
};

export type PublicWorkResponseTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PublicWorkResponseType'] = ResolversParentTypes['PublicWorkResponseType']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['PublicWorkType']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pagination?: Resolver<Maybe<ResolversTypes['PaginationType']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PublicWorkTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PublicWorkType'] = ResolversParentTypes['PublicWorkType']> = {
  category?: Resolver<ResolversTypes['WorkCategoryEnum'], ParentType, ContextType>;
  img_url?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  adminPanelKey?: Resolver<Maybe<ResolversTypes['AdminPanelKeyResponse']>, ParentType, ContextType>;
  appointment?: Resolver<ResolversTypes['AppointmentResponseType'], ParentType, ContextType, RequireFields<QueryAppointmentArgs, 'id'>>;
  appointments?: Resolver<ResolversTypes['AppointmentResponseType'], ParentType, ContextType, Partial<QueryAppointmentsArgs>>;
  busyInRange?: Resolver<ResolversTypes['BusyResponseType'], ParentType, ContextType, RequireFields<QueryBusyInRangeArgs, 'date' | 'unit'>>;
  getWorks?: Resolver<ResolversTypes['PublicWorkResponseType'], ParentType, ContextType, RequireFields<QueryGetWorksArgs, 'filter' | 'pagination'>>;
  newWorks?: Resolver<ResolversTypes['PublicWorkResponseType'], ParentType, ContextType, Partial<QueryNewWorksArgs>>;
  publicConfig?: Resolver<ResolversTypes['PublicConfigResponseType'], ParentType, ContextType>;
  siteConfig?: Resolver<ResolversTypes['SiteConfigResponseType'], ParentType, ContextType, RequireFields<QuerySiteConfigArgs, 'id'>>;
  work?: Resolver<ResolversTypes['WorkResponseType'], ParentType, ContextType, RequireFields<QueryWorkArgs, 'id'>>;
  works?: Resolver<ResolversTypes['WorkResponseType'], ParentType, ContextType, Partial<QueryWorksArgs>>;
};

export type SiteConfigResponseTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SiteConfigResponseType'] = ResolversParentTypes['SiteConfigResponseType']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['SiteConfigType']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SiteConfigTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SiteConfigType'] = ResolversParentTypes['SiteConfigType']> = {
  c_country?: Resolver<ResolversTypes['CountryCode'], ParentType, ContextType>;
  closing_at?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  min_duration?: Resolver<ResolversTypes['PositiveFloat'], ParentType, ContextType>;
  opening_at?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  phone_number?: Resolver<ResolversTypes['PhoneNumber'], ParentType, ContextType>;
  support_email?: Resolver<ResolversTypes['EmailAddress'], ParentType, ContextType>;
  timezone?: Resolver<ResolversTypes['TimeZone'], ParentType, ContextType>;
};

export type StartUploadImageResponseTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['StartUploadImageResponseType'] = ResolversParentTypes['StartUploadImageResponseType']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['StartUploadImageType']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StartUploadImageTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['StartUploadImageType'] = ResolversParentTypes['StartUploadImageType']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
};

export interface TimeZoneScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['TimeZone'], any> {
  name: 'TimeZone';
}

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export type WorkResponseTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkResponseType'] = ResolversParentTypes['WorkResponseType']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['WorkType']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pagination?: Resolver<Maybe<ResolversTypes['PaginationType']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkType'] = ResolversParentTypes['WorkType']> = {
  category?: Resolver<ResolversTypes['WorkCategoryEnum'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  img_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  img_url?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  APIResponseInterface?: ApiResponseInterfaceResolvers<ContextType>;
  AdminPanelKeyResponse?: AdminPanelKeyResponseResolvers<ContextType>;
  AppointmentResponseType?: AppointmentResponseTypeResolvers<ContextType>;
  AppointmentType?: AppointmentTypeResolvers<ContextType>;
  BusyResponseType?: BusyResponseTypeResolvers<ContextType>;
  BusyType?: BusyTypeResolvers<ContextType>;
  CountryCode?: GraphQLScalarType;
  DateTimeISO?: GraphQLScalarType;
  EmailAddress?: GraphQLScalarType;
  FinalizeUploadImageResponseType?: FinalizeUploadImageResponseTypeResolvers<ContextType>;
  FinalizeUploadImageType?: FinalizeUploadImageTypeResolvers<ContextType>;
  JSONObject?: GraphQLScalarType;
  JWT?: GraphQLScalarType;
  JWTResponseType?: JwtResponseTypeResolvers<ContextType>;
  JWTType?: JwtTypeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInfoType?: PageInfoTypeResolvers<ContextType>;
  PaginationType?: PaginationTypeResolvers<ContextType>;
  PhoneNumber?: GraphQLScalarType;
  PositiveFloat?: GraphQLScalarType;
  PositiveInt?: GraphQLScalarType;
  PublicConfigResponseType?: PublicConfigResponseTypeResolvers<ContextType>;
  PublicConfigType?: PublicConfigTypeResolvers<ContextType>;
  PublicWorkResponseType?: PublicWorkResponseTypeResolvers<ContextType>;
  PublicWorkType?: PublicWorkTypeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SiteConfigResponseType?: SiteConfigResponseTypeResolvers<ContextType>;
  SiteConfigType?: SiteConfigTypeResolvers<ContextType>;
  StartUploadImageResponseType?: StartUploadImageResponseTypeResolvers<ContextType>;
  StartUploadImageType?: StartUploadImageTypeResolvers<ContextType>;
  TimeZone?: GraphQLScalarType;
  URL?: GraphQLScalarType;
  WorkResponseType?: WorkResponseTypeResolvers<ContextType>;
  WorkType?: WorkTypeResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = any> = {
  auth?: AuthDirectiveResolver<any, any, ContextType>;
};
