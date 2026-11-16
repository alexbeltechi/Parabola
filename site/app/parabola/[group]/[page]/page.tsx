import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DsCanvas } from "@beltechi/parabola/showcase/ds-shell";
import { DS_GROUPS, findDsPage } from "@beltechi/parabola/showcase/registry";

type Params = { params: Promise<{ group: string; page: string }> };

export function generateStaticParams() {
  return DS_GROUPS.flatMap((group) => group.pages.map((page) => ({ group: group.slug, page: page.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { group, page } = await params;
  const found = findDsPage(group, page);
  return { title: found ? found.page.label : "Parabola" };
}

/** One showcase page, centred on the canvas. */
export default async function ShowcasePage({ params }: Params) {
  const { group, page } = await params;
  const found = findDsPage(group, page);
  if (!found) notFound();
  const Page = found.page.component;
  return (
    <DsCanvas group={found.group.label} title={found.page.label} themeTitle={found.group.slug === "theme"}>
      <Page />
    </DsCanvas>
  );
}
