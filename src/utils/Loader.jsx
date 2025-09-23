import { RingLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <RingLoader color="#7f3ceb" size={100} />
    </div>
  );
};

export default Loader;
