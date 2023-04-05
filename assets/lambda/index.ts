import { Handler } from 'aws-lambda';
import { getPost } from './posts/get-post';
import { getPosts } from './posts/get-posts';
export async function handler(event: Handler, context: any) {
  switch (event.info.fieldName) {
    case 'getPosts':
      return await getPosts();
    case 'getPost':
        return await getPost(event.arguments.id);
    default:
      return null;
  }
}