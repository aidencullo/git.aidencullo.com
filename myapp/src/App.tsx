import { useState, useEffect } from 'react';
import './App.css';

interface Post {
  id: number;
  title: string;
  body: string;
}

function App() {
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then((response) => response.json())
      .then((data) => setPost(data));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {post ? (
          <div>
            <h1>{post.title}</h1>
            <p>{post.body}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </header>
    </div>
  );
}

export default App;

