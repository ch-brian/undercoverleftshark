import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const dashboardResolvers = {
  Query: {},
  Mutation: {
    // Adds a POI to the Experience of Interest
    createPOI: async (parent, args, context, info) => {
      const {
        experienceUUID,
        poiID,
        poiName,
        poiDisplayName,
        poiDisplayData,
        poiTag,
      } = args;
      const today = new Date();
      const uuid = uuidv4();
      console.log(experienceUUID);

      const currExp = await context.db
        .collection('experiences')
        .find({ id: experienceUUID })
        .toArray();

      console.log('mycurrexp: ', currExp);
      if (!currExp[0]) throw new Error('Experience of Interest Not Found');

      const inserted = await context.db
        .collection('experiences')
        .findOneAndUpdate(
          { id: experienceUUID },
          {
            $push: {
              pois: {
                name: poiName,
                id: uuid,
                poi_id: poiID,
                displayName: poiDisplayName,
                displayData: poiDisplayData,
                tag: poiTag,
                createdOn: today,
              },
            },
          }
        );
      console.log(inserted);
      return { message: 'createPOI fired' };
    },

    // Bulk adds selected global media items to the current active hotspot
    addGlobalMediaToHotspot: async (parent, args, context, info) => {
      console.log('addmedia_args: ', args);
      const { experienceUUID, poiUUID, hotspotUUID, globalMediaItems } = args;

      const toAddMedia = globalMediaItems.map((each) => {
        const uuid = uuidv4();
        const today = new Date();
        return {
          id: uuid,
          name: each.name,
          global_id: each.id,
          type: each.type,
          createdOn: today,
        };
      });

      const associatedHotspotMedia = await context.db
        .collection('experiences')
        .findOneAndUpdate(
          {
            id: experienceUUID,
          },
          {
            $push: {
              'pois.$[myPOI].hotspots.$[myHotspot].media': {
                $each: toAddMedia,
              },
            },
          },
          {
            arrayFilters: [
              { 'myPOI.id': poiUUID },
              { 'myHotspot.id': hotspotUUID },
            ],
            returnOriginal: false,
          }
        );
      return associatedHotspotMedia;
    },

    // Bulk adds media items to the global scope of the active experience
    createMedia: async (parent, args, context, info) => {
      const {
        file,
        bucketName,
        experienceUUID,
        poiUUID,
        hotspotUUID,
        mediaInput,
      } = args;
      const {
        mediaName,
        mediaDisplayName,
        mediaDisplayData,
        mediaType,
        mediaTag,
        mediaCustomFields,
      } = mediaInput;
      const fileArr = await file;
      const storage = new Storage({
        keyFileName: path.join(__dirname, '../../../gcsIAM.json'),
      });
      const insertedArr = [];
      const insertedMediaItems = [];
      const fromMedia = poiUUID && hotspotUUID ? true : false;

      const customObj = {};

      if (mediaCustomFields) {
        mediaCustomFields.forEach((field) => {
          customObj[field.keys] = field.values;
        });
      }
      await Promise.allSettled(fileArr).then(async (result) => {
        result.forEach(async (item) => {
          const { filename, createReadStream, mimetype } = item.value;
          const extension = `${filename.split('.').pop()}`;
          const uuid = uuidv4();
          const uuidFileName = `${uuid}.${extension}`;
          const today = new Date();
          insertedArr.push(
            new Promise((resolve, reject) => {
              console.log('inside promise: ', item);
              createReadStream().pipe(
                storage
                  .bucket(bucketName)
                  .file(uuidFileName)
                  .createWriteStream({ resumable: false })
                  .on('finish', () => {
                    console.log('writestreamfinished');
                    storage
                      .bucket(bucketName)
                      .file(uuidFileName)
                      // make the file public
                      .makePublic()
                      .then((data) => {
                        console.log('INSIDE WRITE STREAM', data);
                        // this is the URL to the file in the google bucket.
                        insertedMediaItems.push({
                          id: uuid,
                          url: uuidFileName,
                          name: filename,
                          type: mimetype,
                          createdOn: today,
                        });
                        // fileURL = `https://storage.googleapis.com/${bucketName}/${uuidFileName}/`;
                        resolve();
                      })
                      .catch((e) => {
                        reject((e) => console.log(`exec error : ${e}`));
                      });
                  })
              );
            })
          );
        });
      });
      await Promise.allSettled(insertedArr).then((res) => console.log(res));

      const newGlobalMedia = await context.db
        .collection('experiences')
        .findOneAndUpdate(
          {
            id: experienceUUID,
          },
          {
            $push: {
              media: {
                $each: insertedMediaItems,
              },
            },
          },
          {
            returnOriginal: false,
          }
        );
      // console.log('debug media: ', newGlobalMedia)
      if (fromMedia === true) {
        const newHotspotMedia = insertedMediaItems.map((each) => {
          const uuid = uuidv4();
          const name = mediaName === '' ? each.name : mediaName;
          const type = mediaType === '' ? each.type : mediaType;
          return {
            id: uuid,
            name,
            type,
            displayName: mediaDisplayName,
            displayData: mediaDisplayData,
            tag: mediaTag,
            customFields: customObj,
            global_id: each.id,
            url: each.url,
          };
        });

        const associatedHotspotMedia = await context.db
          .collection('experiences')
          .findOneAndUpdate(
            {
              id: experienceUUID,
            },
            {
              $push: {
                'pois.$[myPOI].hotspots.$[myHotspot].media': {
                  $each: newHotspotMedia,
                },
              },
            },
            {
              arrayFilters: [
                { 'myPOI.id': poiUUID },
                { 'myHotspot.id': hotspotUUID },
              ],
              returnOriginal: false,
            }
          );
        return associatedHotspotMedia;
      }
      // console.log('debug associated Hotspot: ', associatedHotspotMedia)
      return newGlobalMedia;
    },
    removeMediaFromHotspot: async (parent, args, context, info) => {
      const { experienceUUID, hotspotUUID, poiUUID, mediaUUID } = args;
      console.log('args from remove media: ', args);
      const deleted = await context.db
        .collection('experiences')
        .findOneAndUpdate(
          {
            id: experienceUUID,
          },
          {
            $pull: {
              'pois.$[myPOI].hotspots.$[myHotspot].media': { id: mediaUUID },
            },
          },
          {
            arrayFilters: [
              { 'myPOI.id': poiUUID },
              { 'myHotspot.id': hotspotUUID },
            ],
            returnOriginal: false,
          }
        );
      // console.log('deleted media from hotspot: ', deleted);
      return deleted;
    },
  },
};

export default dashboardResolvers;
