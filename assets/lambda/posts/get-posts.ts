import { Post } from '../../types/post'
export async function getPosts(): Promise<Post[]> {
  // dynamo.scan() //example
  return [
    {
      id: '1',
      title: 'Hello World',
      body: 'This is a post',
      published: true
    },
    {
      id: '2',
      title: 'Hello World',
      body: 'This is a post',
      published: true
    }
  ]
}