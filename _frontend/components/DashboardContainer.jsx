import React, { useCallback, useState } from 'react';
import POIContainer from './POIContainer/POIContainer';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';

const GET_EXPERIENCE_BY_UUID = gql`
  query getExperienceByUUID($id: String) {
    getExperienceByUUID(id: $id) {
      name
      id
      bucketName
      baseHref
      media {
        id
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

const CREATE_MEDIA = gql`
  mutation createMedia(
    $file: Upload
    $bucketName: String
    $experienceUUID: String
  ) {
    createMedia(
      file: $file
      bucketName: $bucketName
      experienceUUID: $experienceUUID
    ) {
      id
      media {
        {
          id
          global_id
          name
          displayName
          displayData
          tag
          type
          url
          createdOn
        }
      }
    }
  }
`;

const DashboardContainer = (props) => {
  const { name, id } = props.location.state;

  const { data, loading, error } = useQuery(GET_EXPERIENCE_BY_UUID, {
    variables: { id },
  });
  const [
    createMedia,
    { loading: createMediaLoading, error: createMediaError },
  ] = useMutation(CREATE_MEDIA);

  const { handleSubmit } = useForm({});

  const [file, setFile] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    // console.log('in on drop: ', acceptedFiles);
    setFile(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  if (loading) return <p>loading...</p>;
  const experience = data.getExperienceByUUID;

  const onSubmit = async (submitData) => {
    const inserted = await createMedia({
      variables: {
        file,
        experienceUUID: experience.id,
        bucketName: experience.bucketName,
      },
    });

    if (createMediaLoading) return <p>UPLOADING MEDIA</p>;
    if (createMediaError) return <p>ERROR ON UPLOAD</p>;

    if (inserted) setFile([]);
  };

  return (
    <div className="justify-center">
      <h3 className="text-4xl font-normal">Experience: {experience.name}</h3>
      <span>Experience ID: {experience.id}</span>
      <POIContainer experience={experience} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3 shadow sm:rounded-lg sm:overflow-hidden">
          <div className="px-4 py-5 space-y-3 bg-white sm:p-3">
            <div className="flex justify-center px-3 pt-3 pb-3 mt-2 border-2 border-gray-300 border-dashed rounded-lg">
              <div
                {...getRootProps()}
                className="space-y-1 text-center focus:outline-none"
              >
                <svg
                  className="w-12 h-12 mx-auto text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  ariaHidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  {/* This needs to be wrapped in a Div. If wrapped in a label, file will need to be passed down from the label to the input - users would essentially have to upload twice. */}
                  <div
                    htmlFor="file-upload"
                    className="relative font-medium text-indigo-600 cursor-pointer hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    {isDragActive ? (
                      <p>Drop files here ...</p>
                    ) : (
                      <p>Drag files or Click Here for Upload ...</p>
                    )}
                    <input
                      {...getInputProps()}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                    />
                  </div>
                </div>

                {file.length > 0 ? (
                  <p className="text-xs text-gray-500">
                    {file.length} file(s) selected
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF, MPEG4 up to ∞ Mb
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="py-3 text-right sm:px-4">
          <button
            type="submit"
            className="inline-flex px-6 py-2 text-white bg-indigo-500 border-0 rounded-lg focus:outline-none hover:bg-indigo-600 text-md"
          >
            Upload Global Media
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardContainer;
