import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  directive @isAuth(role: String) on FIELD | FIELD_DEFINITION

  scalar Date
  scalar customFields

  type Query {
    hello: String!
    logout: Message!
    getUserFromCookie: User
    getUserByUUID(fbUUID: String!): User @isAuth(role: "Admin")
    getAllUsers: [User] @isAuth(role: "Admin")
    getAllExperiences: [Experience]
    getExperienceByName(name: String): Experience
    getExperienceByUUID(id: String): Experience
  }
  type Mutation {
    authAndRegister(input: UserInput!): User!
    createNewExperience(name: String): Experience! @isAuth(role: "Admin")
    addExperiencesToUser(user: UserInput!, experiences: [String]!): User!
      @isAuth(role: "Admin")
    createPOI(experienceUUID: String, poiInput: poiInput): Experience
    createHotspot(
      experienceUUID: String
      poiUUID: String
      hotspotInput: hotspotInput
    ): Experience
    updateHotspotMetadata(
      experienceUUID: String
      poiUUID: String
      hotspotInput: hotspotInput
    ): Experience
    createMedia(
      experienceUUID: String
      poiUUID: String
      hotspotUUID: String
      bucketName: String
      file: Upload
      mediaInput: mediaInput
    ): Experience
    addGlobalMediaToHotspot(
      experienceUUID: String
      poiUUID: String
      hotspotUUID: String
      globalMediaItems: [GlobalMediaInput]
    ): Experience
  }

  type File {
    fileName: String!
    mimetype: String!
    encoding: String!
    url: String!
  }

  type User {
    fbEmail: String
    fbUUID: String
    name: String
    role: String
    experiences: [Experience]
  }

  type Experience {
    id: String
    name: String
    bucketName: String
    baseHref: String
    createdOn: Date
    media: [MediaItem]
    pois: [POI]
  }

  type POI {
    id: String
    name: String!
    poi_id: String
    displayName: String
    displayData: String
    tag: String
    hotspots: [Hotspot]
    createdOn: String
  }

  type Hotspot {
    id: String
    name: String!
    hs_id: String
    displayName: String
    displayData: String
    tag: String
    media: [MediaItem]
    createdOn: String
    customFields: customFields
  }

  type MediaItem {
    id: String
    global_id: String
    name: String
    displayName: String
    displayData: String
    tag: String
    type: String
    url: String
    createdOn: String
    customFields: customFields
  }

  type MediaResponse {
    message: String
    data: responseData
  }

  input POIInput {
    poiID: String
    poiName: String
    poiDisplayName: String
    poiDisplayData: String
    poiTag: String
  }
  input HotspotInput {
    hotspotID: String
    hotspotName: String
    hotspotDisplayName: String
    hotspotDisplayData: String
    hotspotTag: String
    hotspotCustomFields: [CustomField]
  }
  input MediaInput {
    mediaName: String
    mediaDisplayName: String
    mediaDisplayData: String
    mediaTag: String
    mediaType: String
    mediaCustomFields: [CustomField]
  }
  input GlobalMediaInput {
    id: String
    url: String
    name: String
    type: String
  }
  input CustomField {
    keys: String
    values: String
  }
  input UserInput {
    fbUUID: String
    fbEmail: String
    name: String
  }
`;
