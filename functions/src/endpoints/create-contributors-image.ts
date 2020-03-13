import * as functions from 'firebase-functions';
import { Repository } from '../model/repository';
import { generateContributorsImage } from '../service/contributors-image';
import { restoreImageCache, saveImageCache } from '../service/image-cache';
import { validateRepoParam } from './utils/validators';

export const createContributorsImage = functions
  .runWith({ timeoutSeconds: 60, memory: '1GB' })
  .https.onRequest(async (request, response) => {
    console.group('createContributorsImage');

    const repoParam = request.query['repo'];

    try {
      validateRepoParam(repoParam);
    } catch (error) {
      console.error(error);
      response.status(400).send(error.toString());
      return;
    }
    const repository = Repository.fromString(repoParam);

    try {
      const image = await createImage(repository);
      response
        .header('Content-Type', 'image/png')
        .status(200)
        .send(image);
    } catch (error) {
      console.error(error);
      response.status(500).send(error.toString());
    }
    console.groupEnd();
  });

async function createImage(repository: Repository) {
  const cache = await restoreImageCache(repository);
  if (cache) {
    return cache;
  }
  const image = await generateContributorsImage(repository);
  await saveImageCache(repository, image);
  return image;
}
