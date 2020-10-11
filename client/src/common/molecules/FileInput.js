import React, { useCallback, useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { appContext } from '../../context/app';
import Button from '../Button';
import {ErrorText, InputTitle} from './Input';

const FileInput = ({
  display,
  file,
  onUploadStarted,
  error,
  isRequired,
  onError,
  label,
  onUploadEnded,
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
      if (!selectedFile) {
        onUploadEnded();
        onChange(null);
      } else {
        setUploading(true);
        onUploadStarted();
        try {
          onChange(await api.upload(selectedFile));
        } catch (error) {
          onError(error);
        }
        onUploadEnded();
        setUploading(false);
      }
    },
    [onUploadEnded, onChange, onUploadStarted, api, onError],
  );

  return (
    <FileInputWrapper>
      {label && (
        <InputTitle marginBottom={18} block isRequired={isRequired}>
          {label}
        </InputTitle>
      )}
      <PreviewWrapper>{display(file)}</PreviewWrapper>
      <Button
        type="button"
        isLoading={isUploading}
        onClick={openFileUploadClicked}
        compact
        minWidth={100}
        secondary
      >
        {isUploading ? 'Uploading...' : `Upload${file ? ' Another' : ''}`}
      </Button>
      {!!file && (
        <Button
          type="button"
          onClick={() => onChange(null)}
          compact
          minWidth={100}
          secondary
        >
          Remove
        </Button>
      )}
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
  margin-bottom: 7px;
`;

FileInput.propTypes = {
  display: PropTypes.func.isRequired,
  isRequired: PropTypes.bool,
  error: PropTypes.object,
  file: PropTypes.object,
  onUploadStarted: PropTypes.func,
  onError: PropTypes.func.isRequired,
  label: PropTypes.string,
  onUploadEnded: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};
