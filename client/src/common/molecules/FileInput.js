import React, { useCallback, useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import AttachmentIcon from '@material-ui/icons/Attachment';
import { appContext } from '../../context/app';
import Button from '../Button';
import { ErrorText, InputTitle } from './Input';
import ImagePreview from '../atoms/ImagePreview';

const FileInput = ({
  file,
  onUploadStarted,
  error,
  isRequired,
  onError,
  label,
  onUploadEnded,
  isMultiple = false,
  onChange,
}) => {
  const { api } = useContext(appContext);
  const inputReference = useRef(null);
  const [isUploading, setUploading] = useState(false);

  const openFileUploadClicked = useCallback(
    () => inputReference.current.click(),
    [inputReference],
  );

  const openFileUploadTriggered = useCallback(
    async e => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        setUploading(true);
        onUploadStarted();
        try {
          const uploadedFile = await api.upload(selectedFile);
          onChange(isMultiple ? [...file, uploadedFile] : uploadedFile);
        } catch (uploadError) {
          onError(uploadError);
        }
        onUploadEnded();
        setUploading(false);
      }
    },
    [onUploadEnded, onChange, onUploadStarted, api, onError, isMultiple, file],
  );

  return (
    <FileInputWrapper>
      {label && (
        <InputTitle marginBottom={18} block isRequired={isRequired}>
          {label}
        </InputTitle>
      )}

      <div>
        {(isMultiple ? file : [file])
          .filter(x => x)
          .map((f, i) => (
            <PreviewWrapper key={f?.path}>
              <ImagePreview
                onDelete={() => {
                  onChange(isMultiple ? file.filter((x, j) => i !== j) : null);
                }}
                src={f.path}
              />
            </PreviewWrapper>
          ))}
      </div>

      <Button
        type="button"
        isLoading={isUploading}
        onClick={openFileUploadClicked}
        compact
        withIcon
        minWidth={100}
        secondary
      >
        <AttachmentIcon />
        {isUploading ? 'Uploading...' : `Upload`}
      </Button>

      <input
        type="file"
        ref={inputReference}
        accept="image/jpeg, image/png"
        onChange={openFileUploadTriggered}
      />

      {error && <ErrorText>{error.message}</ErrorText>}
    </FileInputWrapper>
  );
};

export default FileInput;

const FileInputWrapper = styled.div`
  min-width: 160px;
  display: inline-block;
  line-height: 1.5;
  letter-spacing: 0.53px;
  margin-right: 20px;
  margin-bottom: 12px;

  input[type='file'] {
    display: none;
  }
`;

const PreviewWrapper = styled.div`
  display: inline-block;
`;

FileInput.propTypes = {
  isMultiple: PropTypes.bool,
  isRequired: PropTypes.bool,
  error: PropTypes.object,
  file: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onUploadStarted: PropTypes.func,
  onError: PropTypes.func.isRequired,
  label: PropTypes.string,
  onUploadEnded: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};
