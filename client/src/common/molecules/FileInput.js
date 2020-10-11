import React, {useCallback, useContext, useRef, useState} from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {appContext} from "../../context/app";
import Button from "../Button";
import {InputTitle} from "./Input";

const FileInput = ({
  display,
  file,
  onUploadStarted,
  onError,
  label,
  onUploadEnded,
  onChange
}) => {
  const { api } = useContext(appContext);
  const inputRef = useRef(null);
  const [isUploading, setUploading] = useState(false);

  const openFileUploadClicked = useCallback(() => inputRef.current.click(), [inputRef])

  const openFileUploadTriggered = useCallback(async e => {
    const selectedFile = e.target.files[0];
    if(!selectedFile) {
      onUploadEnded()
      onChange(null)
    } else {
      setUploading(true);
      onUploadStarted();
      try {
        const file = await api.upload(selectedFile);
        onChange(file)
      } catch (e) {
        onError(e);
      }
      onUploadEnded();
      setUploading(false);
    }
  }, [onUploadEnded, onUploadStarted, onChange])

  return (
    <FileInputWrapper>
      {label && <InputTitle marginBottom={18} block>{label}</InputTitle>}
      <PreviewWrapper>
      {display(file)}
      </PreviewWrapper>
      <Button type={"button"}
              isLoading={isUploading}
              onClick={openFileUploadClicked}
              compact
              minWidth={100}
              secondary>{isUploading ? 'Uploading...' : `Upload${file ? ' Another' : ''}`}</Button>
      {!!file && <Button type={"button"} onClick={() => onChange(null)} compact minWidth={100} secondary>Remove</Button>}
      <input type="file" ref={inputRef} accept="image/jpeg, image/png" onChange={openFileUploadTriggered} />
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
  
  input[type="file"] {
    display: none;
  }
`;

const PreviewWrapper = styled.div`
  margin-bottom: 7px;
`;

FileInput.propTypes = {
  display: PropTypes.func.isRequired,
  file: PropTypes.object,
  onUploadStarted: PropTypes.func,
  onError: PropTypes.func.isRequired,
  label: PropTypes.string,
  onUploadEnded: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};
