import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DsCanvas } from "@beltechi/parabola/showcase/ds-shell";
import { DS_GROUPS, dsHref, findDsPage } from "@beltechi/parabola/showcase/registry";

type Params = { params: Promise<{ group: string }> };

export function generateStaticParams() {
  return DS_GROUPS.map((group) => ({ group: group.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { group } = await params;
  const found = findDsPage(group);
  return { title: found ? found.page.label : "Parabola" };
}

/**
 * A group's own address. A one-page group (Theme, Board, Intro) is its page, /parabola/theme; a group of
 * several pages opens on its first.
 */
export default async function ShowcaseGroup({ params }: Params) {
  const { group: slug } = await params;
  const group = DS_GROUPS.find((g) => g.slug === slug);
  if (!group) notFound();
  if (!group.single) redirect(dsHref(group, group.pages[0]));
  const page = group.pages[0];
  const Page = page.component;
  return (
    <DsCanvas group={group.label} title={page.label} themeTitle={group.slug === "theme"} board={page.board}>
      <Page />
    </DsCanvas>
  );
}
