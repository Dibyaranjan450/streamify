import { useQuery } from "@tanstack/react-query";
import { Axios } from "../lib/axios";

const HomePage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["test"],
    queryFn: async () => {
      const res = await Axios.get("https://jsonplaceholder.typicode.com/todos");
      // const res = await Axios.get("/auth/me");
      return res.data;
    },
    retry: false,
  });
  console.log(data);

  return <div>HomePage</div>;
};

export default HomePage;
