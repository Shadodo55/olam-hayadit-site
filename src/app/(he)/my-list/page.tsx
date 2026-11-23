import { MyListPage, myListMetadata } from "@/features/my-list/MyListPage";

export const metadata = myListMetadata("he");

export default function Page() {
  return <MyListPage locale="he" />;
}
