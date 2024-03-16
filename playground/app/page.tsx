'use client'

import InfiniteScroll, { LoadMoreState } from '@alzera/react-infinite-scroll'
import { useState } from "react";

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  const loadData = async () => {
    await new Promise((resolve, _) => setTimeout(resolve, 2000))
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    return await res.json() as Post[]
  }
  return (
    <>
      <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia rem libero nihil dicta, labore quos expedita necessitatibus illum, non temporibus dolorum atque magni aliquam ipsum dolores quod nemo corrupti! Sunt!</h1>
      <InfiniteScroll
        onLoadMore={async (param) => {
          console.log("Load More ...", param)
          const data = await loadData();
          setPosts((prevPosts) => [...prevPosts, ...data]);
          param.page++
          if (param.page > 2) param.state = LoadMoreState.noMore
          return param
        }}
        onRefresh={async () => {
          console.log("Refreshing ...")
          await new Promise((resolve, _) => setTimeout(resolve, 2000))
          const data = await loadData();
          setPosts(data);
          return true
        }}>
        <ul>
          {posts.map((post, index) => (
            <li key={index}>
              <div>
                <h2>{post.title}</h2>
                <p>{post.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </>
  );
}
