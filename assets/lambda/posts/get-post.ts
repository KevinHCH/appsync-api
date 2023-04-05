import { Post } from '../../types/post'

export async function getPost(id: string): Promise<Post> {
  // dynamo.get(id) //example
  return {
    id: '1',
    title: 'Hello World',
    body: 'This is a post',
    published: true
  }
}