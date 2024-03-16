'use client'

import InfiniteScroll, { InfiniteScrollState } from '@alzera/react-infinite-scroll'
import { useState } from "react";

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  return (
    <div>
      <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia rem libero nihil dicta, labore quos expedita necessitatibus illum, non temporibus dolorum atque magni aliquam ipsum dolores quod nemo corrupti! Sunt!</h1>
      <InfiniteScroll
        onLoadMore={async (param) => {
          const res = await fetch("https://jsonplaceholder.typicode.com/posts");
          const data = await res.json();
          setPosts((prevPosts) => [...prevPosts, ...data]);
          param.page++
          if (param.page > 2) param.state = InfiniteScrollState.noMore
          return param
        }}
        onRefresh={async () => {
          await new Promise((resolve, _) => setTimeout(resolve, 1000))
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
    </div>
  );
}