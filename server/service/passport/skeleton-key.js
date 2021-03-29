const skeletonKey = () => {
  const { NODE_ENV: environment, SKELETON_KEY: key } = process.env;
  return environment === 'test'
    ? 'ilovemarshmallows'
    : !!key && key.length > 15 && key; // some things should not be short*
};

// * that's what she said
export default skeletonKey;
