# README

### Quick summary

This repository contains small excerpts of code from the internal CMS tool I'm currently developing at Inhance Digital. The files are separted by concern with respect to frontend or backend code. Large swaths of the codebase have been removed to keep this a succinct sample. I am a building this internal tool entirely as a solo developer at Inhance.

### What does the application do?

Our internal CMS tool allows our developers and clients to upload media items like photos, videos, pdfs, custom HTML, and text to populate our live experiences. This allows us to avoid rebuilding sites after they have been deployed when media items need to be updated while providing our clients with the flexibility to preload and update media items within their associated Google Cloud buckets.

Our experiences are structured into Points of Interests, which contain multiple hotspots, which contain multiple media items. Points of Interest reflect a category of items or a main item, for example dishwashers. A dishwasher POI could then contain multiple dishwashers from various manufacturers like Samsung or Whirlpool. Each of these diswashers would correspond to a hotspot. Clicking on a dishwasher would then bring up a modal or a separate page that contains its associated media.

A live example of a an experience populated by this CMS can be found here: https://experienceaviara.com/

- Tech Stack:
  - NodeJS
  - Apollo GraphQL
  - Apollo Client
  - React
  - TailwindCSS
  - Google Cloud Platform
  - Firebase
  - MongoDB Atlas

## Frontend:

State throughout our frontend is largely handled by Apollo Client caching. This allows our entire frontend to update dynamically dependent on what GraphQL queries each component depends on. I hope to implement fragments in the future alongside caching with cache.modify instead of refetchQueries.

In AppRouter.jsx, many of our routes are wrapped in the `<AuthRoute />` component, which is a render props that verifies a users' credentials based on the jwt token our backend sends to them on login. This allows us to lock out certain portions of the app to only admins or only authorized developers.

Styling is done with a combination of TailwindCSS and custom SCSS.

Dashboard Container:

- Ability to bulk upload media items globally to an experience
- Ability to create new points of interest within an experience

Hotspot:

- Ability to parse through globally uploaded media items and add them to a particular hotspot
- Ability to add media items to the particular hotspot, and by extension, the global media bank
- Displays the media items contained within the hotspot

## Backend:

typeDefs.js:

- Included are the type definitions for a portion of our graphQL schema. A custom directive is used to lock out certain resolvers based on a users' granted role, which is verified against our MongoDB database. I hope to further clarify the type definitions as our application matures and the use cases become better defined.

resolvers.js:

- Here, we import and destructure our entire schema so that it can be exported into our Apollo GraphQL Server in server.js. The resolvers I've included here also handle some of our basic user creation and verification features. The frontend is consuming the firebase API for OAuth, and our backend is grabbing the information found within the token that the firebase API sends back to our app to resolve user information. Currently I am only supporting OAuth through Google.

dashboardResolvers.js:

- Here, I am handling some of the functionality associated with uploading media from the CMS into Google Cloud Storage. We are consuming the Google Cloud Storage API and wrapping some of that functionality within promises to handle the async behavior. Other async behavior is handled with async/await.

## Pipeline:

This is a yml file that dictates our deployment script on PR into the master branch via Bitbucket Pipelines. Testing is done on staging branches and features branches. The app gets built into a Docker Image that is pushed up to Google Container Registry and deployed onto Google Cloud Run. Our Cloud Run instance passes its traffic through a static IP via a Custom VPC connected to a Cloud Router within Google Cloud networking solutions. This allows the application access to our MongoDB Cloud cluster that operates with a whitelisted IP list. Prior to my hiring, none of the projects at Inhance had any CI/CD pipelines of any sort. Building and testing were done manually and serverless deployments were done through firebase. Now, more and more of our apps leverage containerization for flexible deployment and consistent development.
