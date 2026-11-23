import { MyListPage, myListMetadata } from "@/features/my-list/MyListPage";

export const metadata = myListMetadata("en");

export default function Page() {
  return <MyListPage locale="en" />;
}
