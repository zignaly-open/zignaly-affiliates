export const getCloudinaryPreview = (path, size) => {
  return path.replace(/\/upload/, `/upload/c_thumb,w_${size},h_${size}`);
};

export const getSourceSet = (media, size) => {
  return {
    src: getCloudinaryPreview(media.path, size),
    srcSet: `${getCloudinaryPreview(
      media.path,
      size,
    )} 1x, ${getCloudinaryPreview(
      media.path,
      size * 2,
    )} 2x, ${getCloudinaryPreview(media.path, size * 3)} 3x`,
  };
};
