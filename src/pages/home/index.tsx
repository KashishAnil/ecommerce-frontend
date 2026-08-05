import { Button } from "antd";
import { useGetPostsQuery } from "../../redux/services/apiSlice";
import { ImageUrl } from "../../utils/Functions";

const Home = () => {
  const { data: posts, error, isLoading } = useGetPostsQuery();

  if (isLoading) return <h2>Loading...</h2>;
  if (error) return <h2>Error fetching posts</h2>;
  return (
    <>
      <div style={{ padding: 20 }}>
        <h1>Welcome to Vite + Ant Design</h1>
        <Button type="primary">Click Me</Button>
      </div>
      <img src={ImageUrl("dummy.jpg")} alt="Not found" height={100} width={200} />
      <div>
        <h1>Redux Toolkit Query in Vite</h1>
        {posts?.map((post) => (
          <div
            key={post.id}
            style={{ padding: 10, borderBottom: "1px solid #ccc" }}
          >
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
