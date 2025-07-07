import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const HomePage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["test"],
    queryFn: async () => {
      const res = await axios.get("https://jsonplaceholder.typicode.com/todos");
      return res.data;
    },
  });

  return <div>HomePage</div>;
};

export default HomePage;
