import React, { useState, useEffect } from 'react';
import CustomMediaModal from '../CustomMediaModal/CustomMediaModal';
import MediaGallery from '../MediaGallery/MediaGallery';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_EXPERIENCE_BY_UUID = gql`
  query getExperienceByUUID($id: String) {
    getExperienceByUUID(id: $id) {
      name
      id
      bucketName
      baseHref
      media {
        id
        name
        type
        url
      }
      pois {
        name
        id
        poi_id
        displayName
        displayData
        tag
        hotspots {
          name
          id
          hs_id
          displayName
          displayData
          tag
          customFields
          media {
            name
            id
            global_id
            displayName
            displayData
            tag
            type
            url
            customFields
          }
        }
      }
    }
  }
`;

const UPDATE_HOTSPOT_METADATA = gql`
  mutation updateHotspotMetadata(
    $experienceUUID: String
    $poiUUID: String
    $hotspotInput: hotspotInput
  ) {
    updateHotspotMetadata(
      experienceUUID: $experienceUUID
      poiUUID: $poiUUID
      hotspotInput: $hotspotInput
    ) {
      id
      pois {
        hotspots {
          id
          name
          hs_id
          displayName
          displayData
          tag
          customFields
        }
      }
    }
  }
`;

const Hotspot = (props) => {
  const { expID, poi, hotspot } = props.location.state;
  const { data, loading, error } = useQuery(GET_EXPERIENCE_BY_UUID, {
    variables: {
      id: expID,
    },
  });
  const [updateHotspotMetadata] = useMutation(UPDATE_HOTSPOT_METADATA);

  const [customModal, setCustomModal] = useState(false);
  const [textModal, setTextModal] = useState(false);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      hotspotName: '',
      hotspotID: '',
      hotspotDisplayName: '',
      hotspotDisplayData: '',
      hotspotTag: '',
      hotspotCustomFields: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: `hotspotCustomFields`,
  });

  useEffect(() => {
    if (!loading) {
      let customObjArray = [];
      const exp = data?.getExperienceByUUID;
      const currPOI = exp?.pois?.filter((elem) => elem.id === poi.id)[0];
      const currHotspot = currPOI?.hotspots.filter(
        (hs) => hs.id === hotspot.id
      )[0];

      console.log(exp, currPOI, currHotspot);
      if (
        currHotspot !== undefined &&
        currHotspot.customFields !== undefined &&
        Object.keys(currHotspot.customFields).length > 0
      ) {
        const keys = Object.keys(currHotspot.customFields);
        customObjArray = keys.map((each) => {
          return { keys: each, values: currHotspot.customFields[each] };
        });
      }
      reset({
        hotspotName: currHotspot.name,
        hotspotID: currHotspot.hs_id,
        hotspotDisplayName: currHotspot.displayName,
        hotspotDisplayData: currHotspot.displayData,
        hotspotTag: currHotspot.tag,
        hotspotCustomFields: [...customObjArray],
      });
    }
  }, [data, poi, reset, hotspot, loading]);

  if (loading) return <p>loading...</p>;

  const experience = data.getExperienceByUUID;

  const reqVars = {
    experienceUUID: expID,
    poiUUID: poi.id,
    hotspotUUID: hotspot.id,
    bucketName: experience.bucketName,
  };

  const onSubmit = async (submitData) => {
    const update = await updateHotspotMetadata({
      variables: {
        ...reqVars,
        hotspotInput: submitData,
      },
      refetchQueries: [
        {
          query: gql`
            query getExperienceByUUID($id: String) {
              getExperienceByUUID(id: $id) {
                pois {
                  name
                  hotspots {
                    name
                    hs_id
                    displayName
                    displayData
                    tag
                    customFields
                    media {
                      name
                      url
                    }
                  }
                }
              }
            }
          `,
          variables: { id: expID },
        },
      ],
    });
  };

  return (
    <div>
      <h3 className="text-4xl font-normal">Hotspot: {hotspot.name}</h3>
      <form
        className="table border-solid border-2 border-black"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="table-row">
          <p className="table-cell px-1"> Hotspot UUID: </p>
          <p className="table-cell px-1"> {hotspot.id}</p>
        </div>
        <div className="table-row">
          <label className="table-cell px-1">Name: </label>
          <div className="table-cell px-1">
            <input
              id={`hotspot_name`}
              ref={register}
              name={`hotspotName`}
              placeholder={`Enter new Hotspot Name`}
            />
          </div>
        </div>
        <div className="table-row">
          <label className="table-cell px-1">Hotspot ID: </label>
          <div className="table-cell px-1">
            <input
              id={`hotspot_id`}
              ref={register}
              name={`hotspotID`}
              placeholder={`Enter new Hotspot ID`}
            />
          </div>
        </div>
        <div className="table-row">
          <label className="table-cell px-1">Display Name: </label>
          <div className="table-cell px-1">
            <input
              id={`hotspot_displayName`}
              ref={register}
              name={`hotspotDisplayName`}
              placeholder={`Enter new Display Name`}
            />
          </div>
        </div>
        <div className="table-row">
          <label className="table-cell px-1">Display Data: </label>
          <div className="table-cell px-1">
            <input
              id={`hotspot_displayData`}
              ref={register}
              name={`hotspotDisplayData`}
              placeholder={`Enter new Display Data`}
            />
          </div>
        </div>
        <div className="table-row">
          <label className="table-cell px-1">Tag: </label>
          <div className="table-cell px-1">
            <input
              id={`hotspot_tag`}
              ref={register}
              name={`hotspotTag`}
              placeholder={`Enter new Tag`}
            />
          </div>
        </div>
        {fields.map(({ id, keys, values }, index) => {
          return (
            <div key={id} className="table-row">
              <div className="table-cell px-1">
                <input
                  ref={register()}
                  name={`hotspotCustomFields[${index}].keys`}
                  defaultValue={keys}
                  placeholder={`Key`}
                />
              </div>
              <div className="table-cell px-1">
                <input
                  ref={register()}
                  name={`hotspotCustomFields[${index}].values`}
                  defaultValue={values}
                  placeholder={`Value`}
                />
              </div>
              <div className="table-cell px-1">
                <button
                  className="table-cell hover:text-red-500"
                  type="button"
                  onClick={() => remove(index)}
                >
                  Remove Field
                </button>
              </div>
            </div>
          );
        })}
        <div className="table-row">
          <div className="table-cell p-2">
            <button
              type="button"
              className="table-cell bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded"
              onClick={() => append({})}
            >
              Add Custom Field
            </button>
          </div>
          <div className="table-cell p-2">
            <button
              type="submit"
              className="table-cell bg-indigo-500 hover:bg-indigo-700 text-white py-1 px-2 rounded"
            >
              Update Hotspot Metadata
            </button>
          </div>
        </div>
      </form>
      <div>
        <button
          onClick={() => setCustomModal(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white m-2 py-2 px-4 rounded"
        >
          Add Custom Media
        </button>
        <button
          onClick={() => setTextModal(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white m-2 py-2 px-4 rounded"
        >
          Add Text
        </button>
      </div>

      {textModal ? <div>Text Modal</div> : null}

      <MediaGallery
        experience={experience}
        poiUUID={poi.id}
        hotspotUUID={hotspot.id}
      />

      {customModal ? (
        <CustomMediaModal
          origin="media"
          reqVars={reqVars}
          showModal={setCustomModal}
        />
      ) : null}
    </div>
  );
};

export default Hotspot;
