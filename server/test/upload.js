import cloudinaryService from 'cloudinary';
import request from 'superagent';
import assert from 'assert';
import path from 'path';
import { getAffiliateToken, uploadRequest } from './_common';
import * as databaseHandler from './mongo-mock';

const { v2: cloudinary } = cloudinaryService;

describe('Upload', function () {
  before(databaseHandler.connect);
  afterEach(databaseHandler.clearDatabase);
  after(databaseHandler.closeDatabase);

  it('should upload nice anime girls', async function () {
    this.timeout(15000);
    const accessToken = await getAffiliateToken();
    const {
      body: { path: url, filename },
    } = await uploadRequest(
      `${path.resolve('')}/test/sample.jpg`,
      accessToken,
    ).expect(200);

    assert(url);
    assert(filename);

    const {
      headers: { 'content-type': contentType },
    } = await request(url);
    assert(contentType === 'image/jpeg');

    // Note that the ing will be available for some time
    // https://support.cloudinary.com/hc/en-us/articles/202520352-I-have-deleted-an-image-and-though-it-has-been-removed-from-the-media-library-it-is-still-available-via-URL-
    await cloudinary.uploader.destroy(filename);
  });

  it('should NOT upload ugly txt files', async function () {
    const accessToken = await getAffiliateToken();
    const {
      body: {
        errors: { media: mediaError },
      },
    } = await uploadRequest(
      `${path.resolve('')}/test/sample.txt`,
      accessToken,
    ).expect(400);
    assert(mediaError);
  });
});
