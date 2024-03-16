import Error from "next/error";
import { AdministrationView } from "@/components/administration/AdministrationView";
import { useUser } from "@/lib/UserProvider";

const Administration = () => {
  const { user } = useUser();
  if (user?.role !== "ADMIN") {
    return <Error statusCode={403} />;
  }
  return <AdministrationView />;
};

export default Administration;
